const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow = null;

// Get data from environment variables (better Unicode support than command-line args)
let goal = process.env.BLOCK_GOAL || 'your goal';
let activity = process.env.BLOCK_ACTIVITY || 'unproductive activity';
let blockedApp = process.env.BLOCK_APP || 'Unknown App';
let category = process.env.BLOCK_CATEGORY || 'Unknown';
let sessionStats = { blocksStopped: 0, sessionStartTime: Date.now() };

// Parse session stats from JSON if available
try {
  if (process.env.BLOCK_STATS_JSON) {
    sessionStats = JSON.parse(process.env.BLOCK_STATS_JSON);
  }
} catch (error) {
  console.log('Could not parse session stats:', error);
}

console.log('Overlay started with:');
console.log('Goal:', goal);
console.log('Activity:', activity);
console.log('App:', blockedApp);
console.log('Category:', category);
console.log('Session stats:', sessionStats);

function createBlockingWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    skipTaskbar: false,
    focusable: true,
    minimizable: false,
    closable: true
  });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  // Ensure window is always on top
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  // Load the blocking HTML
  mainWindow.loadFile(path.join(__dirname, 'blocking.html'));

  // Open DevTools for debugging (comment out in production)
  // mainWindow.webContents.openDevTools();

  // Send data to renderer once loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded, sending blocking data:', { goal, activity, sessionStats });
    mainWindow.webContents.send('blocking-data', {
      goal: goal,
      activity: activity,
      blocksStopped: sessionStats.blocksStopped,
      sessionStartTime: sessionStats.sessionStartTime
    });
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  // Register ESC key globally to close
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape' && input.type === 'keyDown') {
      mainWindow.close();
    }
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  // Handle dismiss action from renderer
  ipcMain.on('dismiss-overlay', () => {
    console.log('Received dismiss-overlay signal from renderer');
    if (mainWindow) {
      console.log('Closing main window');
      mainWindow.close();
    } else {
      console.log('No main window to close');
    }
  });

  // Handle whitelist action from renderer
  ipcMain.on('mark-as-productive', async () => {
    console.log('Received mark-as-productive signal from renderer');

    try {
      // Write the activity to the whitelist file for the main app to read
      const whitelistFile = path.join(__dirname, '..', 'whitelist.txt');
      await fs.writeFile(whitelistFile, activity, 'utf8');
      console.log(`✅ Written "${activity}" to whitelist file`);
    } catch (error) {
      console.error(`❌ Error writing to whitelist file: ${error}`);
    }

    // Close the window
    if (mainWindow) {
      console.log(`Activity "${activity}" marked as productive, closing window`);
      mainWindow.close();
    } else {
      console.log('No main window to close');
    }
  });

  createBlockingWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createBlockingWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
