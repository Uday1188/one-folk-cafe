const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  platform: process.platform,
  
  // Database backup and restore
  backupDatabase: () => ipcRenderer.invoke('database:backup'),
  restoreDatabase: () => ipcRenderer.invoke('database:restore'),
  
  // Menu publishing
  publishMenu: () => ipcRenderer.invoke('menu:publish'),
  
  // Utility actions
  openDataFolder: () => ipcRenderer.invoke('system:open-data-folder'),
  getSystemStatus: () => ipcRenderer.invoke('system:get-status'),
  restartBackend: () => ipcRenderer.invoke('system:restart-backend'),

  // Listeners
  onStatusUpdate: (callback) => {
    ipcRenderer.on('backend:status', (_, status) => callback(status));
  }
});
