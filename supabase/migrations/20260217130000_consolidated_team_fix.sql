-- ============================================================================
-- CONSOLIDATED FIX SCRIPT: Company Team & Profiles
-- ============================================================================

-- 1. Ensure `mvp.profiles` has the necessary columns (from previous migration)
--    If these columns are missing, the team query will fail.
ALTER TABLE mvp.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE mvp.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE mvp.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Ensure `mvp.companies_team` exists
CREATE TABLE IF NOT EXISTS mvp.companies_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES mvp.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'recruiter', 'viewer')) DEFAULT 'recruiter',
    status TEXT CHECK (status IN ('active', 'pending', 'invited')) DEFAULT 'active',
    invited_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, user_id),
    UNIQUE(company_id, invited_email)
);

-- 3. Ensure the explicit Foreign Key exists for the relationship
--    This allows PostgREST to join `companies_team` with `profiles` easily
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_companies_team_profiles'
    ) THEN
        ALTER TABLE mvp.companies_team 
        ADD CONSTRAINT fk_companies_team_profiles 
        FOREIGN KEY (user_id) REFERENCES mvp.profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Enable RLS (Security Policies)
ALTER TABLE mvp.companies_team ENABLE ROW LEVEL SECURITY;

-- Re-apply policies (DROP first to avoid errors if they exist)
DROP POLICY IF EXISTS "Company members can view their team" ON mvp.companies_team;
CREATE POLICY "Company members can view their team" 
ON mvp.companies_team FOR SELECT 
USING (
    company_id IN (
        SELECT company_id 
        FROM mvp.companies_team 
        WHERE user_id = auth.uid() OR user_id = (SELECT id FROM auth.users WHERE email = invited_email)
    )
);

DROP POLICY IF EXISTS "Company admins can manage team" ON mvp.companies_team;
CREATE POLICY "Company admins can manage team" 
ON mvp.companies_team FOR ALL 
USING (
    EXISTS (
        SELECT 1 
        FROM mvp.companies_team 
        WHERE user_id = auth.uid() 
        AND company_id = companies_team.company_id 
        AND role = 'admin'
    )
);
