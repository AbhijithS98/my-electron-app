const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startServer, stopServer, isRunning, getPublicUrl } = require('./express-app/server');
const os = require('os');


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('renderer/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// IPC handlers
ipcMain.handle('start-server', async () => {
  const url = await startServer();
  return url; // Send public URL to renderer
});

ipcMain.handle('stop-server', () => {
  stopServer();
});

ipcMain.handle('get-server-status', () => {
  return isRunning(); 
});

ipcMain.handle('get-public-url', () => {
  return getPublicUrl();
});

ipcMain.handle('get-local-ip', () => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
});

// Clean shutdown
app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});