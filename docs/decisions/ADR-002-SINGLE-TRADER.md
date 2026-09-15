# ADR-002 — Single-Operator Private System (Workspace-Capable)

Status: Accepted (refined FPM-002A).  
Date: 2026-09-15.

## Context

Screenshots show one operator. Original specification requires a **Workspace** model and roles even for one user, without implying a public multi-tenant SaaS.

## Decision

1. FPM is a **private single-operator** product for CORE MVP — not a multi-tenant SaaS marketplace.  
2. Persist a **Workspace** on all domain records (per Spec). Bootstrap **one workspace** with **OWNER**.  
3. Role model OWNER/ADMIN/MEMBER/VIEWER exists in schema; **members UI is SECONDARY/FUTURE**.  
4. Never trust `workspaceId` from the browser; derive from session membership.

## Consequences

* ADR no longer conflicts with Spec workspace requirement.  
* Multi-tenant billing/org switcher remains out of scope.  
* If true multi-operator collaboration ships, extend members UI without redesigning tenancy.
