# SCREENSHOT-INVENTORY

Status: Authored (FPM-002).  
Owner: Lead Agent.  
Source class: **CONFIRMED** from visual inspection unless marked otherwise.

## Inspection summary

| Item | Result |
| --- | --- |
| Expected screenshots | 27 |
| Files present | 26 (`1.png`–`4.png`, `6.png`–`27.png`) |
| Missing | `5.png` |
| Original written specification | Not present (placeholder only) |

`Route:` values are inferred from breadcrumbs/sidebar only; URLs were not visible → `Route: Not visible` unless breadcrumbs imply a path (still not a real URL).

---

## Screenshot 1 — Dashboard (hero / funded summary)

* **Screen/page:** Dashboard (Funded hero)
* **Purpose:** High-level funded capital, counts, CTA to log withdrawal, period income cards, business snapshot entry points
* **Navigation:** Sidebar → FUNDED → Dashboard (active)
* **Route:** Not visible
* **Main UI elements:** Sidebar; greeting “TRADING BUSINESS - Welcome back, Mohamed”; “+ Log Withdrawal”; total funded capital; status badges; largest withdrawal highlight; six period income cards; Business Snapshot icon row
* **Data shown:** Total Funded Capital `$820,000`; badges `2 Active Accounts`, `2 Firms`, `27 Certificates`, `32 Paid Withdrawals`; Largest Withdrawal `$6,675` Fundednext May 29, 2026; This Month `$0`; Last Month `$8,517`; Q3 2026 `$13,164`; 2026 `$41,969`; Lifetime `$75,040`; Avg/Month `$4,414`
* **Actions:** Log Withdrawal; Sign out; sidebar navigation; Business Snapshot metric icons
* **Forms / Tables / Charts / Filters / Dialogs:** None visible on this crop
* **Relationships:** Aggregates Firms, Accounts, Withdrawals, Certificates
* **UX patterns:** Pastel metric cards; badge chips; left sidebar groups
* **Problems:** Dashboard active while later crops show Real Accounts content on same Dashboard route (scroll continuity) — Behavior: Requires confirmation whether one long page or multiple views

---

## Screenshot 2 — Dashboard (Business Snapshot + Lifetime Income Growth)

* **Screen/page:** Dashboard (continued)
* **Purpose:** Detail Business Snapshot KPIs and cumulative income chart
* **Navigation:** Dashboard active
* **Route:** Not visible
* **Main UI elements:** Same six income cards; Business Snapshot card; Lifetime Income Growth area chart
* **Data shown:** Income Yield `9.2%`; Avg Payout Size `$2,345` (32 payouts); Business Tenure `16 mo` since May 2025; Largest Withdrawal `$6,675`; Best Month `$15,060` May 2026; Lifetime `$75,040`
* **Actions:** Quarter/year card pagination arrows (`< >`); View navigation
* **Charts:** Lifetime Income Growth (area/line)
* **Forms / Tables / Filters / Dialogs:** None
* **Relationships:** Withdrawals over time
* **UX patterns:** Soft pastel cards; large KPI typography
* **Problems:** Quarter/year card chevrons — Behavior: Requires confirmation (period navigation vs decorative)

---

## Screenshot 3 — Dashboard (charts + recent activity)

* **Screen/page:** Dashboard (continued)
* **Purpose:** Payout trend, income by firm, recent withdrawals, monthly payouts
* **Navigation:** Dashboard active
* **Route:** Not visible
* **Main UI elements:** Payout Trend bar chart; Income by Firm list; Recent Withdrawals list; Monthly Payouts list
* **Data shown:** This Quarter `$13,164`; Fundednext `$61,198` (82%); FTMO `$13,842` (18%); recent paid withdrawals; monthly totals (e.g. May 2026 `$15,060`)
* **Actions:** “View all →” on Income by Firm and Recent Withdrawals
* **Charts:** Monthly payout bar chart
* **Tables:** List-style recent withdrawals / monthly groups (not full data grid)
* **Filters / Forms / Dialogs:** None
* **Relationships:** Links toward Withdrawals / Firms modules
* **UX patterns:** Color-coded section cards
* **Problems:** Partial top timeline crop — Behavior: Requires confirmation what the thin top strip chart represents

