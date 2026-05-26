# DSC Management — Feature Plan

## What is DSC Management?

A feature within KDK Software's web application that allows users (CAs, tax practitioners, advocates, enterprises) to **save, track, and manage their Digital Signature Certificates (DSCs)** — get alerted before expiry, and renew via Capricorn.

---

## Target Users

| User Type | Why They Need This |
|---|---|
| Chartered Accountants (CAs) | Manage DSCs for themselves and their clients |
| Tax Practitioners | Need DSC for e-filing |
| Advocates | Use DSC for court submissions |
| Large Enterprises | Multiple DSCs for different authorized signatories |

> Key insight: These users often have **multiple DSCs** and lose track of expiry dates. A CA firm may manage 50+ DSCs across clients.

---

## Core User Flow

```
Login to App
    └── DSC Management (Menu / Dashboard)
            ├── Add DSC
            │       ├── Plug in USB Token → Agent detects → Auto-read details → Add extra info → Save
            │       └── No token? → Manual entry of certificate fields + extra info → Save
            │
            ├── View All DSCs (Dashboard)
            │       ├── Active
            │       ├── Expiring Soon (highlighted / color coded)
            │       └── Expired
            │
            ├── DSC Detail View
            │       ├── View all certificate + extra info
            │       ├── Edit extra details (location, label, notes)
            │       └── Renew via Capricorn
            │
            └── Notification Settings
                    └── Configure alert thresholds per DSC or globally
```

---

## How Token Detection Works

### Why a Browser Cannot Read the Token Directly

DSC USB tokens are hardware smart card devices. Browsers are sandboxed — they have no native API to interface with USB tokens or smart card readers:
- **Web Crypto API** — handles crypto operations only, cannot access hardware tokens
- **WebUSB / WebHID** — cannot access smart card class (CCID) devices; the OS claims these at the driver level
- **No browser plugin support** — Java applets and NPAPI are dead

**Conclusion: A desktop agent is required.** This is the same approach used by eMudhra (emBridge), NSDL, and most government DSC portals in India.

---

### KDK DSC Agent — How It Works

A small background application that the user installs once. It runs silently in the background and acts as a bridge between the USB token and the KDK web application.

```
USB Token (plugged in)
      │
      ▼
KDK DSC Agent (background service)
  ├── Windows: reads via Windows CryptoAPI or PKCS#11 DLL
  └── Mac: reads via macOS Security Framework or PKCS#11 DYLIB
      │
      ▼ (WebSocket on localhost)
KDK Web Application (browser)
      │
      ▼
Certificate data displayed → user confirms → saved to server
```

**Step-by-step:**
1. User installs KDK DSC Agent (one-time, like installing a printer driver)
2. Agent starts as a background service automatically on system startup
3. Agent opens a local WebSocket server on `localhost` (e.g., port 12345)
4. User opens KDK web app in browser and goes to Add DSC
5. Web app connects to `ws://localhost:12345`
6. User plugs in DSC USB token
7. Agent detects the token insertion (OS-level USB event)
8. Agent reads the certificate data from the token
9. Agent sends the data to the web app via WebSocket (JSON format)
10. Web app displays the pre-filled details for user to review and confirm

---

### How the Agent Reads the Token

**On Windows:**
- When a DSC token is plugged in with its driver installed, Windows automatically registers the certificate into the **Windows Certificate Store** (Personal store)
- The agent reads from this store using **Windows CryptoAPI / CNG**
- Alternatively, the agent can use **PKCS#11** by loading the token's `.dll` library directly (more reliable for all token brands)

**On Mac:**
- The agent uses the **macOS Security Framework** (Keychain Services / SecCertificate APIs)
- Or reads via **PC/SC framework** which is built into macOS
- Or uses **PKCS#11** with the token's `.dylib` library

**PKCS#11 (recommended for both platforms)** is the cross-platform cryptographic hardware standard. Every DSC token brand ships a PKCS#11 library. The agent can auto-detect which library to load based on the token brand inserted.

---

### Common DSC Token Brands in India

