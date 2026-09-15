# ADR-013 — Restore execution model (FPM-017)

Status: Accepted.  
Date: 2026-09-15.

## Context

OQ-014 asked whether restore uses staging schemas vs a single transaction. Spec §12 requires safety backup, typed confirmation, no immediate delete on upload, ZIP safety, and no `skipDuplicates`.

## Decision

For MVP:

1. Persist an expiring `RestoreJob` on upload (never mutate live data at upload).
2. Validate ZIP (Zip Slip, absolute paths, checksums, format version).
3. Build a count-based exact preview (`creates`/`deletes`/`unchanged` approximations by entity counts).
4. Create a pre-restore safety backup via FPM-016; abort if it fails.
5. Require typed `RESTORE` + one-time confirmation token.
6. Execute restore in **one DB transaction**: delete workspace business children first, insert parents first from JSON; never `skipDuplicates`.
7. Preserve users/sessions; do not restore secrets.

Staging-schema cutover remains a production hardening option after FPM-018.

## Consequences

* OQ-014 resolved for MVP as single-transaction restore.
* Large restores may need workerization later (same as backup jobs).
