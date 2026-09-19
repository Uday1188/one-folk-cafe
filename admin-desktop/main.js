const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, utilityProcess } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const http = require('http');

// Global exception handling to prevent uncaught error dialogs
process.on('uncaughtException', (err) => {
  console.error('[Main Process Exception]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Main Process Rejection]', reason);
});

// ==========================================
// 1. SINGLE INSTANCE LOCK (Prevents multiple app launches)
// ==========================================
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[App] Another instance is already running. Quitting duplicate.');
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let splashWindow = null;
let tray = null;
let backendProcess = null;
let frontendProcess = null;
let isQuitting = false;

const isDev = !app.isPackaged;
const BACKEND_PORT = 8080;
const FRONTEND_PORT = 3000;

// ==========================================
// 2. PATH RESOLUTION HELPERS
// ==========================================
function getDbPath() {
  const dataDir = isDev
    ? path.join(__dirname, '..', 'backend', 'data')
    : path.join(app.getPath('userData'), 'database');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'one-folk-cafe.db');
}

function getJavaExecutable() {
  const possibleJrePaths = [
    path.join(process.resourcesPath, 'jre', 'bin', 'java.exe'),
    path.join(process.resourcesPath, 'resources', 'jre', 'bin', 'java.exe'),
    path.join(__dirname, 'resources', 'jre', 'bin', 'java.exe')
  ];

  for (const jrePath of possibleJrePaths) {
    if (fs.existsSync(jrePath)) {
      console.log('[System] Found bundled JRE:', jrePath);
      return jrePath;
    }
  }
  return 'java';
}

function getJarPath() {
  const possibleJarPaths = [
    path.join(process.resourcesPath, 'backend.jar'),
    path.join(process.resourcesPath, 'resources', 'backend.jar'),
    path.join(__dirname, 'resources', 'backend.jar'),
    path.join(__dirname, '..', 'backend.jar'),
    path.join(__dirname, '..', 'backend', 'build', 'libs', 'friends-cafe-backend-0.0.1-SNAPSHOT.jar')
  ];

  for (const jarPath of possibleJarPaths) {
    if (fs.existsSync(jarPath)) {
      return jarPath;
    }
  }
  return path.join(process.resourcesPath, 'backend.jar');
}

function getFrontendServerPath() {
  const possiblePaths = [
    path.join(process.resourcesPath, 'frontend', 'server.js'),
    path.join(process.resourcesPath, 'resources', 'frontend', 'server.js'),
    path.join(__dirname, 'resources', 'frontend', 'server.js'),
    path.join(__dirname, '..', 'frontend', '.next', 'standalone', 'server.js')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// ==========================================
// 3. PROCESS LIFECYCLE MANAGEMENT
// ==========================================
function startBackend() {
  const javaExe = getJavaExecutable();
  const jarPath = getJarPath();
  const dbPath = getDbPath();

  console.log(`[Backend] Starting Spring Boot: ${jarPath}`);
  console.log(`[Backend] SQLite Database: ${dbPath}`);

  const args = [
    '-Xms64m',
    '-Xmx256m',
    '-XX:+UseG1GC',
    '-jar',
    jarPath,
    '--spring.profiles.active=sqlite',
    `--DB_PATH=${dbPath}`,
    `--server.port=${BACKEND_PORT}`,
    '--server.address=127.0.0.1'
  ];

  try {
    backendProcess = spawn(javaExe, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend STDOUT] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend STDERR] ${data.toString().trim()}`);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`[Backend] Exited code ${code}, signal ${signal}`);
      backendProcess = null;
    });

    backendProcess.on('error', (err) => {
      console.error('[Backend] Failed to start backend:', err);
    });
  } catch (err) {
    console.error('[Backend] Spawn error:', err);
  }
}

function startFrontendServer() {
  const serverPath = getFrontendServerPath();
  if (!serverPath) {
    console.log('[Frontend] No bundled standalone server.js found, relying on existing server.');
    return;
  }

  console.log(`[Frontend] Launching standalone server: ${serverPath}`);
  const workingDir = path.dirname(serverPath);

  try {
    // Check if node is available or use utilityProcess
    frontendProcess = utilityProcess.fork(serverPath, [], {
      cwd: workingDir,
      env: {
        ...process.env,
        PORT: String(FRONTEND_PORT),
        HOSTNAME: '127.0.0.1',
        NODE_ENV: 'production'
      },
      stdio: 'pipe'
    });

    frontendProcess.stdout?.on('data', (data) => {
      console.log(`[Frontend STDOUT] ${data.toString().trim()}`);
    });

    frontendProcess.stderr?.on('data', (data) => {
      console.error(`[Frontend STDERR] ${data.toString().trim()}`);
    });

    frontendProcess.on('exit', (code) => {
      console.log(`[Frontend] Process exited with code ${code}`);
      frontendProcess = null;
    });
  } catch (e) {
    console.warn('[Frontend] utilityProcess.fork failed, attempting spawn:', e);
    try {
      frontendProcess = spawn('node', ['server.js'], {
        cwd: workingDir,
        windowsHide: true,
        env: {
          ...process.env,
          PORT: String(FRONTEND_PORT),
          HOSTNAME: '127.0.0.1',
          NODE_ENV: 'production'
        }
      });
    } catch (spawnErr) {
      console.error('[Frontend] Could not start frontend server:', spawnErr);
    }
  }
}

function stopAllProcesses() {
  if (backendProcess && backendProcess.pid) {
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${backendProcess.pid} /T /F`);
      } else {
        backendProcess.kill('SIGTERM');
      }
    } catch (e) {
      console.error('[Backend] Termination error:', e);
    }
    backendProcess = null;
  }

  if (frontendProcess) {
    try {
      if (frontendProcess.kill) {
        frontendProcess.kill();
      } else if (frontendProcess.pid && process.platform === 'win32') {
        exec(`taskkill /pid ${frontendProcess.pid} /T /F`);
      }
    } catch (e) {
      console.error('[Frontend] Termination error:', e);
    }
    frontendProcess = null;
  }
}

