# DEPLOYMENT

Status: Authoritative for FPM-018 MVP deploy path.  
Owner: DevOps + Security review.

## Target topology

```text
Internet → Caddy (TLS) → Next.js (@fpm/web)
                ↘ Postgres 16
                ↘ Redis 7
Private volumes: certificates, backups
```

## Artifacts

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage pnpm build + `next start` |
| `docker-compose.prod.yml` | Caddy + web + Postgres + Redis |
| `deploy/Caddyfile` | TLS reverse proxy + security headers |
| `.env.production.example` | Required env placeholders (no secrets in git) |

## Deploy checklist (VPS)

1. Install Docker Engine + Compose plugin.
2. Clone repo; checkout release tag / `development` as approved.
3. Copy `.env.production.example` → `.env.production` and set strong secrets.
4. Set `FPM_DOMAIN` + `CADDY_ACME_EMAIL` for ACME certificates.
5. `docker compose -f docker-compose.prod.yml up -d --build`
6. Run migrations inside the web network:  
   `docker compose -f docker-compose.prod.yml run --rm web pnpm --filter @fpm/db db:migrate`
7. Seed only for non-prod. Production creates OWNER via controlled bootstrap (no default password in compose).
8. Verify `/api/health`, login, backup create, restore preview (dry).

## Security notes

* Never commit `.env.production`.
* Certificate/backup volumes are private host paths — not publicly served.
* Prefer firewall allowing 80/443 only; Postgres/Redis bound to compose network (no host publish in prod compose).
* Rotate `AUTH_SECRET` only with coordinated session invalidation.

## Deferred / follow-ups

* S3-compatible object storage remains **FUTURE** (ADR-015) — VPS private volumes are production for certs/backups.
* Dedicated worker process for long backup/restore jobs.
* Full `pg_dump` in backup ZIP (SQL placeholder today).
* Observability (metrics/log shipping) and automated CI deploy.
