const path = require("path");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const Store = require("electron-store");

const store = new Store({
  name: "settings",
  defaults: {
    connectionName: "",
    appUrl: process.env.DESKTOP_APP_URL || "http://localhost:3002",
    backendUrl: "",
    hackerMode: process.env.HACKER_MODE !== "false"
  }
});

let mainWindow = null;
let settingsWindow = null;
let hackerCssKey = null;
let loadingOffline = false;

const normalizeUrl = value => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
};

const parseHttpUrl = value => {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed;
  } catch (_err) {
    return null;
  }
};

const getAllowedOrigin = () => {
  const parsed = parseHttpUrl(store.get("appUrl"));
  return parsed ? parsed.origin : null;
};

const isAllowedNavigation = url => {
  if (/^file:\/\//i.test(url)) return true;
  const parsed = parseHttpUrl(url);
  if (!parsed) return false;
  const allowedOrigin = getAllowedOrigin();
  if (!allowedOrigin) return false;
  return parsed.origin === allowedOrigin;
};

const decodeConnectionCode = code => {
  if (!code || typeof code !== "string") return null;
  const raw = code.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) {
    return {
      connectionName: "",
      appUrl: normalizeUrl(raw),
      backendUrl: ""
    };
  }

  if (!raw.startsWith("DCRM1-")) return null;
  const encoded = raw.slice("DCRM1-".length);

  try {
    const json = Buffer.from(encoded, "base64").toString("utf8");
    const data = JSON.parse(json);
    return {
      connectionName: (data.name || "").toString(),
      appUrl: normalizeUrl(data.appUrl || data.frontendUrl || ""),
      backendUrl: normalizeUrl(data.backendUrl || data.apiUrl || "")
    };
  } catch (_err) {
    return null;
  }
};

const hackerCss = `
  :root {
    --hacker-bg: #020702;
    --hacker-surface: #041104;
    --hacker-green: #54ff54;
    --hacker-green-soft: #8cff8c;
  }

  body {
    background: var(--hacker-bg) !important;
    color: var(--hacker-green-soft) !important;
    font-family: "JetBrains Mono", "Fira Code", monospace !important;
    text-shadow: 0 0 3px rgba(84, 255, 84, 0.15);
  }

  .MuiPaper-root {
    background-color: var(--hacker-surface) !important;
    border: 1px solid rgba(84, 255, 84, 0.2) !important;
  }

  .MuiButton-containedPrimary,
  .MuiButton-outlinedPrimary {
    border-color: rgba(84, 255, 84, 0.4) !important;
    color: var(--hacker-green) !important;
  }

  .MuiTableCell-root,
  .MuiTypography-root,
  .MuiInputBase-input,
  .MuiFormLabel-root {
    color: var(--hacker-green-soft) !important;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: rgba(84, 255, 84, 0.3) !important;
  }
`;

const applyHackerMode = async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const enabled = store.get("hackerMode");
  if (!enabled) return;

  if (hackerCssKey) {
    try {
      await mainWindow.webContents.removeInsertedCSS(hackerCssKey);
    } catch (_err) {}
  }
  hackerCssKey = await mainWindow.webContents.insertCSS(hackerCss);
};

const clearHackerMode = async () => {
  if (!mainWindow || mainWindow.isDestroyed() || !hackerCssKey) return;
  try {
    await mainWindow.webContents.removeInsertedCSS(hackerCssKey);
  } catch (_err) {}
  hackerCssKey = null;
};

const injectSettingsFab = async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  await mainWindow.webContents.executeJavaScript(`
    (() => {
      const ID = "dismalcrm-desktop-settings-fab";
      if (document.getElementById(ID)) return;

      const btn = document.createElement("button");
      btn.id = ID;
      btn.type = "button";
      btn.innerHTML = '<span style="font-size:14px;line-height:1">⚙</span><span>Config</span>';
      btn.setAttribute("aria-label", "Abrir configuracion");
      btn.style.position = "fixed";
      btn.style.right = "16px";
      btn.style.bottom = "16px";
      btn.style.zIndex = "2147483647";
      btn.style.border = "1px solid rgba(84, 255, 84, 0.45)";
      btn.style.background = "#072007";
      btn.style.color = "#54ff54";
      btn.style.padding = "6px 10px";
      btn.style.borderRadius = "8px";
      btn.style.cursor = "pointer";
      btn.style.fontFamily = "JetBrains Mono, Fira Code, monospace";
      btn.style.fontSize = "11px";
      btn.style.opacity = "0.92";
      btn.style.display = "inline-flex";
      btn.style.alignItems = "center";
      btn.style.gap = "6px";

      btn.addEventListener("mouseenter", () => {
        btn.style.background = "#0a280a";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "#072007";
      });
      btn.addEventListener("click", () => {
        if (window.desktopAPI && typeof window.desktopAPI.openSettings === "function") {
          window.desktopAPI.openSettings();
        }
      });

      document.body.appendChild(btn);
    })();
  `, true);
};

