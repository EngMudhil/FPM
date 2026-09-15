# SYSTEM-BOUNDARIES

Status: Authored (FPM-002).  
Owner: Architecture.

## Inside the system

* Next.js web application
* Financial Domain library/services
* PostgreSQL data store
* Redis + BullMQ workers
* Object storage for files/backups
* Caddy reverse proxy (production target)

## Outside / integrations

| Integration | Boundary | Status |
| --- | --- | --- |
| Manual user input | Primary data entry | CORE |
| Prop firm portals | External; certificates uploaded as images | Manual |
| MT5 / brokers APIs | External | FUTURE (ADR-004) |
| Email provider | Optional verify/reset | UNRESOLVED |
| S3-compatible storage | Infrastructure dependency | SECONDARY MVP for backup/certs |

## Domain boundaries

```text
UI  ──reads DTOs──►  Application Services  ──►  Financial Domain
                         │
                         ├──► Persistence (Drizzle)
                         └──► Jobs (BullMQ)
```

* **Financial Domain** owns calculations/invariants
* **Database** owns schema/migrations
* **Security** owns authn/authz/session/cookie/CSRF/secrets policies
* **UI** owns presentation only

## Data crossing boundaries

* Withdrawals in → income metrics out (Financial Domain)
* Certificate images in → object storage; metadata in DB
* Backup job → ZIP in object storage; metadata in DB
* Restore job → replaces domain data; preserves users + login history (**CONFIRMED** product behavior)

## Non-boundaries (do not invent)

* Multi-tenant org graph
* Marketplace / billing for FPM itself
