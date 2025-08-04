const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startServer, stopServer, isRunning } = require('./express-app/server');

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
ipcMain.handle('start-server', () => {
  startServer();
});

ipcMain.handle('stop-server', () => {
  stopServer();
});

ipcMain.handle('get-server-status', () => {
  return isRunning(); 
});

// Clean shutdown
app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});