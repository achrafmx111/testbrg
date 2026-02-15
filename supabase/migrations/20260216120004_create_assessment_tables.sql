CREATE TABLE IF NOT EXISTS "mvp"."assessments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" uuid REFERENCES "mvp"."courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "questions" jsonb DEFAULT '[]'::jsonb,
  "passing_score" integer DEFAULT 70,
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "mvp"."submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "assessment_id" uuid REFERENCES "mvp"."assessments"("id") ON DELETE CASCADE,
  "talent_id" uuid REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "score" integer,
  "answers" jsonb,
  "passed" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now()
);
