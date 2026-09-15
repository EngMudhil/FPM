# THREAT-MODEL

Status: Initial (FPM-002).  
Owner: Security.

## Assets

* Financial history (withdrawals, incomes)
* Certificate images
* Backup archives (full DB dump)
* User credentials / sessions

## Actors

* Legitimate single trader
* Attacker with stolen password
* Attacker with network access to deployment
* Malicious backup ZIP upload

## Top risks (initial)

| Risk | Mitigation direction |
| --- | --- |
| Account takeover | Strong passwords, session timeout, login history, rate limits |
| Destructive restore abuse | Confirmations, authz, audit, optional re-auth |
| Malicious file upload | Type/size checks, scanning RECOMMENDED, isolated storage |
| Backup exfiltration | Private bucket, signed URLs, access logging |
| XSS/CSRF on money actions | Framework defaults + CSRF tokens + Zod validation |

Full STRIDE analysis: FUTURE refinement during auth/backup tasks.
