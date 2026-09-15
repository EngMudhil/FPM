CREATE TYPE "public"."backup_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
--> statement-breakpoint
CREATE TABLE "backup_records" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"filename" text NOT NULL,
	"size_bytes" text NOT NULL,
	"status" "backup_status" DEFAULT 'PENDING' NOT NULL,
	"object_key" text,
	"checksum" text,
	"format_version" text DEFAULT '1' NOT NULL,
	"notes" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "backup_records" ADD CONSTRAINT "backup_records_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "backup_records" ADD CONSTRAINT "backup_records_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "backup_records_workspace_id_idx" ON "backup_records" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "backup_records_created_at_idx" ON "backup_records" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "backup_records_status_idx" ON "backup_records" USING btree ("status");
