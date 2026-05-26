'use strict';

const { execSync } = require('child_process');
const os = require('os');
const { brandFromVid, driverUrlForBrand } = require('./pkcs11-registry');

// Smart card USB device class codes (CCID)
const CCID_CLASS = 0x0B;

/**
 * UsbWatcher uses OS-level commands to detect USB token
 * insertion when no driver is installed yet.
 *
 * The primary token detection path (after driver install) is
 * PKCS#11 slot polling in TokenReader. This module handles only
 * the "driver missing" notification path.
 *
 * Usage:
 *   const w = new UsbWatcher(onInsertCallback);
 *   w.start();
 *   w.stop();
 */
class UsbWatcher {
  constructor(onUnknownToken) {
    this.onUnknownToken = onUnknownToken;
    this.pollTimer      = null;
    this.prevDevices    = new Set();
    this.POLL_MS        = 1000;
  }

  start() {
    this._poll();
    this.pollTimer = setInterval(() => this._poll(), this.POLL_MS);
  }

  stop() {
    clearInterval(this.pollTimer);
  }

  _poll() {
    let devices;
    try {
      devices = this._enumerateUSB();
    } catch {
      return;
    }

    const current = new Set(devices.map(d => `${d.vid}:${d.pid}`));

    for (const d of devices) {
      const key = `${d.vid}:${d.pid}`;
      if (!this.prevDevices.has(key)) {
        // New device appeared
        this._onDeviceAttached(d);
      }
    }

    this.prevDevices = current;
  }

  _onDeviceAttached(device) {
    const brand      = brandFromVid(device.vid);
    const driverUrl  = brand ? driverUrlForBrand(brand) : null;
    this.onUnknownToken({ brand, driverUrl, vid: device.vid, pid: device.pid });
  }

  // ── OS-specific USB enumeration ──

  _enumerateUSB() {
    switch (os.platform()) {
      case 'win32':  return this._enumerateWindows();
      case 'darwin': return this._enumerateMac();
      default:       return this._enumerateLinux();
    }
  }

  // Windows: use PowerShell to query Win32_USBHub or PnP devices
  _enumerateWindows() {
    const out = execSync(
      'powershell -Command "Get-PnpDevice -Class SmartCardReader | Select-Object Status,InstanceId | ConvertTo-Json"',
      { encoding: 'utf8', timeout: 3000 },
    );
    let items;
    try {
      const parsed = JSON.parse(out);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
    // InstanceId format: USB\\VID_096E&PID_003A\\...
    return items
      .filter(d => d.Status === 'Unknown' || d.Status === 'Error') // no driver
      .map(d => {
        const match = (d.InstanceId || '').match(/VID_([0-9A-Fa-f]{4})&PID_([0-9A-Fa-f]{4})/);
        if (!match) return null;
        return { vid: parseInt(match[1], 16), pid: parseInt(match[2], 16) };
      })
      .filter(Boolean);
  }

  // macOS: use system_profiler
  _enumerateMac() {
    const out = execSync('system_profiler SPUSBDataType -json', { encoding: 'utf8', timeout: 5000 });
    const data = JSON.parse(out);
    const devices = [];

    function walk(node) {
      if (Array.isArray(node)) { node.forEach(walk); return; }
      if (typeof node !== 'object' || !node) return;
      if (node.vendor_id && node.product_id) {
        devices.push({
          vid: parseInt((node.vendor_id || '0').replace(/^0x/, ''), 16),
          pid: parseInt((node.product_id || '0').replace(/^0x/, ''), 16),
        });
      }
      Object.values(node).forEach(walk);
    }

    walk(data);
    return devices;
  }

  // Linux: use lsusb
  _enumerateLinux() {
    const out = execSync('lsusb', { encoding: 'utf8', timeout: 3000 });
    return out
      .split('\n')
      .map(line => {
        const match = line.match(/ID ([0-9a-f]{4}):([0-9a-f]{4})/i);
        if (!match) return null;
        return { vid: parseInt(match[1], 16), pid: parseInt(match[2], 16) };
      })
      .filter(Boolean);
  }
}

module.exports = UsbWatcher;
