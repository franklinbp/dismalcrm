const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  getSettings: () => ipcRenderer.invoke("desktop:get-settings"),
  setConnection: payload => ipcRenderer.invoke("desktop:set-connection", payload),
  retryLoad: () => ipcRenderer.invoke("desktop:retry-load"),
  openSettings: () => ipcRenderer.invoke("desktop:open-settings"),
  closeSettings: () => ipcRenderer.invoke("desktop:close-settings")
});
