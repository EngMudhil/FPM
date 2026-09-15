# REQUIREMENTS RECONCILIATION

Status: Authoritative for FPM-002B.  
Owner: Lead + Architecture.  
Sources:

1. `reference/FPM-Original-Specification.md` (immutable)
2. `reference/screenshots/` (26 files; `5.png` missing)
3. **Old Replit FPM verified audit** (historical implementation — see `HISTORICAL-BEHAVIOR-REGISTER.md`)
4. Current ADRs / blueprint / agents

Classification values (exactly one per row):

`SPECIFICATION-CONFIRMED` · `SCREENSHOT-CONFIRMED` · `IMPLEMENTATION-CONFIRMED` · `BOTH` · `CURRENT-ARCHITECTURE-DECISION` · `INFERRED` · `RECOMMENDED` · `FUTURE` · `UNRESOLVED` · `SUPERSEDED`

**Rule:** `IMPLEMENTATION-CONFIRMED` means the old system did it. It does **not** automatically become NEW FPM behavior.

---

## A. Technology & platform

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Next.js 15+ App Router, React 19+, strict TS, Tailwind, pnpm | BOTH | Spec §1; foundation | Keep | Aligned | Already scaffolded | — |
| PostgreSQL | BOTH | Spec §1; compose | Keep | Aligned | Core persistence | — |
| Prisma ORM | SUPERSEDED | Spec §1 | **Drizzle ORM** | ADR-001 / foundation chose Drizzle | Use Drizzle migrations; do not add Prisma | — |
| Zod server validation | BOTH | Spec §1; stack ADR | Keep | Aligned | All mutations | — |
| DB-backed sessions; no in-memory sessions/restore tokens | SPECIFICATION-CONFIRMED | Spec §1, §12 | Adopt | Security/stateless | Session + RestoreJob tables | — |
| Redis + BullMQ workers | CURRENT-ARCHITECTURE-DECISION | Blueprint / ADR-001 | Adopt | Spec requires durable jobs; BullMQ chosen | Worker package later | — |
| Private object storage | BOTH | Spec §1; screenshots backup/certs | Adopt | Aligned | Certs + backups | Provider choice |
| Money as Decimal / minor units; no JS float totals | SPECIFICATION-CONFIRMED | Spec §1 | Adopt | Correctness | Financial Domain + DB types | Decimal vs minor-unit choice |
| Caddy + Docker + Codespaces + GHA | CURRENT-ARCHITECTURE-DECISION | Foundation / blueprint | Keep | Ops direction | Deploy later | — |
| shadcn/ui + RHF | CURRENT-ARCHITECTURE-DECISION | ADR-001 | Keep | Spec doesn't forbid | UI tasks | — |

---

## B. Product identity & workflow

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Private funded/payout portfolio manager (not trading terminal/broker/prop platform) | BOTH | Spec goals; screenshots; task brief | Adopt | Product identity | Scope filter | — |
| Manual withdrawal recording is core & permanent | BOTH | Spec withdrawals; screenshots CTA; ADR-003 | Keep | Central workflow | FPM-007/008 priority | — |
| Integrations enhance, not block core | CURRENT-ARCHITECTURE-DECISION | ADR-003/004; task | Keep | Resilience | MT5 FUTURE | — |
| Multi-tenant SaaS / billing | SUPERSEDED / OUT | Screenshots lack orgs; ADR-002 | **Not building** | Private single-operator product | No tenant marketplace | — |
| Workspace model even for one user | SPECIFICATION-CONFIRMED | Spec §3 | **Adopt single-workspace MVP** | Spec requires workspace ownership on all records | Schema includes Workspace from start | Multi-member UI timing |
| Roles OWNER/ADMIN/MEMBER/VIEWER | SPECIFICATION-CONFIRMED | Spec §3 | Schema now; UI later | Spec requires roles | Seed OWNER; members UI SECONDARY | When to build members UI |

---

## C. Auth & security

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Email/password, hashed, HttpOnly cookies, CSRF, lockout, rate limits | SPECIFICATION-CONFIRMED | Spec §3, §13 | Adopt | Baseline security | Auth task | Argon2id vs bcrypt |
| Login history / LoginEvent | BOTH | Spec; screenshot 23 | Adopt | Aligned | Auth module | — |
| Audit log searchable + export | BOTH | Spec §13; screenshot 26 | Adopt (SECONDARY after core) | Important but not first slice | Audit task | — |
| Security headers / CSP / HSTS | SPECIFICATION-CONFIRMED | Spec §13 | Adopt | Production hardening | Middleware later | Exact CSP policy |

---

