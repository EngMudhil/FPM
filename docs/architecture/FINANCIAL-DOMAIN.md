# FINANCIAL-DOMAIN

Status: Authoritative (FPM-002B).  
Owner: Financial Domain Agent.  
Reviewers: Lead + QA.

## Authority rule

```text
Financial Domain  →  authoritative calculations  →  Dashboard / Reports / Exports / APIs
```

* UI components **must not** independently compute business totals.  
* Backend handlers may orchestrate but must call Financial Domain for money metrics.  
* One implementation path for each confirmed rule.  
* Old Replit formulas are **historical evidence** only until classified PRESERVE.

## Confirmed rules (implementable now)

| Rule | Definition | Source |
| --- | --- | --- |
| Recognized payout amount | Withdrawal with status **PAID** and non-null **`receivedAt`** | Spec §9; FPM-002A (**not** old `requestedAt` period basis) |
| Period payout totals | Sum recognized payouts whose **`receivedAt`** falls in period (workspace timezone boundaries; store UTC) | Spec §2, §9 |
| Never silent FX mix | Do not add amounts across different currency codes | Spec §9; CURRENCY-POLICY |
| Withdrawal PAID constraint | PAID requires `receivedAt`; `receivedAt` ≥ `requestedAt` | Spec §8 |
| Scale size authority (candidate current) | After ScaleEvent create/update/delete: set `TradingAccount.currentSize` from **latest** ScaleEvent.`toSize` by `scaledAt` (then id); if none remain, set to `initialSize`. Create path must run in same transaction as Spec §8 (`toSize` > `fromSize`) | Spec §8 + old HB-014 **PRESERVE candidate** |
| Broker return zero denom | Return **N/A** (not Infinity/NaN) when denominator is zero | Spec |
| Money storage | PostgreSQL Decimal or integer minor units; no JS float aggregation | Spec §1 |
| Pending withdrawal amount | `SUM(amount)` where status = PENDING, **per currency** | Spec dashboard + old HB-005 |

### Payout date reconciliation

| System | Period / recognition date field |
| --- | --- |
| OLD FPM | `requestedAt` for PAID income periods |
| NEW FPM | **`receivedAt`** for recognized PAID income |

Old behavior is documented; **NEW FPM does not adopt it**.

---

## Historical Financial Formulas

Recorded exactly as verified in the old Replit audit. Classification: **PRESERVE** · **CHANGE** · **UNRESOLVED**.

| Metric | Old formula (historical) | Classification | NEW FPM stance |
| --- | --- | --- | --- |
| Funded / current capital | `SUM(all TradingAccount.currentSize)` including ACTIVE, PAUSED, CLOSED | **UNRESOLVED** | Strong candidate for “current funded capital”; Spec also names “total funded capital” — relationship still open (OQ-001) |
| Portfolio growth | `(SUM(currentSize) - SUM(initialSize)) / SUM(initialSize) × 100` | **UNRESOLVED** | Candidate; needs explicit approval (OQ-002) |
| Paid / lifetime income | `SUM(amount WHERE status = PAID)` | **CHANGE** | NEW = sum where PAID **and** `receivedAt` present; still per currency |
| Period income | PAID amounts bucketed by **`requestedAt`** | **CHANGE** | NEW buckets by **`receivedAt`** |
| Pending amount | `SUM(amount WHERE status = PENDING)` | **PRESERVE** | Keep, currency-grouped |
| Average payout | lifetime PAID amount / PAID withdrawal count | **UNRESOLVED** | Candidate using NEW recognized set (OQ-002) |
| Average monthly income | lifetime PAID amount / inclusive month count | **UNRESOLVED** | Candidate; define “inclusive month count” (OQ-002) |
| Yield / income yield | lifetime PAID / total current funded capital × 100 | **UNRESOLVED** | Candidate; depends on capital + recognition rules (OQ-002) |
| Broker net P/L | `current equity + withdrawals - deposits` | **UNRESOLVED** | Candidate (OQ-003) |
| Broker ROI | `net P/L / deposits × 100` | **UNRESOLVED** | Candidate + Spec N/A if deposits = 0 (OQ-003) |
| Combined managed capital | funded current capital + broker current equity | **CHANGE** | Allowed only when currencies match; else separate (OQ-012) |
| Combined generated profit | funded lifetime PAID + broker net P/L | **CHANGE** | Same currency constraint; formula adoption still open (OQ-012) |
| Mixed-currency aggregates | Combined USD+EUR etc. without conversion | **CHANGE** / forbidden | **REMOVE** from NEW FPM |

