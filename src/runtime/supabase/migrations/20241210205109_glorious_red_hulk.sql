CREATE SCHEMA "galaxy";
--> statement-breakpoint
CREATE TYPE "galaxy"."dataset_state" AS ENUM('ok', 'empty', 'error', 'discarded', 'failed_metadata', 'new', 'upload', 'queued', 'running', 'paused', 'setting_metadata', 'deferred');--> statement-breakpoint
CREATE TYPE "galaxy"."history_state" AS ENUM('new', 'upload', 'queued', 'running', 'ok', 'empty', 'error', 'paused', 'setting_metadata', 'failed_metadata', 'deferred', 'discarded');--> statement-breakpoint
CREATE TYPE "galaxy"."invocation_state" AS ENUM('cancelled', 'failed', 'scheduled', 'new', 'ready', 'cancelling');--> statement-breakpoint
CREATE TYPE "galaxy"."job_state" AS ENUM('deleted', 'deleting', 'error', 'ok', 'new', 'resubmitted', 'upload', 'waiting', 'queued', 'running', 'failed', 'paused', 'stop', 'stopped', 'skipped');--> statement-breakpoint
CREATE TYPE "galaxy"."role_permissions_type" AS ENUM('workflows.insert', 'workflows.delete', 'instances.insert', 'instances.delete');--> statement-breakpoint
CREATE TYPE "galaxy"."role_type" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"state" "galaxy"."invocation_state" NOT NULL,
	"parameters" json NOT NULL,
	"datamap" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"owner_id" uuid NOT NULL,
	"history_id" integer NOT NULL,
	"workflow_id" integer NOT NULL,
	"galaxy_id" varchar(256) NOT NULL,
	"stderr" text,
	"stdout" text,
	"invocation" json NOT NULL,
	"is_sync" boolean DEFAULT false NOT NULL,
	CONSTRAINT "analyses_history_id_unique" UNIQUE("history_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."analysis_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" "galaxy"."dataset_state" NOT NULL,
	"dataset_id" integer NOT NULL,
	"analysis_id" integer NOT NULL,
	CONSTRAINT "analysis_inputs_dataset_id_unique" UNIQUE("dataset_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."analysis_ouputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" "galaxy"."dataset_state" NOT NULL,
	"dataset_id" integer NOT NULL,
	"analysis_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	CONSTRAINT "analysis_ouputs_dataset_id_job_id_unique" UNIQUE("dataset_id","job_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."datasets" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"history_id" integer NOT NULL,
	"storage_object_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"uuid" uuid NOT NULL,
	"extension" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"data_lines" integer,
	"dataset_name" varchar(256) NOT NULL,
	"galaxy_id" varchar(256) NOT NULL,
	"annotation" varchar(200),
	CONSTRAINT "datasets_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "datasets_history_id_galaxy_id_unique" UNIQUE("history_id","galaxy_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."datasets_to_tags" (
	"dataset_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "datasets_to_tags_dataset_id_tag_id_pk" PRIMARY KEY("dataset_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" "galaxy"."history_state" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"owner_id" uuid NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_sync" boolean DEFAULT false NOT NULL,
	"galaxy_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"annotation" varchar(200)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(256) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "instances_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" "galaxy"."job_state" NOT NULL,
	"tool_id" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"exit_code" integer,
	"stdout" text,
	"stderr" text,
	"owner_id" uuid NOT NULL,
	"galaxy_id" varchar(256) NOT NULL,
	"step_id" integer NOT NULL,
	"analysis_id" integer NOT NULL,
	"is_sync" boolean DEFAULT false NOT NULL,
	CONSTRAINT "jobs_galaxy_id_unique" UNIQUE("galaxy_id"),
	CONSTRAINT "jobs_galaxy_id_analysis_id_unique" UNIQUE("galaxy_id","analysis_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"permission" "galaxy"."role_permissions_type" NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "role_permissions_permission_role_id_unique" UNIQUE("permission","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "galaxy"."role_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(75) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."uploaded_datasets" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text,
	"storage_object_id" uuid NOT NULL,
	CONSTRAINT "uploaded_datasets_storage_object_id_unique" UNIQUE("storage_object_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_unique" UNIQUE("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(100) NOT NULL,
	"instance_id" integer NOT NULL,
	CONSTRAINT "user_email_instance_id_unique" UNIQUE("email","instance_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"user_id" integer NOT NULL,
	"definition" json NOT NULL,
	"galaxy_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"annotation" varchar(200),
	CONSTRAINT "workflows_galaxy_id_version_unique" UNIQUE("galaxy_id","version")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "galaxy"."workflows_to_tags" (
	"workflow_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "workflows_to_tags_workflow_id_tag_id_pk" PRIMARY KEY("workflow_id","tag_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analyses" ADD CONSTRAINT "analyses_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analyses" ADD CONSTRAINT "analyses_history_id_histories_id_fk" FOREIGN KEY ("history_id") REFERENCES "galaxy"."histories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analyses" ADD CONSTRAINT "analyses_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "galaxy"."workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_inputs" ADD CONSTRAINT "analysis_inputs_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "galaxy"."datasets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_inputs" ADD CONSTRAINT "analysis_inputs_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "galaxy"."analyses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_ouputs" ADD CONSTRAINT "analysis_ouputs_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "galaxy"."datasets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_ouputs" ADD CONSTRAINT "analysis_ouputs_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "galaxy"."analyses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_ouputs" ADD CONSTRAINT "analysis_ouputs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "galaxy"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."datasets" ADD CONSTRAINT "datasets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."datasets" ADD CONSTRAINT "datasets_history_id_histories_id_fk" FOREIGN KEY ("history_id") REFERENCES "galaxy"."histories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."datasets" ADD CONSTRAINT "datasets_storage_object_id_objects_id_fk" FOREIGN KEY ("storage_object_id") REFERENCES "storage"."objects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."datasets_to_tags" ADD CONSTRAINT "datasets_to_tags_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "galaxy"."datasets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."datasets_to_tags" ADD CONSTRAINT "datasets_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "galaxy"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."histories" ADD CONSTRAINT "histories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "galaxy"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."histories" ADD CONSTRAINT "histories_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."jobs" ADD CONSTRAINT "jobs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."jobs" ADD CONSTRAINT "jobs_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "galaxy"."analyses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "galaxy"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."uploaded_datasets" ADD CONSTRAINT "uploaded_datasets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."uploaded_datasets" ADD CONSTRAINT "uploaded_datasets_storage_object_id_objects_id_fk" FOREIGN KEY ("storage_object_id") REFERENCES "storage"."objects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "galaxy"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."user" ADD CONSTRAINT "user_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "galaxy"."instances"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."workflows" ADD CONSTRAINT "workflows_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "galaxy"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."workflows_to_tags" ADD CONSTRAINT "workflows_to_tags_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "galaxy"."workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."workflows_to_tags" ADD CONSTRAINT "workflows_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "galaxy"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE VIEW "galaxy"."datasets_with_storage_path" AS (select "galaxy"."datasets"."id", "galaxy"."datasets"."owner_id", "galaxy"."datasets"."history_id", "galaxy"."datasets"."storage_object_id", "galaxy"."datasets"."created_at", "galaxy"."datasets"."uuid", "galaxy"."datasets"."extension", "galaxy"."datasets"."file_size", "galaxy"."datasets"."data_lines", "galaxy"."datasets"."dataset_name", "galaxy"."datasets"."galaxy_id", "galaxy"."datasets"."annotation", "storage"."objects"."name" from "galaxy"."datasets" inner join "storage"."objects" on "galaxy"."datasets"."storage_object_id" = "storage"."objects"."id");