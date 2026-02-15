CREATE TABLE IF NOT EXISTS "mvp"."company_registration_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_name" text NOT NULL,
  "contact_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "industry" text,
  "country" text,
  "website" text,
  "status" text DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  "reviewed_by" uuid REFERENCES "auth"."users"("id"), -- Admin who reviewed
  "reviewed_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