---

## Screenshot 4 — Dashboard (Real Accounts block)

* **Screen/page:** Dashboard — Real Accounts section
* **Purpose:** Broker equity / P/L overview on Dashboard
* **Navigation:** Dashboard still active (not Broker Accounts)
* **Route:** Not visible
* **Main UI elements:** “Real Accounts” heading; Current Real Equity hero; eight metric cards; Profit by Broker; Profit by Account; start of Combined Business Overview
* **Data shown:** Current Real Equity `$8,000`; Net P/L `+$644`; ROI `+8.1%` / `+8.05%`; Total Deposits `$8,000`; Total Withdrawals `$644`; Peak Equity `$8,644`; Trading Drawdown `$0` excl. withdrawals; fxprimus / PrimusPRO `+$644`
* **Actions:** “View all →”
* **Charts:** Progress bars in lists
* **Problems:** ROI shown as both `+8.1%` and `+8.05%` on same screen — inconsistency **CONFIRMED**

---

## Screenshot 5 — MISSING

* **File:** `reference/screenshots/5.png` — **not present**
* **Status:** UNRESOLVED — content unknown

---

## Screenshot 6 — Dashboard (Combined Business Overview)

* **Screen/page:** Dashboard — Combined Business Overview
* **Purpose:** Totals across funded + real accounts
* **Navigation:** Dashboard active
* **Route:** Not visible
* **Main UI elements:** Real metric grid (continued); Profit by Broker/Account; Combined cards
* **Data shown:** Total Managed Capital `$828,000` (Funded `$820,000` + Real `$8,000`); Total Generated Profit `+$75,684` (Funded payouts `$75,040` + Real P/L `$644`); counts 2 funded accts, 1 broker acct, 2 prop firms, 1 broker
* **Actions:** View all links
* **Relationships:** Cross-module aggregation
* **Problems:** Combining funded payouts with real P/L into one “profit” figure — terminology risk **CONFIRMED** (financial meaning needs rules doc)

---

## Screenshot 7 — Firms list

* **Screen/page:** Firms
* **Purpose:** Manage prop trading firms
* **Navigation:** FUNDED → Firms (active)
* **Route:** Not visible
* **Main UI elements:** Title/subtitle; `+ Add Firm`; search; count `2 firms`; table
* **Data shown:** Fundednext, FTMO; Website `—`; Created Jun 19/18, 2026
* **Actions:** Add Firm; Edit; Delete; search; sort
* **Forms:** None on list
* **Tables:** Name, Website, Created, Actions
* **Filters:** Search only
* **Dialogs:** None visible (Delete confirmation unknown)
* **Relationships:** Feeds Accounts / Withdrawals firm labels
* **Problems:** Delete affordance muted — Behavior: Requires confirmation (disabled vs secondary style); no confirmation dialog visible

---

## Screenshot 8 — Add Firm

* **Screen/page:** Add Firm
* **Purpose:** Create prop firm
* **Navigation:** Firms active; breadcrumb `Firms / New`
* **Route:** Not visible (breadcrumb implies create path)
* **Main UI elements:** Form card
* **Forms:** Name* ; Website (optional); Notes (optional); Create Firm; Cancel
* **Data shown:** Placeholders only
* **Tables / Charts / Filters / Dialogs:** None
* **Relationships:** Creates Firm entity
* **UX patterns:** Required asterisks; primary teal button; secondary Cancel

---

## Screenshot 9 — Accounts list (Funded)

