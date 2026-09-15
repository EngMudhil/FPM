# DATA-LIFECYCLE

Status: Authoritative (FPM-002B).  
Owner: Database + Lead (+ Financial for money records).  
Sources: Spec §9/§12–13, screenshots, old Replit audit (HB-014…HB-022).

## Principles

1. Historical financial records must not be casually destroyed.  
2. Prefer **archive / void / reverse** over hard delete for money history.  
3. Audit logs are append-only for ordinary users.  
4. Destructive UI requires accessible confirmation (Spec §14).  
5. Cascades must be explained before confirm (Spec Firms).  
6. Old cascade-heavy deletes are **not** automatically preserved (HB-021 → CHANGE).

## Policy by entity

| Entity | Policy | Notes |
| --- | --- | --- |
| User | Restricted | Soft constraints; restore preserves users/login history (screenshot) |
| Session | Hard delete / expiry | Normal session lifecycle |
| Workspace | Restricted | Not casually deleted |
| WorkspaceMember | Hard delete membership | After CORE if multi-member |
| Firm | Archive preferred; hard delete only if no historical children or with cascade confirm | Spec prefers archive; do not silent-cascade destroy history |
| TradingAccount | Archive / phase CLOSED preferred over hard delete | CLOSED is a phase |
| Withdrawal PENDING | Editable; delete allowed with confirm | Pre-recognition |
| Withdrawal PAID | **Restricted** — prefer REVERSED status over delete | Protects income history; PAID does not auto-mutate size/certs (HB-016 PRESERVE) |
| Withdrawal FAILED | Editable/delete with confirm | Operational |
| Withdrawal REVERSED | Restricted further edits | Audit trail |
| ScaleEvent | Create/update/delete may **resync** `currentSize` (HB-014 PRESERVE candidate) | Deleting last event restores `initialSize`; confirm UX required |
| Certificate | Delete metadata + **object** with confirm; orphan cleanup | Fix old incomplete cleanup (HB-018 REMOVE defect) |
| Broker / BrokerAccount | Archive preferred | — |
| BrokerDeposit / BrokerWithdrawal | Restricted; void/corrective entry RECOMMENDED | Old auto-snapshot side effects → OQ-015 |
| EquitySnapshot | Replace-or-reject duplicate dates (must be explicit) | Auto-generation lifecycle → OQ-015/OQ-006 |
| AuditLog | **No deletion** for ordinary users | Append-only |
| LoginEvent | Retain | — |
| BackupRecord | Delete object + metadata with confirm | — |
| RestoreJob | Retain for diagnostics; expire tokens | Spec statuses |

## Scale event size authority (historical + Spec)

Old FPM (HB-014):

```text
TradingAccount.currentSize = latest ScaleEvent.toSize
(no events → initialSize)
```

**NEW FPM candidate/current rule:** preserve this sync behavior, executed transactionally with Spec validations (`toSize` > `fromSize` on create/update).

## Broker snapshot lifecycle (historical — INVESTIGATE)

Old FPM (HB-019/020):

* Auto-created EquitySnapshots on account create (starting capital), deposit, and broker withdrawal  
* Deleting the original transaction did **not** remove the snapshot  

**Open architectural question (OQ-015):**

> Should generated snapshots be immutable historical records, derived records, or regenerated from transactions?

Do not auto-reproduce old behavior until decided.

## Restore lifecycle

Old weak restore (HB-022) is **REMOVE**. NEW restore follows Spec-safe pipeline (see Master Blueprint / ops docs). Certificate **objects** must be included in backup/restore (fix HB-018).

## Screenshot vs Spec

Screenshots expose Delete on many rows. **CURRENT DECISION:** Keep delete affordances only where policy allows; for PAID withdrawals use reverse/void flow instead of silent hard delete.
