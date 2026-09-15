CREATE TABLE "certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"withdrawal_id" text NOT NULL,
	"title" text,
	"issued_at" timestamp with time zone,
	"object_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" text NOT NULL,
	"checksum" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_withdrawal_id_withdrawals_id_fk" FOREIGN KEY ("withdrawal_id") REFERENCES "public"."withdrawals"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "certificates_workspace_id_idx" ON "certificates" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "certificates_withdrawal_id_idx" ON "certificates" USING btree ("withdrawal_id");
