# Product Requirements: DSC Management
**KDK Software · v1.2 · July 2026**

> **About this document:** This is the product requirements document for the DSC Management module. It describes what the system must do and how it must behave, not how it is built. Backend and infrastructure decisions are left to the engineering team.

---

## 1. Problem We Are Solving

Professionals who file documents on government portals (Income Tax, GST, MCA, DGFT) use Digital Signature Certificates (DSCs) stored on USB tokens. Most of them manage DSCs for multiple clients. Today they track these in spreadsheets or from memory.

**Key pain points:**
- DSCs expire without warning and filings fail at the last moment
- No central place to see the status of all DSCs across all clients
- No easy way to know where a physical token is kept or who holds it

**What we are building:** A DSC Management module added to the Office Management section of KDK Spectrum Cloud, where users can track all their DSCs in one place and receive timely alerts before any certificate expires.

---

## 2. Who Uses This

This module is part of the Office Management section within KDK Spectrum Cloud. It is available to all existing users of Spectrum Cloud who need to manage Digital Signature Certificates for themselves or on behalf of their clients.

Within the module, DSCs are organised into two categories:
- **Own DSCs:** certificates belonging to the user's own firm or organisation, used for their own filings
- **Client DSCs:** certificates belonging to clients whose filings the user handles on their behalf

---

## 3. Feature Overview

| # | Feature | Summary |
|---|---|---|
| 1 | Add DSC via USB Token | Plug in token, system reads certificate data automatically, user confirms and saves |
| 2 | Add DSC Manually | User types certificate details when the token is not available |
| 3 | DSC Dashboard | Central view of all DSCs across all clients with status summary cards |
| 4 | Client View | Filtered view showing DSCs belonging to a single client |
| 5 | DSC Detail View | Full information for a single DSC with edit and delete options |
| 6 | Edit DSC | User can update management and hardware details after saving |
| 7 | Delete DSC | User can permanently remove a DSC record |
| 8 | Expiry Alerts | Email and WhatsApp reminders sent automatically before a DSC expires — to the user and, optionally, the client |
| 9 | Settings | User configures alert timing, communication channels (Email / WhatsApp), and who receives alert notifications (user and/or client) |

---

## 4. Detailed Requirements

---

### 4.1 Adding a DSC via USB Token

The system must allow a user to add a DSC by plugging in their USB token. The system reads the certificate information from the token automatically.

**Desktop Component (one-time install)**

Reading a USB token requires a small background application to be installed on the user's computer. This is a one-time install. If this application is not detected when the user tries to read a token, the system must:
- Tell the user clearly that the component is not running
- Show download and installation instructions
- Provide a button the user clicks once they have installed it
- Automatically detect when the component becomes available without requiring a page refresh

> **Note — KDK Connector:** This desktop component does not have to be a standalone install. The token-reading capability can be delivered through **KDK Connector**, KDK's existing desktop utility that many users already run for other KDK products. Where KDK Connector is present, the read flow can run through it instead of a separate download, removing the one-time install step for those users.

**Token Detection**

Once the desktop component is running, the user plugs in their USB token. The system must detect the token and begin reading it. If the token requires a PIN, the system must show a PIN entry screen before reading.

**PIN Entry**

| Requirement | Expected Behaviour |
|---|---|
| Show/hide toggle | The PIN field must have a toggle to reveal or hide the PIN |
| Wrong PIN feedback | Show an error message and display how many attempts remain |
| One attempt remaining | Show a prominent warning that the token will lock permanently on the next wrong entry |
| Token locked | Show a message that the token is locked and inform the user to contact their DSC provider |

**Multiple Certificates on One Token**

Some tokens contain more than one certificate. If multiple certificates are found, the system must list them so the user can select the one they want to save. To save both, the user runs the Add DSC flow a second time.

**Certificate Preview and Management Details (single screen)**

Once the certificate is read, a brief confirmation appears and the system automatically moves to the management details screen. No separate Continue button is needed.

This screen has two parts:

Part 1 — Read-only certificate summary at the top of the screen. All certificate data that was read from the token (holder name, organisation, serial number, expiry date, class, purpose, and any other extracted fields) is shown in a compact display. The user can review this data but cannot change it.

Part 2 — Management fields below the summary, which the user fills in:

| Field | Required | Notes |
|---|---|---|
| Client Assignment | Required (if clients exist) | Which client this DSC belongs to. "My Own DSCs" option is always available. |
| Label / Nickname | No | A friendly name the user gives this DSC |
| Physical Location | No | Where the token is kept, e.g. Office Drawer 3 |
| Assigned To | No | The person responsible for this token |
| Notes | No | Any remarks |
| Token PIN | No | Stored for the user's reference only |
| Certificate Password | No | Stored for the user's reference only |
| Consent Confirmation | Required | User must confirm they are authorised to register this DSC |

