CREATE TYPE "public"."account_phase" AS ENUM('ACTIVE', 'PAUSED', 'CLOSED');
--> statement-breakpoint
CREATE TABLE "trading_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"firm_id" text NOT NULL,
	"account_number" text,
	"label" text,
	"phase" "account_phase" DEFAULT 'ACTIVE' NOT NULL,
	"initial_size" numeric(20, 8) NOT NULL,
	"current_size" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"platform" text,
	"start_date" text,
	"notes" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "trading_accounts_workspace_id_idx" ON "trading_accounts" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "trading_accounts_firm_id_idx" ON "trading_accounts" USING btree ("firm_id");
--> statement-breakpoint
CREATE INDEX "trading_accounts_phase_idx" ON "trading_accounts" USING btree ("phase");
--> statement-breakpoint
CREATE INDEX "trading_accounts_archived_at_idx" ON "trading_accounts" USING btree ("archived_at");
