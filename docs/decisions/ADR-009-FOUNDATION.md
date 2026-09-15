# ADR-009 — Identity, Timestamps, Money, Auth Foundation

Status: Accepted (FPM-003).  
Date: 2026-09-15.

## Decisions

### ORM
Drizzle ORM + PostgreSQL (Prisma remains superseded).

### IDs
UUID v4 stored as `text` primary keys (`crypto.randomUUID()`).

### Timestamps
All timestamps are `timestamptz` stored and compared in **UTC**. Application code uses `Date`. Workspace `timezone` is used later for report **calendar** boundaries only (not storage).

### Money (resolves OQ-008)
* PostgreSQL `numeric(20, 8)` for monetary columns in future domain tables  
* Application arithmetic via `decimal.js` (`@fpm/money`)  
* Wire format: `{ amount: string, currency: ISO4217 }`  
* Never use JS `number` for authoritative money math  
* Never silently combine currencies  

### Auth / sessions
* Email/password with **bcryptjs** (cost 12) — resolves OQ-007 choice  
* Database-backed sessions (`sessions` table)  
* HttpOnly cookie `fpm_session`, `SameSite=Lax`, `Secure` in production  
* Default session max age: 2 hours (configurable)

### Workspace
* Every future business row will FK to `workspaces.id`  
* Bootstrap: one workspace + `OWNER` membership  
* Never trust browser-supplied `workspaceId` / `userId`

### Transactions
Use `withTransaction(db, fn)` from `@fpm/db` for multi-step financial mutations.
