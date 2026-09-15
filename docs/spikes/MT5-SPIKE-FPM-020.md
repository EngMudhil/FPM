# Spike — MT5 Integration (FPM-020)

Status: Spike complete — **no implementation authorized**.  
Date: 2026-09-15.  
Owner: Architecture + Security + Lead.  
Related: [ADR-004](../decisions/ADR-004-MT5-INTEGRATION.md).

## Question

Should NEW FPM add live MetaTrader 5 sync for balances, deals, or payouts?

## Findings

1. **Product:** Core workflow is manual withdrawal recording (ADR-003). Platform is already a free-text field (e.g. `MT5`) on funded accounts.
2. **Security:** Live MT5 / broker API credentials would expand the secret surface (storage, rotation, audit). Unacceptable to gate CORE features on external API availability.
3. **Financial Domain:** Import pipelines must never invent recognition rules; payouts still require explicit PAID + `receivedAt` unless a future ADR redefines recognition.
4. **Options surveyed (not selected):**
   * Manual CSV import of deals (lower risk than live API)
   * Read-only MT5 Manager / broker REST (vendor-specific, brittle)
   * Third-party sync SaaS (data residency / ToS review needed)

## Recommendation

* Keep **ADR-004 FUTURE**.
* Do **not** add MT5 SDKs, credentials tables, or sync jobs in the current release train.
* If revisited: open a dedicated ADR + threat model + task after CORE is stable in production; prefer **optional, off-by-default** import that never blocks manual entry.

## Explicit non-goals (now)

* Auto-creating withdrawals from MT5 deals
* Storing MT5 investor/master passwords in FPM
* Blocking account CRUD without platform connectivity
