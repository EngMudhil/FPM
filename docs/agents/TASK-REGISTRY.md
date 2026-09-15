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
| FPM-006 | Funded Accounts | PASS | 4eede63 · PR #4 merged |
| FPM-007 | Withdrawal Engine | PASS | 8e99706 · PR #5 merged |
| FPM-008 | Withdrawal UI | PASS | a5b55f8 · PR #6 merged |
| FPM-009 | Certificates | PASS | 90369ca · PR #7 merged |
| FPM-010 | Scale Events | PASS | 3e60a59 · PR #8 merged |
| FPM-011 | Dashboard | PASS | e1ad878 · PR #9 merged |
| FPM-012 | Reports | PASS | c0b3ccc · PR #10 merged |
| FPM-013 | Excel Export | PASS | b481f5a · PR #11 merged |
| FPM-014 | Broker Accounts | PASS | 1e12039 · PR #12 merged |
| FPM-015 | Audit | PASS | b7b4b60 · PR #13 merged |
| FPM-016 | Backup | PASS | 1907857 · PR #14 merged |
| FPM-017 | Restore | PASS | 5fef5f3 · PR #15 merged |
| FPM-018 | Production Deployment | PASS | See completion record (this branch) |

### FPM-018 completion

* **Date:** 2026-09-15
* **Summary:** Dockerfile, docker-compose.prod.yml, Caddyfile, `.env.production.example`, DEPLOYMENT.md runbook
* **Deferred:** S3, worker process, CI deploy automation

## Next

| ID | Name | Owner | Dependencies | Acceptance (summary) | Reviewers | Output |
| --- | --- | --- | --- | --- | --- | --- |
| FPM-019 | Full QA | QA | Feature set | Cross e2e/a11y/financial suite | Lead | QA report |
| FPM-020 | MT5 Integration | Architecture + Backend + Security | After CORE | Spike/ADR update only until approved | Security + Lead | Spike report |

## Recommended next task

**FPM-019 — Full QA** (after FPM-018 PASS)
