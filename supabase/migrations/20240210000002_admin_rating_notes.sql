-- Add admin rating and internal notes to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS admin_rating INTEGER CHECK (admin_rating >= 0 AND admin_rating <= 5),
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Index for rating if we want to filter by it later
CREATE INDEX IF NOT EXISTS idx_applications_admin_rating ON public.applications (admin_rating);