const loadApp = async () => {
  const appUrl = normalizeUrl(store.get("appUrl"));
  const parsed = parseHttpUrl(appUrl);
  if (!parsed) {
    throw new Error("La URL del panel web no es valida");
  }
  await mainWindow.loadURL(appUrl);
};

const loadOfflinePage = async ({ code = "", reason = "Unknown error", failedUrl = "" } = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (loadingOffline) return;

  loadingOffline = true;
  try {
    const fallbackPath = path.join(__dirname, "../renderer/offline.html");
    await mainWindow.loadFile(fallbackPath, {
      query: {
        failedUrl: failedUrl || store.get("appUrl"),
        code: String(code || ""),
        reason: reason || "Unknown error"
      }
    });
  } catch (err) {
    await mainWindow.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent("<h2 style='font-family:monospace'>Error al cargar pantalla offline</h2>")
    );
  } finally {
    loadingOffline = false;
  }
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#020702",
    title: "DismalCRM Desktop",
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.webContents.on("did-finish-load", async () => {
    const currentUrl = mainWindow.webContents.getURL() || "";
    if (/^https?:\/\//i.test(currentUrl)) {
      await injectSettingsFab();
    }
    if (store.get("hackerMode")) {
      await applyHackerMode();
    }
  });

  const onLoadFailed = async (_event, code, desc, url, isMainFrame) => {
    if (isMainFrame === false) return;
    // Ignore aborts caused by internal redirects/reloads.
    if (code === -3) return;
    await loadOfflinePage({
      code,
      reason: desc,
      failedUrl: url
    });
  };

  mainWindow.webContents.on("did-fail-load", onLoadFailed);
  mainWindow.webContents.on("did-fail-provisional-load", onLoadFailed);

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isAllowedNavigation(url)) return;
    event.preventDefault();
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedNavigation(url)) {
      mainWindow.loadURL(url);
    } else {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  loadApp().catch(async () => {
    await loadOfflinePage({
      code: "CONFIG",
      reason: "URL del panel web invalida",
      failedUrl: store.get("appUrl")
    });
  });
};

const openSettingsWindow = () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 560,
    height: 620,
    resizable: false,
    title: "Configuracion",
    parent: mainWindow || undefined,
    modal: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });

  settingsWindow.loadFile(path.join(__dirname, "../renderer/settings.html"));
};

const toggleHackerMode = async () => {
  const current = store.get("hackerMode");
  store.set("hackerMode", !current);

  if (!current) {
    await applyHackerMode();
  } else {
    await clearHackerMode();
  }
};

const setupMenu = () => {
  const template = [
    {
      label: "App",
      submenu: [
        {
          label: "Configuracion",
          accelerator: "CmdOrCtrl+,",
          click: () => openSettingsWindow()
        },
        { type: "separator" },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow && mainWindow.webContents.reload()
        },
        {
          label: "Hard Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => mainWindow && mainWindow.webContents.reloadIgnoringCache()
        },
        {
          label: "Toggle Hacker Mode",
          accelerator: "CmdOrCtrl+Shift+H",
          click: () => toggleHackerMode()
        },
        {
          label: "Toggle DevTools",
          accelerator: "CmdOrCtrl+Shift+I",
          click: () => mainWindow && mainWindow.webContents.toggleDevTools()
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit()
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.whenReady().then(() => {
  createMainWindow();
  setupMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("desktop:get-settings", async () => {
  return {
    connectionName: store.get("connectionName"),
    appUrl: store.get("appUrl"),
    backendUrl: store.get("backendUrl"),
    hackerMode: store.get("hackerMode"),
    version: app.getVersion()
  };
});

ipcMain.handle("desktop:set-connection", async (_event, payload) => {
  const data = payload || {};
  const fromCode = decodeConnectionCode(data.code);

  const connectionName =
    (fromCode?.connectionName || data.connectionName || "").toString().trim();
  const appUrl = normalizeUrl(fromCode?.appUrl || data.appUrl || "");
  const backendUrl = normalizeUrl(fromCode?.backendUrl || data.backendUrl || "");

  if (!appUrl) {
    throw new Error("Debe indicar la URL del panel web");
  }

  if (!parseHttpUrl(appUrl)) {
    throw new Error("La URL del panel web no es valida");
  }

  if (backendUrl && !parseHttpUrl(backendUrl)) {
    throw new Error("La URL del backend/API no es valida");
  }

  store.set("connectionName", connectionName);
  store.set("appUrl", appUrl);
  store.set("backendUrl", backendUrl);

  if (mainWindow) {
    await loadApp();
  }

  return {
    connectionName: store.get("connectionName"),
    appUrl: store.get("appUrl"),
    backendUrl: store.get("backendUrl")
  };
});

ipcMain.handle("desktop:retry-load", async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { ok: false };
  await loadApp();
  return { ok: true };
});

ipcMain.handle("desktop:open-settings", async () => {
  openSettingsWindow();
  return { ok: true };
});

ipcMain.handle("desktop:close-settings", async () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
  }
  return { ok: true };
});
