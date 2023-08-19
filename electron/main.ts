import { join } from 'path';
import { app, BrowserWindow, Session, shell } from 'electron';

import permissions from './permissions';
import { Preferences } from './preferences';
import { SharedProperties } from './shared-properties';

import { GoogleCredential } from './google';

process.env.DIST = join(__dirname, '../dist');
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public');

SharedProperties.Preferences = new Preferences();

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

    SharedProperties.GoogleCredential = new GoogleCredential();

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
    // TODO: config to decide save account
    // session.clearStorageData({ origin: "https://accounts.google.com/" });
    session.setPermissionRequestHandler((webContents, permission, callback, details) => { callback(permissions.indexOf(permission) !== -1); });

    SharedProperties.createIPCTerminal(win.webContents);
});

app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        setImmediate(() => { shell.openExternal(url); });
        return { action: 'deny' };
    })
});

app.on('window-all-closed', () => { app.quit(); });

function loadGame(win: BrowserWindow) {
    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open devTool if the app is not packaged
        win.webContents.openDevTools();
    } else {
        win.loadFile(join(process.env.DIST, 'index.html'));
    }
}
