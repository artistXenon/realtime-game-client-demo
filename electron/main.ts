// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

import { join } from 'path'
import { app, BrowserWindow, ipcMain, Session } from 'electron'

let win: BrowserWindow | null
let session: Session;
// Here, you can also use other preload
const preload = join(__dirname, './preload.js')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const url = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: join(process.env.PUBLIC, 'logo.svg'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload,
    },
  })

  win.setAspectRatio(16/9)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (url) {
    win.loadURL(url)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(join(process.env.DIST, 'index.html'))
  }
  session = win.webContents.session
  
  session.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
        if (permission === "fullscreen") {
            callback(true);
        }
    }
  );

  ipcMain.on("boo", (a, b, c) => { // browser to node
    console.log(c)
    setTimeout(() => {
      win?.webContents.send("wah", c) // node to browser
    }, 1000)
  })
}

app.on('window-all-closed', () => {
  win = null
})

app.whenReady().then(createWindow)
