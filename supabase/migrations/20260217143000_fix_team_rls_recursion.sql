-- ============================================================================
-- FIX: Infinite Recursion AND Missing Permissions for Owners
-- ============================================================================

-- Problem: 
-- 1. Infinite Recursion: Policy querying itself.
-- 2. Permissions: Company Owners (in profiles table) were not recognized as Admins in the new team table.

-- Solution: 
-- Use SECURITY DEFINER functions to bypass RLS and check BOTH 'companies_team' and 'profiles'.

-- 1. Helper: Get Company IDs I have access to (via Team OR Profile)
CREATE OR REPLACE FUNCTION mvp.get_my_company_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = mvp, public
STABLE
AS $$
    -- IDs from Team table
    SELECT company_id 
    FROM mvp.companies_team 
    WHERE user_id = auth.uid()
    UNION
    -- IDs from Profile (Legacy/Owner)
    SELECT company_id
    FROM mvp.profiles
    WHERE id = auth.uid() AND company_id IS NOT NULL;
$$;

-- 2. Helper: Check if I am Admin (via Team Admin OR Profile Owner)
CREATE OR REPLACE FUNCTION mvp.is_company_admin(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = mvp, public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM mvp.companies_team 
        WHERE user_id = auth.uid() 
        AND company_id = target_company_id 
        AND role = 'admin'
    ) OR EXISTS (
        SELECT 1 
        FROM mvp.profiles 
        WHERE id = auth.uid() 
        AND company_id = target_company_id
        -- We treat any user linked to the company in profiles as an admin/owner for now
    );
$$;

-- 3. Drop Old Policies
DROP POLICY IF EXISTS "Company members can view their team" ON mvp.companies_team;
DROP POLICY IF EXISTS "Company admins can manage team" ON mvp.companies_team;

-- 4. Create New Robust Policies

-- VIEW: I can view rows if they belong to a company I am a member of (or own).
CREATE POLICY "Company members can view their team" 
ON mvp.companies_team FOR SELECT 
USING (
    company_id IN (SELECT mvp.get_my_company_ids())
);

-- MANAGE: I can manage rows if I am an ADMIN (or owner) of that company.
CREATE POLICY "Company admins can manage team" 
ON mvp.companies_team FOR ALL 
USING (
    mvp.is_company_admin(company_id)
);

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION mvp.get_my_company_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION mvp.is_company_admin(UUID) TO authenticated;