* **Screen/page:** Accounts
* **Purpose:** Track challenges and funded accounts
* **Navigation:** FUNDED → Accounts (active)
* **Route:** Not visible
* **Main UI elements:** `+ Add Account`; search; phase filter `All phases`; count `2 accounts`; table
* **Data shown:** Accounts `2`, `1`; Phase badge `Active`; Current Size `$400,000` / `$420,000`; Firm FTMO / Fundednext; Platform `MT5`
* **Actions:** Add; Edit; Delete; search; filter; sort
* **Tables:** Account, Phase, Current Size, Firm, Platform, Actions
* **Filters:** Search; phase dropdown
* **Problems:** Account identified mainly as ordinal numbers — identification clarity issue **CONFIRMED**; Phase values beyond Active not shown — Behavior: Requires confirmation

---

## Screenshot 10 — Add Account (upper form)

* **Screen/page:** Add Account
* **Purpose:** Track new challenge or funded account
* **Navigation:** Accounts active; breadcrumb `Accounts / New`
* **Route:** Not visible
* **Forms:** Firm*; Account Number (optional); Phase* (default Active); Initial Size*; Current Size*; Currency* (USD); Platform (optional); Start Date (optional); Notes (optional)
* **Actions:** Form fields visible; submit buttons may be below fold
* **Relationships:** Firm required FK
* **UX patterns:** Two-column field pairs

---

## Screenshot 11 — Add Account (with actions)

* **Screen/page:** Add Account (same form, actions visible)
* **Purpose:** Same as 10
* **Actions:** Create Account; Cancel
* **Other:** Same fields as 10
* **Dialogs:** None

---

## Screenshot 12 — Withdrawals list

* **Screen/page:** Withdrawals
* **Purpose:** Track payouts from funded accounts
* **Navigation:** FUNDED → Withdrawals (active)
* **Route:** Not visible
* **Main UI elements:** `+ Record Withdrawal`; search; status filter `All statuses`; count `32 withdrawals`; table
* **Data shown:** Requested dates; Amounts; Status `Paid`; Account labels `FTMO - 2`, `Fundednext - 1`; Paid dates
* **Actions:** Record Withdrawal; Edit; Delete; search; filter; sort
* **Tables:** Requested, Amount, Status, Account, Paid, Actions
* **Filters:** Search; status dropdown (implies non-Paid statuses exist)
* **Problems:** Destructive Delete adjacent to Edit without visible confirm — Behavior: Requires confirmation

---

## Screenshot 13 — Record Withdrawal

* **Screen/page:** Record Withdrawal
* **Purpose:** Manually log a payout from a funded account (**CONFIRMED** core workflow)
* **Navigation:** Withdrawals active; breadcrumb `Withdrawals / New`
* **Route:** Not visible
* **Forms:** Account* (e.g. `FTMO — 2. ($400,000)`); Amount*; Status* (default Pending); Requested Date*; Paid Date (optional); Notes (optional); Record Withdrawal; Cancel
* **Relationships:** Withdrawal → Account
* **Statuses visible:** Pending (form), Paid (list elsewhere)

---

## Screenshot 14 — Scale Events (empty)

* **Screen/page:** Scale Events
* **Purpose:** Account size upgrades
* **Navigation:** FUNDED → Scale Events (active)
* **Route:** Not visible
* **Main UI elements:** Empty state; `+ Add Scale Event`; `+ Add First Scale Event`
* **Data shown:** None
* **Empty state:** “No scale events yet” / “Record when a funded account gets scaled up.”
* **Tables / Charts / Filters:** None
* **CONFIRMED:** Empty-state pattern exists for this module

---

## Screenshot 15 — Add Scale Event

* **Screen/page:** Add Scale Event
* **Purpose:** Record account scale-up
* **Navigation:** Scale Events active; breadcrumb `Scale Events / New`
* **Route:** Not visible
* **Forms:** Account*; From Size*; To Size*; Scale Date*; Notes (optional); Add Scale Event; Cancel
* **Relationships:** Scale Event → Account

---

## Screenshot 16 — Certificate Gallery

