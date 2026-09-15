# AGENTS.md — Funded Portfolio Manager

Rules for humans and AI development agents working in this repository.

## Coordination

The **Lead Agent** (`.agents/lead/AGENT.md`) coordinates the project. Specialist agents have defined ownership under `.agents/` and `.agents/AGENT-OWNERSHIP.md`.

Repository documentation (`docs/`, ADRs, approved requirements) is the project memory and source of truth.

## Project Rule

FPM is developed through controlled, registered tasks. Work only on assigned task scope.

## Agent Rule

Agents must not silently change architecture or scope. Architectural changes require review. Propose changes explicitly and document approved decisions.

## Ownership Rule

Do not modify another agent's owned area without coordination. See `.agents/AGENT-OWNERSHIP.md`.

## Financial Rule

Financial calculations have one authoritative Financial Domain implementation (`.agents/financial/AGENT.md`). UI and other layers must not independently implement financial business rules.

## Git Rule

No direct commits to `main`. Use feature branches and pull requests.

```text
feature/* → Pull Request → CI → Review → development → Release → main
```

## Testing Rule

Completed work requires appropriate tests and acceptance validation. Every implementation task must include tests.

## Documentation Rule

Important architectural decisions must be documented (prefer ADRs under `docs/decisions/`).

## Security Rule

Never commit passwords, API keys, tokens, database credentials, private certificates, production secrets, or `.env` files containing secrets. Use `.env.example` for placeholders only.

## Scope Rule

Do not implement features that are not part of an approved task.
