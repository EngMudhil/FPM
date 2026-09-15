# AGENT-WORKFLOW

Status: Authored (governance).  
Owner: Lead Agent.

How FPM agents move work from intent to validated completion.

## Standard flow

```text
PLAN
↓
DELEGATE
↓
IMPLEMENT
↓
TEST
↓
REVIEW
↓
INTEGRATE
↓
VALIDATE
```

| Stage | Meaning |
| --- | --- |
| **PLAN** | Clarify task scope, owners, risks, and acceptance criteria |
| **DELEGATE** | Lead assigns work to the owning specialist(s) |
| **IMPLEMENT** | Owner implements only within approved scope |
| **TEST** | QA-aligned tests cover the change; financial logic tested beyond UI where needed |
| **REVIEW** | Required reviewers from the ownership matrix approve |
| **INTEGRATE** | Merge via feature branch → PR → CI → `development` |
| **VALIDATE** | Acceptance criteria confirmed; Lead closes the task |

## Git path

```text
feature/* → Pull Request → CI → Review → development → Release → main
```

No direct commits to `main`.

## Review gates (summary)

See `.agents/AGENT-OWNERSHIP.md` for the full matrix. In particular:

* Architecture → Lead
* Database → Architecture + Lead
* Financial logic → Lead + QA
* Backend → Database/Security + Lead
* Frontend → Lead + QA
* Security → Lead
* Testing → Lead
* Infrastructure → Security + Lead

## Prohibitions

No agent may silently change architecture or product scope, modify another agent's area without coordination, introduce unnecessary dependencies, change financial rules or schema without required reviews, make security-sensitive changes without Security review, or mark work complete without tests and acceptance validation.

## References

* Roles: `docs/agents/AGENT-ROLES.md`
* Tasks: `docs/agents/TASK-PROTOCOL.md`
* Charters: `.agents/*/AGENT.md`
