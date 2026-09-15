# RUNTIME-ARCHITECTURE

Status: Authored (FPM-002).  
Owner: Architecture + DevOps.

## Local / Codespaces

```text
Developer
  → pnpm dev (Next.js :3000)
  → docker compose: PostgreSQL :5432, Redis :6379
```

Worker process: **RECOMMENDED** separate `pnpm --filter worker dev` when BullMQ introduced (not implemented yet).

## Production target (not deployed in this task)

```text
Clients → Caddy (TLS) → Next.js app
                      → BullMQ worker(s)
Postgres + Redis on host/network
Object storage endpoint for backups/images
```

## Job classes (from UI requirements)

| Job | Trigger | Notes |
| --- | --- | --- |
| Excel export | User click | May be sync initially; async if large |
| Backup ZIP | Generate Backup | Async **RECOMMENDED** |
| Restore | Restore action | Async + locking **RECOMMENDED** |
| Future MT5 sync | FUTURE | — |

## Session runtime

* UI states session timeout 2 hours inactivity (**CONFIRMED** display)
* Enforcement mechanism UNRESOLVED until auth implementation

## Observability (direction)

* App logs + worker logs
* Backup/restore status in DB
* Audit log for data changes
* Deeper APM: FUTURE
