CREATE TYPE "public"."restore_job_status" AS ENUM('UPLOADED', 'VALIDATED', 'PREVIEW_READY', 'CONFIRMING', 'RUNNING', 'COMPLETED', 'FAILED', 'EXPIRED');
--> statement-breakpoint
CREATE TABLE "restore_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"backup_record_id" text,
	"uploaded_object_key" text,
	"status" "restore_job_status" DEFAULT 'UPLOADED' NOT NULL,
	"format_version" text,
	"manifest_checksum" text,
	"preview" jsonb,
	"exact_diff" jsonb,
	"error_message" text,
	"confirmation_token" text,
	"expires_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "restore_jobs" ADD CONSTRAINT "restore_jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "restore_jobs" ADD CONSTRAINT "restore_jobs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "restore_jobs" ADD CONSTRAINT "restore_jobs_backup_record_id_backup_records_id_fk" FOREIGN KEY ("backup_record_id") REFERENCES "public"."backup_records"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "restore_jobs_workspace_id_idx" ON "restore_jobs" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "restore_jobs_status_idx" ON "restore_jobs" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "restore_jobs_expires_at_idx" ON "restore_jobs" USING btree ("expires_at");
