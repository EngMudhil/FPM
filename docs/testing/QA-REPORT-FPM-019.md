# QA Report — FPM-019

Status: Completed for current CORE+SECONDARY feature set.  
Date: 2026-09-15.  
Owner: QA + Lead.

## Scope exercised

| Area | Evidence |
| --- | --- |
| Financial Domain unit | `@fpm/financial` vitest (withdrawals, scale, reports, broker helpers) |
| receivedAt ≠ requestedAt | `apps/web/src/server/qa/received-at-basis.test.ts` |
| Web unit | services/actions sanitize/export/backup/restore/dashboard/reports/brokers |
| Lint / typecheck / build | `@fpm/web` gates on each feature PR |
| E2E Playwright | `e2e/smoke.spec.ts`, `e2e/core-routes.spec.ts` (opt-in via `E2E_ENABLED`) |
| A11y | Primary flows use labeled fields / buttons from `@fpm/ui`; full axe suite deferred |

## Acceptance highlights

* Withdrawals recognized only when **PAID + receivedAt**
* Scale events enforce **toSize > fromSize** and txn size sync
* Excel exports sanitize formula injection
* Backup ZIP excludes secrets; restore requires typed **RESTORE** + token + safety backup
* Unresolved formulas (capital OQ-001, growth/avg OQ-002, broker P/L OQ-003) remain deferred and are not silently invented in UI

## Residual risks / follow-ups

1. Enable CI Playwright job with seeded Postgres + web server.
2. Expand authenticated e2e for withdrawal→certificate path.
3. Automated a11y (axe) on dashboard/withdrawals.
4. Production restore dry-run on staging VPS after FPM-018.

## Verdict

**PASS for MVP gate** with residual risks documented. Manual VPS validation still recommended before public/private production cutover.
