# ADR-003 — Withdrawal-Centric Workflow

Status: Accepted.  
Date: 2026-09-15 (FPM-002).

## Context

Existing UI centers on logging payouts: Dashboard `+ Log Withdrawal`, Withdrawals module, income metrics from paid payouts, certificates attached to withdrawals.

## Decision

1. **Manual withdrawal/payout recording is a core workflow** and must remain available.
2. Funded income analytics are derived from withdrawal records (paid vs pending rules finalized by Financial Domain with Lead/QA).
3. Automation (imports, MT5) may assist but must not remove manual entry.

## Consequences

* Withdrawal entity is central to data model
* Certificates reference withdrawals
* Dashboard CTAs prioritize recording payouts
