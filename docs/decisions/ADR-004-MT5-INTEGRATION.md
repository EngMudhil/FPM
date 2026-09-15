# ADR-004 — MT5 Integration

Status: Accepted as **FUTURE** (reaffirmed FPM-020 spike).  
Date: 2026-09-15 (FPM-002); spike 2026-09-15 (FPM-020).

## Context

Funded accounts show Platform text such as `MT5`. No live sync UI, credentials, or import jobs appear in screenshots. Core workflow is manual withdrawal entry.

Spike report: [`docs/spikes/MT5-SPIKE-FPM-020.md`](../spikes/MT5-SPIKE-FPM-020.md).

## Decision

* MT5 (and similar) integrations remain **out of CORE/SECONDARY MVP**.
* Store platform as optional metadata for now.
* Any future MT5 sync requires a dedicated task + security review and must not block manual recording.
* FPM-020 spike explicitly **does not authorize** SDKs, credential storage, or sync jobs.

## Consequences

* No MT5 dependencies in MVP implementation
* Avoid coupling Financial Domain to broker APIs
* Revisit only after production-stable CORE + new ADR
