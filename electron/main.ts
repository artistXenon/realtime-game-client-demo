process.env.DIST = join(__dirname, '../dist');
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public');

import { join } from 'path';
import { app, BrowserWindow, ipcMain, Session, shell } from 'electron';

import permissions from './permissions';
import { SharedProperties } from './shared-properties';

import GoogleCredential from './google';

let win: BrowserWindow | null;
let session: Session;

const googleCredential = new GoogleCredential();

app.whenReady().then(() => {
  win = new BrowserWindow({
    icon: join(process.env.PUBLIC, 'logo.svg'), // TODO: change
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: true,
      preload: join(__dirname, './preload.js'),
    },
  });
  SharedProperties.BrowserWindow = win;

  win.setAspectRatio(16 / 9);

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  win.webContents.on('will-redirect', async function (event, url) {
    if (url.startsWith(GoogleCredential.code_endpoint)) {
      event.preventDefault();
      const isCode = await googleCredential.onCode(event, url, win!);
      if (isCode) {
        loadGame(win!);
        return;
      } else {
        googleCredential.promptLogin(win!);
        return;
      }
    }
    if (!GoogleCredential.isGoogleAccountDomain(url)) {
      event.preventDefault();
      console.log(url);
    }    
  });

  if (googleCredential.isLocalTokenPrepared) {
    googleCredential.refreshLocalToken()
      .then((done) => {
        if (!done) {
          googleCredential.promptLogin(win!);
        } else {
          loadGame(win!);
        }
      });
  } else {
    googleCredential.promptLogin(win!);
  }
  
  session = win.webContents.session;
  // session.clearStorageData({ origin: "https://accounts.google.com/" });
  session.setPermissionRequestHandler((webContents, permission, callback, details) => { callback(permissions.indexOf(permission) !== -1); });

  ipcMain.on("boo", (a, b, c) => { // browser to node
    console.log(c);
    setTimeout(() => win?.webContents.send("wah", c), 500); // node to browser
  });
});

function loadGame(win: BrowserWindow) {
  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(process.env.DIST, 'index.html'));
  }
}


app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    setImmediate(() => {
      shell.openExternal(url);
    })
    return { action: 'deny' };
  })
});

app.on('window-all-closed', () => {
  app.quit();
});
