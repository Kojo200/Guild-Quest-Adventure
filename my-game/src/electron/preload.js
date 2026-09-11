import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    platform: process.platform,
    quit: () => ipcRenderer.invoke("app:quit"),
});
