'use strict';

const pkcs11js = require('pkcs11js');
const { detectLib, detectAllLibs, driverUrlForBrand } = require('./pkcs11-registry');
const { parseCertDER } = require('./cert-parser');

// Poll interval for slot/token detection (ms)
const SLOT_POLL_MS   = 500;
// Poll interval when waiting for driver to be installed (ms)
const DRIVER_POLL_MS = 2000;

class TokenReader {
  constructor(ws, debug = false) {
    this.ws      = ws;
    this.debug   = debug;
    this.pkcs11  = null;
    this.libInfo = null;

    this.slotPollTimer   = null;
    this.driverPollTimer = null;

    this.prevTokenCount  = 0;  // how many slots had tokens on last poll
    this.awaitingPin     = false;
    this.pendingSlot     = null;
    this.pendingSession  = null;
  }

  // ─────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────

  start() {
    this.libInfo = detectLib();

    if (!this.libInfo) {
      this.log('No PKCS#11 library found — waiting for driver install');
      this._pollForDriver();
      return;
    }

    this._initPKCS11();
  }

  stop() {
    clearInterval(this.slotPollTimer);
    clearInterval(this.driverPollTimer);
    this._finalizePKCS11();
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'submit_pin':
        if (this.awaitingPin) this._loginWithPin(msg.pin);
        break;
      case 'select_cert':
        // No-op: the frontend resolves this in demo/SoftHSM mode.
        // With a real token the cert was already chosen when we sent multiple_certs.
        break;
      case 'retry_read':
        this.log('Browser requested retry — restarting reader');
        this.stop();
        this.start();
        break;
      default:
        break;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Internals
  // ─────────────────────────────────────────────────────────────────

  _initPKCS11() {
    try {
      this.pkcs11 = new pkcs11js.PKCS11();
      this.pkcs11.load(this.libInfo.path);
      this.pkcs11.C_Initialize();
      this.log(`PKCS#11 loaded: ${this.libInfo.brand} @ ${this.libInfo.path}`);
      this._pollForToken();
    } catch (e) {
      this.log(`Failed to init PKCS#11: ${e.message}`);
      // Library may exist but token service not ready; retry
      this.driverPollTimer = setTimeout(() => this._initPKCS11(), DRIVER_POLL_MS);
    }
  }

  _finalizePKCS11() {
    if (this.pendingSession) {
      try { this.pkcs11.C_CloseSession(this.pendingSession); } catch {}
      this.pendingSession = null;
    }
    if (this.pkcs11) {
      try { this.pkcs11.C_Finalize(); } catch {}
      this.pkcs11 = null;
    }
  }

  // Poll every SLOT_POLL_MS for a token insertion event
  _pollForToken() {
    this.slotPollTimer = setInterval(() => {
      if (!this.pkcs11 || this.awaitingPin) return;
      try {
        const slots = this.pkcs11.C_GetSlotList(true); // true = only token-present slots
        const count = slots.length;

        if (count > 0 && this.prevTokenCount === 0) {
          // Token just inserted
          clearInterval(this.slotPollTimer);
          this._readToken(slots[0]);
        }

        this.prevTokenCount = count;
      } catch {
        // PKCS#11 library crashed or token was forcibly removed
        this.prevTokenCount = 0;
      }
    }, SLOT_POLL_MS);
  }

  // Poll every DRIVER_POLL_MS until a PKCS#11 lib appears on disk
  _pollForDriver() {
    this.driverPollTimer = setInterval(() => {
      const found = detectLib();
      if (found) {
        clearInterval(this.driverPollTimer);
        this.libInfo = found;
        this.log(`Driver found: ${found.brand}`);
        this._initPKCS11();
      }
    }, DRIVER_POLL_MS);
  }

  _readToken(slot) {
    this.send({ type: 'reading' });
    this.log(`Reading slot ${slot}`);

    try {
      const session = this.pkcs11.C_OpenSession(
        slot,
        pkcs11js.CKF_SERIAL_SESSION | pkcs11js.CKF_RW_SESSION,
      );
      this.pendingSession = session;
      this.pendingSlot    = slot;

      // Attempt to read certificates without logging in first
      const certs = this._collectCerts(session);

      if (certs.length > 0) {
        this._emitCerts(certs, slot);
      } else {
        // No public cert objects — token requires login
        this._requestPin(slot);
      }
    } catch (e) {
      this.log(`Error reading token: ${e.message}`);
      this.send({ type: 'error', message: 'Failed to open token session. Please try again.' });
      this._resumePolling();
    }
  }

  _requestPin(slot) {
    let tokenLabel     = this.libInfo.brand;
    let attemptsLeft   = 3;
    let pinType        = 'pin';

    try {
      const info = this.pkcs11.C_GetTokenInfo(slot);
      tokenLabel   = (info.label || '').trim() || tokenLabel;
      // Determine if alphanumeric password required (SafeNet style)
      pinType = (info.flags & pkcs11js.CKF_PROTECTED_AUTHENTICATION_PATH) ? 'password' : 'pin';
      // CKF_USER_PIN_COUNT_LOW means fewer than 3 remaining
      if (info.flags & pkcs11js.CKF_USER_PIN_COUNT_LOW)  attemptsLeft = 2;
      if (info.flags & pkcs11js.CKF_USER_PIN_FINAL_TRY)  attemptsLeft = 1;
    } catch {}

    this.awaitingPin = true;
    this.send({
      type:              'pin_required',
      pinType,
      tokenLabel,
      attemptsRemaining: attemptsLeft,
    });
  }

  _loginWithPin(pin) {
    if (!this.pendingSlot || !this.pendingSession) return;
    this.awaitingPin = false;

    try {
      this.pkcs11.C_Login(this.pendingSession, pkcs11js.CKU_USER, pin);
      this.log('PIN accepted');

      const certs = this._collectCerts(this.pendingSession);
      if (certs.length > 0) {
        this._emitCerts(certs, this.pendingSlot);
      } else {
        this.send({ type: 'error', message: 'No certificates found on this token after login.' });
        this._resumePolling();
      }
    } catch (e) {
      const msg = e.message || '';

      if (msg.includes('CKR_PIN_INCORRECT')) {
        let remaining = 1;
        try {
          const info = this.pkcs11.C_GetTokenInfo(this.pendingSlot);
          if (info.flags & pkcs11js.CKF_USER_PIN_FINAL_TRY)  remaining = 1;
          else if (info.flags & pkcs11js.CKF_USER_PIN_COUNT_LOW) remaining = 2;
          else remaining = 3;
        } catch {}

        this.awaitingPin = true;
        this.send({ type: 'pin_wrong', attemptsRemaining: remaining });
      } else if (
        msg.includes('CKR_PIN_LOCKED') ||
        msg.includes('CKR_USER_PIN_NOT_INITIALIZED')
      ) {
        this.send({ type: 'token_locked' });
        this._resumePolling();
      } else {
        this.log(`Login error: ${msg}`);
        this.send({ type: 'error', message: 'Authentication failed. Please try again.' });
        this._resumePolling();
      }
    }
  }

  _collectCerts(session) {
    const certs = [];
    try {
      this.pkcs11.C_FindObjectsInit(session, [
        { type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_CERTIFICATE },
      ]);

      let obj;
      while ((obj = this.pkcs11.C_FindObjects(session))) {
        try {
          const attrs = this.pkcs11.C_GetAttributeValue(session, obj, [
            { type: pkcs11js.CKA_VALUE },  // raw DER bytes
            { type: pkcs11js.CKA_LABEL },  // optional label
          ]);
          const der = attrs[0]?.value;
          if (der && der.length > 32) {
            const parsed = parseCertDER(der);
            parsed.token_label  = this.libInfo.brand;
            parsed.cert_label   = attrs[1]?.value?.toString?.() || '';
            certs.push(parsed);
          }
        } catch (e) {
          this.log(`Skipped cert object: ${e.message}`);
        }
      }
      this.pkcs11.C_FindObjectsFinal(session);
    } catch (e) {
      this.log(`FindObjects error: ${e.message}`);
    }
    return certs;
  }

  _emitCerts(certs, slot) {
    // Attach hardware token serial number
    let tokenSerial = '';
    try {
      const info = this.pkcs11.C_GetTokenInfo(slot);
      tokenSerial = (info.serialNumber || '').trim();
    } catch {}

    const enriched = certs.map(c => ({ ...c, token_serial: tokenSerial }));

    if (enriched.length === 1) {
      this.send({ type: 'certificate', certificate: enriched[0] });
    } else {
      this.send({ type: 'multiple_certs', certificates: enriched });
    }

    this._resumePolling();
  }

  _resumePolling() {
    this.prevTokenCount = 0;
    clearInterval(this.slotPollTimer);
    // Brief delay before resuming so the token has time to settle
    setTimeout(() => this._pollForToken(), 1500);
  }

  send(data) {
    try {
      if (this.ws.readyState === 1 /* OPEN */) {
        this.ws.send(JSON.stringify(data));
      }
    } catch {}
  }

  log(msg) {
    if (this.debug) console.log(`[TokenReader] ${msg}`);
  }
}

module.exports = TokenReader;
