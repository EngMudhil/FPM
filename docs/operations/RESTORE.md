# RESTORE

Status: Direction from existing product UI (FPM-002).  
Owner: DevOps + Security + Database.

## Existing product behavior (CONFIRMED UI)

* Restore from history or uploaded FPM backup ZIP
* Warning: permanently replaces prop firm accounts, withdrawals, certificates, real broker data
* **Preserves user accounts and login history**

## Rebuild direction

* Explicit confirmation UX (improve over click-only)
* Transactional restore + job status
* Security review mandatory before enabling in production
