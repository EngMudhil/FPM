# AGENTS.md — Funded Portfolio Manager

Rules for humans and AI development agents working in this repository.

## Project Rule

FPM is developed through controlled tasks. Work only on the assigned task scope.

## Source of Truth

Project documentation and approved requirements are authoritative. Prefer `docs/` and approved task briefs over assumptions.

## Agent Rule

Agents must not silently change architecture or scope. Propose changes explicitly and document approved decisions.

## Git Rule

No direct commits to `main`. Use feature branches and pull requests.

Workflow:

```text
feature/*
   ↓
Pull Request
   ↓
CI
   ↓
Review
   ↓
development
   ↓
Release
   ↓
main
```

## Testing Rule

Every implementation task must include appropriate tests.

## Documentation Rule

Important architectural decisions must be documented (prefer ADRs under `docs/decisions/`).

## Financial Rule

Financial calculations must eventually have one authoritative domain implementation. Do not duplicate financial logic across layers.

## Security Rule

Never commit:

* Passwords
* API keys
* Tokens
* Database credentials
* Private certificates
* Production secrets
* `.env` files containing secrets

Use `.env.example` for non-secret placeholders only.

## Scope Rule

Do not implement features that are not part of an approved task.
