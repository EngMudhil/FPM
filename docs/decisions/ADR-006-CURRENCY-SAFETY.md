# ADR-006 — Currency Safety

Status: Accepted (FPM-002A).  
Date: 2026-09-15.

## Decision

Never silently combine different currencies. Group or separate totals by ISO 4217 code until an explicit FX conversion ADR exists.

## Consequences

* Dashboard/Reports/Exports must be currency-safe.  
* FX conversion is **FUTURE**.