The Save button is enabled only after the consent checkbox is ticked.

**Success State**

After saving, the system shows a success confirmation with a full summary of everything saved. The user can choose to add another DSC or go to the dashboard.

**Token Driver Not Installed**

If the hardware driver for the USB token is missing, the system must tell the user. If the token brand can be identified, show the brand name and a driver download link. If it cannot be identified, show a general instruction to install the driver that came with the token.

---

### 4.2 Adding a DSC Manually

When the user does not have the token available, they must be able to add a DSC by typing in the details.

**Required fields:**

| Field | Required |
|---|---|
| Holder Name | Yes |
| Serial Number | Yes |
| Issuing CA | Yes |
| Expiry Date | Yes |

**Optional fields:** Organisation, Email, City, State, DSC Class, Purpose, Issue Date, Token Brand, Token Serial Number

After filling in the certificate details, the user proceeds to the same management details step as the USB token flow covering Label, Location, Client Assignment, and Consent.

---

### 4.3 DSC Dashboard

The dashboard is the home screen of the DSC Management module.

**Left Panel: Client List**
- Shows all clients in the user's account
- Each client entry shows name, type, number of DSCs, number of alerts, and a health indicator
- A search box to find clients by name
- A "My Own DSCs" entry for the firm's own DSCs, shown distinctly
- User profile menu at the bottom with access to Settings, Profile, and Sign Out

**Main Area: All DSCs View**
- Four summary cards at the top: Total, Active, Expiring Soon, Expired
- Clicking a summary card filters the list to that status
- A status filter bar with options: All, Active, Expiring Soon, Expired
- A search box that searches across holder name, label, organisation, serial number, and location
- A table listing all DSCs with status indicator, certificate name, client name, issuing CA, expiry date with days remaining, and status badge
- Columns must be sortable by certificate name, expiry date, status, and date added
- Clicking a row opens the DSC Detail view

**Status Colour Rules**

| Colour | Meaning |
|---|---|
| Green | DSC is active and not expiring within the alert threshold |
| Amber (pulsing) | DSC is expiring within the user's configured alert threshold (default 90 days) |
| Red | DSC has already expired |

---

### 4.4 Client View

When the user clicks a client in the left panel, the main area changes to show only that client's DSCs.

- Shows the client's name and type in the header
- The four summary cards show counts for this client only
- DSCs are shown as cards, each displaying status, days remaining, holder name, issuing CA, expiry date, class, and purpose
- An "Add Another DSC" button opens the wizard with this client already pre-selected
- If the client has no DSCs yet, show a clear empty state with a prompt to add the first one

---

### 4.5 DSC Detail View

Clicking a DSC opens a detail view showing all information about that DSC.

**Header**
- Status badge
- DSC label or holder name
- Organisation
- Countdown showing days remaining
- A progress bar showing how much of the certificate's lifetime has passed
- Issue date and expiry date

**Alert Banner**

| Status | Banner |
|---|---|
| Expiring Soon | Amber banner showing the number of days remaining and prompting the user to take action |
| Expired | Red banner informing the user that the certificate has expired and action is needed |

The banner collapses when the user scrolls down.

**Information Sections**

| Section | Fields | Can User Edit |
|---|---|---|
| Certificate Holder | Holder name, Organisation, City, State, Email | No |
| Certificate Info | Serial number, Issued by, Class, Purpose, Issue date, Expiry date | No |
| Token / Hardware | Token brand, Token serial number, Token PIN, Certificate password | Yes |
| Management | Label, Physical location, Assigned to, Notes | Yes |

Certificate Holder and Certificate Info contain data that was originally issued by the Certificate Authority. This data cannot be changed by the user after saving.

**Footer**
- A "Remove" link to delete this DSC
- An "Edit Details" button
- A small note at the bottom showing how the DSC was added (via token or manually) and the date it was added

---

### 4.6 Editing a DSC

The user must be able to update the hardware and management details of a saved DSC at any time.

- Certificate Holder and Certificate Info fields remain locked and cannot be changed
- Token / Hardware and Management fields become editable when the user clicks "Edit Details"
- The footer must show a message when there are unsaved changes
- Save Changes and Discard buttons appear in edit mode
- If nothing has been changed, the primary button shows "Done" instead of "Save Changes"

---

### 4.7 Deleting a DSC

The user must be able to permanently remove a DSC record.

- Delete is triggered via the "Remove" link in the detail view footer
- Before deleting, the system must show a confirmation screen naming the specific DSC being deleted
- Deletion is permanent with no undo or recovery
- After deletion, the detail view closes and the dashboard updates