* **Screen/page:** Certificate Gallery
* **Purpose:** Browse payout certificates
* **Navigation:** FUNDED → Certificates (active)
* **Route:** Not visible
* **Main UI elements:** `+ Add Certificate`; search by title/firm; filters All Firms / All Years; count `27 certificates`; card grid
* **Data shown:** Certificate previews (FundedNext / FTMO); titles; account refs; large currency figures on cards; dates
* **Actions:** Add; Edit; Delete per card
* **Charts:** None
* **Problems:** Card large amount vs certificate payout amount relationship unclear — Behavior: Requires confirmation (account size vs payout); Delete near Edit

---

## Screenshot 17 — Certificate detail

* **Screen/page:** Certificate detail (Fundednext Certificate)
* **Purpose:** View certificate image + linked withdrawal metadata
* **Navigation:** Certificates active; breadcrumb `Certificates / Fundednext Certificate`
* **Route:** Not visible
* **Main UI elements:** Edit button; large certificate image; metadata list
* **Data shown:** Certificate amount `$2,704.07`; linked Withdrawal `$2,704 - Fundednext - 1.`; Status Paid; Requested Aug 31, 2026
* **Relationships:** Certificate → Withdrawal (**CONFIRMED**)
* **Forms / Tables / Charts:** Metadata list; no edit form on this view

---

## Screenshot 18 — Add Certificate

* **Screen/page:** Add Certificate
* **Purpose:** Attach payout certificate to a withdrawal
* **Navigation:** Certificates active
* **Route:** Not visible
* **Forms:** Withdrawal*; Title (optional); Issue Date (optional); Certificate Image upload (PNG/JPG/WebP up to 10 MB); Notes (optional); Add Certificate; Cancel
* **Dialogs:** Upload dropzone (not a modal)
* **Relationships:** Certificate requires Withdrawal selection

---

## Screenshot 19 — Broker Accounts

* **Screen/page:** Broker Accounts
* **Purpose:** Real broker account overview cards
* **Navigation:** REAL ACCOUNTS → Broker Accounts (active)
* **Route:** Not visible
* **Main UI elements:** Eyebrow “REAL ACCOUNTS”; `+ Add Broker`; `+ Add Account`; broker filter chip `fxprimus`; account card
* **Data shown:** PrimusPRO; account # `5111038`; ROI badge `+8.1%`; Current Equity `$8,000`; Net P/L `$644`; Total Deposits `$8,000`; Trading Drawdown `$0` excl. withdrawals; `14 snapshots`
* **Actions:** Add Broker; Add Account; View details →
* **Problems:** No dedicated Brokers list page visible in inventory — Brokers managed via Add Broker from this page (**CONFIRMED** pattern)

---

## Screenshot 20 — Add Broker

* **Screen/page:** Add Broker
* **Purpose:** Create broker entity
* **Navigation:** Broker Accounts active; breadcrumb `Broker Accounts / New Broker`
* **Route:** Not visible
* **Forms:** Name*; Website (optional); Notes (optional); Create Broker; Cancel
* **Relationships:** Broker parent of Broker Accounts

---

## Screenshot 21 — Add Broker Account

* **Screen/page:** Add Broker Account
* **Purpose:** Track a new real trading account
* **Navigation:** Broker Accounts active; breadcrumb `Broker Accounts / New Account`
* **Route:** Not visible
* **Forms:** Broker*; Account Name*; Account Number (optional); Starting Capital; Currency (USD); Start Date (optional); Notes (optional); helper link “Need a new broker? Add one here”
* **Actions:** Submit buttons not fully visible in crop
* **Relationships:** Broker Account → Broker

---

## Screenshot 22 — Account Settings (Profile / Password)

* **Screen/page:** Account Settings
* **Purpose:** Update profile and password
* **Navigation:** Settings → Account Settings (active); Settings expanded
* **Route:** Not visible
* **Forms:** Display Name; Email*; Save Profile; Current/New/Confirm password (change password section partially cropped)
* **Settings children visible:** Account Settings, Data Management, Audit Log
* **Relationships:** User profile

---

## Screenshot 23 — Account Settings (Account + Login History)

