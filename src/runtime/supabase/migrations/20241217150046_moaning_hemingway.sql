ALTER TABLE "galaxy"."analysis_ouputs" RENAME TO "analysis_outputs";--> statement-breakpoint
ALTER TABLE "galaxy"."analysis_outputs" DROP CONSTRAINT "analysis_ouputs_dataset_id_job_id_unique";--> statement-breakpoint
ALTER TABLE "galaxy"."analysis_outputs" DROP CONSTRAINT "analysis_ouputs_dataset_id_datasets_id_fk";
--> statement-breakpoint
ALTER TABLE "galaxy"."analysis_outputs" DROP CONSTRAINT "analysis_ouputs_analysis_id_analyses_id_fk";
--> statement-breakpoint
ALTER TABLE "galaxy"."analysis_outputs" DROP CONSTRAINT "analysis_ouputs_job_id_jobs_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_outputs" ADD CONSTRAINT "analysis_outputs_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "galaxy"."datasets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_outputs" ADD CONSTRAINT "analysis_outputs_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "galaxy"."analyses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "galaxy"."analysis_outputs" ADD CONSTRAINT "analysis_outputs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "galaxy"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "galaxy"."analysis_outputs" ADD CONSTRAINT "analysis_outputs_dataset_id_job_id_unique" UNIQUE("dataset_id","job_id");