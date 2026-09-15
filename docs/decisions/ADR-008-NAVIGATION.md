# ADR-008 — Navigation Information Architecture

Status: Accepted (FPM-002A).  
Date: 2026-09-15.

## Context

Screenshots use FUNDED / REAL ACCOUNTS / Reports / Settings. Spec §5 defines Overview / Prop Firms / Real Accounts / System.

## Decision

Rebuild navigation using **Spec groups**, preserving screenshot modules:

* **Overview:** Dashboard, Reports  
* **Prop Firms:** Firms, Funded Accounts, Withdrawals, Scale Events, Certificates  
* **Real Accounts:** Broker Accounts  
* **System:** Settings (security, audit-log, data-management, workspace, members as scoped)

Active state derives from current route. Routes follow Spec §4.

## Consequences

* Screenshot “Accounts” ≡ “Funded Accounts” label.  
* Visual identity (colors/CTAs) still follows screenshot brand + Spec tokens.
