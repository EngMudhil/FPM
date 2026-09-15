# ADR-015 — Post-MVP settings & storage decisions

Status: Accepted.  
Date: 2026-09-15.  
Owner: Lead.

## Context

After FPM-021, open product gaps were:

* **OQ-010** — when to ship Members / Workspace settings UI  
* **OQ-013** — production object storage provider for certificates/backups  
* Security settings page still a placeholder despite Spec routes

## Decisions

### OQ-010 — Ship workspace + members now (FPM-022)

Ship Spec routes `/settings/workspace` and `/settings/members`.

| Capability | Minimum role |
| --- | --- |
| View workspace + members | VIEWER |
| Update workspace name / timezone / default currency | ADMIN |
| Invite member (create local user + membership) | OWNER |
| Change member role / remove member | OWNER |

Rules:

* Single-operator remains the default (ADR-002); multi-member is available when needed.  
* **Cannot** remove or demote the last OWNER.  
* Invite creates a local email/password user (no email provider). Existing users can be added by email if not already members.  
* Role hierarchy matches authz ranks (OWNER > ADMIN > MEMBER > VIEWER).

### OQ-013 — Local private filesystem is production for VPS deploy

For the Caddy + Docker VPS topology (FPM-018), **local private volumes** remain the authoritative storage for certificate objects and backup ZIP files.

* Objects stay non-public; access only via authenticated app routes.  
* Operators must back up host volumes with the database.  
* **S3-compatible storage stays FUTURE** — not required for private single-operator VPS; avoid a half-wired cloud adapter without ops credentials/tests.

This closes OQ-013 for the current deploy path (supersedes “S3 still open for prod” as a blocker). ADR-010 local adapter remains correct.

### Security settings (included in FPM-022)

Replace the Security placeholder with:

* Profile display name  
* Password change (current + new)  
* Recent login events for the signed-in user  

## Consequences

* Navigation adds Workspace + Members under System.  
* OPEN-QUESTIONS marks OQ-010 and OQ-013 resolved.  
* Future S3 work is a new registered task only when off-box object storage is required.
