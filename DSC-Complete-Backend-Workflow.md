# KDK DSC Management — Complete Backend Workflow

---

## 1. System Overview

The current system has **no centralized HTTP backend server**. It is a two-part architecture:

| Layer | Technology | Role |
|---|---|---|
| **DSC Agent** | Electron + Node.js | Reads USB DSC token hardware on user's PC |
| **Web Frontend** | React + Vite | Dashboard UI, state managed locally |
| **Communication** | WebSocket (localhost only) | Bridge between Agent and Browser |
| **Storage** | `localStorage` (browser) | Alert settings, mock data |

> All certificate reading happens on the user's local machine. There is no cloud server or database yet.

---

## 2. Complete Architecture Diagram

```
┌──────────────────────────┐
│   USB DSC Token          │  (Feitian / WatchData / SafeNet / PROXKey)
│   Physical Hardware      │
└────────────┬─────────────┘
             │  PKCS#11 Protocol (.dll driver)
             ▼
┌──────────────────────────────────────────────────────────┐
│               KDK DSC Agent  (Electron App)              │
│                                                          │
│  ┌─────────────────────┐   ┌──────────────────────────┐ │
│  │ main.js             │   │ src/token-reader.js      │ │
│  │ - Electron shell    │   │ - PKCS#11 session mgmt   │ │
│  │ - System tray icon  │   │ - Slot polling (500ms)   │ │
│  │ - Single instance   │   │ - PIN handling           │ │
│  │ - WS Server :12345  │   │ - Certificate extraction │ │
│  └─────────────────────┘   └──────────────────────────┘ │
│                                                          │
│  ┌─────────────────────┐   ┌──────────────────────────┐ │
│  │ src/cert-parser.js  │   │ src/pkcs11-registry.js   │ │
│  │ - X.509 DER parser  │   │ - Driver path scanner    │ │
│  │ - OID → DSC class   │   │ - VID/PID brand map      │ │
│  │ - SHA-256 hash      │   │ - Driver download URLs   │ │
│  └─────────────────────┘   └──────────────────────────┘ │
│                                                          │
│  ┌─────────────────────┐                                │
│  │ src/usb-watcher.js  │                                │
│  │ - OS USB detection  │                                │
│  │ - No-driver alerts  │                                │
│  └─────────────────────┘                                │
└──────────────────────────────┬───────────────────────────┘
                               │  WebSocket  ws://127.0.0.1:12345
                               │  (JSON messages, localhost only)
                               ▼
┌──────────────────────────────────────────────────────────┐
│               KDK DSC Frontend  (React Web App)          │
│                                                          │
│  ┌──────────────────────┐  ┌───────────────────────────┐│
│  │ DSCDashboard.jsx     │  │ AddDSCWizard.jsx          ││
│  │ - Overview stats     │  │ - Step 1: Token vs Manual ││
│  │ - Client sidebar     │  │ - Step 2: WebSocket read  ││
│  │ - Table + Card views │  │ - Step 3: Mgmt details    ││
│  │ - Filters & search   │  │ - Step 4: Review/consent  ││
│  │ - Alert settings     │  │ - Step 5: Success         ││
│  └──────────────────────┘  └───────────────────────────┘│
│                                                          │
│  ┌──────────────────────┐  ┌───────────────────────────┐│
│  │ DSCDetailPanel.jsx   │  │ data/mockDSCs.js          ││
│  │ - View cert details  │  │ - 11 sample DSCs          ││
│  │ - Edit mgmt fields   │  │ - 35 sample clients       ││
│  │ - Delete DSC         │  │ - Utility functions       ││
│  └──────────────────────┘  └───────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

## 3. DSC Agent — Startup Flow

```
User launches KDK DSC Agent.exe
        │
        ├── Single-instance lock check
        │       └── Another instance already running? → Quit
        │
        ├── Start WebSocket Server
        │       └── ws://127.0.0.1:12345  (localhost ONLY)
        │
        └── Show System Tray Icon
                └── Right-click → "Quit" to close
