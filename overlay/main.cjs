// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let allWindows = [];

// Extract domain from URL if available
function extractDomain(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    // Remove www. prefix if present
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (error) {
    console.log('Could not parse URL:', url, error);
    return null;
  }
}

// Get data from environment variables (better Unicode support than command-line args)
let goal = process.env.BLOCK_GOAL || 'your goal';
let activity = process.env.BLOCK_ACTIVITY || 'unproductive activity';
let blockedApp = process.env.BLOCK_APP || 'Unknown App';
let category = process.env.BLOCK_CATEGORY || 'Unknown';
let blockedUrl = process.env.BLOCK_URL || '';
let domain = extractDomain(blockedUrl);
let sessionStats = { blocksStopped: 0, sessionStartTime: Date.now() };
let blockingMode = process.env.BLOCK_MODE || 'gentle';
let windowInfo = { title: activity, app: blockedApp, url: blockedUrl, path: '' };

// Parse session stats from JSON if available
try {
  if (process.env.BLOCK_STATS_JSON) {
    sessionStats = JSON.parse(process.env.BLOCK_STATS_JSON);
  }
} catch (error) {
  console.log('Could not parse session stats:', error);
}

// Parse window info from JSON if available
try {
  if (process.env.BLOCK_WINDOW_INFO_JSON) {
    windowInfo = JSON.parse(process.env.BLOCK_WINDOW_INFO_JSON);
  }
} catch (error) {
  console.log('Could not parse window info:', error);
}

console.log('Overlay started with:');
console.log('Goal:', goal);
console.log('Activity:', activity);
console.log('App:', blockedApp);
console.log('Category:', category);
console.log('URL:', blockedUrl);
console.log('Domain:', domain);
console.log('Blocking Mode:', blockingMode);
console.log('Window Info:', windowInfo);
console.log('Session stats:', sessionStats);

function createBlockingWindows() {
  // Get all displays
  const displays = screen.getAllDisplays();
  console.log(`Creating blocking overlays on ${displays.length} display(s)`);

  displays.forEach((display, index) => {
    const { x, y, width, height } = display.bounds;

    const window = new BrowserWindow({
      x,
      y,
      width,
      height,
      fullscreen: false, // Use bounds instead of fullscreen
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false
      },
      skipTaskbar: index > 0, // Only show first window in taskbar
      focusable: index === 0, // Only first window is focusable
      minimizable: false,
      closable: true
    });

    // Remove menu bar
    window.setMenuBarVisibility(false);

    // Ensure window is always on top
    window.setAlwaysOnTop(true, 'screen-saver', 1);

    // Load the blocking HTML
    window.loadFile(path.join(__dirname, 'blocking.html'));

    // Send data to renderer once loaded
    window.webContents.on('did-finish-load', () => {
      console.log(`Display ${index + 1} window loaded, sending blocking data`);
      window.webContents.send('blocking-data', {
        goal: goal,
        activity: activity,
        app: blockedApp,
        domain: domain,
        url: blockedUrl,
        blocksStopped: sessionStats.blocksStopped,
        sessionStartTime: sessionStats.sessionStartTime,
        stats: {
          totalBlockedTime: sessionStats.totalBlockedTime || 0,
          blockedAppsCount: sessionStats.blockedAppsCount || 0,
          blocksStopped: sessionStats.blocksStopped || 0,
          sessionStartTime: sessionStats.sessionStartTime || Date.now()
        },
        blockReason: process.env.BLOCK_REASON || 'ai'
      });
    });

    // Handle window close - close all windows when any window is closed
    window.on('closed', () => {
      console.log(`Display ${index + 1} window closed, closing all windows`);
      allWindows.forEach(w => {
        if (w && !w.isDestroyed()) {
          w.close();
        }
      });
      allWindows = [];
      app.quit();
    });

    allWindows.push(window);
  });

  // Focus the first window
  if (allWindows.length > 0) {
    allWindows[0].focus();
  }
}

