# NAVIGATION

Status: Authoritative (FPM-002A).  
Owner: Frontend + Lead.  
ADR: `docs/decisions/ADR-008-NAVIGATION.md`.

## Final sidebar model

```text
FPM Portfolio Manager

OVERVIEW
  Dashboard
  Reports

PROP FIRMS
  Firms
  Funded Accounts
  Withdrawals
  Scale Events
  Certificates

REAL ACCOUNTS
  Broker Accounts

SYSTEM
  Settings ▾
    Security (profile, password, login history)
    Data Management
    Audit Log
    Workspace          # SECONDARY
    Members            # SECONDARY / FUTURE
```

## Mapping from screenshots

| Screenshot label | Final label |
| --- | --- |
| FUNDED | PROP FIRMS |
| Dashboard (under Funded) | Overview → Dashboard |
| Accounts | Funded Accounts |
| REAL ACCOUNTS → Broker Accounts | unchanged group |
| Reports | Overview → Reports |
| Settings → Account Settings | System → Security |
| Settings → Data Management / Audit Log | System → same |

## Rules

* Active item from **current route** (including nested `/new`, `/[id]/edit`).  
* Sticky desktop sidebar; mobile accessible drawer (Spec).  
* Breadcrumbs: Module / New|Detail as today.  
* Readable max width for main content (Spec).

## Routes

Authoritative list: original Spec §4 (immutable source) and `docs/product/SCREEN-INVENTORY.md`.
