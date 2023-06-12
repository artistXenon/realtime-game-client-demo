import { IpcMainEvent, ipcMain } from 'electron';

export class IPCTerminal {
    private static instance: IPCTerminal;
    private constructor() {}

    public static get() {
        if (IPCTerminal.instance === undefined) {
            IPCTerminal.instance = new IPCTerminal();
        }
        return IPCTerminal.instance;
    }

    public addListener(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) {
        ipcMain.on(channel, listener);
        return this;
    }
};
