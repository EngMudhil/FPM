# REQUIREMENTS

Status: Authored (FPM-002).  
Owner: Lead Agent.  
Note: Original written specification was **not available**. Requirements below are tagged by evidence class. Do not treat INFERRED/RECOMMENDED as hard requirements without confirmation.

## FR — Functional requirements

### Identity & access

| ID | Requirement | Class |
| --- | --- | --- |
| FR-AUTH-01 | User signs in with email & password | CONFIRMED (Account Settings: sign-in method) |
| FR-AUTH-02 | User can sign out | CONFIRMED |
| FR-AUTH-03 | Session timeout after inactivity (UI shows 2 hours) | CONFIRMED value in UI; enforcement Behavior: Requires confirmation |
| FR-AUTH-04 | Login history recorded (status, IP, browser, OS, time) | CONFIRMED |
| FR-AUTH-05 | User can update display name and email | CONFIRMED |
| FR-AUTH-06 | User can change password (min 8 characters stated) | CONFIRMED |
| FR-AUTH-07 | Email verification status displayed | CONFIRMED (Not verified shown) |

### Firms

| ID | Requirement | Class |
| --- | --- | --- |
| FR-FIRM-01 | List firms with search and sort | CONFIRMED |
| FR-FIRM-02 | Create firm with Name (required), Website optional, Notes optional | CONFIRMED |
| FR-FIRM-03 | Edit / delete firm | CONFIRMED actions; delete confirm UNRESOLVED |

### Funded accounts

| ID | Requirement | Class |
| --- | --- | --- |
| FR-ACCT-01 | List accounts with search and phase filter | CONFIRMED |
| FR-ACCT-02 | Create account: Firm*, Account Number opt, Phase*, Initial Size*, Current Size*, Currency*, Platform opt, Start Date opt, Notes opt | CONFIRMED |
| FR-ACCT-03 | Show platform (e.g. MT5) as stored text | CONFIRMED |
| FR-ACCT-04 | Edit / delete account | CONFIRMED actions |

### Withdrawals (core)

| ID | Requirement | Class |
| --- | --- | --- |
| FR-WD-01 | List withdrawals with search and status filter | CONFIRMED |
| FR-WD-02 | Manually record withdrawal: Account*, Amount*, Status*, Requested Date*, Paid Date opt, Notes opt | CONFIRMED |
| FR-WD-03 | Support at least statuses Pending and Paid | CONFIRMED |
| FR-WD-04 | Dashboard primary CTA to log/record withdrawal | CONFIRMED |
| FR-WD-05 | Edit / delete withdrawal | CONFIRMED actions |

### Scale events

| ID | Requirement | Class |
| --- | --- | --- |
| FR-SCALE-01 | List scale events; empty state when none | CONFIRMED |
| FR-SCALE-02 | Add scale event: Account*, From Size*, To Size*, Scale Date*, Notes opt | CONFIRMED |

### Certificates

| ID | Requirement | Class |
| --- | --- | --- |
| FR-CERT-01 | Gallery of certificates with search, firm filter, year filter | CONFIRMED |
| FR-CERT-02 | Add certificate linked to a Withdrawal*; optional title, issue date, image (PNG/JPG/WebP ≤10MB), notes | CONFIRMED |
| FR-CERT-03 | Certificate detail shows image + linked withdrawal + status + requested date | CONFIRMED |
| FR-CERT-04 | Edit / delete certificate | CONFIRMED |

### Real / broker accounts

| ID | Requirement | Class |
| --- | --- | --- |
| FR-BRK-01 | Create broker: Name*, Website opt, Notes opt | CONFIRMED |
| FR-BRK-02 | Create broker account: Broker*, Account Name*, Account Number opt, Starting Capital, Currency, Start Date opt, Notes opt | CONFIRMED |
| FR-BRK-03 | Broker Accounts overview cards with equity, P/L, deposits, drawdown, snapshot count | CONFIRMED |
| FR-BRK-04 | Track deposits, withdrawals, snapshots for real accounts | CONFIRMED mentioned in export copy; dedicated UI UNRESOLVED |
| FR-BRK-05 | Broker account detail view | INFERRED (View details link); page not inspected |

### Dashboard & reports

| ID | Requirement | Class |
| --- | --- | --- |
| FR-DASH-01 | Show total funded capital and summary badges | CONFIRMED |
| FR-DASH-02 | Show period income metrics (month, last month, quarter, year, lifetime, avg/month) | CONFIRMED |
| FR-DASH-03 | Business snapshot: income yield, avg payout, tenure, largest withdrawal, best month | CONFIRMED |
| FR-DASH-04 | Charts: lifetime income growth; payout trend | CONFIRMED |
| FR-DASH-05 | Recent withdrawals and monthly payout groupings | CONFIRMED |
| FR-DASH-06 | Real accounts metrics and combined business overview | CONFIRMED |
| FR-RPT-01 | Reports page with funded capital/income metrics and income by firm/account | CONFIRMED |

### Data management & audit

| ID | Requirement | Class |
| --- | --- | --- |
| FR-DATA-01 | Export modules to Excel (.xlsx): firms, trading accounts, withdrawals, scale events, certificates, real broker accounts, dashboard summary | CONFIRMED |
| FR-DATA-02 | Generate backup ZIP (Excel, JSON, certificate images, SQL dump) stored in object storage | CONFIRMED UI copy |
| FR-DATA-03 | List backups with status; download / restore / delete | CONFIRMED |
| FR-DATA-04 | Restore from upload or history; warn destructive; preserve user accounts + login history | CONFIRMED |
| FR-AUDIT-01 | Audit log of data-change events with filters and CSV export | CONFIRMED |

## NFR — Non-functional (from project decisions + UI hints)

| ID | Requirement | Class |
| --- | --- | --- |
| NFR-01 | Private single-trader system (not multi-tenant SaaS) | CONFIRMED decision / UI |
| NFR-02 | Financial calculations have one authoritative domain implementation | CONFIRMED agent/repo rule |
| NFR-03 | Never silently combine mismatched currencies | CONFIRMED project rule (task); conversion UNRESOLVED |
| NFR-04 | Stack direction: Next.js, Postgres, Drizzle, Redis/BullMQ, etc. | CONFIRMED foundation/ADR target |
| NFR-05 | Accessibility and responsive improvements over Replit UI | RECOMMENDED |

## Explicit non-requirements for MVP

| ID | Item | Class |
| --- | --- | --- |
| NR-01 | Live MT5 integration | FUTURE |
| NR-02 | Multi-tenant orgs / team roles | NOT NEEDED (product identity) |
