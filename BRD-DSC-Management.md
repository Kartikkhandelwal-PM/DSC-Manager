# BRD — DSC Management
**KDK Software · v1.4 · July 2026 · Updated**

### Changelog
| Version | Date | What Changed |
|---|---|---|
| v1.4 | Jul 2026 | Added communication options in Settings (Email + WhatsApp channels; alerts to user and/or client); added WhatsApp and Email templates for both user and client alerts; noted the desktop component can be delivered via KDK Connector; removed "Out of Scope" and "Open Questions" sections |
| v1.3 | Jun 2026 | Token PIN and Cert Password fields confirmed in Add DSC wizard (Step 4) and DSC Detail Panel (Section 3); Development Status updated to reflect all frontend and agent components complete |
| v1.2 | Jun 2026 | Added Token PIN and Cert Password fields; redesigned DSC Detail Panel layout |
| v1.1 | Jun 2026 | Initial internal draft |

---

## 1. Why Are We Building This?

A Digital Signature Certificate (DSC) is a government-issued electronic credential stored on a USB token. Professionals — CAs, tax practitioners, businesses — use DSCs to sign ITR, GST, MCA, and DGFT filings.

**The problem today:** People manage multiple DSCs across many clients using Excel or memory. They miss expiry dates, don't know where a token physically is, and have no easy way to renew.

**What we're building:** A DSC Management module inside KDK Software that:
- Auto-reads certificate data when a USB token is plugged in
- Tracks all DSCs for all clients in one dashboard
- Sends email and WhatsApp alerts before expiry — to the user and, optionally, the client
- Enables one-click renewal via Capricorn

---

## 2. Who Uses It?

| User | What they manage |
|---|---|
| CA / Tax Practitioner | DSCs for 20–100+ clients (each client may have 1–3 DSCs) |
| Advocate / Law Firm | DSCs for partners and clients |
| Business / Enterprise | DSCs for directors, CFOs, employees |
| Individual Professional | Their own personal DSC |

A user manages two types of DSCs:
- **Own DSCs** — for their firm's own filings
- **Client DSCs** — belonging to clients they manage on behalf of

---

## 3. How It Works — Big Picture

A browser alone cannot read a USB token. So the user needs two things installed on their computer:

### Two-Component Setup (one-time)

