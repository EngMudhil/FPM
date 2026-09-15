# BACKUP

Status: Direction from existing product UI (FPM-002).  
Owner: DevOps + Security + Database.

## Existing product behavior (CONFIRMED UI)

* Generate ZIP: Excel files, raw JSON, certificate images, SQL dump
* Store in object storage
* History: filename, size, status, notes, actions (download/restore/delete)

## Rebuild direction

* Implement via BullMQ job
* Encrypt in transit; private bucket ACLs
* Record Backup entity + audit event
* No production backup automation until authorized task
