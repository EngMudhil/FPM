# ADR-005 — Financial Domain Authority

Status: Accepted (FPM-002A).  
Date: 2026-09-15.

## Decision

All financial calculations are owned by a single **Financial Domain** module. Dashboard, Reports, Exports, and UI cards consume its results and must not reimplement totals.

Recognized funded payout totals use status **PAID** and **`receivedAt`** (Spec). Undefined formulas remain **UNRESOLVED** until Lead+Financial decide.

## Consequences

* `packages/financial` (or equivalent) is mandatory before Dashboard metrics.  
* QA tests financial correctness independently of UI.
