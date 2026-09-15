# ADR-010 — Certificate private storage (FPM-009)

Status: Accepted.  
Date: 2026-09-15.

## Context

OQ-013 left object storage provider open. Certificates require private storage, MIME+magic-byte validation, 10 MB limit, authz-gated access, and object cleanup on delete.

## Decision

For FPM-009, use **workspace-scoped local filesystem storage** under `CERTIFICATE_STORAGE_PATH` (default `.data/certificates`).

* Objects are never publicly URL-addressable.
* Access only via authenticated route `/api/certificates/[id]/file`.
* Magic-byte validation for PNG/JPEG/WebP; client MIME must match when provided.
* Delete removes DB row **and** object (HB-018 fix).

S3-compatible providers remain the production target and can replace the storage adapter without changing the certificate domain schema (`objectKey`, checksum, mime, size).

## Consequences

* Dev/test needs writable local disk.
* Backup/restore (FPM-016/017) must include this directory / object set.
* OQ-013 production choice for VPS deploy is **local private volumes** (ADR-015); S3-compatible remains FUTURE.
