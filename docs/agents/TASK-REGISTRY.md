# TASK-REGISTRY

Status: Authoritative planning (FPM-002A).  
Owner: Lead.  
Detail: `docs/architecture/IMPLEMENTATION-SEQUENCE.md`.  
**Do not start tasks without Lead assignment.**

## Completed

| ID | Name | Status |
| --- | --- | --- |
| FPM-001 | Repository Foundation | Done |
| FPM-001A | Agent Governance | Done |
| FPM-001B/C | Commit & push foundation | Done |
| FPM-002 | Product Discovery Blueprint | Done |
| FPM-002A | Spec Reconciliation | Done |
| FPM-002B | Old Implementation Audit Reconciliation | Done |
| FPM-003 | Application / Database Foundation | Done |

## Next (do not auto-start)

| ID | Name | Owner | Dependencies | Acceptance (summary) | Reviewers | Output |
| --- | --- | --- | --- | --- | --- | --- |
| FPM-004 | Design System Baseline | Frontend | FPM-003 shell helpful | AppShell/Sidebar Spec IA; tokens; primitives | Lead + QA | `packages/ui` baseline |
| FPM-005 | Firms | Frontend + Backend | FPM-003 | CRUD+detail; Zod; tests | Lead + QA | `/firms/*` |
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

**FPM-004 — Design System Baseline**