| Component | What it is | Who provides it | Status |
|---|---|---|---|
| **Token Driver** (PKCS#11 `.dll`) | Driver for the USB token hardware. e.g. `ep2pk11.dll` for ePass2003. | Token manufacturer (Feitian, WatchData, etc.) | Usually already installed — anyone who has used their DSC on MCA21, TRACES, or GST portal already has this. |
| **KDK DSC Agent** | Small background app that reads the token and sends data to the browser. | KDK Software | New one-time install — download from within the KDK web app. |

> **Important:** Most users will already have the token driver installed. The KDK DSC Agent is the only new thing they need.

> **Note — KDK Connector:** The desktop component does not have to ship as a standalone install. This token-reading capability can be delivered through **KDK Connector** — KDK's existing desktop utility that many users already have installed for other KDK products. Where KDK Connector is present, the DSC read flow can run through it instead of a separate KDK DSC Agent download, removing the one-time install step for those users.

### How It Connects

```
USB Token (plugged in)
      ↓  via Token Driver (PKCS#11)
KDK DSC Agent  ← Electron app, runs silently in system tray
      ↓  WebSocket on ws://localhost:12345
KDK Web App (browser)
      ↓
User reviews data → saves to their KDK account
```

**KDK DSC Agent** — installed once, runs silently in the background. Detects when a USB token is plugged in and passes the certificate data to the web app automatically. Available as a Windows ZIP package. Mac support planned. This same capability can also be provided through **KDK Connector** for users who already run it.

---

## 4. Feature Summary

| Feature | Description |
|---|---|
| Add DSC via USB Token | Plug in token → agent auto-reads all certificate fields → user confirms |
| Add DSC Manually | User types in fields when token isn't available |
| DSC Dashboard | All DSCs across all clients. Cards: Total / Active / Expiring Soon / Expired |
| Client View | Click a client to see only their DSCs |
| DSC Detail Panel | Full info view with edit, delete, and renew actions |
| Expiry Alerts | Email and WhatsApp alerts at threshold → 30 days → 7 days → expiry day → post-expiry. Sent to the user and, optionally, the client |
| Renewal | "Renew via Capricorn" button on expiring/expired DSCs |
| Search & Filter | Search by name/serial/location; filter by status; sort by expiry/name/status |
| Settings | Alert threshold, communication channels (Email / WhatsApp), recipients (user + client), and additional email/WhatsApp contacts |

---

## 5. User Flows

---

### Flow 1 — First-Time Setup: Installing the Agent

**When:** User clicks "Add DSC" → "Read from USB Token" for the first time and the agent is not yet installed.

**Steps:**
1. App connects to `ws://localhost:12345` — checks if agent is running
2. Agent not found (3-second timeout) → show screen:
   - Message: *"KDK DSC Agent not found"*
   - Auto-detect OS → show Windows or Mac download button
   - Installation steps shown:
     1. Download the ZIP and extract it
     2. Double-click `KDK DSC Agent.exe` to start — takes about 30 seconds
     3. Agent icon will appear in the system tray when ready
   - Button: **"I've installed it — Connect →"**
3. User installs agent → clicks button → app retries connection every 3 seconds
4. Agent detected → green dot shown: *"KDK DSC Agent is running"*
5. Continue to Flow 2

> **Note:** If the token driver is also missing, the agent detects this separately and guides the user to install it (see Edge Cases).

---

### Flow 2 — Add DSC via USB Token

**When:** Agent is running. User wants to add a new DSC.

**Step 1 — Method Selection**

User clicks **Add DSC** and chooses:

| Option | Description |
|---|---|
| **Read from USB Token** *(Recommended)* | Agent reads certificate automatically |
| **Enter Manually** | User types in the fields |

User selects **"Read from USB Token"** → app confirms agent is running → shows *"Plug in your USB Token"*

---

**Step 2 — Token Reading**

User plugs in the USB token. Three possible paths:

**Path A — Token needs a PIN:**

> The token requires a PIN before it can be read. User sees the PIN entry screen.

| Field | Type | Placeholder | Required |
|---|---|---|---|
| PIN / Password | Password (with show/hide toggle) | `Enter PIN (e.g. 123456)` | **Yes** |

- Press Enter or click **Submit PIN**
- If wrong PIN → input shakes, shows *"Incorrect PIN — try again"*
  - 2 attempts left → amber warning: *"2 attempts remaining — token locks after 3 wrong entries."*
  - 1 attempt left → red warning: *"Last attempt! Token locks permanently after this."*
- If token locks → see Edge Case: Token Locked

**Path B — No PIN needed:**
Agent reads certificate directly without login.

**Path C — Multiple certificates on one token:**
User sees a list of certificates. Each shows: holder name, issuing CA, purpose, expiry. User selects one.

---

**Step 3 — Certificate Found (read-only preview)**

The web app shows: *"Certificate found! All details read successfully."*

Fields shown (all read-only — extracted from the token, cannot be edited):

*Certificate Holder:*

| Field | Example |
|---|---|
| Holder Name | Ramesh Kumar |
| Organisation | ABC & Associates |
| City | Ahmedabad |
| State | Gujarat |
| Email | ramesh@abc.com |

*Certificate Info:*

| Field | Example |
|---|---|
| Serial Number | 3AF12C9D00B4E721 |
| Issued By | eMudhra Consumer CA 5 |
| DSC Class | Class 3 |
| Purpose | Signing |
| Issue Date | 15 Apr 2024 |
| Expiry Date | 14 Apr 2027 |

User clicks **Continue**.

---

**Step 4 — Details & Client Assignment**

User fills in management information. Certificate fields remain locked.

*Token / Hardware:*

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Token Brand | Dropdown | — Select token — | No |
| Token Serial No. | Text | `HW12345678` | No |

> Token Brand options: ePass2003 · WatchData · PROXKey · SafeNet iKey · Feitian ePass · Aladdin eToken · Other

*Management:*

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Label / Nickname | Text | `e.g. Director Signing DSC` | No |
| Physical Location | Text | `e.g. Office Drawer 3` | No |
| Assigned To | Text | `e.g. Ramesh Kumar` | No |
| Notes | Textarea | `Any remarks about this DSC...` | No |

*Security (stored for user reference only — private keys never leave the token):*

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Token PIN | Password (with show/hide) | `e.g. 123456` | No |
| Cert Password | Password (with show/hide) | `Certificate password` | No |

*Client Assignment:*

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Assign to Client | Searchable Dropdown | `Search client…` | **Yes** (if clients exist) |

> Options include "My Own DSCs" and all client names in the account.

*Consent:*

| Field | Type | Required |
|---|---|---|
| ☐ "I confirm that I am authorised to register and manage this digital signature certificate within KDK DSC Manager." | Checkbox | **Yes** |

**Save & Add DSC** button — enabled only when consent checkbox is checked.

---

**Step 5 — Success**

- *"DSC saved successfully!"*
- Summary of saved DSC (name, expiry, client, status pill)
- Two buttons: **"Add Another DSC"** · **"View Dashboard"**

---

### Flow 3 — Add DSC Manually

**When:** User selects "Enter Manually" at Step 1 of the Add DSC wizard.

**Step 2 — Manual Entry Form**

*Certificate Holder:*

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Holder Name | Text | `Ramesh Kumar` | **Yes** |
| Organisation | Text | `ABC & Associates` | No |
| Email | Text | `ramesh@abc.com` | No |
| City | Text | `Ahmedabad` | No |
| State | Text | `Gujarat` | No |

*Certificate Info:*

| Field | Type | Placeholder / Options | Required |
|---|---|---|---|
| Serial Number | Text | `3AF12C9D00B4E721` | **Yes** |
| Issuing CA | Text | `eMudhra Consumer CA 5` | **Yes** |
| DSC Class | Dropdown | Class 3 / DGFT / Document Signer | No |
| Purpose | Dropdown | Signing / Encryption / Signing & Encryption | No |

*Validity:*

| Field | Type | Required |
|---|---|---|
| Issue Date | Date picker | No |
| Expiry Date | Date picker | **Yes** |

*Token / Hardware:*

| Field | Type | Placeholder / Options | Required |
|---|---|---|---|
| Token Brand | Dropdown | ePass2003 · WatchData · PROXKey · SafeNet iKey · Feitian ePass · Aladdin eToken · Other | No |
| Token Serial No. | Text | `HW12345678` | No |

**Continue** button — enabled only when all required fields are filled.

After Continue → user proceeds to **Step 4 (Details & Client Assignment)** same as the token flow above → then Step 5 (Success).

---

### Flow 4 — DSC Dashboard

**When:** User opens the DSC Management section.

**Left Sidebar:**
- KDK logo at top
- **All Clients** option (shows all DSCs across all clients)
- **My Own DSCs** (personal DSCs, highlighted in amber/gold)
- List of clients — each shows: name, type badge, DSC count, alert count, and a health dot (green / amber / red / grey)
- Search box at top of client list:

| Field | Type | Placeholder |
|---|---|---|
| Search Clients | Text | `Search clients…` |

- User profile menu at bottom (Settings · Profile · Subscription · Sign Out)

**Main Area — All Clients View:**

4 stat cards at the top (clickable — acts as a filter):
- **Total** — all DSCs
- **Active** — valid DSCs
- **Expiring Soon** — expiring within alert threshold (default 90 days)
- **Expired** — already expired

Status filter bar: **All · Active · Expiring Soon · Expired**

Search box:

| Field | Type | Placeholder | Searches Across |
|---|---|---|---|
| Search DSCs | Text | `Search DSCs…` | Holder name · Label · Organisation · Serial number · Location |

DSC Table columns:
- Status dot (green / amber pulsing / red)
- Certificate name · Client name · Client type badge
- Issuing CA
- Expiry date + days remaining (colour-coded: green / amber / red)
- Status badge
- Arrow → open detail panel

Sortable columns: Certificate & Client · Expiry Date · Status (urgency order) · Recently Added

---

### Flow 5 — Client View

**When:** User clicks a client in the sidebar.

- Back button to return to All Clients
- Client name + type in header
- Same 4 stat cards (filtered to this client only)
- DSC cards grid — each card shows: status colour bar · status badge · days left · holder name · issuing CA · expiry · class · purpose
- Hover on card → "View full details →" appears
- **"Add Another DSC"** button (opens wizard with this client pre-selected)

---

### Flow 6 — DSC Detail Panel

**When:** User clicks a row in the table or a card in the client view. A modal panel appears.

**Header (colour reflects status — blue/purple for Active, amber for Expiring Soon, red for Expired):**
- Status badge (top-left)
- Close button (top-right)
- DSC label / holder name
- Organisation
- Countdown: *"47 days"* with "remaining" label
- Progress bar (% of certificate lifetime remaining)
- Issue date and expiry date below the progress bar

**Alert banner** (shown for Expiring Soon / Expired, collapses on scroll):
- Amber: *"Expires in 47 days — renew soon to avoid service disruption."*
- Red: *"This DSC has expired. Renew immediately to continue using it."*

**Section 1 — Certificate Holder** *(read-only)*

| Field | Display |
|---|---|
| Holder Name | Text |
| Organisation | Text |
| City | Text |
| State | Text |
| Email | Text |

**Section 2 — Certificate Info** *(read-only)*

| Field | Display |
|---|---|
| Serial Number | Monospace text |
| Issued By | Text |
| Class | Text |
| Purpose | Text |
| Issue Date | Formatted date |
| Expiry Date | Formatted date |

**Section 3 — Token / Hardware** *(editable in edit mode)*

| Field | Type | Placeholder |
|---|---|---|
| Token Brand | Dropdown | `e.g. ePass2003` |
| Token Serial No. | Text | `HW12345678` |
| Token PIN | Password (show/hide) | `e.g. 123456` |
| Cert Password | Password (show/hide) | `Certificate password` |

**Section 4 — Management** *(editable in edit mode)*

| Field | Type | Placeholder |
|---|---|---|
| Label / Nickname | Text | `e.g. Director Signing DSC` |
| Physical Location | Text | `e.g. Office Drawer 3` |
| Assigned To | Text | `e.g. Accounts Team` |
| Notes | Textarea | `Any remarks about this DSC...` |

**Footer (view mode):**
- Left: *"Remove"* link (opens delete confirmation)
- Right: **Edit Details** button · **Renew via Capricorn** button (shown only for Expiring Soon / Expired)

Small footer text at bottom of panel body: *"Added via USB token · 15 Jan 2026"*

---

### Flow 7 — Edit DSC

**When:** User clicks "Edit Details" in the detail panel.

- Certificate Holder and Certificate Info sections remain grey and locked (read-only)
- Token / Hardware and Management sections become white editable input boxes
- Footer shows **Save Changes** and **Discard**
  - If nothing changed, primary button shows **Done** instead of Save Changes
  - Footer shows *"You have unsaved changes"* text when dirty
- User edits fields → clicks Save Changes → fields return to read-only display

---

### Flow 8 — Delete DSC

1. User opens the detail panel for a DSC
2. Clicks *"Remove"* (small link at bottom-left of footer)
3. Confirmation overlay appears inside the panel:
   - *"Remove this DSC?"*
   - *"[DSC Name] will be permanently deleted and cannot be recovered."*
   - **Cancel** · **Yes, Delete** (red gradient)
4. **Yes, Delete** → DSC removed, panel closes
5. **Cancel** → overlay dismisses, nothing changes

> Deletion is permanent — no recovery.

---

### Flow 9 — Settings

**When:** User clicks their name at the bottom of the sidebar → **Settings**.

*Alert Threshold:*

| Field | Type | Default | Validation | Required |
|---|---|---|---|---|
| Days before expiry | Numeric text | `90` | Integer, 1–365 | **Yes** |

Description: *"Send the reminder this many days before a DSC expires"*
Info banner shows how many recipients alerts will go to and the current threshold.

*Communication Channels:*

The user chooses how alerts are delivered. At least one channel must stay enabled.

| Field | Type | Default | Required |
|---|---|---|---|
| Email alerts | Toggle | On | — |
| WhatsApp alerts | Toggle | Off | — |

*Who Gets Alerted:*

| Field | Type | Default | Notes |
|---|---|---|---|
| Notify the user (account holder) | Toggle | On | The professional / firm managing the DSC |
| Notify the client (certificate holder) | Toggle | Off | Sends the alert directly to the client whose DSC is expiring, using the client's contact details |

*Email Recipients:*

| Field | Type | Placeholder | Validation | Required |
|---|---|---|---|---|
| Add Email Address | Email text | `Add another email address…` | Valid email format, no duplicates | No |

- Primary email (user's account email) — always shown, cannot be removed
- Additional emails listed with × to remove
- Add by pressing Enter or clicking the + button

*WhatsApp Recipients* (shown when WhatsApp alerts are on):

| Field | Type | Placeholder | Validation | Required |
|---|---|---|---|---|
| Add WhatsApp Number | Phone text | `Add a WhatsApp number…` | Valid mobile number, no duplicates | No |

- Numbers listed with × to remove
- Add by pressing Enter or clicking the + button

**Save Changes** button — only active if something changed.
- On save: green banner *"Settings saved successfully"* shown for 2.5 seconds

---

## 6. Edge Cases

| Situation | What the user sees | Recovery |
|---|---|---|
| Agent not installed | Download link + 3-step install guide + **"I've installed it — Connect"** button. App retries every 3 seconds. | User installs agent and clicks Connect. |
| Agent installed but not running | Same screen as above. App keeps retrying every 3 seconds. | User starts agent from its install location. |
| Token driver not installed | *"Token driver not installed."* If brand is identified via USB VID → show brand name + driver download link. If unknown → *"Install the driver that came with your token."* + **"I've installed the driver — Retry"** button. | User installs driver, clicks Retry. |
| PIN required | PIN entry screen with show/hide toggle, submit on Enter. | User enters correct PIN. |
| Wrong PIN entered | Input shakes. *"Incorrect PIN — try again."* Attempt count shown. At 1 left: red final warning. | User tries again carefully. |
| Token locked (too many wrong PINs) | *"Token is locked."* Contact numbers shown for all major providers: eMudhra 1800-103-7778 · Capricorn 0265-6111200 · NSDL 022-24994200 · Sify 1800-229-5559 | User calls their DSC provider for SO (admin) PIN reset. |
| Multiple certificates on token | List of certificates — each shows holder, CA, purpose, expiry. User picks one. To save both, repeat the Add flow. | User selects the certificate they need. |
| Token removed mid-read | *"Token disconnected. Plug it back in and try again."* | User re-plugs token and restarts the read. |
| Client has no DSCs yet | Empty state: *"No certificates added yet."* + **"Add DSC for [Client]"** button. | Click button to open wizard with client pre-filled. |
| Adding an already-expired DSC | Saved normally. Shows red Expired badge in dashboard. | User should renew it. |
| Duplicate serial number | Warning shown with existing entry details. *"Update existing record instead?"* Yes → update. No → cancel. | User decides whether to update or cancel. |
| No clients in account yet | Dashboard shows all stats at 0. | User adds their first DSC. |

---

## 7. Data Fields Reference

### Certificate Data — Read-Only (set by the Certificate Authority, never editable by user)

| Field | Required to Save | Source | Notes |
|---|---|---|---|
| Holder Name | **Yes** (manual) / auto (token) | Certificate CN field | Full name on certificate |
| Organisation | No | Certificate O field | Company / firm name |
| Organisational Unit | No | Certificate OU field | Department or division |
| City | No | Certificate L field | |
| State | No | Certificate ST field | |
| Country | No | Certificate C field | e.g. IN |
| Email | No | Certificate emailAddress or SAN | Email embedded in certificate |
| Serial Number | **Yes** | Certificate serial | Unique hex identifier — used for duplicate detection |
| Issued By | **Yes** | Certificate Issuer CN | Certificate Authority name |
| DSC Class | No | Certificate policy OID | Class 3 / DGFT / Document Signer — detected from Indian DSC OIDs |
| Purpose | No | Certificate Key Usage extension | Signing / Encryption / Signing & Encryption |
| Issue Date | No | Certificate notBefore | |
| Expiry Date | **Yes** | Certificate notAfter | Used for all alert calculations |
| SHA-256 Fingerprint | No | Computed from DER bytes | Stored for reference, not shown in UI by default |

### Token / Hardware Data — Editable Any Time

| Field | Required | Notes |
|---|---|---|
| Token Brand | No | Dropdown: ePass2003 · WatchData · PROXKey · SafeNet iKey · Feitian ePass · Aladdin eToken · Proxima · Other |
| Token Serial No. | No | Hardware serial of the USB device — read from PKCS#11 token info |
| Token PIN | No | Stored for user's reference only — private keys never leave the hardware token |
| Cert Password | No | Stored for user's reference only |

### Management Data — Editable Any Time

| Field | Required | Notes |
|---|---|---|
| Label / Nickname | No | Friendly name shown in dashboard |
| Physical Location | No | Where the token is kept |
| Assigned To | No | Person responsible for the token |
| Notes | No | Free text remarks |
| Client Assignment | **Yes** (if clients exist) | Which client this DSC belongs to |
| Added Method | Auto | "token" or "manual" |
| Added Date | Auto | Date saved in the system |

---

## 8. Alert & Notification System

**How it works:**
1. A background job runs daily
2. Checks all DSCs across all users
3. Calculates days until expiry for each DSC
4. Sends alerts on the enabled channels if days remaining ≤ the user's alert threshold

**Default threshold:** 90 days (user can change to 1–365 in Settings)

### Channels

Alerts can be delivered over two channels, toggled per account in Settings:

| Channel | Default | Notes |
|---|---|---|
| **Email** | On | Sent to all configured email recipients |
| **WhatsApp** | Off | Sent to all configured WhatsApp numbers |

### Recipients

Each account decides who receives alerts (in Settings):

| Recipient | Default | Contact used |
|---|---|---|
| **User (account holder)** | On | Primary account email (always) + additional emails / WhatsApp numbers in Settings |
| **Client (certificate holder)** | Off | The client's email / mobile on their record, so the client is warned directly about their own DSC |

> User and client alerts use different message wording — the user copy is about a certificate they manage; the client copy is addressed to the certificate owner. Both are available on Email and WhatsApp. Client messages carry no app or dashboard links, since clients have no login or client view.

### Schedule per DSC

The same schedule applies to every enabled channel and recipient:

| Trigger | Alert sent |
|---|---|
| Days remaining first drops to ≤ threshold | First alert |
| 30 days before expiry | Reminder (if not yet renewed) |
| 7 days before expiry | Urgent reminder (if not yet renewed) |
| Day of expiry | Final warning |
| After expiry | Post-expiry notice (if not yet renewed or removed) |

---

### Templates

**Placeholders:** `{holder_name}` · `{organisation}` · `{issuing_ca}` · `{dsc_class}` · `{purpose}` · `{expiry_date}` · `{days_remaining}` · `{account_name}` · `{client_name}` · `{recipient}` · `{app_link}`

---

#### 8a. User — Email

```
Subject: DSC Expiring Soon — {holder_name} ({organisation}) — {days_remaining} days left

Dear {account_name},

This is an automated reminder from KDK DSC Manager.

A Digital Signature Certificate you manage is due to expire soon:

  Certificate Holder : {holder_name}
  Organisation       : {organisation}
  Issued By          : {issuing_ca}
  Class              : {dsc_class} | Purpose : {purpose}
  Expiry Date        : {expiry_date} ({days_remaining} days remaining)

Please renew this certificate before it expires to avoid disruption
to your filings.

[Renew via Capricorn]  [View in KDK App]

---
You are receiving this alert because {recipient} is registered as an
alert recipient in KDK DSC Manager.
```

#### 8b. User — WhatsApp

```
*DSC Expiring Soon* — KDK DSC Manager

Dear {account_name},

A DSC you manage is expiring:

Holder: {holder_name}
Organisation: {organisation}
Issued By: {issuing_ca}
Expiry: {expiry_date} ({days_remaining} days left)

Renew before it expires to avoid disruption to filings.
View: {app_link}
```

#### 8c. Client — Email

```
Subject: Your Digital Signature Certificate expires in {days_remaining} days

Dear {client_name},

This is a reminder that your Digital Signature Certificate is due to
expire soon:

  Certificate Holder : {holder_name}
  Organisation       : {organisation}
  Issued By          : {issuing_ca}
  Expiry Date        : {expiry_date} ({days_remaining} days remaining)

Please arrange to renew it in good time so your filings are not
interrupted. If we manage this on your behalf, no action may be
needed — this notice is for your awareness.

---
Sent via KDK DSC Manager on behalf of {account_name}.
```

#### 8d. Client — WhatsApp

```
*DSC Expiry Reminder*

Dear {client_name},

Your Digital Signature Certificate is expiring:

Holder: {holder_name}
Issued By: {issuing_ca}
Expiry: {expiry_date} ({days_remaining} days left)

Please arrange renewal in good time to avoid interrupting your filings.
Sent via KDK DSC Manager on behalf of {account_name}.
```

---

**Visual alerts in the app:**
- Pulsing amber dot on Expiring Soon rows in the table
- Red badge (count) on the client name in the sidebar
- Stat cards for "Expiring Soon" and "Expired" show counts with glow effect
- Countdown text turns red when fewer than 30 days remain

---

## 9. Capricorn Renewal Integration

Capricorn is a licensed DSC Certificate Authority in India. Planned renewal flow:

1. User opens an expiring or expired DSC in the detail panel
2. Clicks **"Renew via Capricorn"**
3. Capricorn's renewal form opens — pre-filled with:
   - Holder Name · Organisation · Email · DSC Class · Purpose
4. User verifies pre-filled data and submits
5. Completes KYC and payment on Capricorn's platform
6. Capricorn issues a new certificate
7. User adds the new certificate to KDK (as a new entry or by updating the existing one)

**Still needed from Capricorn:**
- Pre-fill URL or API endpoint to pass certificate data
- Confirmation webhook or redirect URL for when renewal completes
- Pricing and supported DSC classes

> **Status:** Waiting on partnership agreement. The "Renew via Capricorn" button is present in the UI — needs wiring to their endpoint once the agreement is finalised.

---

## 10. Non-Functional Requirements

### Performance

| What | Target |
|---|---|
| Dashboard load (up to 500 DSCs) | < 2 seconds |
| Token read (plug-in to data in browser) | < 5 seconds |
| Agent WebSocket connection timeout | 3 seconds |
| Search / filter response | < 100ms |

### Security

- All DSC data is private to the user's account — no other user can access it
- The agent binds to `127.0.0.1` only — it cannot be accessed from outside the user's own computer
- **Private keys never leave the USB token** — only the X.509 certificate (public data) is read and transmitted
- The PIN is used only for the PKCS#11 login call — it is never logged or stored by the agent
- Certificate data (serial number, expiry, CA name) is read-only in the UI — it cannot be tampered with after saving
- User must be logged into KDK to access any DSC data
- Consent checkbox required on every new DSC addition
- Delete requires an explicit second confirmation (no accidental deletes)

### Compatibility

| Platform | Supported Versions |
|---|---|
| Windows | Windows 10 and above |
| Mac | macOS 12 (Monterey) and above |
| Browsers | Chrome, Edge, Firefox (latest 2 versions) |
| USB Tokens | All major Indian DSC USB tokens |

**Supported token brands:** ePass2003 · WatchData · PROXKey · SafeNet iKey · Feitian ePass · Aladdin eToken · Proxima

**Supported issuing CAs:** eMudhra · NSDL e-Gov · Capricorn · Sify · NIC · (n)Code Solutions · Safescrypt — and any other government-licensed Certificate Authority

---

## 11. Development Status

| Component | Status | Notes |
|---|---|---|
| **Frontend — Dashboard** | Done | React app — all views, filters, search, sorting |
| **Frontend — Add DSC Wizard** | Done | Token + manual flows, all edge case screens |
| **Frontend — DSC Detail Panel** | Done | Read, edit, delete, renew button |
| **Frontend — Settings Panel** | Done | Alert threshold + communication channels + user/client recipients + email/WhatsApp contacts |
| **KDK DSC Agent — WebSocket server** | Done | Electron app, `ws://127.0.0.1:12345`, system tray. Can alternatively be delivered via KDK Connector |
| **KDK DSC Agent — Token reader** | Done | PKCS#11 full flow: slot polling, PIN auth, cert extraction |
| **KDK DSC Agent — Certificate parser** | Done | Parses DER → all fields including Indian DSC class OIDs |
| **KDK DSC Agent — Driver detector** | Done | Scans known `.dll` paths per token brand on Windows/Mac |
| **KDK DSC Agent — USB watcher** | Done | Detects token brand via USB VID/PID even before driver install |
| **Windows build** | Done | `KDK DSC Agent-1.0.0-win.zip` built and ready to distribute |
| **Mac build** | Not started | Requires Mac machine with Xcode |
| **Backend — DSC data storage API** | Not started | Endpoints to save/retrieve DSC records |
| **Backend — Daily alert job** | Not started | Cron job to check expiry and send email + WhatsApp alerts to user and/or client |
| **Email templates** | Not started | User and client expiry alert email design and delivery |
| **WhatsApp templates & delivery** | Not started | User and client WhatsApp alerts via approved message templates |
| **KDK Connector integration** | Not started | Route token reading through KDK Connector as an alternative to the standalone agent |
| **Capricorn integration** | Blocked | Waiting on partnership agreement |
| **End-to-end test with real token** | Pending | Needs physical DSC USB token + driver installed |

---

*Questions? Contact Product Management, KDK Software.*
