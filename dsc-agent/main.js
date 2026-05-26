'use strict';

const { app, Tray, Menu, nativeImage, dialog } = require('electron');
const { WebSocketServer } = require('ws');
const path = require('path');
const TokenReader = require('./src/token-reader');

const PORT    = 12345;
const HOST    = '127.0.0.1'; // localhost only — never exposed to network
const IS_DEV  = process.argv.includes('--dev');

let tray = null;
let wss  = null;

// ── Single-instance lock: only one agent should run at a time ──
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

app.whenReady().then(() => {
  // Hide the dock icon on macOS (background-only app)
  if (process.platform === 'darwin') app.dock.hide();

  startWebSocketServer();
  setupTray();
});

// Keep app alive when all windows are closed
app.on('window-all-closed', e => e.preventDefault());

// ── WebSocket server ──
function startWebSocketServer() {
  wss = new WebSocketServer({ host: HOST, port: PORT });

  wss.on('listening', () => {
    if (IS_DEV) console.log(`[KDK DSC Agent] WebSocket server listening on ${HOST}:${PORT}`);
  });

  wss.on('error', err => {
    // Port already in use — another instance is running
    if (err.code === 'EADDRINUSE') {
      if (IS_DEV) console.error(`[KDK DSC Agent] Port ${PORT} already in use. Another instance may be running.`);
      app.quit();
    }
  });

  wss.on('connection', (ws, req) => {
    // Only accept connections from localhost
    const origin = req.headers.origin || '';
    const remoteAddr = req.socket.remoteAddress || '';
    const isLocalhost = remoteAddr === '127.0.0.1' || remoteAddr === '::1' || remoteAddr === '::ffff:127.0.0.1';

    if (!isLocalhost) {
      ws.close(1008, 'Remote connections not allowed');
      return;
    }

    if (IS_DEV) console.log(`[KDK DSC Agent] Browser connected from ${origin}`);

    const reader = new TokenReader(ws, IS_DEV);
    reader.start();

    ws.on('message', raw => {
      try {
        const msg = JSON.parse(raw.toString());
        reader.handleMessage(msg);
      } catch (e) {
        if (IS_DEV) console.error('[KDK DSC Agent] Bad message from browser:', e.message);
      }
    });

    ws.on('close', () => {
      if (IS_DEV) console.log('[KDK DSC Agent] Browser disconnected');
      reader.stop();
    });

    ws.on('error', err => {
      if (IS_DEV) console.error('[KDK DSC Agent] WebSocket error:', err.message);
    });
  });
}

// ── System tray ──
function setupTray() {
  const iconPath = path.join(__dirname, 'assets', process.platform === 'darwin' ? 'tray-icon.png' : 'tray-icon.ico');
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath));
  } catch {
    // Icon not found — use an empty image (silently)
    tray = new Tray(nativeImage.createEmpty());
  }

  tray.setToolTip('KDK DSC Agent — Running');
  tray.setContextMenu(buildTrayMenu());
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    { label: 'KDK DSC Agent v1.0', enabled: false },
    { label: `Listening on localhost:${PORT}`, enabled: false },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        wss?.close();
        app.quit();
      },
    },
  ]);
}