## D. Domain entities & enums

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Firm, TradingAccount, Withdrawal, ScaleEvent, Certificate | BOTH | Spec §7; screenshots | Adopt | Core funded domain | CORE MVP | — |
| Broker, BrokerAccount, BrokerDeposit, BrokerWithdrawal, EquitySnapshot | BOTH | Spec §7; screenshots 19–21,24 | Adopt | Real domain | SECONDARY MVP | Detail UI fields |
| BackupRecord, RestoreJob (persisted) | BOTH | Spec §7/12; screenshots 24–25 | Adopt Spec-grade restore | Spec stricter than old UI | SECONDARY; no in-memory map | — |
| AccountPhase ACTIVE/PAUSED/CLOSED | SPECIFICATION-CONFIRMED | Spec enums | Adopt | Screenshots only show Active | Forms/filters | — |
| WithdrawalStatus PENDING/PAID/FAILED/REVERSED | SPECIFICATION-CONFIRMED | Spec enums | Adopt | Screenshots show Pending/Paid | Status UX | — |
| Field `receivedAt` (UI may label Paid/Received) | SPECIFICATION-CONFIRMED | Spec §7–9 | Canonical `receivedAt` | Spec payout recognition rule | Schema + UI labels | — |
| Scale `toSize` > `fromSize`; update `currentSize` same txn | SPECIFICATION-CONFIRMED | Spec §8 | Adopt | Explicit | Scale service | — |
| Certificate ≤10MB; MIME+magic bytes | BOTH | Spec §8; screenshot 18 | Adopt | Aligned | Upload pipeline | — |

---

## E. Financial metrics

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Recognized payout totals = PAID + `receivedAt` | SPECIFICATION-CONFIRMED | Spec §9 Reports | **Authoritative** | Only explicit payout recognition rule | Financial Domain | Timezone boundaries |
| Never silently combine currencies | BOTH | Spec §9; project rules | Adopt | Safety | All aggregates | FX FUTURE |
| Show N/A not Infinity when ROI denom=0 | SPECIFICATION-CONFIRMED | Spec Broker Accounts | Adopt | Explicit | Broker metrics | — |
| Total vs current funded capital | SPECIFICATION-CONFIRMED (names) | Spec Dashboard | Names required; **formulas UNRESOLVED** | Spec lists metrics without formulas | Block precise calc until decided | Exact definitions |
| Income yield, avg payout, portfolio growth, peak equity, drawdown, ROI, lifetime, etc. | SCREENSHOT-CONFIRMED (presence) / UNRESOLVED (formula) | Screenshots; FPM-002 | Do not invent | Task rule | Stub or omit until decided | See OPEN-QUESTIONS |
| Dashboard ROI 8.1% vs 8.05% | SCREENSHOT-CONFIRMED inconsistency | Screenshot 4 | Single Financial Domain rounding | UI bug | Domain owns format | Rounding policy |

---