* **Screen/page:** Account Settings (lower section)
* **Purpose:** Read-only account details + login history
* **Navigation:** Account Settings active
* **Route:** Not visible
* **Data shown:** Account ID `cmqjk3tgp0000d7v7cwvvn4x5`; Member since Jun 18, 2026; Email verified “Not verified”; Sign-in method Email & Password; Session timeout 2 hours inactivity; Login History Success rows with IP, Browser, OS, Time
* **Tables:** Login History (STATUS, IP ADDRESS, BROWSER, OS, TIME)
* **Entities:** Login Event (**CONFIRMED**)

---

## Screenshot 24 — Data Management (Export + Backup header)

* **Screen/page:** Data Management
* **Purpose:** Excel export per module; start backup
* **Navigation:** Settings → Data Management (active)
* **Route:** Not visible
* **Main UI elements:** Export cards; Backup section + Generate Backup; backup history table headers
* **Export modules shown:** Prop Firms; Trading Accounts; Withdrawals; Scale Events; Certificates; Real Broker Accounts (brokers, accounts, deposits, withdrawals & snapshots); Dashboard Summary
* **Backup description:** ZIP with Excel, raw JSON, certificate images, SQL dump; object storage
* **Tables:** Backup history columns FILENAME, SIZE, STATUS, NOTES, ACTIONS (empty in this crop)

---

## Screenshot 25 — Data Management (Backup history + Restore)

* **Screen/page:** Data Management (continued)
* **Purpose:** Backup history actions + restore
* **Navigation:** Data Management active
* **Data shown:** `Backup_2026-07-26_1615.zip`; 54.1 KB; COMPLETE; notes `2 firms, 2 accounts, 27 withdrawals`
* **Actions:** Generate Backup; Download / Restore / Delete icons; Choose File upload
* **Dialogs:** Destructive warning: restore replaces prop firm accounts, withdrawals, certificates, real broker data; **user accounts and login history preserved**
* **Entities:** Backup Record; Restore Job (implied) (**CONFIRMED** UI)

---

## Screenshot 26 — Audit Log

* **Screen/page:** Audit Log
* **Purpose:** Full audit trail of data-change events
* **Navigation:** Settings → Audit Log (active)
* **Route:** Not visible
* **Filters:** Action; Module; From/To dates; IP; Apply; Export CSV
* **Tables:** ACTION, MODULE, RECORD, DETAILS (JSON), IP, TIME
* **Data shown:** Create/Update badges; modules Certificate, Withdrawal; JSON details including amounts/status
* **Entities:** Audit Log (**CONFIRMED**)
* **Problems:** Raw JSON in DETAILS dense for end users — UX density issue **CONFIRMED**

---

## Screenshot 27 — Reports

* **Screen/page:** Reports
* **Purpose:** Trading business intelligence dashboard
* **Navigation:** Reports active; eyebrow “ANALYTICS”
* **Route:** Not visible
* **Main UI elements:** Funded Reports metric cards; Income by Firm; Income by Account
* **Data shown:** Funded Capital `$820,000`; Lifetime `$75,040`; This Month `$0`; Avg/Month `$4,414`; Portfolio Growth `+0.0%` “Current vs initial”; Last Month / Quarter / Year totals; firm/account income bars; Best Firm / Best Account footers
* **Actions:** View all →
* **Charts:** Progress bars (no large chart in this crop)
* **Problems:** Portfolio Growth `+0.0%` while sizes differ across accounts — formula/meaning **Requires confirmation**; heavy overlap with Dashboard metrics **CONFIRMED**

---

## Cross-cutting confirmed navigation (all inspected shots)

Sidebar structure repeatedly observed:

```text
FUNDED: Dashboard, Firms, Accounts, Withdrawals, Scale Events, Certificates
REAL ACCOUNTS: Broker Accounts
Reports
Settings ▾: Account Settings, Data Management, Audit Log
User email + Sign out
```

Not observed as top-level sidebar items: separate Brokers list, separate Broker Deposits/Withdrawals pages, MT5 live sync UI.
