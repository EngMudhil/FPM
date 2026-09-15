# Contributing

Thank you for contributing to Funded Portfolio Manager (FPM).

## Branching

- Do **not** commit directly to `main`.
- Create feature branches from `development`:

```text
feature/<short-description>
```

## Workflow

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

## Pull requests

- Link the related task or issue.
- Keep scope limited to the approved task.
- Include tests for implementation work.
- Update documentation when architecture or workflow changes.

## Local checks

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Secrets

Never commit passwords, API keys, tokens, credentials, certificates, or production secrets. Use `.env.example` for placeholders only.

## Agent contributors

Follow `AGENTS.md`.
