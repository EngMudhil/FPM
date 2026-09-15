Funded Portfolio Manager — Complete Rebuild Prompt
Build a production-ready web application named Funded Portfolio Manager (FPM). This must be a complete functional system backed by PostgreSQL, not a visual mockup and not a demo with placeholder data.

The product manages:

Prop trading firms
Funded trading accounts
Withdrawal requests and received payouts
Account scaling history
Payout certificates
Real-money brokers and broker accounts
Broker deposits, withdrawals, and equity snapshots
Financial reports and analytics
Authentication, security events, and audit history
Excel exports
Complete backups
Safe, validated, atomic database restores
The system must be responsive, accessible, secure, strongly typed, auditable, and compatible with stateless autoscaling.

1. Technology
Use:

Next.js 15+ App Router
React 19+
strict TypeScript
Tailwind CSS
PostgreSQL
Prisma ORM
Zod for server-side validation
Secure database-backed authentication and sessions
Server Components by default
Client Components only when interaction requires them
Server Actions or Route Handlers for mutations
Recharts or an equivalent accessible chart library
ExcelJS or XLSX for spreadsheet exports
Private object storage for certificates and backup archives
pnpm
Unit/integration tests plus Playwright for critical journeys
Do not rely on local files, SQLite, in-memory sessions, in-memory restore tokens, hardcoded localhost URLs, or client-side authorization. Never use JavaScript floating-point arithmetic for financial totals. Store monetary values as PostgreSQL Decimal values or integer minor units.

Required environment configuration:

DATABASE_URL
AUTH_SECRET
Object-storage configuration
Production application URL when required
Never expose secrets to browser code or logs.

2. Product Goals
The user must be able to:

See total and current funded capital
See active, paused, and closed accounts
Track payout requests and received payouts
Track pending, paid, failed, and reversed withdrawals
Attach payout certificates
Track account scaling
View monthly, quarterly, yearly, and all-time results
Manage real broker capital and equity
Export business data
Generate private, versioned backups
Preview the exact effect of a restore
Restore without partial or silent data loss
Review login activity and a searchable audit trail
Store timestamps in UTC. Calculate report date boundaries in a configurable workspace timezone.

3. Authentication, Workspaces, and Roles
Implement:

Email/password login
Argon2id or bcrypt password hashing
Database-backed sessions
Secure, HttpOnly, SameSite cookies
CSRF protection
Sign-out and session revocation
Session expiry
Generic login errors
Failed login tracking
Temporary IP/account lockout
Rate limits for login, upload, export, backup, restore, and destructive actions
Every dashboard route requires authentication. Every server query and mutation requires authorization.

Use workspaces even if the initial product has one user:

OWNER: full access, members, backup, restore, delete
ADMIN: manage data, export, backup; restore only with permission
MEMBER: create and edit operational data
VIEWER: read-only
Every domain, upload, backup, restore, and audit record must belong to a workspace. Never trust a workspaceId sent by the browser; derive access from the authenticated session.

4. Routes
Public:

/
/login
Authenticated:

/dashboard
/firms
/firms/new
/firms/[id]
/firms/[id]/edit
/accounts
/accounts/new
/accounts/[id]
/accounts/[id]/edit
/withdrawals
/withdrawals/new
/withdrawals/[id]
/withdrawals/[id]/edit
/scale-events
/scale-events/new
/scale-events/[id]
/scale-events/[id]/edit
/certificates
/certificates/new
/certificates/[id]
/certificates/[id]/edit
/broker-accounts
/broker-accounts/new
/broker-accounts/[id]
/broker-accounts/[id]/edit
/broker-accounts/brokers/new
/broker-accounts/brokers/[id]/edit
/reports
/settings
/settings/security
/settings/audit-log
/settings/data-management
/settings/workspace
/settings/members
Operational endpoints:

