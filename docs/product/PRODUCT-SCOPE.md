# PRODUCT-SCOPE

Status: Authoritative (FPM-002A).  
Owner: Lead.

## Product definition

**Funded Portfolio Manager (FPM)** is a private financial and **payout-management** system for a funded / prop trader.

It records prop firms, funded accounts, **manual withdrawals/payouts**, scale history, certificates, optional real broker capital, then surfaces calculations, dashboard, reports, exports, and durable backup/restore.

### FPM is NOT

* a trading terminal  
* a broker  
* a prop-firm evaluation platform  
* primarily a trading journal  

### Central workflow (permanent)

```text
Manual withdrawal / payout recording
        ↓
Financial Domain calculations
        ↓
Account history
        ↓
Dashboard
        ↓
Reports
        ↓
Certificates / evidence
        ↓
Exports
```

Manual withdrawal entry **must remain available forever**. Integrations (e.g. MT5) may enhance data entry but must not become dependencies for the core workflow.

### Operator model

* Single-operator private system (not multi-tenant SaaS).  
* Data model uses a **Workspace** (even for one user) with roles defined in the original specification.  
* CORE MVP seeds one workspace + OWNER. Multi-member UI is not required for CORE.

---

## CORE MVP

Must be implemented first (financial spine):

1. Auth (email/password, DB sessions, logout, basic lockout/rate limits as feasible)
2. Workspace bootstrap (single workspace, OWNER)
3. Drizzle schema for funded core entities
4. **Financial Domain package** (authoritative calculations; no invented formulas)
5. Firms CRUD (+ detail)
6. Funded Accounts CRUD (+ detail)
7. **Withdrawal engine + UI** (manual record; statuses PENDING/PAID/FAILED/REVERSED)
8. Certificates (attach to withdrawal; private storage)
9. Funded Dashboard consuming Financial Domain only
10. Account / security settings baseline
11. Decimal-safe money + currency grouping policy

## SECONDARY MVP

Belongs in product; follow after core payout spine:

1. Scale Events (incl. transactional `currentSize` update per spec)
2. Reports (full filters; PAID + `receivedAt` recognition)
3. Real Accounts: Brokers, Broker Accounts, Deposits, Withdrawals, Equity Snapshots + detail/charts
4. Excel export (all modules; injection-safe)
5. Audit Log
6. Backup (versioned ZIP per spec)
7. Safe Restore (validate → diff → confirm → atomic job)
8. Workspace/members settings (if needed beyond single OWNER)
9. Design-system hardening + WCAG AA pass

## FUTURE

1. MT5 / broker API integration  
2. Explicit FX conversion engine  
3. Multi-operator collaboration beyond basic roles (if ever)  
4. Advanced caching/APM  

## Explicit non-goals

* Multi-tenant SaaS marketplace  
* Inventing financial formulas marked UNRESOLVED  
* Replacing manual withdrawals with automation-only flows  

## Sources

* Spec: `reference/FPM-Original-Specification.md` (immutable)  
* Screenshots: `reference/screenshots/`  
* Reconciliation: `docs/architecture/REQUIREMENTS-RECONCILIATION.md`