---

### 4.8 Expiry Alerts

The system must automatically warn users before their DSCs expire. The system checks all DSCs daily and sends a single reminder when a DSC is approaching expiry.

**Alert Schedule per DSC**

| When | Notification Sent |
|---|---|
| Days remaining first drops to or below the user's threshold (default 90 days) | Reminder |

A single reminder is sent per DSC when it first crosses the configured threshold.

**Alert Recipients**

Each account decides, in Settings, who is alerted:

- **User (account holder)** — the professional or firm managing the DSC. The primary Spectrum Cloud account email is always included and cannot be removed, plus any additional email addresses or WhatsApp numbers added in Settings.
- **Client (certificate holder)** — optionally, the client whose DSC is expiring can be alerted directly, using the client's own email and mobile on record.

User and client alerts use different wording: the user copy is about a certificate they manage, while the client copy is addressed to the certificate owner. Both are available on Email and WhatsApp. Client messages do not include app or dashboard links, since clients do not have a login or client view.

---

#### 4.8.1 Email Notification

The system sends an email alert to all configured recipients when the DSC crosses the reminder threshold. Separate wording is used for the user (account holder) and the client (certificate holder).

**User Email Template**

```
Subject: DSC Expiry Alert: {holder_name} ({organisation}) expires in {days_remaining} days

Dear {account_name},

This is an automated reminder from KDK Spectrum Cloud.

A Digital Signature Certificate you manage is due to expire soon:

  Certificate Holder : {holder_name}
  Organisation       : {organisation}
  Issued By          : {issuing_ca}
  DSC Class          : {dsc_class}
  Purpose            : {purpose}
  Expiry Date        : {expiry_date}
  Days Remaining     : {days_remaining} days

Please ensure this certificate is addressed before it expires to avoid
disruption to your filings.

[ View DSC in Spectrum Cloud ]

---
You are receiving this alert because {recipient_email} is registered as
an alert recipient in KDK Spectrum Cloud DSC Management.
```

**Client Email Template**

```
Subject: Your Digital Signature Certificate expires in {days_remaining} days

Dear {client_name},

This is a reminder that your Digital Signature Certificate is due to
expire soon:

  Certificate Holder : {holder_name}
  Organisation       : {organisation}
  Issued By          : {issuing_ca}
  Expiry Date        : {expiry_date}
  Days Remaining     : {days_remaining} days

Please arrange to renew it in good time so your filings are not
interrupted. If we manage this on your behalf, no action may be needed
— this notice is for your awareness.

---
Sent via KDK Spectrum Cloud on behalf of {account_name}.
```

**Variable Fields**

| Variable | Description |
|---|---|
| {holder_name} | Full name of the certificate holder |
| {organisation} | Organisation name on the certificate |
| {issuing_ca} | Name of the Certificate Authority that issued the DSC |
| {dsc_class} | Certificate class, e.g. Class 3 |
| {purpose} | Certificate purpose, e.g. Signing |
| {expiry_date} | Expiry date in a readable format, e.g. 14 Apr 2026 |
| {days_remaining} | Number of days until expiry |
| {account_name} | Name of the Spectrum Cloud account holder |
| {client_name} | Name of the client the DSC belongs to (client template) |
| {recipient_email} | The email address the alert was sent to |

---

#### 4.8.2 WhatsApp Notification

The system sends a WhatsApp message alert to each configured WhatsApp number when the DSC crosses the reminder threshold. Separate wording is used for the user (account holder) and the client (certificate holder).

**User WhatsApp Template**

```
*DSC Expiry Alert*
KDK Spectrum Cloud

Dear {account_name},

A DSC you manage is expiring:

Certificate Holder: {holder_name}
Organisation: {organisation}
Issued By: {issuing_ca}
Expiry Date: {expiry_date}
Days Remaining: {days_remaining} days

Please renew before it expires to avoid disruption to filings.

View details: {app_link}
```

**Client WhatsApp Template**

```
*DSC Expiry Reminder*

Dear {client_name},

Your Digital Signature Certificate is expiring:

Certificate Holder: {holder_name}
Issued By: {issuing_ca}
Expiry Date: {expiry_date}
Days Remaining: {days_remaining} days

Please arrange renewal in good time to avoid interrupting your filings.
Sent via KDK Spectrum Cloud on behalf of {account_name}.
```

**Variable Fields**

