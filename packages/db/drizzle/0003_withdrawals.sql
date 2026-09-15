CREATE TYPE "public"."withdrawal_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'REVERSED');
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"trading_account_id" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"status" "withdrawal_status" DEFAULT 'PENDING' NOT NULL,
	"requested_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_trading_account_id_trading_accounts_id_fk" FOREIGN KEY ("trading_account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "withdrawals_workspace_id_idx" ON "withdrawals" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "withdrawals_trading_account_id_idx" ON "withdrawals" USING btree ("trading_account_id");
--> statement-breakpoint
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "withdrawals_received_at_idx" ON "withdrawals" USING btree ("received_at");
--> statement-breakpoint
CREATE INDEX "withdrawals_requested_at_idx" ON "withdrawals" USING btree ("requested_at");
