# TASK-REGISTRY

Status: Authoritative planning (Lead-maintained).  
Owner: Lead.  
Detail: `docs/architecture/IMPLEMENTATION-SEQUENCE.md`.

## Completed

| ID | Name | Status | Commit / notes |
| --- | --- | --- | --- |
| FPM-001 | Repository Foundation | PASS | foundation |
| FPM-001A | Agent Governance | PASS | |
| FPM-001B/C | Commit & push foundation | PASS | |
| FPM-002 | Product Discovery Blueprint | PASS | 0bf6310 |
| FPM-002A | Spec Reconciliation | PASS | 0bf6310 |
| FPM-002B | Old Implementation Audit Reconciliation | PASS | 0bf6310 |
| FPM-003 | Application / Database Foundation | PASS | 11e9166 · PR #1 merged |
| FPM-004 | Design System Baseline | PASS | 3b7e9ac · PR #2 merged |
| FPM-005 | Firms | PASS | e390e20 · PR #3 merged |
| FPM-006 | Funded Accounts | PASS | See completion record (this branch) |

### FPM-006 completion

* **Date:** 2026-09-15
* **Summary:** `trading_accounts` with phases ACTIVE/PAUSED/CLOSED, numeric sizes, currency, firm restrict FK, identity display helper, list filters, CRUD + archive
* **Migration:** `0002_trading_accounts.sql`
* **Deferred:** Withdrawal/scale history on detail (FPM-007/010)

## Next

| ID | Name | Owner | Dependencies | Acceptance (summary) | Reviewers | Output |
| --- | --- | --- | --- | --- | --- | --- |
| FPM-007 | Withdrawal Engine | Financial + Backend + Database | FPM-006 | Domain rules; PAID+receivedAt; statuses; tests | Lead + QA + Security | Domain services |
| FPM-006 | Funded Accounts | Frontend + Backend | FPM-005 | CRUD+detail; phases; identity UX | Lead + QA | `/accounts/*` |
| FPM-007 | Withdrawal Engine | Financial + Backend + Database | FPM-006 | Domain rules; PAID+receivedAt; statuses; tests | Lead + QA + Security | Domain services |
| FPM-008 | Withdrawal UI | Frontend + Backend | FPM-007 | Manual record E2E; CTA | Lead + QA | `/withdrawals/*` |
| FPM-009 | Certificates | Frontend + Backend + DevOps + Security | FPM-008 | Private upload; link withdrawal | Security + Lead + QA | `/certificates/*` |
| FPM-010 | Scale Events | Frontend + Backend + Financial | FPM-006 | toSize>fromSize; txn currentSize | Lead + QA | `/scale-events/*` |
| FPM-011 | Dashboard | Frontend + Financial | FPM-007+ | Domain-only metrics; no invented formulas | Lead + QA | `/dashboard` |
| FPM-012 | Reports | Frontend + Financial | FPM-007 | Period reports; currency-safe | Lead + QA | `/reports` |
| FPM-013 | Excel Export | Backend + QA | Core modules | Injection-safe exports | Lead + QA | Export actions |
| FPM-014 | Broker Accounts | Frontend + Backend + Financial | FPM-003+ | Full real domain slice | Lead + QA + Database | `/broker-accounts/*` |
| FPM-015 | Audit | Backend + Frontend + Security | Mutations instrumented | Append-only audit UI | Security + Lead | `/settings/audit-log` |
| FPM-016 | Backup | DevOps + Backend | Storage | Spec ZIP format + job | Security + Lead | Backup jobs |
| FPM-017 | Restore | DevOps + Database + Security | FPM-016 | Spec-safe restore | Security + Lead + QA | Restore jobs |
| FPM-018 | Production Deployment | DevOps | Stable CORE+ops | Caddy/Docker/VPS docs+config | Security + Lead | Deploy artifacts |
| FPM-019 | Full QA | QA | Feature set | Cross e2e/a11y/financial suite | Lead | QA report |
| FPM-020 | MT5 Integration | Architecture + Backend + Security | After CORE | Spike/ADR update only until approved | Security + Lead | Spike report |

## Recommended next task

**FPM-005 — Firms** (after FPM-004 PASS)