The agent must support these token brands (each needs its PKCS#11 library):

| Token Brand | PKCS#11 Library (Windows) |
|---|---|
| ePass2003 (Feitian) | ep2pk11.dll |
| WatchData Utrust | WDPKCS.dll |
| SafeNet iKey | eTPKCS11.dll |
| PROXKey | 3079pkcs11.dll |
| Proxima | acospkcs11.dll |

The agent should **auto-detect** the inserted token brand and load the appropriate library automatically — user should not need to select a token type manually.

---

### Agent Installation Flow — UI States

When the user clicks "Add DSC", the web app goes through these states:

```
User clicks "Add DSC"
      │
      ▼
STATE 1: CHECKING
  Web app tries to connect to ws://localhost:12345
  Show: spinner — "Checking for KDK DSC Agent..."
      │
  ┌───┴──────────────────────────┐
  Connected (< 1s)                Timeout (3s — no response)
      │                                │
      ▼                                ▼
STATE 2: READY                  STATE 3: NOT INSTALLED
Proceed to token flow           Show download card:
                                  - "KDK DSC Agent not found"
                                  - Download button (OS-detected)
                                  - Step-by-step install instructions
                                  - "I've installed it" button
                                        │
                                        ▼
                                STATE 4: WAITING
                                App polls ws://localhost:12345
                                every 3 seconds (up to 2 minutes)
                                Show: "Waiting for agent to start..."
                                        │
                                        ▼
                                STATE 2: READY → proceed
```

**OS detection for download:** Serve `.exe` installer for Windows and `.dmg` for Mac based on `navigator.userAgent`. Do not show both — only the relevant one.

**"I've installed it" button:** Triggers an immediate connection retry instead of waiting for the next polling interval.

---

### Driver Detection & Installation

When a DSC USB token is plugged in without its driver installed, the PC/SC smart card layer is not available and the agent cannot read the token. However, every USB device broadcasts a **VID (Vendor ID) + PID (Product ID)** at the OS level even without a driver — the agent reads this via **Windows WMI** / **Mac IOKit** to identify the brand and serve the correct driver download.

**Known VID/PID mapping:**

| Token Brand | VID | PID | Driver to Install |
|---|---|---|---|
| Feitian ePass2003 | 096E | 003A | Feitian PKCS#11 driver |
| WatchData Utrust | 1A4B | varies | WatchData driver |
| SafeNet iKey | 0529 | varies | SafeNet Authentication Client |
| PROXKey | 04B0 | varies | PROXKey PKCS#11 |
| Proxima | varies | varies | Proxima driver |

**Flow:**

```
USB token plugged in
      │
      ▼
Agent detects USB insertion event (WMI / IOKit)
      │
      ▼
Agent checks: is a smart card reader visible via PC/SC?
      │
  ┌───┴──────────────────────────────┐
  YES (driver installed)              NO (driver missing)
      │                                    │
      ▼                                    ▼
Proceed to token reading          Agent reads VID/PID from USB
                                  Looks up brand in known map
                                          │
                                  ┌───────┴───────────────┐
                                  Brand identified          Unknown brand
                                          │                      │
                                  Sends to web app:        Sends to web app:
                                  { type: "driver_missing", { type: "driver_missing",
                                    brand: "Feitian ePass2003",  brand: null }
                                    driverUrl: "..." }           │
                                          │                 Show generic message:
                                  Web app shows:           "Install the driver that
                                  "Driver needed for       came with your USB token."
                                   Feitian ePass2003.       + link to help page with
                                   Download below."          all supported brands
                                  [Download Driver]
                                  [I've installed it — Retry]
                                          │
                                          ▼
                                  Agent retries PC/SC check
                                          │
                                          ▼
                                  Proceed to token reading
```

**Multiple driver types note:** Each token brand ships its own proprietary PKCS#11 library (`.dll` on Windows, `.dylib` on Mac). Installing the brand's official driver also registers this library. The agent must detect which library is available post-install and load the correct one — same auto-detect logic as described in the PKCS#11 section above.

---

### PIN / Password Protection

PKCS#11 tokens require a **C_Login** call (user PIN entry) before protected certificate objects can be accessed. For reading public certificate data, many tokens do not require login — but some do, and the agent must handle both cases gracefully.

**Two protection types in the wild:**

| Type | Format | Common In |
|---|---|---|
| PIN | Numeric only (e.g., `123456`) | Most Indian DSC tokens (Feitian, WatchData, PROXKey) |
| Password | Alphanumeric (e.g., `Abc@1234`) | Enterprise tokens (SafeNet, some Proxima) |

**Flow:**

```
Agent opens PKCS#11 session on token
      │
      ▼
Agent tries to enumerate certificates (without login)
      │
  ┌───┴──────────────────────────────┐
  Success (certificates are public)   Fails / empty (login required)
      │                                         │
      ▼                                         ▼
Send cert data to web app             Agent sends to web app:
→ Proceed normally                    { type: "pin_required",
                                        tokenLabel: "ePass2003",
                                        pinType: "pin" | "password",
                                        attemptsRemaining: 3 }
                                                │
                                      Web app shows PIN/Password dialog:
                                        - Masked input field
                                        - Label: "Enter PIN" or "Enter Password"
                                          based on pinType
                                        - Warning: "X attempts remaining.
                                          Token locks after 3 wrong attempts."
                                        - Never stored or sent to server
                                                │
                                      User submits → sent to agent
                                      over localhost WebSocket only
                                                │
                                      Agent calls C_Login(PIN)
                                                │
                                      ┌─────────┴──────────────────┐
                                      Success                        Wrong PIN
                                           │                              │
                                      Read certificates          Decrement counter
                                      → send to web app          Show error + updated
                                      → proceed normally         "X attempts remaining"
                                                                  If 0 remaining:
                                                                  "Token is now locked.
                                                                   Contact your DSC
                                                                   provider to unlock."
```

**Security note:** The PIN travels only over `localhost` WebSocket and is used exclusively for the PKCS#11 session. It is never logged, stored in the browser, or sent to any server.

**Lockout warning:** Most DSC tokens permanently lock (or require admin SO-PIN reset) after 3 consecutive wrong PINs. The UI must display the remaining attempts count prominently at all times during PIN entry, and disable further attempts once the token reports it is locked.

---

## Data Fields

### Part A — Auto-Read from Token (Certificate Fields)

These are read directly from the X.509 certificate on the token. The user does **not** type these — they are read-only after saving.

| Field | Source on Certificate | Example Value |
|---|---|---|
| Certificate Holder Name | Subject CN (Common Name) | "Ramesh Kumar" |
| Organization | Subject O | "ABC & Associates" |
| Organizational Unit | Subject OU | "Tax Department" |
| City | Subject L (Locality) | "Ahmedabad" |
| State | Subject ST | "Gujarat" |
| Country | Subject C | "IN" |
| Email (if present) | Subject emailAddress | "ramesh@abc.com" |
| Certificate Serial Number | Certificate Serial | "3A:F1:2C:..." |
| Issued By (CA Name) | Issuer CN | "eMudhra Consumer CA 5" |
| Issue Date | Not Before | 2023-04-15 |
| Expiry Date | Not After | 2026-04-14 |
| DSC Purpose | Key Usage | Signing / Encryption / Both |
| DSC Class | Certificate Policy OID | Class 3 / DGFT |
| Certificate Fingerprint | SHA-256 hash | used for deduplication |
| Token Label | PKCS#11 CK_TOKEN_INFO | "ePass2003" |
| Token Serial Number | PKCS#11 CK_TOKEN_INFO | hardware serial of USB dongle |

---

### Part B — User-Added Details (Organizational Fields)

These are filled in by the user after the token is read. Fully optional, editable anytime from the DSC detail page.

| Field | Purpose | Example Value |
|---|---|---|
| Label / Nickname | Friendly name to identify the DSC quickly | "Director Signing DSC", "Client XYZ DSC" |
| Physical Location | Where the USB token is physically kept | "Office Drawer 3", "Client Vault", "Home Safe" |
| Assigned To | Person or department responsible for this token | "Accounts Team", "Mr. Sharma" |
| Notes | Free text for any remarks | "Used for MCA filings only" |

---

### Part C — System-Generated Fields (Auto, not shown to user as input)

| Field | How it's set |
|---|---|
| Status | Calculated: Active / Expiring Soon / Expired / Revoked |
| Days Until Expiry | Calculated daily from Expiry Date |
| Added Method | "token" or "manual" |
| Added By (User ID) | From logged-in session |
| Created At | Timestamp when record saved |
| Updated At | Timestamp of last edit |

---

### DSC Status Definitions

| Status | Condition |
|---|---|
| Active | Expiry date > 90 days away |
| Expiring Soon | Expiry date is within 90 days |
| Expired | Expiry date has passed |
| Revoked | Manually marked by user (CA revoked the certificate) |

---

## Feature Breakdown

### 1. Add DSC

**Flow 1 — Via USB Token (primary method)**
1. User clicks "Add DSC"
2. App checks if KDK DSC Agent is running
3. If not installed — show download prompt for agent
4. User plugs in token
5. Agent reads all certificate fields (Part A above)
6. Web app shows pre-filled read-only certificate details
7. User adds optional organizational details (Part B above)
8. User clicks Save → record stored

**Flow 2 — Manual Entry (fallback)**
- For users who don't have the token with them, or for non-USB soft certificates
- User fills in both Part A fields (certificate details) and Part B fields (organizational details) manually
- Expiry date must be entered — this is required for alerts to work

---

### 2. DSC Dashboard

A table showing all DSCs for the logged-in user.

**Columns:**
- Label / Holder Name
- DSC Class & Purpose
- Issued By
- Expiry Date
- Days Left (color coded: green > 90 days, amber ≤ 90 days, red = expired)
- Location
- Status badge
- Actions: View | Edit | Renew | Delete

**Filters & Search:**
- Status filter: All / Active / Expiring Soon / Expired
- Search: by name, label, serial number, or location
- Sort: by expiry date (default), by name, by date added

---

### 3. DSC Detail View

Displays all fields for a single DSC.

- **Certificate section** (read-only): all Part A fields from the certificate
- **Details section** (editable): all Part B organizational fields
- **Renewal CTA**: visible when status is Expiring Soon or Expired
- **Activity Log**: added on [date], last edited on [date] by [user]
- **Delete option**: soft delete with confirmation

---

### 4. Expiry Alerts & Notifications

**Automated alerts triggered when Days Until Expiry reaches:**
- 90 days
- 60 days
- 30 days
- 15 days
- 7 days
- 0 days (expiry day)

**Alert channels:**
- In-app notification (bell icon in top nav)
- Email notification

**User controls:**
- Choose which day thresholds to receive alerts for
- Dismiss or snooze individual alerts
- Global setting or per-DSC setting

**Backend:**
- Daily cron job runs at midnight, checks all DSC expiry dates
- Queues notifications for any DSC hitting a threshold that day

---

### 5. Capricorn Integration (Renewal)

- "Renew" button visible on DSC detail page when status is Expiring Soon or Expired
- Clicking opens the Capricorn renewal flow (via their API or a redirect with pre-filled data)
- After renewal, user re-plugs token → agent re-reads updated certificate → new expiry date saved

> Requires Capricorn API credentials and integration agreement.

---

## Corner Cases

| Scenario | How to Handle |
|---|---|
| Agent not installed | Show download prompt with OS-specific installer (Windows .exe / Mac .dmg) |
| Token plugged but not readable (driver missing) | Agent reads VID/PID, identifies brand, sends driver download link to web app. If brand unknown, show generic message with link to help page listing all supported brands. |
| Driver installed but PKCS#11 library not found | Agent falls back to Windows Certificate Store. If that also fails, prompt user to reinstall driver. |
| Token requires PIN and user enters wrong PIN | Show remaining attempts with lockout warning. Disable input and show "token locked" message if count reaches 0. |
| Token locked (3 wrong PINs, admin reset needed) | Show message: "Your token is locked. Contact your DSC provider (eMudhra / Capricorn / etc.) to reset it." |
| Token is PIN-protected but user cancels PIN dialog | Abort token reading gracefully. Offer "Manual Entry" fallback. |
| Multiple certificates on same token | Show list — let user choose which certificate(s) to save |
| Duplicate certificate (same serial already saved) | Warn: "This DSC is already saved in your account." Offer to update details only |
| DSC added that is already expired | Allow — mark as Expired, show in dashboard with expired badge |
| Certificate revoked by CA | User can manually change status to Revoked from detail page |
| User deletes a DSC | Soft delete — hidden from list but retained for audit |
| Holder name ≠ account holder name | Always allow — CAs manage DSCs for their clients |
| Token has no label / unrecognized brand | Fall back to reading from Windows Certificate Store or show partial data |
| Capricorn API unavailable at renewal time | Show error gracefully, allow retry |
| No email address on user account | Prompt user to add email before enabling email alerts |
| User has 50+ DSCs | Pagination + search/filter on dashboard must work efficiently |

---

## Pages / Screens Required

1. **DSC Management Dashboard** — full list with filters, search, status badges
2. **Add DSC — Token Flow** — agent check → plug-in → auto-read → confirm + add details → save
3. **Add DSC — Manual Entry** — form for all fields when no token
4. **DSC Detail Page** — view all fields, edit organizational fields, renew CTA, activity log
5. **Notification Settings** — configure alert thresholds
6. **Renewal Flow** — Capricorn integration screens
7. **Agent Download Page** — OS-specific download + step-by-step install instructions with "I've installed it" retry button
8. **Driver Download Prompt** — inline card shown when token is plugged in but driver is missing; shows brand name and download link
9. **PIN / Password Entry Dialog** — masked input, remaining attempts counter, lockout warning

---

## Technical Considerations

| Area | Detail |
|---|---|
| Desktop Agent | Electron app or lightweight native app; runs as Windows Service / Mac LaunchAgent; WebSocket on localhost |
| Token Reading | PKCS#11 (cross-platform); auto-detect token brand and load its library |
| Agent ↔ Browser | WebSocket on localhost; web app polls for agent on page load |
| Security | All DSC data encrypted at rest; local WebSocket restricted to localhost only; no raw private key data ever transferred — only certificate (public) data |
| Cron Job | Daily job checks all DSC expiry dates and fires notification events |
| Email Service | Reuse existing email service in KDK infrastructure |
| Capricorn API | Needs their API documentation and credentials |
| Deduplication | Use Certificate Fingerprint (SHA-256) as unique key to prevent duplicate saves |
| Audit Trail | Log all add / edit / delete / renew actions with timestamp and user ID |

---

## Open Questions

1. Does KDK Software already have an email notification service that can be reused?
2. What are the Capricorn API capabilities — full renewal flow or just a redirect with pre-filled data?
3. Should DSC data be visible to account admins, or strictly private per user?
4. Is there a need for bulk CSV import for enterprises with many DSCs?
5. Should the agent also support soft tokens (certificate files, .pfx / .p12) in addition to USB hardware tokens?
