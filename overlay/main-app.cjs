const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let goalWindow = null;
let monitoringProcess = null;

/**
 * Create the goal input window
 */
function createGoalWindow() {
  goalWindow = new BrowserWindow({
    width: 600,
    height: 700,
    minWidth: 500,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload-goal.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    resizable: true,
    center: true,
    show: false
  });

  goalWindow.loadFile(path.join(__dirname, 'goal-input.html'));

  // Show window when ready to prevent visual flash
  goalWindow.once('ready-to-show', () => {
    goalWindow.show();
  });

  goalWindow.on('closed', () => {
    // Stop monitoring if active
    if (monitoringProcess) {
      monitoringProcess.kill('SIGTERM');
      monitoringProcess = null;
    }
    goalWindow = null;
    app.quit();
  });
}

/**
 * Handle start monitoring request
 */
ipcMain.on('start-monitoring', async (event, goal) => {
  console.log('Starting monitoring for goal:', goal);

  try {
    // Stop any existing monitoring
    if (monitoringProcess) {
      monitoringProcess.kill('SIGTERM');
      monitoringProcess = null;
    }

    // Start gemini_productivity.js as child process
    const scriptPath = path.join(__dirname, '..', 'gemini_productivity.js');

    // Get electron executable path properly
    let electronPath;
    try {
      const electron = require('electron');
      const path = require('path');
      electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
      // For Windows, add .cmd extension
      if (process.platform === 'win32') {
        electronPath += '.cmd';
      }
    } catch (error) {
      console.error('Failed to get electron path:', error);
      // Fallback to system electron if available
      electronPath = 'electron';
    }

    // Spawn the backend process - it will handle its own blocking overlays
    monitoringProcess = spawn('node', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PRODUCTIVITY_GOAL: goal,
        ELECTRON_MODE: 'true',
        ELECTRON_PATH: electronPath,
        // Set this so backend knows it can spawn Electron overlays
        ELECTRON_BACKEND: 'true'
      },
      detached: false
    });

    let goalInput = '';
    let waitingForGoal = true;

    // Send goal to process when it prompts for input
    monitoringProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Backend output:', output);

      // Look for the goal prompt
      if (waitingForGoal && output.includes('What is your current task/goal today?')) {
        // Send the goal to the process
        monitoringProcess.stdin.write(goal + '\n');
        waitingForGoal = false;

        // Send success response to renderer
        event.reply('monitoring-started', { success: true, goal });

        // Minimize goal window
        if (goalWindow) {
          goalWindow.minimize();
        }
      }

      // Don't forward console output - backend will handle blocking overlays
      // Only forward important status updates
      if (goalWindow && !waitingForGoal) {
        // Look for important status indicators
        if (output.includes('✅ Goal set') ||
            output.includes('Starting activity monitoring') ||
            output.includes('Productivity session ended')) {
          goalWindow.webContents.send('monitoring-status', {
            monitoring: true,
            message: output.trim()
          });
        }
      }
    });

    monitoringProcess.stderr.on('data', (data) => {
      console.error('Backend error:', data.toString());
      if (goalWindow) {
        goalWindow.webContents.send('monitoring-error', data.toString());
      }
    });

    monitoringProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
      monitoringProcess = null;
      if (goalWindow) {
        goalWindow.webContents.send('monitoring-stopped', { success: true });
      }
    });

    monitoringProcess.on('error', (error) => {
      console.error('Failed to start backend process:', error);
      event.reply('monitoring-started', { success: false, message: error.message });
    });

  } catch (error) {
    console.error('Error starting monitoring:', error);
    event.reply('monitoring-started', { success: false, message: error.message });
  }
});

/**
 * Handle stop monitoring request
 */
ipcMain.on('stop-monitoring', (event) => {
  console.log('Stopping monitoring');

  if (monitoringProcess) {
    monitoringProcess.kill('SIGTERM');
    monitoringProcess = null;
  }

  // Send response back to renderer
  event.reply('monitoring-stopped', { success: true });

  // Restore the goal window
  if (goalWindow) {
    goalWindow.restore();
    goalWindow.focus();
  }
});

/**
 * Handle mark as productive request
 */
ipcMain.on('mark-as-productive', (event, windowTitle) => {
  console.log(`Marking as productive: ${windowTitle}`);

  // Write to whitelist file that the backend will read
  const fs = require('fs').promises;
  const whitelistFile = path.join(__dirname, '..', 'whitelist.txt');

  fs.writeFile(whitelistFile, windowTitle, 'utf8')
    .then(() => {
      console.log(`✅ Written "${windowTitle}" to whitelist file`);
      event.reply('marked-as-productive', { success: true, window: windowTitle });
    })
    .catch((error) => {
      console.error(`❌ Error writing to whitelist file: ${error}`);
      event.reply('marked-as-productive', { success: false, message: error.message });
    });
});

/**
 * Handle window controls from frameless window
 */
ipcMain.on('window-minimize', () => {
  if (goalWindow) goalWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (goalWindow) {
    if (goalWindow.isMaximized()) {
      goalWindow.unmaximize();
    } else {
      goalWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (goalWindow) goalWindow.close();
});

// App lifecycle
app.whenReady().then(() => {
  createGoalWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createGoalWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (goalWindow) {
      if (goalWindow.isMinimized()) goalWindow.restore();
      goalWindow.focus();
    }
  });
}

// Cleanup on exit
app.on('before-quit', () => {
  if (monitoringProcess) {
    monitoringProcess.kill('SIGTERM');
  }
});