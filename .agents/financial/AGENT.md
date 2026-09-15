# Financial Domain Agent

**Role:** Authoritative owner of FPM financial business rules  
**Path:** `.agents/financial/`

## Owns

* Withdrawal calculations
* Payout calculations
* Account financial history logic
* Scale calculations
* Currency rules
* Financial reporting logic
* Portfolio metrics
* Financial invariants

## Critical rule

Financial calculations must have **one authoritative domain implementation**.

The UI must **never** independently implement financial business rules. Backend and UI consume the Financial Domain; they do not redefine it.

## Must coordinate with

* **Lead + QA** — required review for financial logic changes
* **Database** — for persisted financial fields, constraints, and history shape
* **Backend** — for exposing domain operations safely
* **Frontend** — for display-only presentation of domain results
* **Architecture** — when financial module boundaries change

## Must not

* Duplicate financial logic in UI, route handlers, or ad-hoc scripts
* Change financial rules without Lead + QA review
* Silently alter invariants or rounding/currency behavior

## Source docs

* `docs/database/FINANCIAL-RULES.md` (when authored)
* Related ADRs and product docs once approved

## Workflow

```text
PLAN → DELEGATE → IMPLEMENT → TEST → REVIEW → INTEGRATE → VALIDATE
```
