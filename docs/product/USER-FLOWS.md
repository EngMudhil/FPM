# USER-FLOWS

Status: Authored (FPM-002).  
Owner: Lead + Frontend.  
Actors: Single trader (CONFIRMED).

## Flow A — Record a funded withdrawal (CORE)

```text
Dashboard OR Withdrawals
  → + Log Withdrawal / + Record Withdrawal
  → Select Account
  → Enter Amount, Status (Pending/Paid), Requested Date [, Paid Date] [, Notes]
  → Submit
  → Withdrawals list / Dashboard metrics update (INFERRED refresh)
```

**CONFIRMED** screens: 1, 12, 13.

## Flow B — Attach certificate evidence

```text
Certificates → + Add Certificate
  → Select Withdrawal
  → Optional title / issue date / notes
  → Upload image (PNG/JPG/WebP ≤10MB)
  → Submit
  → Gallery / Detail shows link to withdrawal
```

**CONFIRMED** screens: 16–18.

## Flow C — Onboard a prop firm + account

```text
Firms → + Add Firm → Name [, Website] [, Notes] → Create
Accounts → + Add Account → Firm, Phase, Initial/Current Size, Currency [, Platform] …
  → Create
```

**CONFIRMED** screens: 7–11.

## Flow D — Record scale-up

```text
Scale Events → + Add Scale Event
  → Account, From Size, To Size, Scale Date [, Notes]
  → Submit
```

**CONFIRMED** screens: 14–15. (List may be empty.)

## Flow E — Track a real broker account

```text
Broker Accounts → (+ Add Broker if needed) → + Add Account
  → Broker, Name, capital, currency …
  → Card appears on Broker Accounts
  → View details → (detail UNRESOLVED)
```

**CONFIRMED** screens: 19–21.

## Flow F — Review business performance

```text
Dashboard scroll: funded KPIs → charts → recent payouts → real metrics → combined totals
OR Reports: funded BI cards + income by firm/account
```

**CONFIRMED** screens: 1–4, 6, 27.

## Flow G — Export / backup / restore

```text
Settings → Data Management
  → Export module Excel cards
  OR Generate Backup → history row → Download / Restore / Delete
  OR Upload ZIP restore (destructive warning; users/login history preserved)
```

**CONFIRMED** screens: 24–25.

## Flow H — Audit investigation

```text
Settings → Audit Log
  → Filter action/module/date/IP → Apply
  → Inspect JSON details
  → Export CSV
```

**CONFIRMED** screen: 26.

## Flow I — Account security hygiene

```text
Settings → Account Settings
  → Update profile / change password
  → Review login history
  → Sign out from sidebar
```

**CONFIRMED** screens: 22–23.
