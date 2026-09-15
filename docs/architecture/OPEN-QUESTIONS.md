# OPEN-QUESTIONS

Status: FPM-003 update.  
Owner: Lead (escalation).

| ID | Question | Why it matters | Affected modules | Suggested owner | Blocking? |
| --- | --- | --- | --- | --- | --- |
| OQ-001 | Exact definitions of **total funded capital** vs **current funded capital** | Dashboard/reports | Financial, Dashboard | Financial + Lead | Blocking for those metrics |
| OQ-002 | Approve candidate formulas (portfolio growth, yield, averages, …) | Metric cards | Financial | Financial + Lead | Blocking for those cards |
| OQ-003 | Approve broker P/L and ROI formulas | Real metrics | Financial | Financial + Lead | Blocking for broker ROI/P/L |
| OQ-004 | Trading drawdown formula | Real metrics | Financial | Financial + Lead | Blocking for drawdown |
| OQ-005 | Peak equity definition | Real metrics | Financial | Financial + Lead | Non-blocking if deferred |
| OQ-006 | Duplicate equity snapshot same date: reject vs replace | Data integrity | Database | Database + Lead | Blocking for snapshot write |
| OQ-007 | ~~Argon2id vs bcrypt~~ | — | — | — | **Resolved (FPM-003): bcryptjs** |
| OQ-008 | ~~Decimal vs minor units~~ | — | — | — | **Resolved (FPM-003): numeric(20,8) + decimal.js** |
| OQ-009 | ~~Seed default timezone + currency~~ | — | — | — | **Resolved (FPM-003): UTC + USD seed defaults** |
| OQ-010 | When to ship members UI | Scope | Auth, Settings | Lead | Non-blocking |
| OQ-011 | Missing `5.png` | Possible unknown screen | Design | Lead | Non-blocking |
| OQ-012 | Combined funded+real cards | Dashboard | Financial | Financial + Lead | Non-blocking if deferred |
| OQ-013 | ~~Object storage provider~~ | Certs/backups | DevOps | DevOps + Security | **Partial (FPM-009): local private FS + ADR-010; S3 provider still open for prod** |
| OQ-014 | Restore staging vs single transaction | Restore safety | DevOps, Database | Architecture + DevOps | Blocking for FPM-017 |
| OQ-015 | ~~Broker EquitySnapshot lifecycle~~ | — | — | — | **Resolved (FPM-014 / ADR-012): reject duplicate account+snapshotDate** |
| OQ-016 | ~~Confirm ScaleEvent resync rule~~ | — | — | — | **Resolved (FPM-010 / ADR-011): latest toSize by scaledAt/id; else initialSize; txn with toSize>fromSize** |
| OQ-017 | Inclusive month count for avg/month | Avg/month metric | Financial | Financial + Lead | Blocking if metric shipped |
