# AGENT-RESPONSIBILITIES (confirmed FPM-002A)

Status: Confirmed.  
Owner: Lead.

`.agents/*/AGENT.md` and `.agents/AGENT-OWNERSHIP.md` remain authoritative.

| Agent | FPM-002A emphasis |
| --- | --- |
| Lead | Blueprint authority; open-question escalation; task assignment |
| Architecture | Reconciliation ADRs; boundaries |
| Database | Drizzle schema; lifecycle constraints |
| Financial | Sole calculation authority; refuse invented formulas |
| Backend | Orchestration only for money → call Financial Domain |
| Frontend | Spec IA navigation; no formula authority |
| Security | Auth, uploads, restore confirmations |
| QA | Independent financial tests |
| DevOps | Jobs, storage, backup/restore runtime, deploy |

No agent-system redesign required.
