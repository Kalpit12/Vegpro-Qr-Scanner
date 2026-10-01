CREATE TYPE "public"."analytics_event_type" AS ENUM('QR_SCAN', 'PASSPORT_VIEW', 'GALLERY_VIEW', 'SHARE');--> statement-breakpoint
CREATE TYPE "public"."development_stage" AS ENUM('PARENT', 'CROSS', 'SEEDLING', 'TRIAL', 'EVALUATION', 'SELECTED', 'APPROVED', 'COMMERCIAL');--> statement-breakpoint
CREATE TYPE "public"."flower_status" AS ENUM('DRAFT', 'TRIAL', 'EVALUATION', 'APPROVED', 'COMMERCIAL', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."parameter_data_type" AS ENUM('text', 'number', 'decimal', 'boolean', 'date', 'percentage', 'range', 'select');--> statement-breakpoint
CREATE TYPE "public"."source_system" AS ENUM('Demo', 'VegPro');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('PENDING', 'SUCCESS', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'BREEDER', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."variety_relation_type" AS ENUM('PARENT', 'CHILD', 'RELATED', 'PREDECESSOR', 'SUCCESSOR');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "analytics_event_type" NOT NULL,
	"flower_identity_id" uuid,
	"session_hash" text,
	"user_agent" text,
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"previous_value" text,
	"new_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breeding_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flower_record_id" uuid NOT NULL,
	"breeder_notes_internal" text,
	"trial_notes_internal" text,
	"breeding_code" text,
	"public_summary" text,
	"public_visible" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "breeding_records_flower_record_id_unique" UNIQUE("flower_record_id")
);
--> statement-breakpoint
CREATE TABLE "flower_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_identifier" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "flower_identities_public_identifier_unique" UNIQUE("public_identifier")
);
--> statement-breakpoint
CREATE TABLE "flower_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flower_record_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"public_visible" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flower_parameter_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flower_record_id" uuid NOT NULL,
	"parameter_definition_id" uuid NOT NULL,
	"value" text NOT NULL,
	"public_visible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flower_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flower_identity_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"variety_code" text NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"category" text NOT NULL,
	"flower_type" text,
	"short_description" text,
	"description" text,
	"status" "flower_status" DEFAULT 'DRAFT' NOT NULL,
	"development_stage" "development_stage",
	"origin" text,
	"breeder" text,
	"breeding_program" text,
	"breeding_year" integer,
	"public_visible" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"source_system" "source_system" DEFAULT 'Demo' NOT NULL,
	"source_external_id" text NOT NULL,
	"source_last_updated_at" timestamp NOT NULL,
	"source_synchronized_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "flower_records_flower_identity_id_unique" UNIQUE("flower_identity_id")
);
--> statement-breakpoint
CREATE TABLE "parameter_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"category" text NOT NULL,
	"data_type" "parameter_data_type" NOT NULL,
	"unit" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"public_visibility" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parameter_definitions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "source_system" NOT NULL,
	"event_type" text NOT NULL,
	"external_id" text,
	"status" "sync_status" NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"error_message" text,
	"records_changed" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'VIEWER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "variety_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_flower_record_id" uuid NOT NULL,
	"to_flower_record_id" uuid NOT NULL,
	"relation_type" "variety_relation_type" NOT NULL,
	"public_visible" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_flower_identity_id_flower_identities_id_fk" FOREIGN KEY ("flower_identity_id") REFERENCES "public"."flower_identities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_flower_record_id_flower_records_id_fk" FOREIGN KEY ("flower_record_id") REFERENCES "public"."flower_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flower_images" ADD CONSTRAINT "flower_images_flower_record_id_flower_records_id_fk" FOREIGN KEY ("flower_record_id") REFERENCES "public"."flower_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flower_parameter_values" ADD CONSTRAINT "flower_parameter_values_flower_record_id_flower_records_id_fk" FOREIGN KEY ("flower_record_id") REFERENCES "public"."flower_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flower_parameter_values" ADD CONSTRAINT "flower_parameter_values_parameter_definition_id_parameter_definitions_id_fk" FOREIGN KEY ("parameter_definition_id") REFERENCES "public"."parameter_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flower_records" ADD CONSTRAINT "flower_records_flower_identity_id_flower_identities_id_fk" FOREIGN KEY ("flower_identity_id") REFERENCES "public"."flower_identities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variety_relations" ADD CONSTRAINT "variety_relations_from_flower_record_id_flower_records_id_fk" FOREIGN KEY ("from_flower_record_id") REFERENCES "public"."flower_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variety_relations" ADD CONSTRAINT "variety_relations_to_flower_record_id_flower_records_id_fk" FOREIGN KEY ("to_flower_record_id") REFERENCES "public"."flower_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "flower_identities_public_identifier_idx" ON "flower_identities" USING btree ("public_identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "flower_parameter_values_unique_idx" ON "flower_parameter_values" USING btree ("flower_record_id","parameter_definition_id");--> statement-breakpoint
CREATE INDEX "flower_records_identity_idx" ON "flower_records" USING btree ("flower_identity_id");--> statement-breakpoint
CREATE INDEX "flower_records_name_idx" ON "flower_records" USING btree ("name");