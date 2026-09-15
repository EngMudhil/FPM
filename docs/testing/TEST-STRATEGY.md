# TEST-STRATEGY

Status: Authored direction (FPM-002).  
Owner: QA.

## Layers

1. **Unit** — Financial Domain formulas/invariants (independent of UI)
2. **Integration** — Drizzle repositories, server actions, jobs
3. **E2E** — Playwright critical paths (record withdrawal, attach certificate)
4. **Acceptance** — Task acceptance criteria
5. **A11y** — keyboard/nav/contrast on primary flows
6. **Regression** — export/backup/restore safety

## Rules

* Financial correctness tests must not rely solely on UI assertions
* Every implementation task includes tests (AGENTS.md)
* Tooling: Vitest + Playwright (foundation present)
