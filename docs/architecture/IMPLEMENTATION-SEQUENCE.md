# IMPLEMENTATION-SEQUENCE

Status: Authoritative (FPM-002B).  
Owner: Lead.  
Pattern: vertical slices — Database → Domain/service → Server Action/Route Handler → UI → Tests → Review → Integrate.

Do **not** build the entire backend first. Prioritize the financial core.

## Completed

| ID | Name | Status |
| --- | --- | --- |
| FPM-001 | Repository Foundation | Done |
| FPM-001A | Agent Governance | Done |
| FPM-002 | Discovery Blueprint | Done |
| FPM-002A | Spec Reconciliation | Done |
| FPM-002B | Old Implementation Audit Reconciliation | Done (docs) |
| FPM-003 | Application / Database Foundation | Done |

## Planned sequence

| ID | Name | Objective | Why this order | Extra acceptance from FPM-002B |
| --- | --- | --- | --- | --- |
| FPM-004 | Design System Baseline | Tokens, AppShell/Sidebar Spec IA, primitives | Shared UI | — |
| FPM-005 | Firms | Firm CRUD+detail | Parent of accounts | Cascade/archive confirms per lifecycle (no silent history wipe) |
| FPM-006 | Funded Accounts | Accounts CRUD+detail | Parent of withdrawals | Phases ACTIVE/PAUSED/CLOSED; identity UX |
| FPM-007 | Withdrawal Engine | Domain+DB+Financial Domain | Core engine | **PAID+`receivedAt`** recognition; statuses; PAID does not auto-cert or resize; pending sum; **reject `requestedAt` period basis** |
| FPM-008 | Withdrawal UI | List/new/edit/detail + CTA | Completes workflow | UI labels Paid/Received → `receivedAt` |
| FPM-009 | Certificates | Upload+gallery+detail | Evidence | Link withdrawal; private storage; **object delete cleanup**; backup/restore must include objects later |
| FPM-010 | Scale Events | Slice + size authority | Spec + HB-014 | **`currentSize` = latest `toSize` / else `initialSize`** on create/update/delete (OQ-016 confirm); txn with Spec validations |
| FPM-011 | Dashboard | Domain-only metrics | Consumes engine | Ship only CONFIRMED metrics; candidates gated on OQ-001/002/012; **currency-safe** (no mixed FX) |
| FPM-012 | Reports | Period/breakdown | Secondary | Periods on **`receivedAt`**; currency filters |
| FPM-013 | Excel Export | Injection-safe exports | Ops | Currency columns; no mixed sums |
| FPM-014 | Broker Accounts | Full real domain | Real capital | Decide OQ-015 snapshot lifecycle **before** auto-snapshot behavior; N/A ROI if denom 0; currency-safe |
| FPM-015 | Audit | Append-only audit + UI | Compliance | — |
| FPM-016 | Backup | Versioned ZIP job | Ops | Include certificate objects; exclude secrets |
| FPM-017 | Restore | Spec-safe pipeline | Ops safety | **Reject** old weak restore; exact diff; safety backup; concurrency lock; restore cert objects; no skipDuplicates |
| FPM-018 | Production Deployment | Caddy/Docker/VPS | After CORE+ops | — |
| FPM-019 | Full QA | Cross suite | Release gate | Tests asserting NEW date basis ≠ old `requestedAt` behavior |
| FPM-020 | MT5 Integration | FUTURE | After stable core | — |
| FPM-021 | Financial OQ metric pack | Done | Post-MVP | ADR-014 resolves OQ-001–006/012/017; domain owns formulas |
| FPM-022 | Workspace / members / security | Done | Post-MVP | ADR-015; OQ-010/013 closed |

### Auth note

Authentication is included inside **FPM-003** (session/user) with Security review.

## Slice checklist (each feature task)

1. Schema/migration (if needed)  
2. Domain/service (+ Financial Domain if money)  
3. Server Action / Route Handler + Zod  
4. UI  
5. Tests (unit for domain; e2e for critical path)  
6. Required reviews per ownership matrix  
7. Integrate to `development` via PR  
