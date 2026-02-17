-- Add user_id to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies
-- 1. Users can view their own applications
CREATE POLICY "Users can view own applications" ON public.applications
FOR SELECT USING (auth.uid() = user_id);

-- 2. Users can update their own applications (optional, maybe for cancelling?)
-- CREATE POLICY "Users can update own applications" ON public.applications
-- FOR UPDATE USING (auth.uid() = user_id);
