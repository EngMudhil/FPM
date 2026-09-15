# FINANCIAL-DOMAIN

Status: Authoritative (FPM-002B / FPM-021).  
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
| Funded / current capital | `SUM(all TradingAccount.currentSize)` including ACTIVE, PAUSED, CLOSED | **PRESERVE** (ADR-014) | Current = SUM(currentSize); **Total** = SUM(initialSize); non-archived; per currency |
| Portfolio growth | `(SUM(currentSize) - SUM(initialSize)) / SUM(initialSize) × 100` | **PRESERVE** (ADR-014) | N/A if initial sum = 0 |
| Paid / lifetime income | `SUM(amount WHERE status = PAID)` | **CHANGE** | NEW = sum where PAID **and** `receivedAt` present; still per currency |
| Period income | PAID amounts bucketed by **`requestedAt`** | **CHANGE** | NEW buckets by **`receivedAt`** |
| Pending amount | `SUM(amount WHERE status = PENDING)` | **PRESERVE** | Keep, currency-grouped |
| Average payout | lifetime PAID amount / PAID withdrawal count | **PRESERVE** (ADR-014) | Uses recognized set; N/A if count = 0 |
| Average monthly income | lifetime PAID / inclusive month count | **PRESERVE** (ADR-014) | Inclusive UTC months from earliest receivedAt → now |
| Yield / income yield | lifetime PAID / total current funded capital × 100 | **PRESERVE** (ADR-014) | N/A if current capital = 0 |
| Broker net P/L | `current equity + withdrawals - deposits` | **PRESERVE** (ADR-014) | N/A if no latest equity |
| Broker ROI | `net P/L / deposits × 100` | **PRESERVE** (ADR-014) | N/A if deposits = 0 |
| Combined managed capital | funded current capital + broker current equity | **CHANGE** (ADR-014) | Same currency only; else omit |
| Combined generated profit | funded lifetime PAID + broker net P/L | **CHANGE** (ADR-014) | Same currency only; else omit |
| Mixed-currency aggregates | Combined USD+EUR etc. without conversion | **REMOVE** | Forbidden |

---

## Metric register (NEW FPM)

| Name | Source data | Formula | Currency | Date basis | Status filter | Current definition | Open question |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Recognized payout total | Withdrawal | Sum `amount` | Per currency | `receivedAt` | PAID + receivedAt | CONFIRMED | TZ (OQ-009) |
| Pending withdrawal amount | Withdrawal | Sum `amount` | Per currency | — | PENDING | CONFIRMED (HB-005) | — |
| Total paid withdrawals (count) | Withdrawal | Count recognized | — | — | PAID + receivedAt | CONFIRMED | — |
| Total funded capital | TradingAccount | SUM(`initialSize`) non-archived | Per currency | Point-in-time | All phases | CONFIRMED (ADR-014) | — |
| Current funded capital | TradingAccount | SUM(`currentSize`) non-archived | Per currency | Point-in-time | All phases | CONFIRMED (ADR-014 / HB-001) | — |
| Lifetime income | Withdrawals | All-time recognized sum | Per currency | `receivedAt` | PAID+receivedAt | CONFIRMED | — |
| Monthly / quarterly / yearly income | Withdrawals | Period recognized sums | Per currency | `receivedAt` + TZ | PAID+receivedAt | CONFIRMED mechanism | Period edges |
| Average payout | Withdrawals | recognized ÷ count | Per currency | — | Recognized | CONFIRMED (ADR-014) | — |
| Avg / month | Withdrawals | recognized ÷ inclusive UTC months | Per currency | earliest→now | Recognized | CONFIRMED (ADR-014) | — |
| Largest withdrawal | Withdrawals | max recognized `amount` | Per currency | — | Recognized | CONFIRMED (ADR-014) | — |
| Best month | Withdrawals | max monthly recognized sum | Per currency | Month of `receivedAt` | Recognized | CONFIRMED (ADR-014) | — |
| Income yield | Payouts + capital | lifetime ÷ current capital × 100 | Per currency | — | — | CONFIRMED (ADR-014) | — |
| Portfolio growth | Account sizes | (current−initial)/initial × 100 | Per currency | — | — | CONFIRMED (ADR-014) | — |
| Firm / account income share | Withdrawals | Sum recognized by firm/account | Per currency | `receivedAt` | Recognized | CONFIRMED path | — |
| Broker total deposits / withdrawals | Ledger | Sums | Account currency | dates | — | CONFIRMED | — |
| Net deposited | Deposits − withdrawals | Same currency | Account currency | — | — | CONFIRMED difference | — |
| Latest equity | EquitySnapshot | Latest by date | Account currency | snapshotDate | — | CONFIRMED | — |
| Broker P/L | Equity + cashflows | equity + wd − deposits | Account currency | — | — | CONFIRMED (ADR-014) | — |
| Broker ROI | P/L ÷ deposits | N/A if deposits = 0 | Account currency | — | — | CONFIRMED (ADR-014) | — |
| Peak equity / drawdown | Snapshots | max equity; (peak−latest)/peak | Account currency | — | — | CONFIRMED (ADR-014) | — |
| Combined capital / profit | Funded + real | Same-currency sum only; else omit | Must match | — | — | CONFIRMED (ADR-014) | — |

## Non-authority surfaces

Dashboard, Reports, Excel exports, backup summary notes, MetricCards: **display only** of Financial Domain results.

See also: [HISTORICAL-BEHAVIOR-REGISTER.md](./HISTORICAL-BEHAVIOR-REGISTER.md)
