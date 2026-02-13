
-- Create employer_favorites table
CREATE TABLE IF NOT EXISTS public.employer_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(employer_id, application_id)
);

-- Enable Row Level Security
ALTER TABLE public.employer_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for employer_favorites
-- 1. Employers can view their own favorites
CREATE POLICY "Employers can view their own favorites" 
ON public.employer_favorites 
FOR SELECT 
USING (auth.uid() = employer_id);

-- 2. Employers can add their own favorites
CREATE POLICY "Employers can add their own favorites" 
ON public.employer_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = employer_id);

-- 3. Employers can remove their own favorites
CREATE POLICY "Employers can delete their own favorites" 
ON public.employer_favorites 
FOR DELETE 
USING (auth.uid() = employer_id);

-- Grant access to authenticated users
GRANT ALL ON public.employer_favorites TO authenticated;
GRANT ALL ON public.employer_favorites TO service_role;
