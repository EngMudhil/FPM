# ADR-011 — Scale event currentSize sync (FPM-010)

Status: Accepted.  
Date: 2026-09-15.

## Context

Spec §8 requires `toSize` > `fromSize` and updating account size in the same transaction as a scale event. Historical behavior HB-014 resynced `currentSize` from the latest scale event on create/update/delete (fallback `initialSize`). OQ-016 asked Lead + Financial to confirm the resync rule before FPM-010.

## Decision

Adopt the Spec + HB-014 rule:

1. Validate `toSize` > `fromSize` (strict) with positive decimal sizes via `@fpm/financial`.
2. On scale event **create / update / delete**, in the **same DB transaction**:
   * Persist the scale mutation.
   * Set `TradingAccount.currentSize` to the latest remaining event’s `toSize` ordered by `scaledAt` DESC, then `id` DESC.
   * If no events remain, set `currentSize` to `initialSize`.

Manual edits to `currentSize` on the account form remain allowed at create time, but scale CRUD is the authoritative path once events exist.

## Consequences

* OQ-016 is resolved for MVP.
* Delete of the last scale event restores `initialSize`.
* Dashboard capital candidates that sum `currentSize` will reflect scale history after this sync.
