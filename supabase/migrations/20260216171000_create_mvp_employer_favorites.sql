-- Create employer_favorites table in MVP schema
-- This table tracks employer favorites/shortlist for talents with pipeline status and notes

CREATE TABLE IF NOT EXISTS mvp.employer_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL,
    talent_id UUID NOT NULL REFERENCES mvp.talent_profiles(user_id) ON DELETE CASCADE,
    company_id UUID REFERENCES mvp.companies(id) ON DELETE CASCADE,
    notes TEXT DEFAULT '',
    pipeline_status TEXT DEFAULT 'shortlisted', -- 'shortlisted', 'interview_requested', 'interviewing', 'offered', 'hired', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(employer_id, talent_id)
);

-- Enable RLS
ALTER TABLE mvp.employer_favorites ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employer_favorites_employer ON mvp.employer_favorites(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_favorites_talent ON mvp.employer_favorites(talent_id);
CREATE INDEX IF NOT EXISTS idx_employer_favorites_company ON mvp.employer_favorites(company_id);
CREATE INDEX IF NOT EXISTS idx_employer_favorites_pipeline ON mvp.employer_favorites(pipeline_status);

-- Policies
-- Employers can view their own favorites
CREATE POLICY "Employers can view their own favorites MVP" 
ON mvp.employer_favorites FOR SELECT 
USING (employer_id = auth.uid());

-- Employers can add their own favorites
CREATE POLICY "Employers can add their own favorites MVP" 
ON mvp.employer_favorites FOR INSERT 
WITH CHECK (employer_id = auth.uid());

-- Employers can update their own favorites (notes and pipeline)
CREATE POLICY "Employers can update their own favorites MVP" 
ON mvp.employer_favorites FOR UPDATE 
USING (employer_id = auth.uid());

-- Employers can delete their own favorites
CREATE POLICY "Employers can delete their own favorites MVP" 
ON mvp.employer_favorites FOR DELETE 
USING (employer_id = auth.uid());

-- Talents can view if they are favorited (optional, for notifications)
CREATE POLICY "Talents can view their favorites MVP" 
ON mvp.employer_favorites FOR SELECT 
USING (talent_id = auth.uid());

-- Admins can view all favorites
CREATE POLICY "Admins can view all favorites MVP" 
ON mvp.employer_favorites FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM mvp.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Grant access
GRANT ALL ON mvp.employer_favorites TO authenticated;
GRANT ALL ON mvp.employer_favorites TO service_role;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION mvp.update_employer_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employer_favorites_updated_at ON mvp.employer_favorites;
CREATE TRIGGER update_employer_favorites_updated_at
    BEFORE UPDATE ON mvp.employer_favorites
    FOR EACH ROW
    EXECUTE FUNCTION mvp.update_employer_favorites_updated_at();
