CREATE TABLE IF NOT EXISTS "mvp"."invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid REFERENCES "mvp"."companies"("id") ON DELETE CASCADE,
  "amount" numeric NOT NULL,
  "currency" text DEFAULT 'USD',
  "status" text DEFAULT 'DRAFT', -- DRAFT, SENT, PAID, OVERDUE
  "due_date" date,
  "pdf_url" text,
  "created_at" timestamptz DEFAULT now()
);
