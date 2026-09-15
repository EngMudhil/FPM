# HISTORICAL-BEHAVIOR-REGISTER

Status: Authoritative historical evidence (FPM-002B).  
Owner: Lead + Architecture + Financial.  
Source: Verified audit of the **OLD Replit FPM** implementation.

**Rule:** Historical behavior is evidence, **not** automatic authority.  
Classification per row: `PRESERVE` · `CHANGE` · `REMOVE` · `INVESTIGATE`

Legend for preserve/change/remove:

* **PRESERVE** — candidate/current rule for NEW FPM (compatible with Spec + FPM-002A)
* **CHANGE** — NEW FPM deliberately differs (current architecture wins)
* **REMOVE** — must not be reproduced
* **INVESTIGATE** — needs an explicit decision before coding

---

| ID | Historical behavior | Source | Decision | Reason | Affected domain |
| --- | --- | --- | --- | --- | --- |
| HB-001 | Funded capital = `SUM(all TradingAccount.currentSize)` including ACTIVE, PAUSED, CLOSED | Old FPM audit | **INVESTIGATE** | Matches one plausible “current funded capital”; Spec also names “total” vs “current” without formulas | Financial, Accounts, Dashboard |
| HB-002 | Portfolio growth = `(SUM(currentSize)-SUM(initialSize))/SUM(initialSize)×100` | Old FPM audit | **INVESTIGATE** | Strong candidate; still needs Lead+Financial approval as NEW rule | Financial, Reports |
| HB-003 | Paid income = `SUM(amount WHERE status=PAID)` | Old FPM audit | **CHANGE** (partial) | NEW FPM requires PAID **and** `receivedAt` (Spec / FPM-002A). Amount sum of PAID alone is insufficient | Financial, Withdrawals |
| HB-004 | Period PAID income bucketing used **`requestedAt`** | Old FPM audit | **CHANGE** | NEW FPM period recognition uses **`receivedAt`** | Financial, Dashboard, Reports |
| HB-005 | Pending amount = `SUM(amount WHERE status=PENDING)` | Old FPM audit | **PRESERVE** (candidate) | Aligns with Spec dashboard “pending withdrawal amount”; currency-safe grouping required | Financial |
| HB-006 | Average payout = lifetime PAID amount / PAID count | Old FPM audit | **INVESTIGATE** | Candidate; must use NEW recognition rule (PAID+receivedAt) if adopted | Financial |
| HB-007 | Avg monthly income = lifetime PAID / inclusive month count | Old FPM audit | **INVESTIGATE** | Defines “inclusive month count”; needs approval | Financial |
| HB-008 | Yield = lifetime PAID / total current funded capital × 100 | Old FPM audit | **INVESTIGATE** | Candidate; depends on capital definition + recognition date field | Financial |
| HB-009 | Broker net P/L = `current equity + withdrawals - deposits` | Old FPM audit | **INVESTIGATE** | Candidate for NEW broker P/L | Financial, Broker |
| HB-010 | Broker ROI = `net P/L / deposits × 100` (N/A if denom 0 per Spec) | Old FPM audit | **INVESTIGATE** | Candidate; Spec requires N/A not Infinity | Financial, Broker |
| HB-011 | Combined managed capital = funded current + broker equity | Old FPM audit | **CHANGE** | Only if currencies match; else split/hide (NEW currency policy) | Financial, Dashboard |
| HB-012 | Combined generated profit = funded lifetime PAID + broker net P/L | Old FPM audit | **CHANGE** | Same currency-safety constraint; semantics remain INVESTIGATE | Financial, Dashboard |
| HB-013 | Mixed currencies combined without conversion | Old FPM audit | **REMOVE** | Forbidden by NEW currency policy | All aggregates |
| HB-014 | ScaleEvents sync: `currentSize = latest ScaleEvent.toSize`; CRUD resync; no events → `initialSize` | Old FPM audit | **PRESERVE** (candidate/current) | Compatible with Spec §8 same-transaction update; extend with resync-on-edit/delete | Scale, Accounts |
| HB-015 | Withdrawal statuses PENDING/PAID/FAILED/REVERSED | Old FPM audit | **PRESERVE** | Matches Spec enums | Withdrawals |
| HB-016 | PAID does not auto-create certificate or change account size | Old FPM audit | **PRESERVE** | Certificates remain explicit attach; size via ScaleEvents | Withdrawals, Certificates |
| HB-017 | Certificate linked to Withdrawal; private object storage + signed URLs | Old FPM audit | **PRESERVE** (relationship + private storage) | Improve cleanup + restore of objects | Certificates |
| HB-018 | Incomplete certificate object cleanup; certs not restored in restore | Old FPM audit | **REMOVE** (defects) | NEW restore must restore certificate objects; delete must clean storage | Certificates, Restore |
| HB-019 | Auto EquitySnapshot on broker account create (starting capital), deposit, withdrawal | Old FPM audit | **INVESTIGATE** | Lifecycle model undecided | Broker, Snapshots |
| HB-020 | Deleting deposit/withdrawal did **not** remove generated snapshot | Old FPM audit | **INVESTIGATE** | Immutable vs derived vs regenerate | Broker, Snapshots |
| HB-021 | Cascade deletes on firms/accounts (historical) | Old FPM audit (implied cascades) | **CHANGE** | NEW lifecycle prefers archive/confirm; protect financial history | Data lifecycle |
| HB-022 | Weak restore: in-memory state, count-only preview, no exact diff, no safety backup, weak ZIP/checksum validation, no concurrency lock, skipDuplicates, partial atomicity, certs not restored | Old FPM audit | **REMOVE** | Spec-safe restore + FPM-002A authoritative | Backup/Restore |

---

## Payout date conflict (explicit)

```text
OLD FPM:
  PAID income periods → requestedAt

CURRENT FPM (FPM-002A / Spec §9):
  PAID income recognition → receivedAt
  (PAID requires receivedAt; receivedAt ≥ requestedAt)
```

**Authoritative for NEW FPM:** `receivedAt`. Do not copy old Dashboard/Reports date basis.
