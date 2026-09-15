CREATE TABLE "firms" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"notes" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "firms" ADD CONSTRAINT "firms_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "firms_workspace_id_idx" ON "firms" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "firms_workspace_name_idx" ON "firms" USING btree ("workspace_id","name");
--> statement-breakpoint
CREATE INDEX "firms_archived_at_idx" ON "firms" USING btree ("archived_at");
