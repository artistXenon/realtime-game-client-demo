import { join } from 'path';
import { app, BrowserWindow, IpcMainEvent, Session, shell } from 'electron';

import permissions from './permissions';
import { SharedProperties } from './shared-properties';

import { GoogleCredential } from './google';
import { Lobby } from './application/lobby';
import { IPCTerminal } from './communication';

process.env.DIST = join(__dirname, '../dist');
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public');

let session: Session;

app.whenReady().then(() => {
  const win = new BrowserWindow({
    icon: join(process.env.PUBLIC, 'logo.svg'), // TODO: change
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: true,
      preload: join(__dirname, './preload.js'),
    },
    minWidth: 1280
  });
  SharedProperties.BrowserWindow = win;

  win.setMenuBarVisibility(false);
  win.setAspectRatio(16 / 9);

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main-process-message', (new Date()).toLocaleString());
  });

  win.webContents.on('will-redirect', async (event, url) => {
    if (url.startsWith(GoogleCredential.code_endpoint)) {
      event.preventDefault();
      const isCode = await SharedProperties.GoogleCredential.onCode(event, url, win!);
      if (isCode) {
        return loadGame(win);
      } else {
        return SharedProperties.GoogleCredential.promptLogin(win);
      }
    }
    if (!GoogleCredential.isGoogleAccountDomain(url)) {
      event.preventDefault();
      console.log(url);
    }    
  });

  if (false) { // !app.isPackaged
    loadGame(win);
  } else if (SharedProperties.GoogleCredential.isLocalTokenPrepared) {
    SharedProperties.GoogleCredential.refreshLocalToken()
      .then((done) => {
        if (!done) {
          SharedProperties.GoogleCredential.promptLogin(win);
        } else {
          loadGame(win);
        }
      });
  } else {
    SharedProperties.GoogleCredential.promptLogin(win);
  }
  
  session = win.webContents.session;
  // session.clearStorageData({ origin: "https://accounts.google.com/" });
  session.setPermissionRequestHandler((webContents, permission, callback, details) => { 
    callback(permissions.indexOf(permission) !== -1); 
  });

  SharedProperties.createIPCTerminal(win.webContents)
    .addListener("boo", (a, b, c) => { // browser to node
      console.log(c);
      setTimeout(() => SharedProperties.IPCTerminal.send("wah", c), 500); // node to browser
    })
    .addListener("join", async (event: IpcMainEvent, isPrivate: boolean, lobbyID: string = "") => {
      // TODO: get error message from join attempt
      const lobby = await Lobby.GetLobby(isPrivate, lobbyID);
      if (lobby === undefined) {
        SharedProperties.IPCTerminal.send("join", false, 
          {
            err: (isPrivate && lobbyID === "") ? "can not create lobby" : "can not join lobby"
          }
        );

        console.log("join failure: can not join/create lobby");
        return;
      }
      SharedProperties.Lobby = lobby; 
      await lobby.join();
      SharedProperties.IPCTerminal.send("join", true, {
        id: SharedProperties.Lobby.ID
      });
      // make join success response to renderer
    })
    .addListener("app:exit", (event: IpcMainEvent, code: number) => {
      console.log("browser requested exit with code: " + code);
      app.quit();
    })
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
    });
    return { action: 'deny' };
  })
});

app.on('window-all-closed', () => {
  app.quit();
});
