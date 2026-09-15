# AGENT-ROLES

Status: Authored (governance).  
Owner: Lead Agent.

Defines the FPM AI agent team. Detailed charters live under `.agents/*/AGENT.md`. Ownership and review requirements live in `.agents/AGENT-OWNERSHIP.md`.

## Team

| Agent | Mission |
| --- | --- |
| **Lead** | Coordination authority: source of truth, task registry, delegation, scope/architecture enforcement, acceptance validation |
| **Architecture** | System architecture, module boundaries, runtime design, ADRs, technology decisions |
| **Database** | PostgreSQL, Drizzle, schema, migrations, constraints, indexes, transactions, DB performance |
| **Financial** | Authoritative financial calculations, invariants, currency/reporting/portfolio metrics |
| **Backend** | Server Actions, route handlers, services, validation, authz enforcement, layer integration |
| **Frontend** | Next.js UI, components, forms, tables, dashboard/reports UI, a11y, design-system use |
| **Security** | Authn/authz security, sessions/cookies/CSRF, secrets, threat model, security review |
| **QA** | Unit/integration/e2e/regression/acceptance/a11y tests; financial correctness; release validation |
| **DevOps** | Codespaces, Docker, CI/CD, Redis/workers plumbing, deployment/monitoring/backup infra |

## Critical separations

* Lead coordinates; specialists implement inside their ownership.
* Financial Domain owns calculation rules; UI must not reimplement them.
* Database owns schema; Financial Domain owns meaning of financial data.
* Security reviews security-sensitive changes; DevOps does not deploy production without an approved task.

## References

* Root rules: `AGENTS.md`
* Ownership matrix: `.agents/AGENT-OWNERSHIP.md`
* Workflow: `docs/agents/AGENT-WORKFLOW.md`
* Task protocol: `docs/agents/TASK-PROTOCOL.md`