```

**Security at startup:**
- Only one instance can run at a time
- WebSocket binds to `127.0.0.1` — never exposed on network
- Any connection from a non-localhost IP is immediately rejected

---

## 4. Token Detection Flow

```
Browser tab opens  →  WebSocket connects to ws://127.0.0.1:12345
                                │
                         TokenReader.start()
                                │
                    ┌───────────┴───────────┐
                    │ Scan for PKCS#11 driver│
                    └───────────┬───────────┘
                         Found?
              ┌────── No ──────┤ ──── Yes ──────────────┐
              │                                          │
     Poll every 2s                              Load PKCS#11 library
     (wait for driver install)                  C_Initialize()
              │                                          │
     Driver found?                          Poll every 500ms
     → detectLib() returns path             C_GetSlotList(true)
              │                                          │
     Load driver → continue               Token inserted?
                                                    │
                                      ┌── Yes (count > 0) ──┐
                                      │                     │
                               Open PKCS#11 session         │
                               C_OpenSession(slot, RW)      │
                                      │                  keep polling
                               Try reading certs
                               without PIN first
                                      │
                          ┌── Certs found? ──┐
                          │                  │
                       YES                   NO
                          │                  │
                   Parse & send          PIN required
                   to browser            → ask browser
                          │                  │
                   resume polling      user enters PIN
                                            │
                                     C_Login(session, pin)
                                            │
                               ┌── Login result ──┐
                               │                  │
                           Success           PIN wrong
                               │             → retry (max 3)
                          Read certs              │
                          Send to browser   PIN locked
                          resume polling    → send token_locked
```

---

## 5. Certificate Reading & Parsing

### Step 1 — Find Certificate Objects on Token

```javascript
C_FindObjectsInit(session, [{ type: CKA_CLASS, value: CKO_CERTIFICATE }])
// Finds all X.509 certificate objects stored on token hardware
```

### Step 2 — Extract Raw DER Bytes

```javascript
C_GetAttributeValue(session, obj, [CKA_VALUE, CKA_LABEL])
// CKA_VALUE = raw DER-encoded certificate bytes
// CKA_LABEL = human-readable label on token
```

### Step 3 — Parse X.509 Certificate (cert-parser.js)

Using `node-forge` library to decode DER:

| Field Extracted | X.509 Source |
|---|---|
| `holder_name` | Subject CN |
| `organization` | Subject O |
| `org_unit` | Subject OU |
| `city`, `state`, `country` | Subject L, ST, C |
| `email` | Subject emailAddress or SAN extension |
| `serial_number` | Certificate serial (uppercase hex) |
| `issued_by` | Issuer CN |
| `issue_date` / `expiry_date` | validity.notBefore / notAfter |
| `dsc_purpose` | Key Usage extension |
| `dsc_class` | Certificate Policies OID |
| `fingerprint_sha256` | SHA-256(raw DER bytes) |

### DSC Class OIDs (India-specific)

| OID | Resolved Class |
|---|---|
| `2.16.356.100.2.1` | Class 1 |
| `2.16.356.100.2.2` | Class 2 |
| `2.16.356.100.2.3` | Class 3 |
| `2.16.356.100.2.5` | DGFT |
| `2.16.356.100.2.6` | Document Signer |

### DSC Purpose (from Key Usage extension)

| Key Usage Flags | Resolved Purpose |
|---|---|
| `digitalSignature` or `nonRepudiation` | Signing |
| `keyEncipherment` or `dataEncipherment` | Encryption |
| Both present | Signing & Encryption |

---

## 6. WebSocket Message Protocol

### Agent → Browser

| Message | Payload | Meaning |
|---|---|---|
| `reading` | — | Token detected, reading started |
| `pin_required` | `pinType, tokenLabel, attemptsRemaining` | Token is PIN-protected |
| `pin_wrong` | `attemptsRemaining` | Wrong PIN, try again |
| `token_locked` | — | PIN locked after too many wrong attempts |
| `certificate` | `{ certificate: {...} }` | Single cert found and parsed |
| `multiple_certs` | `{ certificates: [...] }` | Multiple certs found on token |
| `error` | `{ message }` | Unrecoverable error |

### Browser → Agent

| Message | Payload | Action |
|---|---|---|
| `submit_pin` | `{ pin }` | User submitted PIN → triggers `C_Login` |
| `retry_read` | — | User clicked retry → restart TokenReader |
| `select_cert` | — | No-op (cert selection handled in frontend) |

---

## 7. Supported Token Brands & Drivers

| Brand | Windows Driver | macOS Driver |
|---|---|---|
| Feitian ePass2003 | `ep2pk11.dll` | `ep2pk11.dylib` |
| WatchData Utrust | `WDPKCS.dll` | `WDPKCS.dylib` |
| SafeNet iKey | `eTPKCS11.dll` / SAC path | `libeTPkcs11.dylib` |
| PROXKey | `3079pkcs11.dll` | — |
| Proxima | `acospkcs11.dll` | — |

**If driver is missing:**
- `usb-watcher.js` polls OS USB devices every 1 second
- Matches USB VID (Vendor ID) against known brand table
- Sends agent a driver download URL for that brand
- Prompts user to install driver, then re-polls

---

## 8. Frontend Workflow — Add DSC (Wizard)

```
AddDSCWizard opens
        │
 Step 1: Choose Method
 ┌──────┴──────┐
 │             │
