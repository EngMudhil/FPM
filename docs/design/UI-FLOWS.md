# UI-FLOWS

Status: Authored (FPM-002).  
Owner: Frontend.  
Companion to `docs/product/USER-FLOWS.md` with UI-centric notes.

## Shared UI pattern for create flows

1. Sidebar parent remains active  
2. Breadcrumb `{Module} / New`  
3. Page title + short subtitle  
4. Single form card  
5. Primary submit (teal) + Cancel  
6. Required fields marked `*`

**CONFIRMED** across Firms, Accounts, Withdrawals, Scale Events, Certificates, Brokers, Broker Accounts.

## Withdrawal logging (primary)

* Entry points: Dashboard `+ Log Withdrawal`; Withdrawals `+ Record Withdrawal`
* Account select shows firm + index + size (**CONFIRMED** example)
* Status defaults Pending
* Paid Date optional

## Certificate attach

* Must select withdrawal first
* Image dropzone with type/size limits
* Detail page shows image + withdrawal linkage

## Empty state

* Scale Events template: icon + title + description + primary CTA

## Settings

* Expandable Settings group
* Account Settings long scroll: profile → password → account meta → login history
* Data Management: export grid → backup → restore
* Audit Log: filter bar → table → CSV

## Unresolved UI flows

* Login page layout
* Broker account detail + snapshot charts
* Edit forms (Edit actions exist; screens not captured)
* Delete confirmation
