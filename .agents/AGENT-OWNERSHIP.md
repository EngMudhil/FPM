# Agent Ownership Matrix

Defines who owns each area and which reviews are required before changes merge.

| Area            | Owner        | Required Review          |
| --------------- | ------------ | ------------------------ |
| Product scope   | Lead         | —                        |
| Architecture    | Architecture | Lead                     |
| Database        | Database     | Architecture + Lead      |
| Financial logic | Financial    | Lead + QA                |
| Backend         | Backend      | Database/Security + Lead |
| Frontend        | Frontend     | Lead + QA                |
| Security        | Security     | Lead                     |
| Testing         | QA           | Lead                     |
| Infrastructure  | DevOps       | Security + Lead          |

## Specialist definitions

| Agent        | Definition                         |
| ------------ | ---------------------------------- |
| Lead         | `.agents/lead/AGENT.md`            |
| Architecture | `.agents/architecture/AGENT.md`    |
| Database     | `.agents/database/AGENT.md`        |
| Financial    | `.agents/financial/AGENT.md`       |
| Backend      | `.agents/backend/AGENT.md`         |
| Frontend     | `.agents/frontend/AGENT.md`        |
| Security     | `.agents/security/AGENT.md`        |
| QA           | `.agents/qa/AGENT.md`              |
| DevOps       | `.agents/devops/AGENT.md`          |

## Shared prohibitions

No agent may:

* silently change architecture
* silently change product scope
* modify another agent's owned area without coordination
* introduce unnecessary dependencies
* change financial rules without Financial Domain + Lead review
* change database schema without Database + Lead review
* make security-sensitive changes without Security review
* mark work complete without tests and acceptance validation