Token        Manual
 │             │
 Step 2a:    Step 2b:
 Token       Manual form
 Detection   (type all fields)
 │
 Check WebSocket ws://127.0.0.1:12345
 ┌── Connected? ─────────────────────────────┐
 │                                           │
Connected                               Not connected
 │                                      Show "Install agent" prompt
Waiting for token insert
 │
Token detected → Agent sends 'reading'
 │
PIN required? → User enters PIN → sends 'submit_pin'
 │
Agent sends 'certificate' or 'multiple_certs'
 │
Certificate data auto-fills form
        │
 Step 3: Management Details
 (label, location, assigned_to, notes, token_pin, cert_password)
        │
 Step 4: Review & Consent
 (read-only summary, user confirms)
        │
 Step 5: Success
 (DSC saved to state, option to add another)
```

---

## 9. Data Model — Full DSC Object

```javascript
{
  // Auto-read from token (via cert-parser.js)
  holder_name:          "Ramesh Kumar",
  organization:         "ABC & Associates",
  org_unit:             "Accounts",
  city:                 "Ahmedabad",
  state:                "Gujarat",
  country:              "IN",
  email:                "ramesh@abc.com",
  serial_number:        "3A:F1:2C:9D:00:B4:E7:21",
  issued_by:            "eMudhra Consumer CA 5",
  issue_date:           "2024-04-15",
  expiry_date:          "2027-04-14",
  dsc_class:            "Class 3",
  dsc_purpose:          "Signing",
  fingerprint_sha256:   "A3:F1:2C:...",
  token_label:          "Feitian ePass2003",
  token_serial:         "HW12345678",

  // User-entered in Step 3 (management)
  label:                "Director Signing DSC",
  location:             "Office Drawer 3",
  assigned_to:          "Ramesh Kumar",
  notes:                "Primary DSC for GST filings",
  token_pin:            "123456",
  cert_password:        "abc@123",

  // System metadata
  id:                   "dsc_001",
  client_id:            "c1",
  added_method:         "token",   // or "manual"
  created_at:           "2024-04-20"
}
```

---

## 10. Frontend State Management

All state lives in React `useState` hooks (no Redux, no backend):

| State Variable | Type | Purpose |
|---|---|---|
| `dscs` | Array | All DSC records |
| `clients` | Array | All client records |
| `activeClient` | String | Selected client filter (`'all'` or client ID) |
| `statusFilter` | String | `'All'` / `'Active'` / `'Expiring Soon'` / `'Expired'` |
| `search` | String | Search query |
| `sortBy` | String | Sort field (`expiry_asc`, etc.) |
| `alertThreshold` | Number | Days before expiry to flag as "Expiring Soon" |
| `extraEmails` | Array | Alert email recipients |
| `selected` | Object | DSC currently open in detail panel |

**Persisted to localStorage:**
- `alertThreshold` — expiry warning days
- `extraEmails` — notification email list

---

## 11. DSC Status Logic

```
Status = "Expired"        if today > expiry_date
Status = "Expiring Soon"  if (expiry_date - today) ≤ alertThreshold (days)
Status = "Active"         if (expiry_date - today) > alertThreshold
```

---

## 12. Key Files Reference

| File | Lines | Purpose |
|---|---|---|
| `dsc-agent/main.js` | 113 | Electron entry, WebSocket server, tray |
| `dsc-agent/src/token-reader.js` | 299 | PKCS#11 polling, session, PIN, certs |
| `dsc-agent/src/cert-parser.js` | 120 | X.509 DER → JSON, OID resolution |
| `dsc-agent/src/pkcs11-registry.js` | 143 | Driver paths, VID/PID brand map |
| `dsc-agent/src/usb-watcher.js` | 137 | OS USB enumeration (no-driver path) |
| `dsc-frontend/src/pages/DSCDashboard.jsx` | 1155 | Main UI, filters, stats, views |
| `dsc-frontend/src/components/AddDSCWizard.jsx` | 1221 | 5-step DSC entry wizard |
| `dsc-frontend/src/components/DSCDetailPanel.jsx` | ~400 | Detail view, edit, delete |
| `dsc-frontend/src/data/mockDSCs.js` | — | Sample data for development |

---

## 13. Security Design

| Concern | Implementation |
|---|---|
| Network exposure | Agent binds to `127.0.0.1` only; LAN/internet cannot reach it |
| Multiple instances | Single-instance lock — second launch quits immediately |
| Private key access | **Never extracted** — only public certificate DER read |
| PIN handling | Passed directly to `C_Login`, never logged or stored by agent |
| PIN lockout | PKCS#11 hardware enforces lockout; agent reads `CKF_USER_PIN_LOCKED` flag |
| Token serial | Attached to every certificate for hardware traceability |

---

## 14. What's Missing for Production

The current system is **MVP / development-ready** but needs the following for production:

### A. Backend Server (does not exist yet)
- REST API for CRUD on DSCs and clients
- User authentication (JWT or session)
- Multi-user isolation

### B. Database (does not exist yet)

```sql
-- Suggested schema
clients (id, user_id, name, type, pan, created_at)

