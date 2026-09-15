# PRODUCT

Status: Authored (FPM-002).  
Owner: Lead Agent.

## Confidence legend

* **CONFIRMED** — observed in screenshots or explicit repo decisions
* **INFERRED** — reasonable reading of UI, not proven by written spec
* **RECOMMENDED** — blueprint guidance
* **FUTURE** — explicitly deferred
* **UNRESOLVED** — needs human confirmation or missing source

## Product name

**FPM / FPM Portfolio Manager** (**CONFIRMED** UI branding).  
Repository / project: Funded Portfolio Manager (**CONFIRMED** repo docs).

## Definition

FPM is a **private** financial and portfolio-management system for a **funded/prop trader** to record prop-firm accounts, **manually log withdrawals/payouts**, attach certificate evidence, track scale events, optionally track real broker accounts, and view income/analytics — with export, backup/restore, and audit capabilities.

## Primary workflow (CONFIRMED intent + UI support)

```text
Prop Firm
    ↓
Funded Account
    ↓
Withdrawal / Payout (manual recording CONFIRMED)
    ↓
Automatic Financial Calculations (dashboard/reports aggregates CONFIRMED)
    ↓
Reports / Analytics
    ↓
Certificate / Evidence (linked to withdrawal CONFIRMED)
```

## Product principles

1. **Withdrawal-centric** — manual payout logging is a first-class workflow (Dashboard CTA + Withdrawals module) — **CONFIRMED**.
2. **Single trader** — one user identity in UI; no multi-tenant controls observed — **CONFIRMED** absence + ADR-002.
3. **Automation enhances, does not replace** manual recording — MT5 appears as platform text field today — **CONFIRMED**; live MT5 sync is **FUTURE** (ADR-004).
4. **Evidence matters** — certificates attach to withdrawals with image upload — **CONFIRMED**.
5. **Two capital domains** — Funded vs Real Accounts, plus Combined overview — **CONFIRMED**.

## Primary user

* Single trader / operator (display name + email in settings) — **CONFIRMED**.

## Non-goals (for product identity)

* Multi-tenant SaaS for many unrelated traders — **RECOMMENDED** non-goal (ADR-002).
* Dependency on broker API / MT5 for core payout tracking — **FUTURE** only.

## Source material status

* Written original specification: **missing** (`reference/FPM-Original-Specification.md` placeholder).
* Screenshots: **26 of 27** inspected; `5.png` missing.
