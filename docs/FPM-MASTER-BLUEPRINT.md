# FPM Master Blueprint

Status: **Authoritative implementation blueprint (FPM-002B)**.  
Owner: Lead Agent.  
Immutable historical spec: `reference/FPM-Original-Specification.md` (do not edit).

Before implementing features, consult:

```text
AGENTS.md
+ docs/FPM-MASTER-BLUEPRINT.md
+ relevant module documentation
```

Evidence stack:

```text
Original Specification
+ 26 Screenshots
+ Old Replit Implementation (audit)
+ Current Architecture Decisions
```

---

## 0. Evidence classes (critical)

| Layer | Meaning |
| --- | --- |
| **Historical behavior** | What the old Replit FPM actually did ([HISTORICAL-BEHAVIOR-REGISTER.md](./architecture/HISTORICAL-BEHAVIOR-REGISTER.md)) |
| **Current approved behavior** | What NEW FPM will do (this blueprint + ADRs) |
| **Unresolved** | Needs explicit decision before coding that metric/behavior ([OPEN-QUESTIONS.md](./architecture/OPEN-QUESTIONS.md)) |

Old implementation does **not** automatically override Spec or FPM-002A decisions.

---

## 1. Product definition

FPM is a **private financial and payout-management system** for a funded trader.

**Not:** trading terminal, broker, prop-firm platform, or primary trading journal.

**Central permanent workflow:**

```text
Manual withdrawal/payout recording
  → Financial Domain calculations
  → Account history
  → Dashboard
  → Reports
  → Certificates
  → Exports
```

Detail: [product/PRODUCT-SCOPE.md](./product/PRODUCT-SCOPE.md)

---

## 2. Scope

| Tier | Includes |
| --- | --- |
| **CORE MVP** | Auth + single workspace OWNER, Firms, Funded Accounts, Withdrawal engine/UI, Certificates, Funded Dashboard via Financial Domain, Security settings, currency-safe money |
| **SECONDARY MVP** | Scale Events (with size sync), Reports, Broker domain, Excel export, Audit, Backup, Safe Restore, design hardening |
| **FUTURE** | MT5 integration, FX conversion engine |

---

## 3. Requirements reconciliation

Full tables: [architecture/REQUIREMENTS-RECONCILIATION.md](./architecture/REQUIREMENTS-RECONCILIATION.md)

### Major conflicts (current decisions)

| Topic | Historical / prior | Current approved |
| --- | --- | --- |
| ORM | Spec Prisma | **Drizzle** |
| Tenancy | — | Single-operator + Workspace schema |
| Navigation | Screenshot FUNDED/… | Spec Overview / Prop Firms / Real Accounts / System |
| Payout period date | Old FPM **`requestedAt`** | **`receivedAt`** (+ PAID) |
| Currency aggregates | Old FPM could mix FX | **Never silently combine** |
| Restore | Old weak restore | **Spec-safe restore** |
| Scale size | Old latest `toSize` sync | **PRESERVE candidate** (confirm OQ-016) |

---

## 4. Screen inventory

[product/SCREEN-INVENTORY.md](./product/SCREEN-INVENTORY.md) · [design/SCREENSHOT-INVENTORY.md](./design/SCREENSHOT-INVENTORY.md)

---

## 5. Navigation

[design/NAVIGATION.md](./design/NAVIGATION.md) · [decisions/ADR-008-NAVIGATION.md](./decisions/ADR-008-NAVIGATION.md)

---

## 6. Domain model (conceptual)

### Auth / tenancy
User, Account (OAuth), Session, VerificationToken, Workspace, WorkspaceMember, LoginEvent

### Funded
Firm → TradingAccount → Withdrawal → Certificate; TradingAccount → ScaleEvent

### Real
Broker → BrokerAccount → BrokerDeposit | BrokerWithdrawal | EquitySnapshot

### Operations
AuditLog, BackupRecord, RestoreJob

Enums: WorkspaceRole; AccountPhase ACTIVE/PAUSED/CLOSED; WithdrawalStatus PENDING/PAID/FAILED/REVERSED; LoginEventType; BackupStatus; RestoreStatus

---

## 7. Financial rules

Detail: [architecture/FINANCIAL-DOMAIN.md](./architecture/FINANCIAL-DOMAIN.md)

```text
Financial Domain → authoritative calculations → Dashboard / Reports / Exports
```

### Historical (old Replit) — examples

