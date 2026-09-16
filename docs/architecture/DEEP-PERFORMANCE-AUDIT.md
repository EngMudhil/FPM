# FPM Deep Performance Audit

Date: 2026-09-16  
Branch: `feature/fpm-deep-performance` (builds on navigation PR #31)  
Rule: MEASURE → IDENTIFY → OPTIMIZE → TEST — no speculative rewrites; financial/auth behavior unchanged.

## Baseline

| Item | Value |
| --- | --- |
| Prior nav work | `915abfa` / PR #31 |
| Working tree start | clean on nav branch |
| Indexes before | Per-column workspace/status/date indexes already present |
| Auth cache | `cache(getAuthenticatedUser)` + `cache(requirePrimaryWorkspace)` from #31 |
| Observed cold dashboard | Prior session: compile ~54s + GET `/dashboard` ~15–47s (dev compile + DB) |
| Observed warm health | `/api/health` ok after restart |

### Performance budgets (realistic)

| Category | Target (warm, seeded demo) | Notes |
| --- | --- | --- |
| Sidebar route transition | Soft nav; shell stays | Already addressed in #31 |
| Dashboard server snapshot | Prefer &lt; 500ms DB+CPU on demo data | Dominant cost historically |
| List pages (pageSize 20) | Prefer &lt; 200ms query | Already paginated |
| Authz overhead | ≤1 membership query / request | Was 2+ before this work |

## Route inventory (deep)

| Route | Queries (approx) | Parallel? | Bottleneck | Severity | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | Was 10 incl. duplicate WD query | Yes | Duplicate WD fetch; `select *` ledgers; O(n×m) filters; double authz | **P1** | Implemented |
| `/reports` | 2 | Yes | Full WD rows | **P2** | Narrow columns — done |
| `/firms` | 2 (list+count) | Yes | OK | — | Keep |
| `/accounts` | 2+firms options | Yes | OK | — | Keep |
| `/withdrawals` | 2+totals | Yes | OK | — | Keep |
| `/certificates` | 1 unbounded | — | Grows with certs | **P3** | Paginate later |
| `/scale-events` | 2 | Yes | OK | — | Keep |
| `/broker-accounts` | list | — | OK | — | Keep |
| `/broker-accounts/[id]` | 3 ledger | Yes | OK | — | Keep |
| `/settings/audit-log` | 2 paginated | Yes | OK | — | Keep |
| `/settings/data` | backups+restores | Yes | Restore list unbounded | **P3** | Cap later |
| Backup ZIP | many entity selects | Yes | Inherent full export | — | Do not weaken safety |

## Dashboard dependency map

```text
Dashboard page
├── getSessionAction (cached user/workspace)
└── getDashboardAction
    ├── requirePrimaryWorkspaceRole('VIEWER')  // single membership query
    └── getDashboardSnapshot
        ├── Promise.all
        │   ├── withdrawals (+ firm/account labels)  [narrow columns]
        │   ├── trading accounts (active fields)
        │   ├── broker accounts (id/name/currency)
        │   ├── brokers (id/name)
        │   ├── equity snapshots (peak/latest fields)
        │   ├── broker deposits (amount fields)
        │   ├── broker withdrawals (amount fields)
        │   ├── firms COUNT
        │   └── certificates COUNT
        ├── Financial Domain aggregations (@fpm/financial) — unchanged
        └── recent 6 derived in-memory (no 2nd WD query)
```

## Database findings

### Duplicate / N+1

| Finding | Evidence | Action |
| --- | --- | --- |
| Authz double membership query | `requirePrimaryWorkspace` then `requireWorkspaceRole(same id)` | `requirePrimaryWorkspaceRole` |
| Dashboard loaded all withdrawals twice | Full list + `limit 6` recent | Derive recent from full list |
| Broker loop `.filter` per account | O(accounts×rows) | Pre-group maps |
| Firms loaded for `.length` only | `select()` firms | `count()` |

### Indexes added (justified)

| Index | Query pattern | Why | Cost |
| --- | --- | --- | --- |
| `withdrawals_workspace_requested_at_idx` | WD list/order by requestedAt | Matches list + recent sort | Extra write on insert |
| `withdrawals_workspace_status_idx` | Filter by status in workspace | Withdrawals filter UI | Extra write |
| `trading_accounts_workspace_archived_idx` | Active accounts `workspace + archived IS NULL` | Dashboard/reports accounts | Extra write |

Rejected: duplicate equity snapshot index (unique `(broker_account_id, snapshot_date)` already exists).

## Server action findings

All primary-workspace helpers now use `requirePrimaryWorkspaceRole` — removes redundant `requireWorkspaceAccess` query while preserving role checks.

`router.refresh()` / `revalidatePath` after mutations: **kept** (correctness).

## Client / bundle

- Dashboard remains RSC (good).
- No heavy chart library; SVG in RSC.
- Client boundaries limited to interactive chrome/forms (intentional).
- No dependency removals this pass (insufficient evidence of unused heavy deps).

## Changes implemented

1. `requirePrimaryWorkspaceRole` + wire all server actions  
2. Dashboard: drop duplicate WD query; narrow selects; firm/cert counts; ledger pre-group  
3. Reports: narrow withdrawal column projection  
4. Migration `0010_perf_composite_indexes`  
5. This audit document  

## Before / after (server-side)

| Metric | Before | After |
| --- | --- | --- |
| Dashboard SQL queries | 10 | **9** (−1 WD) |
| Authz membership queries / action | 2 | **1** |
| Firms payload for count | full rows | **COUNT** |
| Broker ledger scans | nested filter | **Map group** |
| WD/report row width | `select()` entity | **needed columns** |

Browser Playwright timings with auth: **BLOCKED** (e2e gated; no automated auth credentials in CI). Qualitatively dashboard still benefits from fewer queries + smaller payloads.

## Remaining bottlenecks / candidates

| Item | Severity | Notes |
| --- | --- | --- |
| Dashboard still loads all workspace withdrawals/snapshots | P2 | Correct for lifetime metrics; consider materialized summary later (architecture task) |
| Certificates list unbounded | P3 | Add pagination |
| Restore jobs list unbounded | P3 | Cap/order |
| Large RSC dashboard JSX | P3 | Split components (no formula change) |
| Authenticated browser perf suite | P2 | Needs seeded login in Playwright |

## Security / financial verification

- Role checks still server-side; no client authz  
- No shared cache of financial payloads across users  
- `@fpm/financial` formulas untouched  
- Indexes additive only; no data mutation  

## Measurement limitations

- No authenticated Playwright timing harness in-repo for this pass  
- Dev cold compile dominates first request (not production SSR)  
- Demo DB size may understate large-workspace gains from indexes  
