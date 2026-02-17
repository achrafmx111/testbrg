-- Create companies_team table in mvp schema, assuming companies is in mvp.
CREATE TABLE IF NOT EXISTS mvp.companies_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES mvp.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'recruiter', 'viewer')) DEFAULT 'recruiter',
    status TEXT CHECK (status IN ('active', 'pending', 'invited')) DEFAULT 'active',
    invited_email TEXT, -- For pending invites where user might not exist yet
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, user_id),
    UNIQUE(company_id, invited_email)
);

-- Enable RLS
ALTER TABLE mvp.companies_team ENABLE ROW LEVEL SECURITY;

-- Allow company members to view their own team
CREATE POLICY "Company members can view their team" 
ON mvp.companies_team FOR SELECT 
USING (
    company_id IN (
        SELECT company_id 
        FROM mvp.companies_team 
        WHERE user_id = auth.uid() OR user_id = (SELECT id FROM auth.users WHERE email = invited_email)
    )
);

-- Allow company admins to manage team
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
