# ADR-012 — Equity snapshot duplicate dates (FPM-014)

Status: Accepted.  
Date: 2026-09-15.

## Context

Spec §8 requires an explicit policy when two equity snapshots share the same account and date. OQ-015 blocked ambiguous auto-replace behavior.

## Decision

**Reject** duplicate `(brokerAccountId, snapshotDate)` rows via a unique index. Clients must update or delete the existing snapshot instead of silently replacing.

## Consequences

* Insert conflicts surface as validation/conflict errors.
* OQ-015 is resolved for MVP.
* P/L and ROI formulas remain deferred (OQ-003); net deposited and latest equity are CONFIRMED display metrics.
