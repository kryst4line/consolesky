const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? { titleBarOverlay: {
      color: 'white',
        height: 21
      } } : {})
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `docs/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