dscs (id, user_id, client_id, holder_name, organization,
      serial_number, issue_date, expiry_date, dsc_class,
      dsc_purpose, fingerprint_sha256, token_serial,
      label, location, assigned_to, notes,
      token_pin_encrypted, cert_password_encrypted,
      added_method, created_at, updated_at)

alert_settings (id, user_id, threshold_days, updated_at)

alert_recipients (id, alert_settings_id, email)
```

### C. Alert System (does not exist yet)
- Daily cron job to check `expiry_date - today ≤ threshold_days`
- Email via SendGrid / AWS SES
- WhatsApp/SMS via Twilio

### D. Suggested API Endpoints (future)

```
POST   /api/dsc              Save new DSC
GET    /api/dsc              List all DSCs
GET    /api/dsc/:id          Get one DSC
PATCH  /api/dsc/:id          Update DSC
DELETE /api/dsc/:id          Delete DSC

GET    /api/clients          List clients
POST   /api/clients          Create client
PATCH  /api/clients/:id      Update client

GET    /api/alerts/config    Get alert settings
POST   /api/alerts/config    Save alert settings
```

---

## 15. Build & Run

### DSC Agent

```bash
cd dsc-agent
npm install
npm run dev          # Run with debug logs
npm run build:win    # Build Windows .zip
npm run build:mac    # Build macOS .dmg
```

### Frontend

```bash
cd dsc-frontend
npm install
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build → dist/
```

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `electron` | ^31.0.0 | Desktop shell for agent |
| `pkcs11js` | ^2.1.6 | Native PKCS#11 C++ bindings |
| `node-forge` | ^1.3.1 | X.509 certificate parsing |
| `ws` | ^8.18.0 | WebSocket server |
| `react` | ^19.2.6 | Frontend framework |
| `vite` | ^8.0.12 | Frontend build tool |
| `tailwindcss` | ^4.3.0 | CSS utility framework |
