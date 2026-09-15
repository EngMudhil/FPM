# DATA-MODEL

Status: FPM-003 foundation tables **implemented** in `packages/db` (users, sessions, workspaces, workspace_members, login_events). Domain entities below remain planning until their slice tasks.  
Owner: Database + Financial + Lead.  
Evidence: Screenshots + export/backup UI copy; FPM-003 schema in `packages/db/src/schema`.

## Implemented foundation (FPM-003)

| Table | Keys / notes |
| --- | --- |
| `users` | UUID text PK; unique email; `password_hash` (bcrypt); `created_at`/`updated_at` timestamptz |
| `sessions` | UUID text PK; unique `session_token`; FK → users cascade; `expires_at` |
| `workspaces` | UUID text PK; `timezone` default UTC; `default_currency` default USD |
| `workspace_members` | UUID text PK; unique (workspace_id, user_id); role enum OWNER/ADMIN/MEMBER/VIEWER |
| `login_events` | SUCCESS/FAILURE/LOCKOUT; optional user/workspace FKs |

**ID strategy:** UUID v4 as `text`. **Money (future columns):** `numeric(20,8)` + `@fpm/money`. See ADR-009.

Field lists below for domain entities are **observed or strongly implied**. Types are **INFERRED** for planning until implemented.
## Entity overview

| Entity | Status in source |
| --- | --- |
| User | CONFIRMED |
| Firm | CONFIRMED |
| Trading Account (Funded) | CONFIRMED |
| Withdrawal | CONFIRMED |
| Scale Event | CONFIRMED |
| Certificate | CONFIRMED |
| Broker | CONFIRMED |
| Broker Account | CONFIRMED |
| Broker Deposit | CONFIRMED mentioned (export); UI form NOT CONFIRMED |
| Broker Withdrawal | CONFIRMED mentioned (export); UI form NOT CONFIRMED |
| Equity Snapshot | CONFIRMED (count on card); detail fields UNRESOLVED |
| Audit Log | CONFIRMED |
| Login Event | CONFIRMED |
| Backup Record | CONFIRMED |
| Restore Job | INFERRED from restore UI |

---

## User

* **Purpose:** Authenticated owner of the private FPM instance
* **Important fields (CONFIRMED):** displayName, email, password (hashed — INFERRED), accountId, memberSince, emailVerified, signInMethod, sessionTimeoutPolicy
* **Relationships:** 1 user operates all domain data (single-trader)
* **Required:** email, password credentials
* **Optional:** displayName
* **Statuses:** email verified / not verified
* **Historical:** login history retained across restore (**CONFIRMED** warning text)
* **Constraints:** Single primary operator assumed (ADR-002)

## Firm

* **Purpose:** Prop trading firm
* **Implemented (FPM-005):** `firms` — workspace_id, name, website?, notes?, archived_at?, created_at, updated_at
* **Lifecycle:** Archive preferred; hard delete allowed only when no dependent history (enforced in later account FK)
* **Constraints:** name required; workspace ownership server-side

## Trading Account (Funded Account)

* **Purpose:** Challenge or funded account under a firm
* **Fields:** firmId*, accountNumber?, phase*, initialSize*, currentSize*, currency*, platform?, startDate?, notes?, createdAt
* **Relationships:** Firm; Withdrawals; Scale Events; Certificates (via withdrawal)
* **Statuses / phases:** `Active` CONFIRMED; other phases UNRESOLVED (filter “All phases” implies more)
* **Historical:** sizes change via Scale Events (**INFERRED** link)
* **Constraints:** firm required; sizes numeric; currency set per account

## Withdrawal

* **Purpose:** Payout request/record from a funded account (core entity)
* **Fields:** accountId*, amount*, status*, requestedDate*, paidDate?, notes?
* **Relationships:** Trading Account; optional Certificate
* **Statuses:** Pending, Paid (**CONFIRMED**); others UNRESOLVED
* **Historical:** retained for income metrics; included in backups
* **Constraints:** amount > 0 **INFERRED**; paidDate typically when Paid — Behavior: Requires confirmation

## Scale Event

* **Purpose:** Record funded account size upgrade
* **Fields:** accountId*, fromSize*, toSize*, scaleDate*, notes?
* **Relationships:** Trading Account
* **Constraints:** toSize vs fromSize relationship **RECOMMENDED** validation (to ≥ from) — not proven in source

## Certificate

* **Purpose:** Visual evidence of a payout
* **Fields:** withdrawalId*, title?, issueDate?, image (file), notes?
* **Relationships:** Withdrawal (required on create)
* **Constraints:** image types PNG/JPG/WebP; max 10 MB (**CONFIRMED**)
* **Historical:** images included in backup ZIP

## Broker

* **Purpose:** Real-money broker brand
* **Fields:** name*, website?, notes?
* **Relationships:** Broker Accounts

## Broker Account

* **Purpose:** Live broker trading account tracking
* **Fields:** brokerId*, accountName*, accountNumber?, startingCapital, currency, startDate?, notes?
* **Observed metrics (computed or stored — UNRESOLVED):** currentEquity, netPL, totalDeposits, totalWithdrawals, peakEquity, tradingDrawdown, roi, snapshotCount
* **Relationships:** Broker; Deposits; Withdrawals; Equity Snapshots

## Broker Deposit

* **Purpose:** Cash deposited into broker account
* **Evidence:** Export card text only
* **Fields:** UNRESOLVED (amount, date, notes likely)
* **Relationships:** Broker Account

## Broker Withdrawal

* **Purpose:** Cash withdrawn from broker account
* **Evidence:** Export card text only
* **Fields:** UNRESOLVED
* **Relationships:** Broker Account

## Equity Snapshot

* **Purpose:** Point-in-time equity for broker account
* **Evidence:** “14 snapshots” on card
* **Fields:** UNRESOLVED (likely equity, timestamp)
* **Relationships:** Broker Account
* **Historical:** time series for drawdown/peak **INFERRED**

## Audit Log

* **Purpose:** Data-change trail
* **Fields:** action (Create/Update/…), module, recordId, details (JSON), ip, time
* **Relationships:** soft reference to domain records
* **Historical:** append-only **RECOMMENDED**

## Login Event

* **Purpose:** Authentication attempts/successes
* **Fields:** status, ip, browser, os, time
* **Relationships:** User
* **Historical:** preserved on restore (**CONFIRMED**)

## Backup Record

* **Purpose:** Stored backup archive metadata
* **Fields:** filename, size, status (COMPLETE…), notes, storage location, createdAt
* **Actions:** download, restore, delete
* **Constraints:** object storage (**CONFIRMED** UI copy)

## Restore Job

* **Purpose:** Process restoring a backup ZIP
* **Fields:** UNRESOLVED (status, source backup, startedAt, errors)
* **Behavior:** Replaces prop firm accounts, withdrawals, certificates, real broker data; preserves users + login history (**CONFIRMED**)

---

## Relationship diagram (logical)

```text
User
Firm 1──* TradingAccount 1──* Withdrawal 1──0..1 Certificate
TradingAccount 1──* ScaleEvent
Broker 1──* BrokerAccount 1──* EquitySnapshot
BrokerAccount 1──* BrokerDeposit
BrokerAccount 1──* BrokerWithdrawal
*── AuditLog (cross-cutting)
User 1──* LoginEvent
*── BackupRecord / RestoreJob
```