## F. Navigation & UI

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Spec groups: Overview / Prop Firms / Real Accounts / System | SPECIFICATION-CONFIRMED | Spec §5 | **Adopt for rebuild** | Clearer IA than mixed screenshot labels | Sidebar regroup | — |
| Screenshot groups FUNDED / REAL / Reports / Settings | SCREENSHOT-CONFIRMED | Screenshots | Superseded as IA labels | Same modules, new group names | Migration of labels only | — |
| Routes list in Spec §4 | SPECIFICATION-CONFIRMED | Spec | Adopt as route map | Complete CRUD + ops | App Router | Brokers under `/broker-accounts/brokers/*` |
| Pastel KPI cards / teal CTA / blue active nav | SCREENSHOT-CONFIRMED | Screenshots | Preserve identity | Brand continuity | Design system | Merge with Spec tokens |
| Spec tokens (#F8FAFC, Inter/Geist, 4px scale, WCAG AA) | SPECIFICATION-CONFIRMED | Spec §6 | Adopt as token baseline | Accessibility & consistency | Design system task | Font final choice |
| Detail pages for firms/accounts/withdrawals | SPECIFICATION-CONFIRMED | Spec §4/9 | Adopt | Screenshots often list-only | Add detail routes | — |
| Loading/empty/error/permission states | SPECIFICATION-CONFIRMED | Spec §14 | Adopt | Gaps in screenshots | All pages | — |
| Destructive confirmations (no native prompt) | SPECIFICATION-CONFIRMED | Spec §14 | Adopt | Screenshot deletes weak | Dialogs | — |

---

## G. Ops: export / backup / restore

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Excel export modules + formula injection protection | BOTH | Spec §10; screenshot 24 | Adopt | Aligned | SECONDARY | Job vs sync threshold |
| Versioned ZIP backup format | SPECIFICATION-CONFIRMED | Spec §11 | Adopt Spec format | More complete than UI copy | Backup worker | — |
| Safe restore: validate → diff → confirm → atomic job | SPECIFICATION-CONFIRMED | Spec §12 | **Overrides** simple screenshot restore | Safety critical | Restore module | Staging vs single txn |
| Screenshot restore preserves users/login history | SCREENSHOT-CONFIRMED | Screenshot 25 | Retain as product behavior | Compatible with Spec preview model | Restore rules | Align with Spec exactDiff |

---

## H. Future / deferred

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| MT5 live integration | FUTURE | ADR-004; platform text in UI | Deferred | Manual workflow first | Optional metadata only | Spike later |
| Explicit FX conversion | FUTURE | Spec allows group-or-convert | Deferred | No rates defined | Group-by-currency until then | Rate source |
| Members / workspace settings UI | SECONDARY / FUTURE | Spec routes | After CORE | Single OWNER enough for CORE | Schema ready | Priority vs audit |
| Screenshot `5.png` | UNRESOLVED | Missing file | Ignore until provided | Unknown content | Possible screen gap | Provide file? |

---

## I. Old Replit implementation (FPM-002B)

| Requirement / decision | Class | Source | Current decision | Reason | Implementation impact | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Funded capital = sum all `currentSize` (all phases) | IMPLEMENTATION-CONFIRMED | Old audit HB-001 | Candidate only | Spec still distinguishes total vs current | Do not hard-code until OQ-001 | OQ-001 |
| Portfolio growth old formula | IMPLEMENTATION-CONFIRMED | HB-002 | Candidate / UNRESOLVED | Needs approval | Financial Domain | OQ-002 |
| Period PAID income on `requestedAt` | IMPLEMENTATION-CONFIRMED | HB-004 | **SUPERSEDED** | Spec + FPM-002A use `receivedAt` | Withdrawal engine / reports | Closed |
| PAID income = sum PAID only (no receivedAt required) | IMPLEMENTATION-CONFIRMED | HB-003 | **CHANGE** | NEW requires PAID+`receivedAt` | Validations | — |
| Pending = sum PENDING | IMPLEMENTATION-CONFIRMED | HB-005 | Adopt (currency-safe) | Aligns Spec dashboard | Financial Domain | — |
| Avg payout / avg month / yield old formulas | IMPLEMENTATION-CONFIRMED | HB-006–008 | UNRESOLVED candidates | Not auto-approved | Metrics | OQ-002/017 |
| Broker P/L and ROI old formulas | IMPLEMENTATION-CONFIRMED | HB-009–010 | UNRESOLVED candidates | N/A if denom 0 from Spec | Broker metrics | OQ-003 |
| Combined capital/profit without FX safety | IMPLEMENTATION-CONFIRMED | HB-011–013 | **SUPERSEDED** mixed FX | NEW never silent-mix | Dashboard combined | OQ-012 |
| ScaleEvent → sync `currentSize` (latest toSize / else initialSize) | IMPLEMENTATION-CONFIRMED | HB-014 | **PRESERVE candidate** | Compatible with Spec txn update | FPM-010 | OQ-016 |
| PAID does not auto-create cert or resize account | IMPLEMENTATION-CONFIRMED | HB-016 | Adopt | Certificates explicit | Withdrawal/Cert slices | — |
| Certificate ↔ Withdrawal + private storage | IMPLEMENTATION-CONFIRMED | HB-017 | Adopt + improve | Keep relationship | FPM-009 | — |
| Incomplete cert cleanup; certs missing from restore | IMPLEMENTATION-CONFIRMED (defect) | HB-018 | **SUPERSEDED** | Must fix in NEW | Cert + Restore | — |
| Auto EquitySnapshot on create/deposit/withdrawal; delete txn keeps snapshot | IMPLEMENTATION-CONFIRMED | HB-019–020 | INVESTIGATE | Lifecycle undecided | FPM-014 | OQ-015 |
| Weak restore (in-memory, skipDuplicates, no exact diff, …) | IMPLEMENTATION-CONFIRMED (defect) | HB-022 | **SUPERSEDED** | Spec-safe restore wins | FPM-016/017 | OQ-014 |

---

## Conflict summary (resolved)

1. **Prisma → Drizzle** (SUPERSEDED / CURRENT-ARCHITECTURE-DECISION)  
2. **Multi-tenant SaaS → Single-operator + single workspace schema** (ADR-002 refined)  
3. **Screenshot nav labels → Spec Overview/Prop Firms / Real Accounts / System**  
4. **Screenshot simple restore + old weak restore → Spec safe restore pipeline**  
5. **Paid Date label → canonical `receivedAt`**  
6. **Old period basis `requestedAt` → NEW `receivedAt`** (SUPERSEDED historical)  
7. **Old mixed-currency aggregates → forbidden**  
8. **Financial formulas from old FPM → candidates / UNRESOLVED unless explicitly PRESERVE**
