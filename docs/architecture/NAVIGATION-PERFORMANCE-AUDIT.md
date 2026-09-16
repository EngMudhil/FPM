# FPM Navigation Performance Audit

Date: 2026-09-16  
Branch: `feature/fpm-navigation-performance`  
Scope: client/server routing, layouts, navigation, loading, data fetch duplication — **no financial/auth/schema changes**.

## Inventory (actual routes)

| Route | Page | Layout | Data | Nav | Loading |
| --- | --- | --- | --- | --- | --- |
| `/` | RSC redirect/landing | root | none | Link | none |
| `/login` | RSC + form | root | auth action | form | none |
| `/app` | middleware → `/dashboard` | — | cookie | redirect | — |
| `/dashboard` | RSC | authenticated | `getDashboardAction` + session | SoftLink period, Link | **added** |
| `/firms`, `/firms/new`, `/firms/[id]`, edit | RSC + client danger | authenticated | server actions | Link / SoftLink shell | **added** |
| `/accounts` (+ new/id/edit) | RSC + archive client | authenticated | server actions | Link | **added** |
| `/withdrawals` (+ new/id/edit) | RSC + delete client | authenticated | server actions | Link | **added** |
| `/scale-events` (+ new/id/edit) | RSC + delete client | authenticated | server actions | Link | **added** |
| `/certificates` (+ new/id/edit) | RSC + delete client | authenticated | server actions | Link | **added** |
| `/reports` | RSC | authenticated | reports action | Link | **added** |
| `/broker-accounts` (+ …) | RSC | authenticated | brokers actions | Link | **added** |
| `/settings/*` | RSC + client panels | authenticated | workspace/backup/restore | Link | **added** |

**Layouts:** `app/layout.tsx` (fonts) → `(authenticated)/layout.tsx` (session + `AuthenticatedShell`) → page children.  
**Shell:** Client `AuthenticatedShell` + `AppShell` / `Sidebar` via `FpmLinkProvider` → `SoftLink` (`next/link`). Sidebar stays mounted across sibling navigations.

## Findings

### Critical

_(none that break navigation today — soft routing already landed in #30)_

### High

1. **No `loading.tsx`** — slow RSC pages looked frozen; shell had no content placeholder.
2. **`window.location.reload()`** after backup create / restore confirm — full document reload.
3. **Native `method="get"` filter forms** — full document navigation for search/filter on firms, accounts, withdrawals, reports, audit-log.
4. **Per-request duplicate auth/workspace lookups** — layout `getSessionAction` + page actions both hit DB for the same user/workspace in one RSC render.

### Medium

5. Confirmation dialogs had no pending/disabled state during async confirm (double-click risk).
6. No route-level `error.tsx` under authenticated tree.
7. Plain `next/link` in pages is soft (OK); shell uses SoftLink (OK). Keep mutation `router.refresh()` where staying on page after `revalidatePath`.
8. Server Forms without `useFormStatus` pending feedback (create/edit) — progressive enhancement OK; medium polish.

### Low

9. Dashboard is a large RSC (acceptable; already `Promise.all` for session + snapshot).
10. Targeted prefetch already on sidebar / breadcrumbs — do not blanket-prefetch expensive authenticated pages.
11. No browser timing measurements in this audit (no Playwright perf run with auth).

### Already good

- Persistent authenticated layout + client shell
- SoftLink / FpmLinkProvider for sidebar + period nav
- List pages use server actions → domain/DB (no SC → own HTTP API anti-pattern for lists)
- Pagination/search server-side (pageSize 20)
- Middleware cookie gate only; authoritative auth remains server-side
- Mutations use `revalidatePath` + redirect or `router.refresh` (justified)
- Fonts via `next/font` with `display: 'swap'`

## Recommended changes (this branch)

1. Add `(authenticated)/loading.tsx` + skeleton styles
2. Replace backup/restore reload with `router.refresh()`
3. Soft filter forms (`router.push` + pending)
4. `cache()` around `getAuthenticatedUser` + `requirePrimaryWorkspace`
5. ConfirmationDialog pending feedback
6. Authenticated `error.tsx`

## Security / financial

No change to formulas, schema, authz rules, or caching of private financial payloads across users. Auth remains server-authoritative.
