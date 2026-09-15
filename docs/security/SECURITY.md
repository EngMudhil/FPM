# SECURITY

Status: Authored direction (FPM-002).  
Owner: Security Agent.  
Threat model details: `THREAT-MODEL.md`.

## Observed from existing UI

* Email/password authentication
* Session timeout policy displayed (2h inactivity)
* Login history with IP / browser / OS
* Sign out
* Backup/restore with destructive warning; users/login history preserved
* Certificate uploads (type/size limits shown)
* Audit log of data changes with IP

## Direction for rebuild

1. Secure password hashing; no plaintext secrets in repo
2. HTTP-only secure cookies / CSRF strategy for mutations
3. Authorize all server actions for the single user session
4. Rate-limit login and restore/backup endpoints
5. Validate upload MIME/size; store outside public web root / use signed URLs
6. Encrypt backups in transit; restrict object storage ACLs
7. Never commit `.env` secrets
8. Security review required for auth, backup/restore, file upload tasks

## Unresolved

* Email verification enforcement
* 2FA
* Exact session store (JWT vs server session)
