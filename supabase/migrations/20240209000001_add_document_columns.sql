-- Migration: Add document storage and AI analysis columns to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS cv_path TEXT,
ADD COLUMN IF NOT EXISTS passport_path TEXT,
ADD COLUMN IF NOT EXISTS cert_path TEXT,
ADD COLUMN IF NOT EXISTS ai_skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_analysis_summary TEXT;

-- Update status check to include 'approved' if it was missing or named differently
-- (Wait, the existing check was status IN ('pending', 'reviewed', 'contacted', 'accepted', 'rejected'))
-- Let's keep it consistent.

COMMENT ON COLUMN public.applications.cv_path IS 'Path to the CV file in Supabase Storage';
COMMENT ON COLUMN public.applications.passport_path IS 'Path to the Passport/ID file in Supabase Storage';
COMMENT ON COLUMN public.applications.cert_path IS 'Path to the Certificates file in Supabase Storage';
COMMENT ON COLUMN public.applications.ai_skills IS 'Extracted skills from CV by AI';
COMMENT ON COLUMN public.applications.ai_analysis_summary IS 'AI generated summary of the applicant suitability';