---

## Metric register (NEW FPM)

| Name | Source data | Formula | Currency | Date basis | Status filter | Current definition | Open question |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Recognized payout total | Withdrawal | Sum `amount` | Per currency | `receivedAt` | PAID + receivedAt | CONFIRMED | TZ (OQ-009) |
| Pending withdrawal amount | Withdrawal | Sum `amount` | Per currency | — | PENDING | CONFIRMED (HB-005) | — |
| Total paid withdrawals (count) | Withdrawal | Count recognized | — | — | PAID + receivedAt | CONFIRMED | — |
| Total funded capital | TradingAccount | **UNRESOLVED** | Per currency | Point-in-time | ? | Spec name | OQ-001 / HB-001 |
| Current funded capital | TradingAccount | **UNRESOLVED** (HB-001 candidate: sum all `currentSize`) | Per currency | Point-in-time | All phases in old FPM | Candidate only | OQ-001 |
| Lifetime income | Withdrawals | All-time recognized sum | Per currency | `receivedAt` | PAID+receivedAt | CONFIRMED mechanism | Label synonym OK |
| Monthly / quarterly / yearly income | Withdrawals | Period recognized sums | Per currency | `receivedAt` + TZ | PAID+receivedAt | CONFIRMED mechanism | Period edges |
| Average payout | Withdrawals | **UNRESOLVED** (HB-006 candidate) | Per currency | — | Recognized | Candidate | OQ-002 |
| Avg / month | Withdrawals | **UNRESOLVED** (HB-007 candidate) | Per currency | — | Recognized | Candidate | OQ-002 |
| Largest withdrawal | Withdrawals | **UNRESOLVED** (likely max recognized) | Per currency | — | Recognized | — | OQ-002 |
| Best month | Withdrawals | **UNRESOLVED** | Per currency | Month of `receivedAt` | Recognized | — | OQ-002 |
| Income yield | Payouts + capital | **UNRESOLVED** (HB-008 candidate) | — | — | — | Candidate | OQ-002 |
| Portfolio growth | Account sizes | **UNRESOLVED** (HB-002 candidate) | Per currency | — | — | Candidate | OQ-002 |
| Firm / account income share | Withdrawals | Sum recognized by firm/account | Per currency | `receivedAt` | Recognized | CONFIRMED path | — |
| Broker total deposits / withdrawals | Ledger | Sums | Account currency | dates | — | CONFIRMED | — |
| Net deposited | Deposits − withdrawals | Same currency | Account currency | — | — | CONFIRMED difference | Naming |
| Latest equity | EquitySnapshot | Latest by date | Account currency | snapshotDate | — | CONFIRMED | Tie-break |
| Broker P/L | Equity + cashflows | **UNRESOLVED** (HB-009 candidate) | Account currency | — | — | Candidate | OQ-003 |
| Broker ROI | P/L ÷ deposits | **UNRESOLVED** (HB-010); N/A if 0 | — | — | — | Candidate | OQ-003 |
| Peak equity / drawdown | Snapshots | **UNRESOLVED** | — | — | — | Screenshot | OQ-004/005 |
| Combined capital / profit | Funded + real | **UNRESOLVED** + currency-safe only | Must match | — | — | Screenshot | OQ-012 |

## Non-authority surfaces

Dashboard, Reports, Excel exports, backup summary notes, MetricCards: **display only** of Financial Domain results.

See also: [HISTORICAL-BEHAVIOR-REGISTER.md](./HISTORICAL-BEHAVIOR-REGISTER.md)
