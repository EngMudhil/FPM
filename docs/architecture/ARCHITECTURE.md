# ARCHITECTURE

Status: Authored (FPM-002).  
Owner: Architecture + Lead.  
Implementation: **not started**.

## Target topology

```text
Internet
   ↓
Caddy
   ↓
Next.js (App Router)
   ↓
Application / Service Layer
   ↓
Financial Domain          ← single authority for calculations
   ↓
PostgreSQL (Drizzle ORM)

Next.js / API
   ↓
Redis
   ↓
BullMQ Worker   (exports, backup, restore, heavy jobs)

Next.js
   ↓
S3-compatible object storage  (certificate images, backup ZIPs)
```

## Application shape

* Monorepo: `apps/web` + `packages/{ui,types,config}` (+ future `packages/financial` **RECOMMENDED**)
* UI calls Server Actions / Route Handlers → services → domain → DB
* No financial formulas in React components

## Key modules (logical)

| Module | Responsibility |
| --- | --- |
| Auth | Sessions, login events |
| Funded | Firms, accounts, withdrawals, scale, certificates |
| Real | Brokers, broker accounts, deposits/withdrawals, snapshots |
| Analytics | Dashboard/report queries via Financial Domain |
| Ops | Export, backup, restore, audit |

## Single-trader deployment

Private instance for one operator (ADR-002). No tenant isolation layer required for MVP.

## References

* `SYSTEM-BOUNDARIES.md`
* `RUNTIME-ARCHITECTURE.md`
* `TECHNOLOGY-DECISIONS.md`
* ADRs 001–004
