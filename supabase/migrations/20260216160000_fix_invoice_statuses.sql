-- Migration to standardize invoice statuses
-- 1. Update existing data to match new allowed values
UPDATE "mvp"."invoices"
SET "status" = 'ISSUED'
WHERE "status" IN ('PENDING', 'SENT');

-- 2. Drop existing check constraint if it exists (it might be implicit or named)
-- We'll try to drop the constraint by name if we know it, otherwise we alter column type or add check.
-- Since it was just "text" with no explicit check in previous definitions seen (just comments), 
-- we will add a robust check constraint now.

ALTER TABLE "mvp"."invoices"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

ALTER TABLE "mvp"."invoices"
  ADD CONSTRAINT "invoices_status_check" 
  CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'));
