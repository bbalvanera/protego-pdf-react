import { app, BrowserWindow, ipcMain, dialog } from 'electron'; // eslint-disable-line

const path = require('path');

const debugMode = /--debug/.test(process.argv[2]);
let win;

if (debugMode) {
  const reload = require('electron-reload'); // eslint-disable-line
  reload(__dirname);
}

function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 420,
    resizable: true,
    icon: path.join(__dirname, 'favicon.ico'),
    fullscreenable: false,
    maximizable: false,
    autoHideMenuBar: true,
  });

  win.loadURL(`file://${__dirname}/index.html`);

  if (debugMode) {
    win.webContents.openDevTools();
    const devtron = require('devtron'); // eslint-disable-line
    devtron.install();
  } else {
    win.setMenu(null);
  }

  win.on('closed', () => {
    win = null;
  });
}

function openFileDialog(sender, options) {
  dialog.showOpenDialog(win, options, files => {
    const message = {
      message: 'OPEN_FILE_DIALOG',
      data: files,
    };

    sender.send('ELECTRON_RENDERER_PROC', message);
  });
}

function openSaveDialog(sender, options) {
  dialog.showSaveDialog(win, options, file => {
    const message = {
      message: 'SAVE_FILE_DIALOG',
      data: file,
    };

    sender.send('ELECTRON_RENDERER_PROC', message);
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('ELECTRON_MAIN_PROC', (event, args) => {
  switch (args.message) {
    case 'OPEN_FILE_DIALOG':
      openFileDialog(event.sender, args.data);
      break;
    case 'SAVE_FILE_DIALOG':
      openSaveDialog(event.sender, args.data);
      break;
    default:
      break;
  }
});
