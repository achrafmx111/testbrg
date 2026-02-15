CREATE TABLE IF NOT EXISTS "mvp"."matches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "job_id" uuid REFERENCES "mvp"."jobs"("id") ON DELETE CASCADE,
  "talent_id" uuid REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "score" numeric,
  "details" jsonb,
  "created_at" timestamptz DEFAULT now(),
  UNIQUE("job_id", "talent_id")
);