// Create window when app is ready
app.whenReady().then(() => {
  // Handle dismiss action from renderer
  ipcMain.on('dismiss-overlay', async () => {
    console.log('Received dismiss-overlay signal from renderer');

    // Execute blocking action before closing (minimize or kill based on mode)
    await executeBlockingAction(windowInfo, blockingMode);

    console.log(`Closing ${allWindows.length} window(s)`);
    allWindows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.close();
      }
    });
    allWindows = [];
  });

  // Execute blocking action (minimize or kill)
  async function executeBlockingAction(windowInfo, blockingMode) {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    if (blockingMode === 'hard') {
      // Hard mode: Kill the process
      try {
        const appName = windowInfo.app;
        console.log(`💀 Hard Mode: Terminating ${appName}...`);

        if (process.platform === 'win32') {
          await execPromise(`taskkill /im "${appName}" /t /f`);
          console.log(`✅ Terminated ${appName} and its child processes`);
        } else if (process.platform === 'darwin' || process.platform === 'linux') {
          await execPromise(`killall "${appName}"`);
          console.log(`✅ Killed ${appName}`);
        }
      } catch (error) {
        console.error(`❌ Failed to kill process: ${error.message}`);
      }
    } else if (blockingMode === 'gentle') {
      // Gentle mode: Minimize the window
      try {
        console.log(`📉 Gentle Mode: Minimizing ${windowInfo.app}...`);

        if (process.platform === 'win32') {
          // Windows: Write PowerShell script to temp file and execute it
          const fs = require('fs');
          const os = require('os');
          const tempDir = os.tmpdir();
          const scriptPath = path.join(tempDir, `minimize_${Date.now()}.ps1`);

          const windowTitle = windowInfo.title.replace(/'/g, "''");

          const psScript = `
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Window {
  [DllImport("user32.dll")]
  [return: MarshalAs(UnmanagedType.Bool)]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  [DllImport("user32.dll", SetLastError = true)]
  public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
}
'@

$hwnd = [Window]::FindWindow($null, '${windowTitle}')
if ($hwnd -ne [IntPtr]::Zero) {
  [Window]::ShowWindow($hwnd, 6) | Out-Null
  Write-Host "Window minimized"
} else {
  Write-Host "Window not found"
}
`;

          fs.writeFileSync(scriptPath, psScript, 'utf8');

          try {
            await execPromise(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
            console.log(`✅ Minimized window: ${windowInfo.title}`);
          } finally {
            try {
              fs.unlinkSync(scriptPath);
            } catch (cleanupError) {
              console.log(`Note: Could not delete temp script: ${cleanupError.message}`);
            }
          }
        } else if (process.platform === 'darwin') {
          const appName = windowInfo.app;
          await execPromise(`osascript -e 'tell application "System Events" to tell process "${appName}" to set visible to false'`);
          console.log(`✅ Hid ${appName}`);
        }
      } catch (error) {
        console.error(`⚠️ Failed to minimize window: ${error.message}`);
      }
    }
  }

  // Handle whitelist action from renderer
  ipcMain.on('mark-as-productive', async (event, data) => {
    console.log('Received mark-as-productive signal from renderer:', data);

    try {
      let whitelistContent = '';

      if (data && data.type === 'app') {
        // Mark app as productive (use app name)
        whitelistContent = blockedApp;
        console.log(`Marking app as productive: ${whitelistContent}`);
      } else if (data && data.type === 'page') {
        // Mark specific page as productive (use full URL if available, otherwise title)
        whitelistContent = blockedUrl || activity;
        console.log(`Marking specific page as productive: ${whitelistContent}`);
      } else if (data && data.type === 'domain') {
        // Mark domain as productive
        whitelistContent = domain || activity;
        console.log(`Marking domain as productive: ${whitelistContent}`);
      } else {
        // General/legacy behavior - use activity title or domain
        whitelistContent = domain || activity;
        console.log(`Marking as productive (general): ${whitelistContent}`);
      }

      const whitelistFile = path.join(__dirname, '..', 'whitelist.txt');
      await fs.writeFile(whitelistFile, whitelistContent, 'utf8');
      console.log(`✅ Written "${whitelistContent}" to whitelist file`);
    } catch (error) {
      console.error(`❌ Error writing to whitelist file: ${error}`);
    }

    // Close all windows
    console.log(`Activity marked as productive, closing ${allWindows.length} window(s)`);
    allWindows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.close();
      }
    });
    allWindows = [];
  });

  createBlockingWindows();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createBlockingWindows();
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
