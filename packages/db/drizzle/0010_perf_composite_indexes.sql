-- Composite indexes for hot list/dashboard filters (workspace-scoped sort/filter).
CREATE INDEX IF NOT EXISTS "withdrawals_workspace_requested_at_idx" ON "withdrawals" ("workspace_id","requested_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "withdrawals_workspace_status_idx" ON "withdrawals" ("workspace_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trading_accounts_workspace_archived_idx" ON "trading_accounts" ("workspace_id","archived_at");
