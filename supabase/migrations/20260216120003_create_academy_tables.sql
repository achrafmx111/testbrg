CREATE TABLE IF NOT EXISTS "mvp"."lessons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" uuid REFERENCES "mvp"."courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "content" text,
  "video_url" text,
  "order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now()
);
