-- Add experience_years column to applications table
-- This column is used by the Talent Pool registration form
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;

-- Add german_level and sap_track columns if they don't exist
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS german_level text;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS sap_track text;
