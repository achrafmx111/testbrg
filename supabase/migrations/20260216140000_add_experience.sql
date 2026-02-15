ALTER TABLE "mvp"."talent_profiles" ADD COLUMN IF NOT EXISTS "years_of_experience" integer DEFAULT 0;
ALTER TABLE "mvp"."jobs" ADD COLUMN IF NOT EXISTS "min_experience" integer DEFAULT 0;
