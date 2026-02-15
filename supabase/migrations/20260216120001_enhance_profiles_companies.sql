-- Enhance mvp.profiles
ALTER TABLE "mvp"."profiles" ADD COLUMN IF NOT EXISTS "full_name" text;
ALTER TABLE "mvp"."profiles" ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE "mvp"."profiles" ADD COLUMN IF NOT EXISTS "avatar_url" text;

-- Enhance mvp.companies
ALTER TABLE "mvp"."companies" ADD COLUMN IF NOT EXISTS "website" text;
ALTER TABLE "mvp"."companies" ADD COLUMN IF NOT EXISTS "size" text;
ALTER TABLE "mvp"."companies" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "mvp"."companies" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "mvp"."companies" ADD COLUMN IF NOT EXISTS "logo_url" text;