/health
/data/export/[module]
/data/backup
/data/backup/[id]
/data/restore/validate
/data/restore/diff
/data/restore/confirm
/data/restore/status/[jobId]
/storage/upload-url
/storage/validate
/storage/objects/[...path]
Avoid route conflicts if a separate API service owns /api/*.

5. Navigation and Layout
Desktop:

Sticky left sidebar
Main content area with readable maximum width
Page title, description, breadcrumbs, and primary action
User menu and sign out
Correct active state on nested routes
Navigation groups:

Overview: Dashboard, Reports
Prop Firms: Firms, Funded Accounts, Withdrawals, Scale Events, Certificates
Real Accounts: Broker Accounts
System: Settings
Mobile:

Accessible navigation drawer
No page-level horizontal overflow
One-column forms
Tables may horizontally scroll inside bounded containers or become cards
Dialogs fit the viewport
Primary actions remain easy to reach
6. Design System
Visual style: professional financial operations dashboard; calm, precise, compact, readable, and minimally decorative.

Typography: Inter, Geist, or equivalent.

Page title: 24px, weight 600–700
Section title: 16–18px, weight 600
Metric: 24–32px, weight 600–700
Body: 14px
Table: 13–14px
Supporting text: 12px
Uppercase table headers: 11–12px with tracking
Tokens:

Background: #F8FAFC
Surface: #FFFFFF
Muted surface: #F8FAFC
Hover surface: #F1F5F9
Primary text: #0F172A
Secondary text: #475569
Muted text: #64748B
Disabled text: #94A3B8
Border: #E2E8F0
Strong border: #CBD5E1
Primary blue: #2563EB; hover #1D4ED8; pale #EFF6FF
Success teal: #0D9488; dark #0F766E; pale #F0FDFA
Warning amber: #D97706; dark #B45309; pale #FFFBEB
Danger red: #DC2626; dark #B91C1C; pale #FEF2F2
Use a 4px spacing base: 4, 8, 12, 16, 20, 24, 32, 40, and 48px.

Input/button radius: 8px
Card radius: 12px
Dialog radius: 12–16px
Prefer borders over shadows; reserve shadows for menus, dialogs, and true elevation
Status semantics:

Active/Paid/Complete: teal
Paused/Pending: amber
Closed: gray
Failed: red
Reversed: orange/red
Running/Information: blue
Required reusable components:

AppShell, Sidebar, MobileNavigation
PageHeader, Breadcrumbs
Button and IconButton variants
Card and MetricCard
Badge
DataTable, SortableHeader, Pagination
SearchInput and FilterBar
EmptyState, LoadingSkeleton, ErrorState
FormField, TextInput, NumberInput, CurrencyInput, DateInput, Select, Textarea
FileUpload
Alert
ConfirmationDialog and DestructiveConfirmationDialog
DropdownMenu, Tabs
DetailList, ActivityTimeline
ChartCard
Toast and ProgressIndicator
Tables need loading, empty, error, hover, sort, filter, pagination, responsive, and keyboard-accessible states.

Dashboard activity cards should grow naturally. Do not use arbitrary internal scrolling for Recent Withdrawals or Monthly Payouts; paginate or provide “View all” for genuinely long lists.

Meet WCAG 2.1 AA:

Semantic headings
Explicit labels
Keyboard navigation
Visible focus rings
Modal focus trap and focus return
Escape closes dialogs
Status conveyed by text/icon as well as color
aria-live for saves, uploads, backups, and restores
Reduced-motion support
7. Database Schema
Use cuid or UUID IDs. Add createdAt and updatedAt where appropriate.

Enums:

WorkspaceRole: OWNER, ADMIN, MEMBER, VIEWER
AccountPhase: ACTIVE, PAUSED, CLOSED
WithdrawalStatus: PENDING, PAID, FAILED, REVERSED
LoginEventType: SUCCESS, FAILURE, LOCKOUT
BackupStatus: PENDING, RUNNING, COMPLETE, FAILED
RestoreStatus: VALIDATING, READY, RUNNING, COMPLETE, FAILED, EXPIRED, CANCELLED
Authentication
User:

id, name?, unique email, emailVerified?, image?, hashedPassword?, createdAt, updatedAt
relations to OAuth accounts, sessions, memberships, login events
Account:

id, userId, type, provider, providerAccountId
refreshToken?, accessToken?, expiresAt?, tokenType?, scope?, idToken?, sessionState?
unique provider + providerAccountId
cascade with user
Session:

id, unique sessionToken, userId, expires
indexes on userId and expires
cascade with user
VerificationToken:

identifier, unique token, expires
compound unique identifier + token
Workspaces
Workspace:

id, name, timezone, defaultCurrency, createdAt, updatedAt
WorkspaceMember:

workspaceId, userId, role, createdAt
unique workspaceId + userId
indexes on userId and role
Prop-Firm Domain
Firm:

id, workspaceId, name, website?, notes?, createdAt, updatedAt
unique workspaceId + name
indexes on workspaceId and workspaceId + name
TradingAccount:

id, workspaceId, firmId, accountNumber?, phase
initialSize, currentSize as Decimal or minor-unit integer
currency, platform?, startDate?, notes?, createdAt, updatedAt
indexes on workspaceId, firmId, and workspaceId + phase
cascade with firm
Withdrawal:

id, workspaceId, tradingAccountId
amount as Decimal or minor-unit integer
currency, status, requestedAt, receivedAt?, notes?, createdAt, updatedAt
indexes on workspaceId, tradingAccountId, workspaceId + status, workspaceId + requestedAt
cascade with trading account
ScaleEvent:

id, workspaceId, tradingAccountId
fromSize, toSize as Decimal or minor-unit integer
scaledAt, notes?, createdAt, updatedAt
indexes on workspaceId, tradingAccountId, workspaceId + scaledAt
cascade with trading account
Certificate:

id, workspaceId, withdrawalId, title?, issuedAt?
objectKey?, originalFilename?, mimeType?, sizeBytes?, checksum?, notes?
createdAt, updatedAt
indexes on workspaceId and withdrawalId
cascade with withdrawal
Real Broker Domain
Broker:

id, workspaceId, name, website?, notes?, createdAt, updatedAt
unique workspaceId + name
BrokerAccount:

id, workspaceId, brokerId, accountName, accountNumber?
startingCapital as Decimal or minor-unit integer
currency, startDate?, notes?, createdAt, updatedAt
indexes on workspaceId and brokerId
cascade with broker
BrokerDeposit:

id, workspaceId, brokerAccountId, depositDate
amount as Decimal or minor-unit integer, currency, notes?, createdAt
indexes on workspaceId, brokerAccountId, workspaceId + depositDate
cascade with broker account
BrokerWithdrawal:

id, workspaceId, brokerAccountId, withdrawalDate
amount as Decimal or minor-unit integer, currency, notes?, createdAt
indexes on workspaceId, brokerAccountId, workspaceId + withdrawalDate
cascade with broker account
EquitySnapshot:

id, workspaceId, brokerAccountId, snapshotDate
equity as Decimal or minor-unit integer, currency, notes?, createdAt
unique or indexed brokerAccountId + snapshotDate
index workspaceId + snapshotDate
cascade with broker account
Security and Operations
LoginEvent:

id, userId?, workspaceId?, type, ipAddress?, userAgent?, createdAt
SetNull if user is deleted
indexes on time, type, user, workspace
AuditLog:

id, workspaceId, actorUserId?, action, module, recordType?, recordId?
oldValue JSON?, newValue JSON?, metadata JSON?
ipAddress?, userAgent?, createdAt
indexes on workspace/time, actor, and workspace/action/module
BackupRecord:

id, workspaceId, createdByUserId
filename, sizeBytes BigInt, status, objectKey?, checksum?
formatVersion, notes?, errorMessage?, createdAt, completedAt?
indexes on workspaceId, createdAt, status
RestoreJob:

id, workspaceId, createdByUserId, backupRecordId?, uploadedObjectKey?
status, formatVersion?, manifestChecksum?
preview JSON?, exactDiff JSON?, errorMessage?
expiresAt?, startedAt?, completedAt?, createdAt, updatedAt
indexes on workspaceId, status, expiresAt
Do not use an in-memory pending-restore map.

8. Validation
Use strict Zod schemas for every mutation. Reject unknown keys, invalid dates, NaN, Infinity, invalid enums, excessive text, and unauthorized parent IDs.

Firm name is required and unique within workspace.
Website must be an HTTP/HTTPS URL.
Account sizes are non-negative.
Currency is a valid ISO 4217 code.
Withdrawal amount is positive.
A PAID withdrawal requires receivedAt.
receivedAt cannot precede requestedAt.
Scale toSize must exceed fromSize.
Updating current account size with a scale event occurs in the same transaction.
Certificate MIME type and magic bytes must match.
Certificate upload maximum is 10 MB and enforced server-side/storage-side.
Broker transaction amounts are positive.
Broker transaction currency must match the account unless conversion exists.
Define whether duplicate equity dates are rejected or replaced; never behave ambiguously.
9. Features
Dashboard
Show:

Total funded capital
Current funded capital
Active account count
Total paid withdrawals
Pending withdrawal amount
Current-month payout
Real-account current equity
Real-account net deposits
Account phase distribution
Withdrawal status distribution
Monthly payout trend
Recent withdrawals
Recent scale events
Broker account summary
Quick actions
Firms
Search, sort, paginate, create, view, edit, delete
Detail page with accounts and totals
Destructive confirmation lists affected children
Prefer archiving if historical retention is needed
Funded Accounts
Search account number, firm, and platform
Filter by firm and phase
Sort and paginate
Full CRUD
Detail page includes account data, withdrawals, scale history, total paid, and pending amount
Withdrawals
Search, status/firm/account filters, date range, sorting, pagination
Full CRUD
Requested and received dates
Connected certificates
Audit important status changes
Scale Events
Filter by account, firm, and date
Full CRUD
Show old size, new size, increase, and percentage
Certificates
Private upload, validation, preview, download, metadata edit, and deletion
Delete metadata and stored object safely
Clean up orphaned uploads
Broker Accounts
Manage brokers and accounts
Record deposits, withdrawals, and equity snapshots
Calculate total deposits, total withdrawals, net deposited capital, latest equity, profit/loss, and return percentage
Equity chart and transaction history
Show N/A rather than Infinity when return denominator is zero
Reports
Monthly, quarterly, yearly, and all-time payouts
Count and average payout
Breakdown by status, firm, and account
Account phase distribution
Scaling and funded-capital progression
Broker equity and profit/loss
Deposits versus withdrawals
Date, firm, account, status, and currency filters
Recognized payout totals use PAID withdrawals and receivedAt. Never silently combine currencies. Group by currency or implement explicit exchange-rate conversion with the conversion basis shown.

10. Export
Support Excel exports for all business modules and reports.

Requirements:

Styled header
Autofilter
Frozen header row
Sensible widths
Numeric values stored as numbers
Clear date and currency columns
Human-readable enums
Workspace authorization
Audit event
Formula-injection protection for text beginning with =, +, -, or @
Background jobs or streaming for large exports
11. Backup
Create a versioned ZIP:

metadata.json
manifest.json
json/firms.json
json/accounts.json
json/withdrawals.json
json/scale_events.json
json/certificates.json
json/brokers.json
json/broker_accounts.json
json/broker_deposits.json
json/broker_withdrawals.json
json/equity_snapshots.json
excel/*.xlsx
uploads/certificates/*
database/database_backup.sql

metadata.json includes product, format version, application version, schema version, UTC creation time, workspace, timezone, record counts, file count, total uncompressed size, checksum algorithm, and manifest checksum.

manifest.json lists each path, byte size, SHA-256 checksum, content type, entity, and record count.

Backups must be private and workspace-owned. Never include password hashes, session tokens, OAuth tokens, verification tokens, secrets, or credentials. Never execute SQL from an uploaded backup.

Use durable background jobs and status tracking. Stream large datasets and archives, enforce hard count/size/time limits, record safe failures, and allow retries.

12. Safe Restore
Restoring must never immediately delete current data after upload.

Upload ZIP to private temporary storage and create a persisted, expiring RestoreJob bound to workspace and user.
Enforce compressed size, uncompressed size, and file-count limits.
Prevent ZIP Slip, absolute paths, ../, duplicate paths, unsupported encryption, and unsupported archive entries.
Verify all checksums, including uploads and the manifest.
Validate format/schema versions and explicitly migrate supported older versions.
Strictly validate every entity, type, enum, date, number, duplicate, unique field, parent relation, currency, count, and file reference.
Produce an exact preview showing creates, updates, deletes, unchanged rows, conflicts, invalid references, current counts, and resulting counts.
Generate and verify a pre-restore safety backup. Abort if it fails.
Require restore permission, recent reauthentication, typed RESTORE, and a one-time confirmation token.
Run as a durable background job, not a long-held browser request.
Prefer staging tables/schema, validate staging, then atomically switch.
Otherwise use one database transaction, delete children first, insert parents first, never use skipDuplicates, and fail on unexpected duplicates.
Prevent concurrent restores with an advisory lock or workspace restore lock.
Verify counts, foreign keys, uniqueness, checksums, aggregates, and object references before success.
Never accept an unexpectedly empty result.
On failure, preserve previous data, mark the job failed, release locks, retain the safety backup, and expose a safe diagnostic message.
A timeout, dropped request, process restart, or autoscaling event must not leave the database empty or partially restored.

13. Audit and Security
Audit:

Create, update, delete
Login success, failure, lockout, and sign-out
Export
Upload and object deletion
Backup creation, download, deletion, and failure
Restore validation, preview, confirmation, completion, and failure
Permission and membership changes
Capture actor, workspace, record, timestamp, IP, and user agent. Redact passwords, tokens, secrets, and sensitive fields. Audit records should be durable and append-only for ordinary users.

Security headers:

Content-Security-Policy
Strict-Transport-Security in production
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
Frame protections
Also enforce:

Parameterized ORM queries
Restrictive CORS
Trusted proxy configuration
Safe forwarded-IP handling
DB least privilege
Private storage IAM
Secret rotation
Upload magic-byte validation
No permanent public object URLs
Generic production error responses
Structured server-side error logs without secrets
14. Loading, Errors, and Destructive UX
Every page needs loading, empty, error, success, and permission-denied states.

Disable buttons while submitting
Prevent duplicate submissions
Preserve form values after recoverable errors
Show field-level validation
Use confirmations for destructive operations
Explain cascade effects
Do not use native prompt() for critical confirmation; use an accessible application dialog
Use optimistic updates only when rollback is reliable
15. Performance
Paginate large tables on the server
Select only required columns
Avoid N+1 queries
Add indexes for filters and report dates
Cache only safe read aggregates with correct invalidation
Stream downloads
Do not buffer unbounded uploads, exports, or backups
Use background jobs for large backup, restore, and export work
Keep app instances stateless
Health endpoint returns HTTP 200 without requiring authentication
16. Tests and Acceptance Criteria
Test:

Authentication, logout, expiry, lockout, and unauthorized access
Workspace data isolation
Role enforcement
CRUD for every entity
Cascades or archive behavior
Decimal-safe financial calculations
Report date and currency boundaries
Upload extension/MIME/magic-byte mismatch
Oversized and malformed files
Formula-injection-safe exports
Backup format and checksums
Corrupt, oversized, malicious, and incompatible ZIPs
Restore diff accuracy
Safety-backup failure abort
Restore rollback on insert failure
Timeout/process interruption behavior
Concurrent restore protection
Restore idempotency
No silent duplicate skipping
Audit redaction
Desktop and mobile critical flows
Keyboard and accessibility behavior
Completion requires:

Production build succeeds
Prisma migrations apply cleanly
All routes work
No placeholder production data
No TypeScript errors
No critical accessibility violations
No secrets in client bundles or logs
Health checks pass
Backup round-trip succeeds
Failed restore preserves the original database
Exact restore preview matches committed changes
All financial totals are currency-safe
The app works across mobile, tablet, and desktop widths
Build the system in coherent modules, keep files focused, document setup and deployment, provide a seed command for optional development data, and include a README with environment variables, migrations, backup format, restore process, security assumptions, and operational recovery procedures.
