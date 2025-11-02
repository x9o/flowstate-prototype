const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let currentTheme = 'light';

// Monitoring state
let monitoringProcess = null;
let monitoringState = {
  isActive: false,
  currentGoals: [],
  sessionStats: {
    totalChecks: 0,
    blockedAttempts: 0,
    sessionStartTime: null,
    currentWindow: null
  }
};

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 700, // Reduced minimum width for better responsiveness
    minHeight: 500, // Reduced minimum height for better responsiveness
    frame: false, // Remove the default frame
    titleBarStyle: 'hidden', // Hide the title bar
    title: 'Flowstate', // Set the window title
    icon: path.join(__dirname, 'public', 'flowstate.png'), // Set the app icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    app.quit();
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set the application name
  app.setName('Flowstate');
  createWindow();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// IPC handlers for window controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    mainWindow.maximize();
    mainWindow.webContents.send('window-maximized');
  }
});

ipcMain.handle('window-unmaximize', () => {
  if (mainWindow) {
    mainWindow.unmaximize();
    mainWindow.webContents.send('window-unmaximized');
  }
});

ipcMain.handle('window-is-maximized', () => {
  if (mainWindow) {
    return mainWindow.isMaximized();
  }
  return false;
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Handle window state changes
mainWindow?.on('maximize', () => {
  mainWindow?.webContents.send('window-maximized');
});

mainWindow?.on('unmaximize', () => {
  mainWindow?.webContents.send('window-unmaximized');
});

// Theme handlers
ipcMain.handle('set-theme', (event, theme) => {
  currentTheme = theme;
  if (mainWindow) {
    mainWindow.webContents.send('theme-changed', theme);
  }
});

ipcMain.handle('get-theme', () => {
  return currentTheme;
});

// Monitoring IPC handlers
ipcMain.handle('start-monitoring', async (event, goals, duration) => {
  try {
    if (monitoringProcess) {
      console.log('Monitoring already active, stopping previous process');
      stopMonitoringProcess();
    }

    console.log('Starting monitoring with goals:', goals, 'duration:', duration);

    // Update monitoring state
    monitoringState.isActive = true;
    monitoringState.currentGoals = goals;
    monitoringState.sessionStats = {
      totalChecks: 0,
      blockedAttempts: 0,
      sessionStartTime: Date.now(),
      currentWindow: null
    };

    // Start monitoring process
    startMonitoringProcess(goals, duration);

    // Send initial status to renderer
    mainWindow?.webContents.send('monitoring-status-change', {
      isActive: true,
      goals: goals,
      sessionStats: monitoringState.sessionStats
    });

    return { success: true, message: 'Monitoring started' };
  } catch (error) {
    console.error('Failed to start monitoring:', error);
    mainWindow?.webContents.send('monitoring-error', { error: error.message });
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-monitoring', async () => {
  try {
    console.log('Stopping monitoring');
    stopMonitoringProcess();

    // Update monitoring state
    monitoringState.isActive = false;
    monitoringState.currentGoals = [];

    // Send status to renderer
    mainWindow?.webContents.send('monitoring-status-change', {
      isActive: false,
      goals: [],
      sessionStats: monitoringState.sessionStats
    });

    return { success: true, message: 'Monitoring stopped' };
  } catch (error) {
    console.error('Failed to stop monitoring:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-monitoring-status', () => {
  return {
    ...monitoringState,
    sessionDuration: monitoringState.sessionStats.sessionStartTime
      ? Math.round((Date.now() - monitoringState.sessionStats.sessionStartTime) / 1000 / 60)
      : 0
  };
});

// Helper functions for monitoring process management
function startMonitoringProcess(goals, duration) {
  try {
    console.log('Starting monitoring service with real MonitoringService');

    // Spawn the actual MonitoringService process
    const monitoringServicePath = path.join(__dirname, 'src', 'services', 'MonitoringService.js');
    monitoringProcess = spawn('node', [monitoringServicePath, JSON.stringify(goals), duration.toString()], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ELECTRON_PATH: process.execPath }
    });

    // Setup process communication
    if (monitoringProcess) {
      monitoringProcess.stdout.on('data', (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleMonitoringMessage(message);
        } catch (error) {
          console.log('Monitoring output:', data.toString().trim());
        }
      });

      monitoringProcess.stderr.on('data', (data) => {
        console.error('Monitoring error:', data.toString());
        mainWindow?.webContents.send('monitoring-error', { error: data.toString() });
      });

      monitoringProcess.on('close', (code) => {
        console.log(`Monitoring process exited with code ${code}`);
        monitoringProcess = null;

        // Auto-stop monitoring when process ends
        if (monitoringState.isActive) {
          stopMonitoringProcess();
          mainWindow?.webContents.send('monitoring-status-change', {
            isActive: false,
            goals: [],
            sessionStats: monitoringState.sessionStats
          });
        }
      });

      monitoringProcess.on('error', (error) => {
        console.error('Monitoring process error:', error);
        monitoringProcess = null;
        mainWindow?.webContents.send('monitoring-error', { error: error.message });
      });

      console.log('Monitoring process started successfully');
    } else {
      throw new Error('Failed to spawn monitoring process');
    }

  } catch (error) {
    console.error('Failed to start monitoring process:', error);
    throw error;
  }
}

function stopMonitoringProcess() {
  if (monitoringProcess) {
    monitoringProcess.kill('SIGTERM');
    monitoringProcess = null;
  }

  monitoringState.isActive = false;
  monitoringState.currentGoals = [];
}

function handleMonitoringMessage(message) {
  switch (message.type) {
    case 'window-detected':
      monitoringState.sessionStats.currentWindow = message.data;
      mainWindow?.webContents.send('window-detected', message.data);
      break;

    case 'activity-blocked':
      monitoringState.sessionStats.blockedAttempts++;
      mainWindow?.webContents.send('activity-blocked', message.data);
      break;

    case 'stats-update':
      monitoringState.sessionStats = { ...monitoringState.sessionStats, ...message.data };
      mainWindow?.webContents.send('monitoring-status-change', {
        isActive: monitoringState.isActive,
        goals: monitoringState.currentGoals,
        sessionStats: monitoringState.sessionStats
      });
      break;

    default:
      console.log('Unknown monitoring message:', message);
  }
}

// Cleanup on app exit
app.on('before-quit', () => {
  stopMonitoringProcess();
});