# Funded Portfolio Manager

Private financial/portfolio-management system for a funded trader.

### Current Status

```text
Phase: Repository Foundation
Status: Initial setup
```

### Development

**GitHub Codespaces (recommended)**

1. Open this repository on GitHub.
2. Create a Codespace from the default branch / `development`.
3. Wait for the dev container to finish setup.
4. Run:

```bash
pnpm install
pnpm dev
```

The web app starts at [http://localhost:3000](http://localhost:3000).

**Local development**

Prerequisites: Node.js 20+, pnpm 9+, Docker Desktop.

```bash
pnpm install
docker compose up -d
pnpm dev
```

### Architecture

Application architecture will be documented before feature implementation. See `docs/architecture/` (placeholders until the discovery phase).

### Development Workflow

```text
Task
→ Feature Branch
→ Implementation
→ Tests
→ Pull Request
→ Review
→ Merge
```

See `AGENTS.md` and `CONTRIBUTING.md` for agent and contributor rules.

### Monorepo

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js App Router application |
| `packages/ui` | Shared UI primitives (placeholder) |
| `packages/types` | Shared TypeScript types (placeholder) |
| `packages/config` | Shared TypeScript config |
| `docs/` | Product, architecture, and operations docs |
| `reference/` | Original specification and screenshots |

### Not in this phase

Authentication, dashboard, database schemas, financial calculations, APIs, MT5 integration, and deployment are intentionally not implemented yet.
