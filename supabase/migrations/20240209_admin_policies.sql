-- ADMIN POLICIES MIGRATION
-- Enables Admin role to view and manage all applications

-- 1. Enable RLS on applications (just in case)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 2. Create Admin Access Policies
-- Admin can view ALL applications
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
CREATE POLICY "Admins can view all applications" 
ON public.applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can update ALL applications
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications" 
ON public.applications 
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can delete ALL applications (Optional but recommended)
DROP POLICY IF EXISTS "Admins can delete applications" ON public.applications;
CREATE POLICY "Admins can delete applications" 
ON public.applications 
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Index for role lookups to improve policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
