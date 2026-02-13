-- Fix Courses Table Permissions
-- Run this if "Select Course" is empty or returning 404

-- 1. Ensure RLS is enabled
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;

-- 3. Create Public Read Policy
CREATE POLICY "Allow public read access to courses"
ON public.courses
FOR SELECT
USING (true);

-- 4. Grant access to anon and authenticated roles (just in case)
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.courses TO authenticated;
GRANT SELECT ON public.courses TO service_role;
