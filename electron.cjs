// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { startMonitoring: startMonitoringService } = require('./monitoring-service.cjs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let currentTheme = 'light';

// Monitoring state
let monitoringInstance = null;
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
  // Get screen dimensions
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: Math.min(1400, screenWidth - 100),
    height: Math.min(900, screenHeight - 100),
    minWidth: 1000,
    minHeight: 700,
    frame: false, // Remove the default frame
    titleBarStyle: 'hidden', // Hide the title bar
    title: 'Flowstate', // Set the window title
    icon: path.join(__dirname, 'public', 'flowstate.png'), // Set the app icon
    center: true, // Center the window on screen
    show: false, // Don't show until ready-to-show
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
  });

  // Load the app
  if (isDev) {
    // Use environment variable or default to 8080
    const devPort = process.env.VITE_PORT || '8080';
    mainWindow.loadURL(`http://localhost:${devPort}`);
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
ipcMain.handle('start-monitoring', async (event, goals, duration, whitelist, blocklist, strictnessLevel = 'balanced', blockingMode = 'gentle') => {
  try {
    if (monitoringInstance) {
      console.log('Monitoring already active, stopping previous instance');
      monitoringInstance.stop();
      monitoringInstance = null;
    }

    console.log('Starting monitoring with goals:', goals, 'duration:', duration);
    console.log('Whitelist:', whitelist?.length || 0, 'items');
    console.log('Blocklist:', blocklist?.length || 0, 'items');
    console.log('Strictness Level:', strictnessLevel);
    console.log('Blocking Mode:', blockingMode);

    // Update monitoring state
    monitoringState.isActive = true;
    monitoringState.currentGoals = goals;
    monitoringState.sessionStats = {
      totalChecks: 0,
      blockedAttempts: 0,
      sessionStartTime: Date.now(),
      currentWindow: null
    };

    // Helper to send messages to renderer
    const sendToRenderer = (channel, data) => {
      mainWindow?.webContents.send(channel, data);
    };

    // Start monitoring service
    monitoringInstance = await startMonitoringService(
      goals,
      duration,
      sendToRenderer,
      __dirname,
      whitelist || [],
      blocklist || [],
      strictnessLevel,
      blockingMode
    );

    // Minimize the FlowState window
    if (mainWindow) {
      mainWindow.minimize();
    }

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

    if (monitoringInstance) {
      monitoringInstance.stop();
      monitoringInstance = null;
    }

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

// Notification IPC handlers
ipcMain.handle('request-notification-permission', async () => {
  try {
    const { Notification } = require('electron');

    // In Electron, we don't need to request permission like in browsers
    // Notifications work by default, but let's check if they're supported
    if (Notification.isSupported()) {
      return { success: true, granted: true };
    } else {
      return { success: false, error: 'Notifications not supported on this system' };
    }
  } catch (error) {
    console.error('Failed to check notification support:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-notification', async (event, options) => {
  try {
    const { Notification } = require('electron');

    if (!Notification.isSupported()) {
      throw new Error('Notifications not supported on this system');
    }

    const notification = new Notification({
      title: options.title,
      body: options.body,
      icon: options.icon || path.join(__dirname, 'public', 'flowstate_transparent_light_resized.png'),
      silent: options.silent || false,
      urgency: 'normal', // Can be 'normal', 'critical', or 'low'
    });

    // Show the notification
    notification.show();

    // Handle click events
    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        mainWindow.show();
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to show notification:', error);
    return { success: false, error: error.message };
  }
});

// Cleanup on app exit
app.on('before-quit', () => {
  if (monitoringInstance) {
    monitoringInstance.stop();
    monitoringInstance = null;
  }
});