-- Phase 8: Revenue & Interaction Pro+ Schema

-- 1. Add subscription_tier to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'; -- 'free', 'pro'

-- 2. Add pipeline_status to employer_favorites
ALTER TABLE public.employer_favorites
ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'shortlisted'; -- 'shortlisted', 'interview_requested', 'hired', 'rejected'

-- 3. Create interview_requests table
CREATE TABLE IF NOT EXISTS public.interview_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'declined'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(employer_id, application_id)
);

-- Enable RLS for interview_requests
ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;

-- Policies for interview_requests
CREATE POLICY "Employers can view their own requests" 
ON public.interview_requests FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create requests" 
ON public.interview_requests FOR INSERT WITH CHECK (auth.uid() = employer_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all interview requests" 
ON public.interview_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Grant Access
GRANT ALL ON public.interview_requests TO authenticated;
GRANT ALL ON public.interview_requests TO service_role;
