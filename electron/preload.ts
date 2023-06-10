import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// create communication interface to browser
contextBridge.exposeInMainWorld("electronIPC", {
  showTime: (c: number) => ipcRenderer.send("boo", "arg1", c), // browser to node
  showedTime: (c: (e: IpcRendererEvent, a: number) => void) => ipcRenderer.on("wah", c) // node to browser
});
