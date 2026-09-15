# TECHNOLOGY-DECISIONS

Status: Authored (FPM-002).  
Owner: Architecture + Lead.  
Aligns with ADR-001 and FPM-001 foundation.

## Chosen direction

| Layer | Technology | Status |
| --- | --- | --- |
| App framework | Next.js App Router | Foundation present |
| UI | React + TypeScript | Foundation present |
| Styling | Tailwind CSS + shadcn/ui | Tailwind present; shadcn later |
| Forms | React Hook Form + Zod | Later install |
| DB | PostgreSQL + **Drizzle ORM** | Compose Postgres present; Drizzle later — **Prisma SUPERSEDED** |
| Jobs | Redis + BullMQ | Redis compose present; BullMQ later |
| Charts | Recharts | Later |
| Excel | ExcelJS | Later |
| Tests | Vitest + Playwright | Present (smoke) |
| Package manager | pnpm workspaces | Present |
| Containers | Docker / Compose / Codespaces | Present |
| Edge proxy | Caddy | Later deploy |

## Explicitly deferred installs

Do not install feature dependencies until the owning implementation task.

## Rejected for MVP

* Prisma ORM (original spec; superseded by Drizzle — ADR-001)
* Multi-tenant SaaS marketplace
* Client-side financial engines as source of truth
* Mandatory MT5 connectivity for core payout tracking
