const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose safe IPC methods to renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Monitoring controls
  startMonitoring: (goal) => {
    ipcRenderer.send('start-monitoring', goal);
  },

  stopMonitoring: () => {
    ipcRenderer.send('stop-monitoring');
  },

  // Listen for monitoring events
  onMonitoringStarted: (callback) => {
    ipcRenderer.on('monitoring-started', (event, data) => {
      callback(data);
    });
  },

  onMonitoringStopped: (callback) => {
    ipcRenderer.on('monitoring-stopped', (event, data) => {
      callback(data);
    });
  },

  onMonitoringStatus: (callback) => {
    ipcRenderer.on('monitoring-status', (event, status) => {
      callback(status);
    });
  },

  // Listen for monitoring output from backend
  onMonitoringOutput: (callback) => {
    ipcRenderer.on('monitoring-output', (event, data) => {
      callback(data);
    });
  },

  // Listen for monitoring errors from backend
  onMonitoringError: (callback) => {
    ipcRenderer.on('monitoring-error', (event, error) => {
      callback(error);
    });
  },

  // Local storage operations (for task persistence)
  store: {
    get: (key) => {
      return localStorage.getItem(key);
    },
    set: (key, value) => {
      localStorage.setItem(key, value);
    }
  }
});
