# EXISTING-SCREENS

Status: Authored (FPM-002).  
Owner: Lead Agent.  
Evidence: `docs/design/SCREENSHOT-INVENTORY.md` (26 screenshots).  
Original written specification: **not available**.

Classification key: **CONFIRMED** = seen in screenshots.

## Module map found in screenshots

```text
Funded
├── Dashboard                          CONFIRMED (screens 1–4, 6)
├── Firms (list + add)                 CONFIRMED (7–8)
├── Accounts / Funded Accounts         CONFIRMED (9–11)
├── Withdrawals (list + record)        CONFIRMED (12–13)
├── Scale Events (list empty + add)    CONFIRMED (14–15)
└── Certificates (gallery + detail + add) CONFIRMED (16–18)

Real Accounts
├── Broker Accounts (cards + add account) CONFIRMED (19, 21)
└── Brokers (add form; no dedicated list page seen) CONFIRMED create (20); list page NOT CONFIRMED

Analytics
└── Reports                            CONFIRMED (27)

Settings
├── Account Settings                   CONFIRMED (22–23)
├── Data Management (export/backup/restore) CONFIRMED (24–25)
└── Audit Log                          CONFIRMED (26)
```

## Screens confirmed

| Module | Screen | Evidence | Notes |
| --- | --- | --- | --- |
| Funded | Dashboard | 1–4, 6 | Long scrolling page with Funded + Real + Combined sections |
| Funded | Firms list | 7 | Search, sort, edit/delete |
| Funded | Add Firm | 8 | Name/Website/Notes |
| Funded | Accounts list | 9 | Phase filter; MT5 platform shown as text |
| Funded | Add Account | 10–11 | Firm, sizes, currency, phase, platform |
| Funded | Withdrawals list | 12 | Status filter; Paid rows |
| Funded | Record Withdrawal | 13 | Manual entry; Pending default |
| Funded | Scale Events list | 14 | Empty state only in sample |
| Funded | Add Scale Event | 15 | From/To size + date |
| Funded | Certificate Gallery | 16 | Grid + firm/year filters |
| Funded | Certificate detail | 17 | Linked to withdrawal |
| Funded | Add Certificate | 18 | Image upload tied to withdrawal |
| Real | Broker Accounts | 19 | Cards; snapshots count |
| Real | Add Broker | 20 | Via Broker Accounts flow |
| Real | Add Broker Account | 21 | Starting capital + currency |
| Analytics | Reports | 27 | Funded-focused BI cards |
| Settings | Account Settings | 22–23 | Profile, password, login history |
| Settings | Data Management | 24–25 | Excel export, backup, restore |
| Settings | Audit Log | 26 | Filters + CSV export |

## Entities mentioned but lacking dedicated screens in inventory

| Item | Evidence | Screen status |
| --- | --- | --- |
| Broker deposit / withdrawal ledgers | Export card text “deposits, withdrawals & snapshots” (24) | No dedicated UI screen in inspected set |
| Equity snapshots | “14 snapshots” on broker card (19) | Detail screen not captured |
| Broker detail / list page | Only Add Broker + filter chip | Dedicated Brokers CRUD list **NOT CONFIRMED** |
| Login page | Auth exists (sign-in method, login history) | Login UI **NOT CONFIRMED** in screenshots |
| Broker account detail | “View details →” (19) | Target page **NOT CONFIRMED** |

## Missing screenshot

* `5.png` — unknown content (**UNRESOLVED**)

## Not found as multi-tenant / SaaS admin

* No org switcher, no team invites, no multi-user admin console in screenshots (**CONFIRMED** absence in observed UI)
* Single user email in sidebar footer across shots
