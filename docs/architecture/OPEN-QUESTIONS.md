# OPEN-QUESTIONS

Status: Updated FPM-021 (Lead financial pack).  
Owner: Lead (escalation).

| ID | Question | Why it matters | Affected modules | Suggested owner | Blocking? |
| --- | --- | --- | --- | --- | --- |
| OQ-001 | ~~Exact definitions of total vs current funded capital~~ | — | — | — | **Resolved (ADR-014): total=SUM(initialSize); current=SUM(currentSize); per currency; non-archived** |
| OQ-002 | ~~Approve candidate formulas~~ | — | — | — | **Resolved (ADR-014): growth, avg payout, avg/month, yield, largest, best month** |
| OQ-003 | ~~Approve broker P/L and ROI~~ | — | — | — | **Resolved (ADR-014): P/L=equity+wd−dep; ROI=P/L÷dep; N/A rules** |
| OQ-004 | ~~Trading drawdown formula~~ | — | — | — | **Resolved (ADR-014): (peak−latest)/peak×100** |
| OQ-005 | ~~Peak equity definition~~ | — | — | — | **Resolved (ADR-014): max equity; tie snapshotDate then id** |
| OQ-006 | ~~Duplicate equity snapshot same date~~ | — | — | — | **Resolved (ADR-012 / OQ-015): reject** |
| OQ-007 | ~~Argon2id vs bcrypt~~ | — | — | — | **Resolved (FPM-003): bcryptjs** |
| OQ-008 | ~~Decimal vs minor units~~ | — | — | — | **Resolved (FPM-003): numeric(20,8) + decimal.js** |
| OQ-009 | ~~Seed default timezone + currency~~ | — | — | — | **Resolved (FPM-003): UTC + USD seed defaults** |
| OQ-010 | When to ship members UI | Scope | Auth, Settings | Lead | **Deferred (post-MVP)** |
| OQ-011 | Missing `5.png` | Possible unknown screen | Design | Lead | **Deferred / ignore** |
| OQ-012 | ~~Combined funded+real cards~~ | — | — | — | **Resolved (ADR-014): same-currency only; else omit** |
| OQ-013 | ~~Object storage provider~~ | Certs/backups | DevOps | DevOps + Security | **Partial (FPM-009): local FS + ADR-010; S3 still open for prod** |
| OQ-014 | ~~Restore staging vs single transaction~~ | — | — | — | **Resolved (FPM-017 / ADR-013)** |
| OQ-015 | ~~Broker EquitySnapshot lifecycle~~ | — | — | — | **Resolved (FPM-014 / ADR-012): reject duplicates** |
| OQ-016 | ~~Confirm ScaleEvent resync rule~~ | — | — | — | **Resolved (FPM-010 / ADR-011)** |
| OQ-017 | ~~Inclusive month count for avg/month~~ | — | — | — | **Resolved (ADR-014): earliest receivedAt UTC month → now UTC month inclusive** |
