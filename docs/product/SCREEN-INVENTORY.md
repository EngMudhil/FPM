# SCREEN-INVENTORY

Status: Authoritative reconciled inventory (FPM-002A).  
Owner: Frontend + Lead.  
Evidence: 26 screenshots + Spec §4–6, §9. Missing: `5.png`.

Routes follow Spec §4 (CURRENT DECISION). Screenshot labels mapped to Spec navigation groups.

| Screen | Route | Purpose | Main info | Main actions | Domain | Screenshot-confirmed | Improvements | Scope |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Login | `/login` | Authenticate | Credentials | Sign in | Auth | Behavior CONFIRMED; UI not in shots | Spec auth UX | CORE |
| Marketing/landing | `/` | Public entry | — | Redirect/login | Auth | Not shown | Minimal | CORE |
| Dashboard | `/dashboard` | Business overview | Capital, payouts, charts, recent activity, real summary | Log withdrawal, view all | Funded+Real | Shots 1–4,6 | Fix ROI inconsistency; currency groups; loading/empty; Spec metrics (pending amount, phase distribution) | CORE |
| Firms list | `/firms` | Manage firms | Name, website, created | Search, add, edit, delete | Firm | 7 | Archive preference; cascade confirm; pagination | CORE |
| Firm new/edit/detail | `/firms/new`, `/[id]`, `/[id]/edit` | Firm CRUD/detail | Notes, linked accounts | Save, cancel | Firm | 8 (new); detail Spec | Add detail totals | CORE |
| Accounts list | `/accounts` | Funded accounts | Phase, size, firm, platform | Filter phase/firm, CRUD | TradingAccount | 9 | Stronger identity (not just 1/2); CLOSED/PAUSED | CORE |
| Account new/edit/detail | `/accounts/new`, `/[id]`, `/[id]/edit` | CRUD + history | Sizes, currency, withdrawals, scales | Save | TradingAccount | 10–11 | Detail per Spec | CORE |
| Withdrawals list | `/withdrawals` | Payout ledger | Amount, status, account, dates | Record, filter, edit | Withdrawal | 12 | FAILED/REVERSED; restrict PAID delete | CORE |
| Withdrawal new/edit/detail | `/withdrawals/new`, `/[id]`, `/[id]/edit` | Manual record | Account, amount, status, requested/received | Save | Withdrawal | 13 | Label Paid/Received → `receivedAt`; validations | CORE |
| Scale events list | `/scale-events` | Size upgrades | Empty or history | Add | ScaleEvent | 14 | Filters firm/account/date; show Δ% | SECONDARY |
| Scale new/edit/detail | `/scale-events/new`, … | Record scale | From/to/date | Save; txn update size | ScaleEvent | 15 | Enforce to>from | SECONDARY |
| Certificates gallery | `/certificates` | Evidence gallery | Cards, filters | Add, edit, delete | Certificate | 16 | Clarify payout vs size labels | CORE |
| Certificate detail/edit/new | `/certificates/[id]`, … | Attach/view | Image, linked withdrawal | Upload, save | Certificate | 17–18 | Private download; magic bytes | CORE |
| Broker accounts | `/broker-accounts` | Real capital | Equity cards, snapshots count | Add broker/account | Broker* | 19 | Detail route; ledgers | SECONDARY |
| Broker new/edit | `/broker-accounts/brokers/new`, `…/edit` | Broker CRUD | Name, website, notes | Save | Broker | 20 | List management | SECONDARY |
| Broker account new/edit/detail | `/broker-accounts/new`, `/[id]`, … | Account + cash/equity | Capital, currency, history | Deposits/withdrawals/snapshots | BrokerAccount | 21 (new); detail missing | Charts; N/A ROI | SECONDARY |
| Reports | `/reports` | BI | Period payouts, breakdowns | Filters | Analytics | 27 | Reduce Dashboard dup; currency filter | SECONDARY |
| Settings hub | `/settings` | System | Nav to children | — | System | Partial | Align Spec routes | CORE shell |
| Account/security settings | `/settings/security` | Profile, password, login history | User meta, login table | Save, change password | Auth | 22–23 | Map from “Account Settings” | CORE |
| Data management | `/settings/data-management` | Export/backup/restore | Export cards, backup table | Generate, restore | Ops | 24–25 | Spec-safe restore UX | SECONDARY |
| Audit log | `/settings/audit-log` | Audit trail | Filters, JSON details | Export CSV | Audit | 26 | Human-readable details | SECONDARY |
| Workspace / members | `/settings/workspace`, `/settings/members` | Roles | Members, timezone, currency | Invite/role | Workspace | Spec | ADR-015 | SECONDARY (shipped FPM-022) |

## Design requirements (document only — no redesign now)

Preserve screenshot identity (F mark, pastel KPIs, teal CTAs, blue active nav) while adopting Spec: readable max width, 4px spacing, status color semantics, WCAG 2.1 AA, loading/empty/error/permission states, destructive dialogs, route-derived active nav, improved account identity.