// Health check helper
function pingUrl(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for both backend and frontend to be up
async function waitForServices(onProgress, maxWaitSec = 60) {
  const start = Date.now();
  let backendReady = false;
  let frontendReady = false;

  while ((Date.now() - start) < (maxWaitSec * 1000)) {
    if (!backendReady) {
      backendReady = await pingUrl(`http://127.0.0.1:${BACKEND_PORT}/api/health`);
      if (backendReady && onProgress) onProgress('Backend service ready. Connecting frontend...');
    }

    if (!frontendReady) {
      frontendReady = await pingUrl(`http://127.0.0.1:${FRONTEND_PORT}/admin/login`);
      if (frontendReady && onProgress) onProgress('Frontend interface ready!');
    }

    if (backendReady && frontendReady) {
      return true;
    }

    await new Promise((r) => setTimeout(r, 600));
  }

  return backendReady && frontendReady;
}

// ==========================================
// 4. WINDOW MANAGEMENT
// ==========================================
function createSplashWindow() {
  if (splashWindow && !splashWindow.isDestroyed()) return;

  splashWindow = new BrowserWindow({
    width: 480,
    height: 380,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    show: true,
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function updateSplashStatus(text, progress) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('backend:status', { text, progress });
  }
}

function getIconPath() {
  const paths = [
    path.join(process.resourcesPath, 'icon.png'),
    path.join(process.resourcesPath, 'resources', 'icon.png'),
    path.join(__dirname, 'resources', 'icon.png')
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(__dirname, 'resources', 'icon.png');
}

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'One Folk Cafe - Admin Desktop Suite',
    icon: getIconPath(),
    show: false,
    backgroundColor: '#120d0b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Security: Prevent navigation outside local host and open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  const targetUrl = `http://127.0.0.1:${FRONTEND_PORT}/admin/dashboard`;
  mainWindow.loadURL(targetUrl).catch(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(`http://127.0.0.1:${FRONTEND_PORT}/admin/login`);
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = getIconPath();
  if (!fs.existsSync(iconPath)) return;

  try {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Dashboard',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createMainWindow();
          }
        }
      },
      {
        label: 'Backup Database...',
        click: () => triggerBackup()
      },
      {
        label: 'Open Data Directory',
        click: () => shell.openPath(path.dirname(getDbPath()))
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('One Folk Cafe Admin');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      } else {
        createMainWindow();
      }
    });
  } catch (err) {
    console.warn('[Tray] Could not initialize tray:', err);
  }
}

