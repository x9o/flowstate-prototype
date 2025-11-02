const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Send dismiss signal to main process
  dismissOverlay: () => {
    console.log('Preload: dismissOverlay called');
    ipcRenderer.send('dismiss-overlay');
  },

  // Send whitelist signal to main process
  markAsProductive: () => {
    console.log('Preload: markAsProductive called');
    ipcRenderer.send('mark-as-productive');
  },

  // Receive blocking data from main process
  onBlockingData: (callback) => {
    console.log('Preload: Setting up onBlockingData listener');
    ipcRenderer.on('blocking-data', (event, data) => {
      console.log('Preload: Received blocking data:', data);
      callback(data);
    });
  }
});

console.log('Preload script loaded successfully');
