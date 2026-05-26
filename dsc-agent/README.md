# KDK DSC Agent

A lightweight Electron background app that bridges USB DSC tokens to the KDK web application via a local WebSocket server on `localhost:12345`.

---

## Architecture

```
USB Token (plugged in)
      │
      ▼
KDK DSC Agent  ← this app
  ├── Detects token via PKCS#11 slot polling (every 500ms)
  ├── Reads X.509 certificate from token
  ├── Handles PIN/password entry
  └── WebSocket server on 127.0.0.1:12345
      │
      ▼
KDK Web App (browser)
  ├── Connects to ws://localhost:12345
  └── Receives certificate JSON → user confirms → saved to server
```

---

## Prerequisites

- **Node.js** 18 or 20 (LTS)
- **Python 3** (for node-gyp — needed by `pkcs11js`)
- **Visual Studio Build Tools** (Windows) or **Xcode Command Line Tools** (macOS)
- **SoftHSM2** for development/testing (see below)

---

## Setup

```bash
# Install dependencies + rebuild native modules for Electron
npm install
npm run rebuild
```

---

## Development Run

```bash
npm run dev
```

The agent starts, opens a system tray icon, and listens on `ws://127.0.0.1:12345`.

---

## Testing Without a Real Token (SoftHSM2)

SoftHSM2 is a free software PKCS#11 token that behaves identically to a real USB token.

### 1. Install SoftHSM2

**Windows:** Download from [github.com/opendnssec/SoftHSMv2/releases](https://github.com/opendnssec/SoftHSMv2/releases) and install.

**macOS:**
```bash
brew install softhsm
```

### 2. Initialise a virtual token

```bash
softhsm2-util --init-token --slot 0 --label "TestDSC" --pin 1234 --so-pin 1234
```

### 3. Generate a test certificate

```bash
# Create a fake CA (eMudhra style)
openssl req -x509 -newkey rsa:2048 -keyout ca-key.pem -out ca-cert.pem -days 3650 -nodes \
  -subj "/CN=eMudhra Consumer CA 5/O=eMudhra Limited/C=IN"

# Create the DSC certificate signed by the fake CA
openssl req -newkey rsa:2048 -keyout test-key.pem -out test-csr.pem -nodes \
  -subj "/CN=Ramesh Kumar/O=ABC And Associates/OU=Accounts/L=Ahmedabad/ST=Gujarat/C=IN/emailAddress=ramesh@abc.com"

openssl x509 -req -in test-csr.pem -CA ca-cert.pem -CAkey ca-key.pem \
  -CAcreateserial -out test-cert.pem -days 730
```

### 4. Import the certificate into the virtual token

```bash
softhsm2-util --import test-key.pem --token "TestDSC" --label "RameshDSC" --id 01 --pin 1234
```

### 5. Point the agent at SoftHSM2

Add the SoftHSM2 PKCS#11 library to `src/pkcs11-registry.js` under the `win32` or `darwin` section:

- **Windows:** `C:\Program Files\SoftHSM2\lib\softhsm2-x64.dll`
- **macOS:** `/usr/local/lib/softhsm/libsofthsm2.so` (or the path from `softhsm2-util --show-slots`)

The agent will detect it automatically on the next start.

---

## WebSocket Message Protocol

### Agent → Browser

| Message | When |
|---|---|
| `{ type: "reading" }` | Token detected, reading started |
| `{ type: "driver_missing", brand, driverUrl }` | Token plugged in but no driver |
| `{ type: "pin_required", pinType, tokenLabel, attemptsRemaining }` | Token needs login |
| `{ type: "pin_wrong", attemptsRemaining }` | Wrong PIN entered |
| `{ type: "token_locked" }` | Token locked after too many wrong PINs |
| `{ type: "certificate", certificate: {...} }` | Certificate read successfully |
| `{ type: "multiple_certs", certificates: [...] }` | Multiple certs on one token |
| `{ type: "error", message }` | Unrecoverable error |

### Browser → Agent

| Message | When |
|---|---|
| `{ type: "submit_pin", pin }` | User entered PIN/password |
| `{ type: "select_cert", index }` | User selected cert from multiple_certs list |
| `{ type: "retry_read" }` | User installed driver, wants to retry |

---

## Certificate JSON Schema

```json
{
  "holder_name":       "Ramesh Kumar",
  "organization":      "ABC & Associates",
  "org_unit":          "Accounts",
  "city":              "Ahmedabad",
  "state":             "Gujarat",
  "country":           "IN",
  "email":             "ramesh@abc.com",
  "serial_number":     "3AF12C9D00B4E721",
  "issued_by":         "eMudhra Consumer CA 5",
  "issue_date":        "2024-04-15",
  "expiry_date":       "2027-04-14",
  "dsc_purpose":       "Signing",
  "dsc_class":         "Class 3",
  "fingerprint_sha256":"A3:F1:2C:...",
  "token_label":       "Feitian ePass2003",
  "token_serial":      "HW12345678",
  "added_method":      "token"
}
```

---

## Production Build

```bash
# Windows installer (.exe)
npm run build:win

# macOS disk image (.dmg)
npm run build:mac
```

Outputs go to the `dist/` directory.

---

## Supported Token Brands

| Brand | PKCS#11 DLL (Windows) | Status |
|---|---|---|
| Feitian ePass2003 | `ep2pk11.dll` | Tested |
| WatchData Utrust | `WDPKCS.dll` | Tested |
| SafeNet iKey | `eTPKCS11.dll` | Tested |
| PROXKey | `3079pkcs11.dll` | Tested |
| Proxima | `acospkcs11.dll` | Community-tested |
| SoftHSM2 | `softhsm2-x64.dll` | Used for dev/testing |

---

## Security Notes

- WebSocket server binds to `127.0.0.1` only — never reachable from the network.
- Only the public certificate (X.509 data) is extracted and sent. **Private keys never leave the token.**
- The PIN is transmitted only over localhost and used solely for the PKCS#11 C_Login call. It is never logged or stored.