// ==========================================
// 5. NATIVE DIALOGS & IPC
// ==========================================
async function triggerBackup() {
  const defaultFilename = `one-folk-cafe_backup_${new Date().toISOString().slice(0, 10)}.db`;
  const result = await dialog.showSaveDialog(mainWindow || undefined, {
    title: 'Backup One Folk Cafe Database',
    defaultPath: path.join(app.getPath('documents'), defaultFilename),
    filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
  });

  if (result.canceled || !result.filePath) return;

  const targetPath = result.filePath;
  const postData = JSON.stringify({ targetPath });

  const req = http.request({
    hostname: '127.0.0.1',
    port: BACKEND_PORT,
    path: '/api/admin/backup/export-to-path',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          dialog.showMessageBox(mainWindow || undefined, {
            type: 'info',
            title: 'Backup Successful',
            message: `Database backup created successfully!\n\nSaved to: ${targetPath}`
          });
        } else {
          dialog.showErrorBox('Backup Failed', response.message || 'Unknown error');
        }
      } catch (e) {
        dialog.showErrorBox('Backup Error', 'Failed to parse server response');
      }
    });
  });

  req.on('error', (e) => {
    dialog.showErrorBox('Backup Failed', `Connection error: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

function setupIPC() {
  ipcMain.handle('database:backup', async () => {
    await triggerBackup();
  });

  ipcMain.handle('database:restore', async () => {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      title: 'Select Backup Database to Restore',
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return false;

    const sourcePath = result.filePaths[0];

    const confirm = await dialog.showMessageBox(mainWindow || undefined, {
      type: 'warning',
      buttons: ['Cancel', 'Restore Database'],
      defaultId: 0,
      cancelId: 0,
      title: 'Confirm Database Restore',
      message: 'Restoring a database will replace the current cafe records.\nA pre-restore safety backup will be automatically saved.\n\nDo you want to proceed?'
    });

    if (confirm.response !== 1) return false;

    const postData = JSON.stringify({ sourcePath });
    return new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: BACKEND_PORT,
        path: '/api/admin/backup/restore-from-path',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const resp = JSON.parse(data);
            if (resp.success) {
              dialog.showMessageBox(mainWindow || undefined, {
                type: 'info',
                title: 'Restore Completed',
                message: `${resp.message}\n\nPlease click OK to reload the dashboard.`
              }).then(() => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.reload();
                }
              });
              resolve(true);
            } else {
              dialog.showErrorBox('Restore Failed', resp.message || 'Unknown error');
              resolve(false);
            }
          } catch (e) {
            dialog.showErrorBox('Restore Error', 'Invalid server response');
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        dialog.showErrorBox('Restore Error', e.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  });

  ipcMain.handle('menu:publish', async () => {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: BACKEND_PORT,
        path: '/api/admin/publish-menu/export-local',
        method: 'POST'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const resp = JSON.parse(data);
            resolve(resp);
          } catch (e) {
            resolve({ success: false, message: e.message });
          }
        });
      });
      req.on('error', (e) => resolve({ success: false, message: e.message }));
      req.end();
    });
  });

  ipcMain.handle('system:open-data-folder', () => {
    const dataDir = path.dirname(getDbPath());
    shell.openPath(dataDir);
  });

  ipcMain.handle('system:restart-backend', async () => {
    try {
      if (backendProcess && backendProcess.pid) {
        if (process.platform === 'win32') {
          exec(`taskkill /pid ${backendProcess.pid} /T /F`);
        } else {
          backendProcess.kill();
        }
        backendProcess = null;
      }
      await new Promise(r => setTimeout(r, 1200));
      startBackend();
      const ready = await waitForServices(null, 30);
      return { success: ready };
    } catch (e) {
      return { success: false, message: e.message };
    }
  });
}

// ==========================================
// 6. APPLICATION STARTUP FLOW
// ==========================================
app.on('second-instance', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  } else if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.focus();
  }
});

app.whenReady().then(async () => {
  setupIPC();
  createSplashWindow();
  createTray();

  // Check backend
  const backendAlreadyRunning = await pingUrl(`http://127.0.0.1:${BACKEND_PORT}/api/health`);
  if (!backendAlreadyRunning) {
    updateSplashStatus('Starting local Spring Boot engine...', 30);
    startBackend();
  } else {
    console.log('[App] Existing backend instance detected.');
    updateSplashStatus('Local backend connected...', 50);
  }

  // Check frontend
  const frontendAlreadyRunning = await pingUrl(`http://127.0.0.1:${FRONTEND_PORT}/admin/login`);
  if (!frontendAlreadyRunning) {
    updateSplashStatus('Starting desktop interface server...', 65);
    startFrontendServer();
  } else {
    console.log('[App] Existing frontend instance detected.');
    updateSplashStatus('Desktop interface connected...', 80);
  }

  // Wait for both services to respond
  updateSplashStatus('Synchronizing offline database...', 90);
  const ready = await waitForServices((msg) => updateSplashStatus(msg, 95), 60);

  if (ready) {
    updateSplashStatus('Launching One Folk Cafe Admin...', 100);
    createMainWindow();
  } else {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    dialog.showErrorBox(
      'Startup Error',
      'The local One Folk Cafe service could not be initialized.\nPlease ensure Java 17+ is installed and port 8080/3000 are not blocked.'
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  stopAllProcesses();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    isQuitting = true;
    app.quit();
  }
});
