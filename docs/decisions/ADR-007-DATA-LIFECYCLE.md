# ADR-007 — Data Lifecycle & Historical Protection

Status: Accepted (FPM-002A).  
Date: 2026-09-15.

## Decision

Prefer archive / phase CLOSED / status REVERSED over hard-deleting historical financial records. Audit logs are append-only for ordinary users. PAID withdrawals are restricted from casual deletion. Destructive actions use accessible confirmation dialogs (no native `prompt()`).

## Consequences

* UI Delete buttons from screenshots are policy-filtered.  
* See `docs/architecture/DATA-LIFECYCLE.md`.
