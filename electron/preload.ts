import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// create communication interface to browser
contextBridge.exposeInMainWorld("electronIPC", {
    showTime: (c: number) => ipcRenderer.send("boo", "arg1", c), // browser to node
    showedTime: (c: (e: IpcRendererEvent, a: number) => void) => ipcRenderer.on("wah", c), // node to browser

    listenToPreference: (c: (e: IpcRendererEvent, result: unknown) => void) => ipcRenderer.on("preference", c),
    getPreference: () => ipcRenderer.send("preference"),
    updatePreference: (v: unknown) => ipcRenderer.send("preference:update", v),

    joinLobby: (isPrivate: boolean, matchID: string | undefined) => ipcRenderer.send("join", isPrivate, matchID),
    joinResult: (c: (e: IpcRendererEvent, success: boolean, err: string) => void) => ipcRenderer.once("join", c),

    listenToLobby: (
        onInfo: (e: IpcRendererEvent, result: unknown) => void, 
        onLeave: (e: IpcRendererEvent, code: number) => void) => {
        ipcRenderer.removeAllListeners("lobby:info");
        ipcRenderer.on("lobby:info", onInfo);
        ipcRenderer.removeAllListeners("lobby:leave");
        ipcRenderer.once("lobby:leave", onLeave);

        ipcRenderer.send("lobby:ready");
    },
    getLobby: () => ipcRenderer.send("lobby:info"),
    leaveLobby: (id: string) => ipcRenderer.send("lobby:leave", id),

    onError: (c: (e: IpcRendererEvent, a: string) => void) => ipcRenderer.on("error", c),

    exit: (code: number) => ipcRenderer.send("app:exit", code)
});
