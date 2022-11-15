const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  windowClose: () => ipcRenderer.send("windowClose"),
  windowMax: () => ipcRenderer.send("windowMax"),
  windowMin: () => ipcRenderer.send("windowMin"),
  data: {
    isLoadedInApp: "windows",
  },
});
