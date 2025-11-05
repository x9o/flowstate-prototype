const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  unmaximize: () => ipcRenderer.invoke('window-unmaximize'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  close: () => ipcRenderer.invoke('window-close'),

  // Theme controls
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),

  // Monitoring controls
  startMonitoring: (goals, duration, whitelist, blocklist) => ipcRenderer.invoke('start-monitoring', goals, duration, whitelist, blocklist),
  stopMonitoring: () => ipcRenderer.invoke('stop-monitoring'),
  getMonitoringStatus: () => ipcRenderer.invoke('get-monitoring-status'),

  // Listen for window state changes
  onWindowMaximize: (callback) => ipcRenderer.on('window-maximized', callback),
  onWindowUnmaximize: (callback) => ipcRenderer.on('window-unmaximized', callback),
  onThemeChange: (callback) => ipcRenderer.on('theme-changed', callback),

  // Listen for monitoring events
  onMonitoringStatusChange: (callback) => ipcRenderer.on('monitoring-status-change', callback),
  onWindowDetected: (callback) => ipcRenderer.on('window-detected', callback),
  onActivityBlocked: (callback) => ipcRenderer.on('activity-blocked', callback),
  onMonitoringError: (callback) => ipcRenderer.on('monitoring-error', callback),

  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});