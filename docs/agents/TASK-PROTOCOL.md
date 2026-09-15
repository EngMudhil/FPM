# TASK-PROTOCOL

Status: Authored (governance).  
Owner: Lead Agent.

Protocol for creating and completing registered FPM tasks. This document defines the process only; it does not create implementation tasks.

## Principles

1. Work happens only through **registered, approved tasks**.
2. The **Lead Agent** maintains the task registry and coordinates specialists.
3. Repository documentation is project memory; agents do not invent scope.
4. Each task has a clear owner, reviewers, and acceptance criteria.

## Task lifecycle

```text
Propose → Register → Approve scope → Assign owner(s) → Execute workflow → Validate → Close
```

Execution follows `docs/agents/AGENT-WORKFLOW.md`:

```text
PLAN → DELEGATE → IMPLEMENT → TEST → REVIEW → INTEGRATE → VALIDATE
```

## Task brief (minimum fields)

When a task is registered, record at least:

* **ID** (e.g. `FPM-00N`)
* **Title**
* **Goal**
* **In scope / out of scope**
* **Owner agent** (from `.agents/`)
* **Required reviewers** (from `.agents/AGENT-OWNERSHIP.md`)
* **Acceptance criteria**
* **Test expectations**
* **Docs / ADR expectations** (if architecture or rules change)
* **Status** (`proposed` | `approved` | `in_progress` | `in_review` | `done` | `blocked`)

## Assignment rules

* Assign to the **owning specialist** for the primary area of change.
* Lead may split work across agents; integration remains Lead-coordinated.
* Cross-cutting changes must list all required reviewers up front.

## Completion checklist

A task may close only when:

* [ ] Scope was not exceeded
* [ ] Required reviews are done
* [ ] Tests appropriate to the change exist and pass
* [ ] Acceptance criteria are met
* [ ] Required documentation/ADRs are updated
* [ ] No secrets were introduced
* [ ] Integration path used feature branch + PR (no direct `main` commits)

## Explicitly out of this protocol doc

Creating the master blueprint, product analysis, schemas, features, or deployment tasks is **not** done here—those require separate approved tasks.

## References

* Root rules: `AGENTS.md`
* Roles: `docs/agents/AGENT-ROLES.md`
* Workflow: `docs/agents/AGENT-WORKFLOW.md`
* Ownership: `.agents/AGENT-OWNERSHIP.md`
