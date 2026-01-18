CREATE TABLE "channel_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"parent_group_id" uuid,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "group_id" uuid;--> statement-breakpoint
ALTER TABLE "channel_groups" ADD CONSTRAINT "channel_groups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_groups" ADD CONSTRAINT "channel_groups_parent_group_id_channel_groups_id_fk" FOREIGN KEY ("parent_group_id") REFERENCES "public"."channel_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channel_groups_org_idx" ON "channel_groups" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "channel_groups_parent_idx" ON "channel_groups" USING btree ("parent_group_id");--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_group_id_channel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."channel_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channels_group_idx" ON "channels" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "message_attachments_message_idx" ON "message_attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_attachments_file_idx" ON "message_attachments" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "messages_user_idx" ON "messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_parent_idx" ON "messages" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_pinned_at_idx" ON "messages" USING btree ("pinned_at");--> statement-breakpoint
CREATE INDEX "organizations_owner_idx" ON "organizations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "personalizations_user_idx" ON "personalizations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "personalizations_org_idx" ON "personalizations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "personalizations_user_org_idx" ON "personalizations" USING btree ("user_id","organization_id");