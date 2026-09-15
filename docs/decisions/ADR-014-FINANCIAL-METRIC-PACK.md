# ADR-014 — Financial metric pack (open-question resolutions)

Status: Accepted.  
Date: 2026-09-15.  
Owner: Lead + Financial Domain.

## Context

Dashboard/Reports/Broker UIs deferred several Spec-named metrics until OQ-001–005, OQ-012, and OQ-017 were decided. Old Replit formulas were strong candidates (HB-001–012) but not automatic authority.

## Decisions

### OQ-001 — Total vs current funded capital

| Metric | Formula | Scope |
| --- | --- | --- |
| **Total funded capital** | `SUM(initialSize)` | Non-archived accounts; all phases; **per currency** |
| **Current funded capital** | `SUM(currentSize)` | Same scope (HB-001 PRESERVE) |

Rationale: Spec lists both names; `initialSize` is original allocation, `currentSize` is scale-authoritative size (ADR-011).

### OQ-002 / OQ-017 — Portfolio / income formulas

| Metric | Formula |
| --- | --- |
| Portfolio growth | `(SUM(currentSize) − SUM(initialSize)) / SUM(initialSize) × 100` per currency; **N/A** if initial sum = 0 |
| Average payout | recognized lifetime ÷ recognized count per currency; **N/A** if count = 0 |
| Avg / month | recognized lifetime ÷ **inclusive UTC month count**; **N/A** if no recognized payouts |
| Inclusive month count | From UTC month of earliest `receivedAt` through UTC month of `now`, inclusive |
| Income yield | recognized lifetime ÷ current funded capital × 100; **N/A** if capital = 0 |
| Largest withdrawal | max recognized `amount` per currency |
| Best month | UTC `YYYY-MM` of `receivedAt` with highest recognized sum per currency |

### OQ-003 — Broker P/L and ROI

| Metric | Formula |
| --- | --- |
| Broker net P/L | `latestEquity + SUM(withdrawals) − SUM(deposits)` (account currency) |
| Broker ROI | `net P/L / SUM(deposits) × 100`; **N/A** if deposits = 0 (Spec) |

If no equity snapshot exists, P/L and ROI are **N/A**.

### OQ-004 / OQ-005 — Peak equity and drawdown

| Metric | Formula |
| --- | --- |
| Peak equity | max `equity` among snapshots; ties → latest `snapshotDate`, then `id` |
| Drawdown % | `(peak − latestEquity) / peak × 100`; **N/A** if no snapshots or peak = 0 |
| Trading drawdown (dashboard $) | `max(0, peak − (latestEquity + SUM(broker withdrawals)))` money amount; labeled **excl. withdrawals** (reference UI) |

Rationale for dollar drawdown: cash removed via withdrawal is not trading loss; reference screenshots show `$0.00` when the equity drop equals withdrawals.

### OQ-006 — Duplicate equity dates

Same as ADR-012 / OQ-015: **reject** duplicates.

### OQ-012 — Combined funded + real cards

Show **combined managed capital** (= current funded capital + sum of latest broker equities) and **combined generated profit** (= recognized lifetime + sum of broker net P/L) **only** when every contributing amount shares one currency. Otherwise omit combined totals (no silent FX).

### Explicitly deferred (not formulas)

| ID | Decision |
| --- | --- |
| OQ-010 | Members UI remains SECONDARY / not in this pack |
| OQ-011 | Missing `5.png` ignored |
| OQ-013 | Local private FS remains; S3 still prod follow-up |
| HB-019/020 | No auto equity snapshots on deposit/withdrawal; snapshots stay explicit |

## Consequences

* `@fpm/financial` owns all formulas above; UI only displays results.
* Dashboard deferred placeholders are replaced with these metrics.
* FINANCIAL-DOMAIN.md metric register updated to CONFIRMED for this pack.
