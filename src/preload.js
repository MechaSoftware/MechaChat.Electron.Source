<<<<<<< Updated upstream
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    loadPreferences: () => ipcRenderer.invoke('load-prefs');
});
=======
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  windowClose: () => ipcRenderer.send("windowClose"),
  windowMax: () => ipcRenderer.send("windowMax"),
  windowMin: () => ipcRenderer.send("windowMin"),
  data: {
    isLoadedInApp: "windows",
  },
});
>>>>>>> Stashed changes
