-- Phase 9: Candidate Experience Pro Schema

-- 1. Add granular status message for student feedback
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS status_message TEXT;

-- 2. Add Jsonb for tracking missing documents specifically
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS missing_docs JSONB DEFAULT '[]'::jsonb;

-- 3. Add Jsonb for recommended next steps (CTAs)
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS next_steps JSONB DEFAULT '[]'::jsonb;

-- 4. Add flag for withdrawn applications
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS is_withdrawn BOOLEAN DEFAULT false;

-- 5. Add a last_updated_by_admin flag (optional but useful)
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS admin_last_review TIMESTAMP WITH TIME ZONE;
