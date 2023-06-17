import { IpcMainEvent, WebContents, ipcMain } from 'electron';

export class IPCTerminal {
    private web: WebContents;

    constructor(web: WebContents) {
        this.web = web;
    }

    public addListener(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) {
        ipcMain.on(channel, listener);
        return this;
    }

    public send(channel: string, ...args: any[]) {
        this.web.send(channel, ...args);
    }
};
