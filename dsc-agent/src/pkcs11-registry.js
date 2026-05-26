'use strict';

const fs = require('fs');
const os = require('os');

// VID/PID table: used to identify brand from USB device descriptor
// even before the driver is installed.
const VID_PID_MAP = [
  { vid: 0x096E, brand: 'Feitian ePass2003' },
  { vid: 0x1A4B, brand: 'WatchData Utrust'  },
  { vid: 0x0529, brand: 'SafeNet iKey'      },
  { vid: 0x04B0, brand: 'PROXKey'           },
  { vid: 0x04E6, brand: 'SCM Microsystems'  }, // common reader chipset
];

// Known PKCS#11 library paths per brand per OS.
// Order matters: first matching path wins.
const PKCS11_LIBS = {
  win32: [
    {
      brand: 'Feitian ePass2003',
      paths: [
        'C:\\Windows\\System32\\ep2pk11.dll',
        'C:\\Windows\\SysWOW64\\ep2pk11.dll',
      ],
    },
    {
      brand: 'WatchData Utrust',
      paths: [
        'C:\\Windows\\System32\\WDPKCS.dll',
        'C:\\Windows\\SysWOW64\\WDPKCS.dll',
      ],
    },
    {
      brand: 'SafeNet iKey',
      paths: [
        'C:\\Windows\\System32\\eTPKCS11.dll',
        'C:\\Windows\\SysWOW64\\eTPKCS11.dll',
        'C:\\Program Files\\SafeNet\\Authentication\\SAC\\x64\\PKCS11Client.dll',
        'C:\\Program Files (x86)\\SafeNet\\Authentication\\SAC\\x32\\PKCS11Client.dll',
      ],
    },
    {
      brand: 'PROXKey',
      paths: [
        'C:\\Windows\\System32\\3079pkcs11.dll',
        'C:\\Windows\\SysWOW64\\3079pkcs11.dll',
      ],
    },
    {
      brand: 'Proxima',
      paths: [
        'C:\\Windows\\System32\\acospkcs11.dll',
        'C:\\Windows\\SysWOW64\\acospkcs11.dll',
      ],
    },
  ],
  darwin: [
    {
      brand: 'Feitian ePass2003',
      paths: [
        '/usr/local/lib/ep2pk11.dylib',
        '/usr/lib/ep2pk11.dylib',
      ],
    },
    {
      brand: 'SafeNet iKey',
      paths: [
        '/usr/local/lib/libeTPkcs11.dylib',
        '/usr/lib/libeTPkcs11.dylib',
        '/Library/Frameworks/eToken.framework/Versions/Current/libeTPkcs11.dylib',
      ],
    },
    {
      brand: 'WatchData Utrust',
      paths: ['/usr/local/lib/WDPKCS.dylib'],
    },
  ],
};

/**
 * Scan known PKCS#11 library paths on the current OS.
 * Returns the first matching { brand, path } or null if none found.
 */
function detectLib() {
  const platform = os.platform();
  const libs = PKCS11_LIBS[platform] || [];

  for (const { brand, paths } of libs) {
    for (const p of paths) {
      if (fs.existsSync(p)) {
        return { brand, path: p };
      }
    }
  }
  return null;
}

/**
 * Detect all installed PKCS#11 libraries (for multi-token support).
 * Returns array of { brand, path }.
 */
function detectAllLibs() {
  const platform = os.platform();
  const libs = PKCS11_LIBS[platform] || [];
  const found = [];

  for (const { brand, paths } of libs) {
    for (const p of paths) {
      if (fs.existsSync(p)) {
        found.push({ brand, path: p });
        break; // first valid path for this brand is enough
      }
    }
  }
  return found;
}

/**
 * Resolve brand name from USB VID (without needing a driver).
 * Useful for identifying a token that's connected but not yet readable.
 */
function brandFromVid(vid) {
  const match = VID_PID_MAP.find(e => e.vid === vid);
  return match ? match.brand : null;
}

/**
 * Return the driver download URL for a known brand.
 */
function driverUrlForBrand(brand) {
  const urls = {
    'Feitian ePass2003': 'https://www.ftsafe.com/Support/DownloadCenter',
    'WatchData Utrust':  'https://www.watchdata.com/support/download',
    'SafeNet iKey':      'https://support.thalesgroup.com/app/answers/detail/a_id/1782',
    'PROXKey':           'https://www.proxkey.in/download.html',
    'Proxima':           'https://www.proximag.com/download',
  };
  return urls[brand] || null;
}

module.exports = { detectLib, detectAllLibs, brandFromVid, driverUrlForBrand };
