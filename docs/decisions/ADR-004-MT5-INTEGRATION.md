# ADR-004 — MT5 Integration

Status: Accepted as **FUTURE**.  
Date: 2026-09-15 (FPM-002).

## Context

Funded accounts show Platform text such as `MT5`. No live sync UI, credentials, or import jobs appear in screenshots. Core workflow is manual withdrawal entry.

## Decision

* MT5 (and similar) integrations are **out of CORE/SECONDARY MVP**.
* Store platform as optional metadata for now.
* Any future MT5 sync requires a dedicated task + security review and must not block manual recording.

## Consequences

* No MT5 dependencies in early implementation tasks
* Avoid coupling Financial Domain to broker APIs
