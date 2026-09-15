CREATE TABLE "brokers" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broker_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"broker_id" text NOT NULL,
	"account_name" text NOT NULL,
	"account_number" text,
	"starting_capital" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"start_date" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broker_deposits" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"broker_account_id" text NOT NULL,
	"deposit_date" timestamp with time zone NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broker_withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"broker_account_id" text NOT NULL,
	"withdrawal_date" timestamp with time zone NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equity_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"broker_account_id" text NOT NULL,
	"snapshot_date" timestamp with time zone NOT NULL,
	"equity" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brokers" ADD CONSTRAINT "brokers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "broker_accounts" ADD CONSTRAINT "broker_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "broker_accounts" ADD CONSTRAINT "broker_accounts_broker_id_brokers_id_fk" FOREIGN KEY ("broker_id") REFERENCES "public"."brokers"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "broker_deposits" ADD CONSTRAINT "broker_deposits_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "broker_deposits" ADD CONSTRAINT "broker_deposits_broker_account_id_broker_accounts_id_fk" FOREIGN KEY ("broker_account_id") REFERENCES "public"."broker_accounts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "broker_withdrawals" ADD CONSTRAINT "broker_withdrawals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "broker_withdrawals" ADD CONSTRAINT "broker_withdrawals_broker_account_id_broker_accounts_id_fk" FOREIGN KEY ("broker_account_id") REFERENCES "public"."broker_accounts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "equity_snapshots" ADD CONSTRAINT "equity_snapshots_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "equity_snapshots" ADD CONSTRAINT "equity_snapshots_broker_account_id_broker_accounts_id_fk" FOREIGN KEY ("broker_account_id") REFERENCES "public"."broker_accounts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "brokers_workspace_name_unique" ON "brokers" USING btree ("workspace_id","name");
--> statement-breakpoint
CREATE INDEX "brokers_workspace_id_idx" ON "brokers" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "broker_accounts_workspace_id_idx" ON "broker_accounts" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "broker_accounts_broker_id_idx" ON "broker_accounts" USING btree ("broker_id");
--> statement-breakpoint
CREATE INDEX "broker_deposits_workspace_id_idx" ON "broker_deposits" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "broker_deposits_broker_account_id_idx" ON "broker_deposits" USING btree ("broker_account_id");
--> statement-breakpoint
CREATE INDEX "broker_deposits_workspace_deposit_date_idx" ON "broker_deposits" USING btree ("workspace_id","deposit_date");
--> statement-breakpoint
CREATE INDEX "broker_withdrawals_workspace_id_idx" ON "broker_withdrawals" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "broker_withdrawals_broker_account_id_idx" ON "broker_withdrawals" USING btree ("broker_account_id");
--> statement-breakpoint
CREATE INDEX "broker_withdrawals_workspace_withdrawal_date_idx" ON "broker_withdrawals" USING btree ("workspace_id","withdrawal_date");
--> statement-breakpoint
CREATE UNIQUE INDEX "equity_snapshots_account_date_unique" ON "equity_snapshots" USING btree ("broker_account_id","snapshot_date");
--> statement-breakpoint
CREATE INDEX "equity_snapshots_workspace_id_idx" ON "equity_snapshots" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "equity_snapshots_workspace_snapshot_date_idx" ON "equity_snapshots" USING btree ("workspace_id","snapshot_date");
