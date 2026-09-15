# CURRENCY-POLICY

Status: Authoritative (FPM-002B).  
Owner: Financial Domain + Lead.  
Review: Architecture + QA.

## Hard rule (NEW FPM)

**Never silently combine different currencies.**

If conversion is not implemented, totals must be **grouped by currency** (or clearly separated). Do not invent exchange rates.

## Historical vs new

```text
OLD FPM:
  Mixed currencies could be combined (e.g. USD + EUR) without conversion.

NEW FPM:
  Never silently combine currencies.
```

Old mixed-currency aggregation is **REMOVE** (HB-013). The new policy wins.

## Currency fields

| Context | Policy | Class |
| --- | --- | --- |
| Workspace `defaultCurrency` | ISO 4217; used for defaults / display preference | SPECIFICATION-CONFIRMED |
| TradingAccount `currency` | Required ISO 4217 | SPECIFICATION-CONFIRMED |
| Withdrawal `currency` | Stored on withdrawal; must match account unless future conversion exists | SPECIFICATION-CONFIRMED |
| BrokerAccount `currency` | Required | SPECIFICATION-CONFIRMED |
| BrokerDeposit / BrokerWithdrawal / EquitySnapshot `currency` | Must match broker account unless conversion exists | SPECIFICATION-CONFIRMED |

## Surface behavior

| Surface | Behavior until FX exists |
| --- | --- |
| Dashboard | Show per-currency metric groups; if single currency workspace, one group is fine |
| Reports | Filters include currency; recognized payouts grouped by currency |
| Exports | Explicit currency column; no mixed-currency sum cells |
| Combined funded+real cards | Only combine when currencies match; otherwise split or hide combined total |

## Future FX conversion

* Class: **FUTURE**  
* When added: show conversion basis, rate source, and timestamp; never silent.  
* Requires new ADR.

## Open

* Default workspace currency at seed (likely USD from screenshots) — **RECOMMENDED USD**, confirm with human if needed (OQ-009).
