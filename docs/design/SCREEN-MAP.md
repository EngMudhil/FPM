# SCREEN-MAP

Status: Authored (FPM-002).  
Owner: Lead + Frontend (future implementation).  
Primary user: Single funded/prop trader (see ADR-002).

Classification:

* **EXISTING + KEEP** — retain as-is conceptually
* **EXISTING + IMPROVE** — keep, fix UX/consistency
* **REQUIRED BUT NOT EXISTING** — needed for coherent MVP; not clearly present
* **FUTURE** — after MVP
* **REMOVE / NOT NEEDED** — none identified as remove-only yet

## Funded

### Dashboard
* **Class:** EXISTING + IMPROVE
* **Purpose:** Business overview — funded capital, income periods, charts, recent payouts, real + combined summaries
* **Primary user:** Trader
* **Entry:** Sidebar Dashboard; default landing (**INFERRED**)
* **Main actions:** Log Withdrawal; navigate to modules via View all
* **Related entities:** Firm, Trading Account, Withdrawal, Certificate, Broker Account
* **Related screens:** Withdrawals, Reports, Broker Accounts

### Firms — List
* **Class:** EXISTING + IMPROVE
* **Purpose:** Manage prop firms
* **Entry:** Sidebar Firms
* **Main actions:** Search, add, edit, delete
* **Related entities:** Firm
* **Related screens:** Add/Edit Firm, Accounts

### Firms — Create / Edit
* **Class:** EXISTING + KEEP (create CONFIRMED; edit form not screenshot but Edit action exists)
* **Purpose:** Firm CRUD
* **Entry:** Add Firm / Edit
* **Main actions:** Save, cancel
* **Related entities:** Firm

### Accounts — List (Funded)
* **Class:** EXISTING + IMPROVE
* **Purpose:** List funded/challenge accounts
* **Entry:** Sidebar Accounts
* **Main actions:** Filter by phase, add, edit, delete
* **Related entities:** Trading Account, Firm
* **Related screens:** Add/Edit Account, Withdrawals, Scale Events

### Accounts — Create / Edit
* **Class:** EXISTING + KEEP / IMPROVE
* **Purpose:** Capture firm, phase, sizes, currency, platform
* **Entry:** Add Account
* **Main actions:** Create/Update, cancel

### Withdrawals — List
* **Class:** EXISTING + IMPROVE
* **Purpose:** Core payout ledger
* **Entry:** Sidebar Withdrawals
* **Main actions:** Record, filter status, edit, delete
* **Related entities:** Withdrawal, Trading Account, Certificate

### Withdrawals — Record / Edit
* **Class:** EXISTING + KEEP (manual entry is core — ADR-003)
* **Purpose:** Manual withdrawal/payout logging
* **Entry:** Record Withdrawal / Log Withdrawal CTA
* **Main actions:** Save with status Pending/Paid, dates, notes

### Scale Events — List / Create
* **Class:** EXISTING + KEEP
* **Purpose:** Record account size upgrades
* **Entry:** Sidebar Scale Events
* **Main actions:** Add scale event
* **Related entities:** Scale Event, Trading Account

### Certificates — Gallery / Detail / Create
* **Class:** EXISTING + IMPROVE
* **Purpose:** Evidence of payouts; attach image to withdrawal
* **Entry:** Sidebar Certificates
* **Main actions:** Add, view, edit, delete; filter firm/year
* **Related entities:** Certificate, Withdrawal, Account, Firm

## Real Accounts

### Broker Accounts — List/Cards
* **Class:** EXISTING + IMPROVE
* **Purpose:** Real broker portfolio cards
* **Entry:** Sidebar Broker Accounts
* **Main actions:** Add Broker, Add Account, filter broker, view details
* **Related entities:** Broker, Broker Account, snapshots

### Brokers — Create
* **Class:** EXISTING + KEEP
* **Purpose:** Create broker
* **Entry:** Add Broker from Broker Accounts

### Brokers — List
* **Class:** REQUIRED BUT NOT EXISTING (dedicated list not observed)
* **Purpose:** Manage brokers without relying only on chips/forms
* **Entry:** RECOMMENDED under Real Accounts or from Broker Accounts
* **Related entities:** Broker

### Broker Account — Detail
* **Class:** REQUIRED BUT NOT EXISTING (link present; page not captured)
* **Purpose:** Show equity history, deposits, withdrawals, snapshots
* **Entry:** View details →
* **Related entities:** Broker Account, Broker Deposit, Broker Withdrawal, Equity Snapshot

### Broker Deposit / Withdrawal entry
* **Class:** REQUIRED BUT NOT EXISTING (entities mentioned in export text only)
* **Purpose:** Manual cash-flow for real accounts
* **Entry:** From broker account detail (**RECOMMENDED**)

## Analytics

### Reports
* **Class:** EXISTING + IMPROVE
* **Purpose:** BI summary for funded business
* **Entry:** Sidebar Reports
* **Main actions:** View firm/account breakdowns
* **Related screens:** Dashboard (overlap to reduce)

## Settings

### Account Settings
* **Class:** EXISTING + KEEP / IMPROVE
* **Purpose:** Profile, password, account metadata, login history
* **Entry:** Settings → Account Settings
* **Related entities:** User, Login Event

### Data Management
* **Class:** EXISTING + KEEP / IMPROVE
* **Purpose:** Excel export, backup ZIP, restore
* **Entry:** Settings → Data Management
* **Related entities:** Backup Record, Restore Job

### Audit Log
* **Class:** EXISTING + IMPROVE
* **Purpose:** Data-change audit trail + CSV export
* **Entry:** Settings → Audit Log
* **Related entities:** Audit Log

## Auth

### Login / Session
* **Class:** REQUIRED BUT NOT EXISTING (UI not in screenshots; auth clearly exists)
* **Purpose:** Email/password sign-in; session timeout 2h shown in settings
* **Entry:** Unauthenticated route
* **Related entities:** User, Login Event

## Future

| Screen / capability | Class | Notes |
| --- | --- | --- |
| MT5 live sync / auto import | FUTURE | Platform field is manual text today; ADR-004 |
| Multi-user / team / tenant admin | REMOVE / NOT NEEDED for product identity | ADR-002 |
| Public marketing site | FUTURE / out of product core | Not in screenshots |

## Intentionally not removed

No existing module in the screenshot set is marked REMOVE; improvements preferred over deletion.
