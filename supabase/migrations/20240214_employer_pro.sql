-- Phase 7: Employer Experience Pro Schema

-- Add availability to applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Immediate';

-- Add private notes to employer_favorites
ALTER TABLE public.employer_favorites
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update RLS for employer_favorites just in case
-- (Already handled by previous migration, but ensuring clarity)
COMMENT ON COLUMN public.employer_favorites.notes IS 'Private notes added by the employer for this candidate.';

-- Refresh the view if needed (not applicable here as we use tables directly)
