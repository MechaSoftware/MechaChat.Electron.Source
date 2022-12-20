const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  windowClose: () => ipcRenderer.send("macosClose"),
  windowMax: () => ipcRenderer.send("macosMax"),
  windowMin: () => ipcRenderer.send("macosMin"),
  data: {
    isLoadedInApp: "macos",
  },
});
