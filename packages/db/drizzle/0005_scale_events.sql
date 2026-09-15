CREATE TABLE "scale_events" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"trading_account_id" text NOT NULL,
	"from_size" numeric(20, 8) NOT NULL,
	"to_size" numeric(20, 8) NOT NULL,
	"scaled_at" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scale_events" ADD CONSTRAINT "scale_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "scale_events" ADD CONSTRAINT "scale_events_trading_account_id_trading_accounts_id_fk" FOREIGN KEY ("trading_account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "scale_events_workspace_id_idx" ON "scale_events" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "scale_events_trading_account_id_idx" ON "scale_events" USING btree ("trading_account_id");
--> statement-breakpoint
CREATE INDEX "scale_events_workspace_scaled_at_idx" ON "scale_events" USING btree ("workspace_id","scaled_at");
