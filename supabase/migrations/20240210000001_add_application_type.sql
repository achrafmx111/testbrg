-- Add type column to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'course_application';

-- Update previous records if they exist (optional)
UPDATE public.applications SET type = 'course_application' WHERE type IS NULL;