| Variable | Description |
|---|---|
| {holder_name} | Full name of the certificate holder |
| {organisation} | Organisation name on the certificate |
| {issuing_ca} | Name of the Certificate Authority that issued the DSC |
| {expiry_date} | Expiry date in a readable format, e.g. 14 Apr 2026 |
| {days_remaining} | Number of days until expiry |
| {client_name} | Name of the client the DSC belongs to (client template) |
| {account_name} | Name of the Spectrum Cloud account holder |
| {app_link} | Direct link to open the DSC record in Spectrum Cloud |

---

#### 4.8.3 In-App Visual Alerts

- Pulsing amber indicator on expiring DSC rows in the dashboard table
- Alert count shown against the client name in the left sidebar
- Expiring Soon and Expired stat cards show counts prominently
- Days remaining text turns red when fewer than 30 days remain

---

### 4.9 Settings

Users must be able to configure how alerts are sent.

**Alert Threshold**

| Setting | Default | Allowed Range | Applies To |
|---|---|---|---|
| Days before expiry to send the reminder | 90 days | 1 to 365 days | All DSCs in the account |

**Communication Channels**

The user chooses how alerts are delivered. At least one channel must remain enabled.

| Channel | Default | Notes |
|---|---|---|
| Email | On | Sent to all configured email recipients |
| WhatsApp | Off | Sent to all configured WhatsApp numbers |

**Who Gets Alerted**

| Recipient | Default | Notes |
|---|---|---|
| User (account holder) | On | The professional or firm managing the DSC |
| Client (certificate holder) | Off | Sends the alert directly to the client whose DSC is expiring, using the client's contact details on record |

**Alert Recipients**

- The user's primary account email is always included and cannot be removed
- The user can add additional email addresses
- The user can add WhatsApp numbers for WhatsApp alerts
- Additional entries can be removed at any time
- Adding a duplicate or invalid entry must be prevented

**Save Behaviour**
- The Save button is only active when something has changed
- After saving, a confirmation message is shown briefly

---

## 5. Coverage Requirements

The system must not be limited to specific token brands or Certificate Authorities. Any user with a valid DSC issued by a government-licensed CA in India must be able to use this module, regardless of which token brand they use or which CA issued their certificate.

### USB Token Brands

The system must support all major USB token brands used for DSCs in India. The list below covers the most common ones, but the system must not reject or fail on a token simply because its brand is not on this list.

Known token brands include: ePass2003, WatchData, PROXKey, SafeNet iKey, Feitian ePass, Aladdin eToken, Proxima.

If a token brand cannot be identified, the system must still attempt to read the certificate and fall back to a generic driver install instruction rather than blocking the user.

### Certificate Authorities

The system must accept DSCs issued by any government-licensed Certificate Authority (CA) in India. The list below covers the currently active CAs, but the system must not restrict entry to these names alone.

Known CAs include: eMudhra, NSDL e-Gov, Capricorn, Sify, NIC, (n)Code Solutions, Safescrypt.

For manual entry, the Issuing CA field must be a free-text input, not a dropdown, so that any CA name can be entered.

### DSC Classes and Purposes

The system must support all DSC types issued for professional and business use in India:

| Class / Type | Common Use |
|---|---|
| Class 3 | Income Tax, MCA, GST, DGFT filings |
| DGFT | Foreign trade filings |
| Document Signer | High-volume automated signing |

Purposes supported: Signing, Encryption, Signing and Encryption.

---

## 6. Data Captured per DSC


### Certificate Data: Set by the Certificate Authority and not editable by the user

| Field | Required | Description |
|---|---|---|
| Holder Name | Yes (manual entry) / auto-read (token) | Full name on the certificate |
| Organisation | No | Company or firm name |
| City | No | |
| State | No | |
| Email | No | Email embedded in the certificate |
| Serial Number | Yes | Unique identifier used to detect duplicate entries |
| Issued By | Yes | Name of the Certificate Authority |
| DSC Class | No | e.g. Class 3, DGFT, Document Signer |
| Purpose | No | e.g. Signing, Encryption, Signing and Encryption |
| Issue Date | No | When the certificate was issued |
| Expiry Date | Yes | Used for all alert calculations |

### Management Data: Added and editable by the user at any time

| Field | Required | Description |
|---|---|---|
| Token Brand | No | Brand of the USB token device |
| Token Serial Number | No | Hardware serial of the USB device |
| Token PIN | No | Stored for the user's reference only |
| Certificate Password | No | Stored for the user's reference only |
| Label / Nickname | No | Friendly name shown in the dashboard |
| Physical Location | No | Where the token is stored |
| Assigned To | No | Person responsible for the token |
| Notes | No | Free text remarks |
| Client Assignment | Required (if clients exist) | Which client this DSC belongs to |

---

*For technical implementation details, see BRD-DSC-Management.md.*

*Questions? Contact Product Management, KDK Software.*
