import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1218,
        height: 562,
        useContentSize: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // load the vite dev server URL in development, or the local file in production
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

// the renderer can't call app.quit() directly -- it asks the main
// process to do it via this IPC channel (see src/electron/preload.js)
ipcMain.handle("app:quit", () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});
