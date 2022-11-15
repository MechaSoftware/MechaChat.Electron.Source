const {
  app,
  contextBridge,
  ipcRenderer,
  BrowserWindow,
  dialog,
  Menu,
  Tray
} = require("electron");

const { autoUpdater } = require("electron-updater");

const ipc = require("electron").ipcMain;
const path = require("node:path");
const log = require("electron-log");

const WindowsToaster = require('node-notifier').WindowsToaster;

var windowsNotify = new WindowsToaster();

let win = null;
let splashWin = null;
let tray = null;
let isCompletedSplash = false;

var gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (isCompletedSplash === false) {
      if (splashWin.isMinimized()) splashWin.restore();
      splashWin.focus();
    }

    if (isCompletedSplash === true) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

log.info("MechaChat starting...");

var userRoamingData = app.getPath('userData');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

const server = 'https://dl.mecha.chat'
const updateURL = `${server}/app/${process.platform}`

autoUpdater.setFeedURL({
  provider: "generic",
  url: updateURL,
  channel: "latest"
})

function ensureSafeQuitAndInstall() {
  app.removeAllListeners('window-all-closed');

  const browserWindows = BrowserWindow.getAllWindows();

  browserWindows.forEach((browserWindow) => {
    browserWindow.removeAllListeners('close');
  });

  autoUpdater.quitAndInstall(false);
}

function showBalloonNotification(notifyTitle, notifyMessage) {
  windowsNotify.notify(
    {
      title: notifyTitle,
      message: notifyMessage,
      icon: path.join(userRoamingData, 'assets/notification_icon.png'),
      sound: 'Default',
    },
    function (error, data) {}
  );
}

function showToastUpdateReadyToInstallNotification(notifyTitle, notifyMessage) {
  windowsNotify.notify(
    {
      title: notifyTitle,
      message: notifyMessage,
      icon: path.join(userRoamingData, 'assets/notification_icon.png'),
      sound: 'Default',
      actions: ["Restart Now", "Restart Later"]
    },
    function (error, data) {
      log.info(data);

      if (data === "restart now") {
        setTimeout(() => {
          ensureSafeQuitAndInstall();
        }, 10000);
      }
    }
  );
}

const createWindow = () => {
  splashWin = new BrowserWindow({
    frame: false,
    width: 500,
    height: 348,
    minWidth: 500,
    minHeight: 348,
    show: false,
    resizable: false,
    transparent: true,
    fullscreenable: false,
    fullscreen: false,
    icon: path.join(__dirname, "UI/assets/MechaChat_260.ico"),
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  splashWin.loadFile(__dirname + "/UI/splash.html");

  splashWin.once("ready-to-show", () => {
    splashWin.show();

    autoUpdater.checkForUpdates();
  });
};

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.mechachat.app");
  }

  createWindow();
});

app.on("window-all-closed", (event, data) => {
  app.quit();
});

ipc.on("windowMin", (event, data) => {
  win.minimize();
});

ipc.on("windowClose", (event, data) => {
  const template = [
    {
      label: "MechaChat",
      icon: __dirname + "/UI/assets/Gradient_16.png",
      enabled: false,
    },
    {
      type: "separator",
    },
    {
      label: "Open MechaChat",
      click: function () {
        win.show();
        createNewDefaultTray();
      },
    },
    {
      type: "separator",
    },
    {
      label: "Check for Updates...",
      click: function () {
        autoUpdater.checkForUpdates();

        showBalloonNotification("Update Checker", "Checking for updates!");
      },
    },
    {
      type: "separator",
    },
    {
      label: "Quit MechaChat",
      click: function () {
        app.quit();
      },
    },
  ];

  const contextMenu = Menu.buildFromTemplate(template);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("MechaChat");

  tray.on("click", function (e) {
    win.show();
    createNewDefaultTray();
  });

  win.hide();
});

function createNewDefaultTray() {
  if (tray === null) {
    tray = new Tray(__dirname + "/UI/assets/Gradient.png");
  }

  const template = [
    {
      label: "MechaChat",
      icon: __dirname + "/UI/assets/Gradient_16.png",
      enabled: false,
    },
    {
      type: "separator",
    },
    {
      label: "Check for Updates...",
      click: function () {
        autoUpdater.checkForUpdates();

        showBalloonNotification("Update Checker", "Checking for updates!");
      },
    },
    {
      type: "separator",
    },
    {
      label: "Quit MechaChat",
      click: function () {
        app.quit();
      },
    },
  ];

  const contextMenu = Menu.buildFromTemplate(template);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("MechaChat");

  tray.on("click", function (e) {
    win.show();
    createNewDefaultTray();
  });
}

ipc.on("windowMax", (event, data) => {
  win.isMaximized() ? win.unmaximize() : win.maximize();
});

autoUpdater.on("update-not-available", () => {
  log.info("Update not available.");

  if (isCompletedSplash === false) {
    splashWin.webContents.send("no-update-available");

    setTimeout(() => {
      splashWin.close();
      isCompletedSplash = true;

      win = new BrowserWindow({
        frame: false,
        width: 800,
        height: 600,
        minWidth: 900,
        minHeight: 700,
        show: false,
        resizable: true,
        fullscreenable: false,
        fullscreen: false,
        icon: path.join(__dirname, "UI/assets/MechaChat_260.ico"),
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          preload: path.join(__dirname, "preload.js"),
        },
      });

      win.loadURL("https://mecha.chat/app/dashboard/home");

      createNewDefaultTray();

      win.maximize();
      win.show();

      setInterval(function () {
        autoUpdater.checkForUpdates();
      }, 60000 * 10);
    }, 6000);
  }
});

autoUpdater.on("update-available", () => {
  log.info("Update available.");
  
  if (isCompletedSplash === false) {
    splashWin.webContents.send("update-available");
  }

  autoUpdater.downloadUpdate();
});

autoUpdater.on("error", (err) => {
  log.info("Update Error: " + err);
});

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  log.info("Update downloaded.");

  if (isCompletedSplash === true) {
    showToastUpdateReadyToInstallNotification("Update Available", "MechaChat needs to be restarted!");
  }

  if (isCompletedSplash === false) {
    setTimeout(() => {
      ensureSafeQuitAndInstall();
    }, 10000);
  }
});
