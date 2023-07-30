import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// create communication interface to browser
contextBridge.exposeInMainWorld("electronIPC", {
  showTime: (c: number) => ipcRenderer.send("boo", "arg1", c), // browser to node
  showedTime: (c: (e: IpcRendererEvent, a: number) => void) => ipcRenderer.on("wah", c), // node to browser

  joinMatch: (isPrivate: boolean, matchID: string | undefined) => ipcRenderer.send("join", isPrivate, matchID),

  onError: (c: (e: IpcRendererEvent, a: string) => void) => ipcRenderer.on("error", c),

  exit: (code: number) => ipcRenderer.send("app:exit", code)
});