* Capital ≈ sum all `currentSize` (all phases)  
* Period PAID income on **`requestedAt`**  
* Yield / avg payout / portfolio growth formulas as audited  
* Broker P/L = equity + withdrawals − deposits; ROI = P/L / deposits  
* Could mix currencies  

### Current approved

* Recognized payouts = **PAID + `receivedAt`**  
* Period totals on **`receivedAt`**  
* Pending = sum PENDING (per currency)  
* No silent FX mix  
* Scale create validates `toSize` > `fromSize` and updates size in-txn; **resync-on-CRUD candidate** from history  
* PAID does not auto-create certificates or change account size  
* Undefined metrics omitted until approved  

### Unresolved

Capital total vs current; portfolio growth/yield/averages approval; broker P/L/ROI approval; combined cards; peak/drawdown — see Open Questions.

---

## 8. Currency policy

[architecture/CURRENCY-POLICY.md](./architecture/CURRENCY-POLICY.md)

```text
OLD FPM: mixed currencies could be combined
NEW FPM: never silently combine currencies
```

---

## 9. Data lifecycle

[architecture/DATA-LIFECYCLE.md](./architecture/DATA-LIFECYCLE.md)

* Protect PAID history (prefer REVERSED)  
* ScaleEvent may resync `currentSize` (candidate)  
* Broker auto-snapshots = INVESTIGATE (OQ-015)  
* Improve certificate object cleanup vs old defects  

---

## 10. Architecture

```text
Internet → Caddy → Next.js → Services → Financial Domain → PostgreSQL (Drizzle)
                         ↘ Redis → BullMQ
                         ↘ S3-compatible private object storage
```

Stateless apps; durable jobs; **no** in-memory restore maps.

### Restore

```text
OLD RESTORE = historical implementation (rejected)
NEW RESTORE = specification-safe architecture
```

Required properties: persisted RestoreJob; private temp storage; ZIP safety; checksums; version validation; strict entity validation; exact diff; pre-restore safety backup; explicit confirmation; durable job; atomic restore; concurrency protection; post-verify; preserve data on failure; **restore certificate objects**.

---

## 11. Security principles

DB sessions, CSRF, lockout/rate limits, private uploads, audit redaction, Spec-safe restore confirmations.

---

## 12. Agent ownership

[.agents/AGENT-OWNERSHIP.md](../.agents/AGENT-OWNERSHIP.md) — Financial Domain is sole calculation authority.

---

## 13. Implementation sequence

[architecture/IMPLEMENTATION-SEQUENCE.md](./architecture/IMPLEMENTATION-SEQUENCE.md) · [agents/TASK-REGISTRY.md](./agents/TASK-REGISTRY.md)

Next: **FPM-004 — Design System Baseline**

FPM-003 complete: Drizzle/Postgres foundation, Workspace OWNER, sessions, money helpers — see [ADR-009](./decisions/ADR-009-FOUNDATION.md).

---

## 14. ADR references

| ADR | Topic |
| --- | --- |
| [001](./decisions/ADR-001-STACK.md) | Stack / Drizzle |
| [002](./decisions/ADR-002-SINGLE-TRADER.md) | Single-operator + workspace |
| [003](./decisions/ADR-003-WITHDRAWAL-CENTRIC.md) | Manual withdrawals |
| [004](./decisions/ADR-004-MT5-INTEGRATION.md) | MT5 FUTURE |
| [005](./decisions/ADR-005-FINANCIAL-DOMAIN.md) | Financial authority |
| [006](./decisions/ADR-006-CURRENCY-SAFETY.md) | Currency safety |
| [007](./decisions/ADR-007-DATA-LIFECYCLE.md) | Lifecycle |
| [008](./decisions/ADR-008-NAVIGATION.md) | Navigation |
| [009](./decisions/ADR-009-FOUNDATION.md) | IDs, timestamps, money, auth sessions |

---

## 15. Open questions

[architecture/OPEN-QUESTIONS.md](./architecture/OPEN-QUESTIONS.md)

---

## 16. Definition of Done (project-level)

* Build + Drizzle migrations clean  
* CORE authz + manual withdrawal path  
* Only **approved** financial totals shipped; never fake UNRESOLVED metrics  
* Currency-safe aggregates  
* Spec-safe backup/restore when those tasks ship  
* No secrets in client/logs  

---

## 17. Implementation status

```text
NO APPLICATION FEATURES IMPLEMENTED
```

FPM-002B is documentation reconciliation only.
