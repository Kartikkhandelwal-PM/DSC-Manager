# DSC Management — Development Approach & Testing Without a Token

---

## What to Build — Desktop App (Electron)

An Electron app that the user installs once. It runs silently in the background as a Windows Service (Windows) or LaunchAgent (Mac) and opens a local WebSocket server on `localhost:12345`. The KDK web app connects to it via the browser.

**Why Electron:**
- One codebase for Windows + Mac
- Uses Node.js — easy to work with PKCS#11 libraries
- Packages as `.exe` (Windows) and `.dmg` (Mac)
- Industry standard approach — same as eMudhra's emBridge utility

**How it connects to the web app:**

```
USB Token (plugged in)
      │
      ▼
KDK DSC Agent — Electron App (background)
  Reads token via PKCS#11
      │  WebSocket on localhost:12345
      ▼
KDK Web App (browser)
  Displays certificate data → user confirms → saved
```

---

## Testing Without a Token — Use SoftHSM2

**SoftHSM2** is a free software tool that creates a virtual PKCS#11 token in software. It behaves exactly like a real USB token. Any agent code written against SoftHSM2 will work identically on a real DSC hardware token — no changes needed.

### Setup (15–20 minutes, one time)

**Install SoftHSM2**
- Windows: download installer from [github.com/opendnssec/SoftHSMv2](https://github.com/opendnssec/SoftHSMv2/releases)
- Mac: `brew install softhsm`

**Initialize a virtual token**
```bash
softhsm2-util --init-token --slot 0 --label "TestDSC" --pin 1234 --so-pin 1234
```

**Generate a test certificate using OpenSSL — with real-looking data**
```bash
openssl req -x509 -newkey rsa:2048 -keyout test-key.pem -out test-cert.pem -days 730 -nodes \
  -subj "/CN=Ramesh Kumar/O=ABC And Associates/OU=Accounts/L=Ahmedabad/ST=Gujarat/C=IN/emailAddress=ramesh@abcassociates.com"
```

You can put any real-looking values here:

| Field | What to put | Example |
|---|---|---|
| CN | Actual person's name | "Ramesh Kumar" |
| O | Actual firm/company name | "ABC And Associates" |
| OU | Department | "Accounts" |
| L | City | "Ahmedabad" |
| ST | State | "Gujarat" |
| C | Country | "IN" |
| emailAddress | Email | "ramesh@abc.com" |

Want to simulate a specific CA like eMudhra? Add `-issuer` details or generate a CA cert first and sign with it:

```bash
# Step 1 — Create a fake eMudhra CA cert
openssl req -x509 -newkey rsa:2048 -keyout emudhra-ca-key.pem -out emudhra-ca-cert.pem -days 3650 -nodes \
  -subj "/CN=eMudhra Consumer CA 5/O=eMudhra Limited/C=IN"

# Step 2 — Create the DSC cert signed by that fake CA
openssl req -newkey rsa:2048 -keyout test-key.pem -out test-csr.pem -nodes \
  -subj "/CN=Ramesh Kumar/O=ABC And Associates/L=Ahmedabad/ST=Gujarat/C=IN"

openssl x509 -req -in test-csr.pem -CA emudhra-ca-cert.pem -CAkey emudhra-ca-key.pem \
  -CAcreateserial -out test-cert.pem -days 730
```

Now the certificate will show **Issued By: eMudhra Consumer CA 5** — exactly like a real DSC.

**Import the certificate into the virtual token**
```bash
softhsm2-util --import test-key.pem --token "TestDSC" --label "RameshDSC" --id 01 --pin 1234
```

Now the Electron agent reads this virtual token via PKCS#11 — same code, same data format — as if a real USB token were plugged in.

---

## What the Agent Sends to the Web App (JSON)

```json
{
  "status": "success",
  "certificate": {
    "holder_name": "Ramesh Kumar",
    "organization": "ABC & Associates",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "country": "IN",
    "email": "ramesh@abc.com",
    "serial_number": "3AF12C9D00B4E721",
    "issued_by": "eMudhra Consumer CA 5",
    "issue_date": "2023-04-15",
    "expiry_date": "2026-04-14",
    "dsc_purpose": "Signing",
    "dsc_class": "Class 3",
    "fingerprint_sha256": "A3:F1:2C:9D:BE:44:...",
    "token_label": "TestDSC",
    "token_serial": "SOFT12345678"
  }
}
```

Error responses:

```json
{ "status": "no_token", "message": "No token detected. Please plug in your DSC." }
{ "status": "driver_missing", "message": "Token driver not found." }
{ "status": "multiple_certs", "certificates": [ {...}, {...} ] }
```

---

## Development Sequence

```
Step 1 → Set up SoftHSM2 with test certificate (15–20 min)
Step 2 → Build Electron agent — reads from SoftHSM2 via PKCS#11
Step 3 → Build web frontend — connects to agent WebSocket
Step 4 → Full end-to-end works without any real token
Step 5 → Plug in a real USB token → same code, no changes needed
```

---

## Open Question

Should the app also support **.pfx / .p12 soft certificate files** (not USB tokens)?
Some users may have software-based DSCs stored as files. If yes, the Electron app needs a file-picker flow in addition to token reading.
