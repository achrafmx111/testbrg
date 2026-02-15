-- Create interview_requests table in MVP schema for company-talent interview workflow
-- This table tracks interview requests from employers to talents

CREATE TABLE IF NOT EXISTS mvp.interview_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL,
    talent_id UUID NOT NULL REFERENCES mvp.talent_profiles(user_id) ON DELETE CASCADE,
    company_id UUID REFERENCES mvp.companies(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'scheduled', 'completed', 'cancelled'
    notes TEXT,
    admin_notes TEXT,
    proposed_dates TIMESTAMP WITH TIME ZONE[],
    scheduled_at TIMESTAMP WITH TIME ZONE,
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(employer_id, talent_id)
);

-- Enable RLS
ALTER TABLE mvp.interview_requests ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_requests_employer ON mvp.interview_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_talent ON mvp.interview_requests(talent_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_company ON mvp.interview_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_status ON mvp.interview_requests(status);

-- Policies
-- Employers can view their own requests
CREATE POLICY "Employers can view their own interview requests" 
ON mvp.interview_requests FOR SELECT 
USING (employer_id = auth.uid());

-- Employers can create requests
CREATE POLICY "Employers can create interview requests" 
ON mvp.interview_requests FOR INSERT 
WITH CHECK (employer_id = auth.uid());

-- Employers can update their own pending requests
CREATE POLICY "Employers can update their pending interview requests" 
ON mvp.interview_requests FOR UPDATE 
USING (employer_id = auth.uid() AND status = 'pending');

-- Talents can view requests for them
CREATE POLICY "Talents can view their interview requests" 
ON mvp.interview_requests FOR SELECT 
USING (talent_id = auth.uid());

-- Admins can view all requests
CREATE POLICY "Admins can view all interview requests" 
ON mvp.interview_requests FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM mvp.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Admins can update all requests
CREATE POLICY "Admins can update interview requests" 
ON mvp.interview_requests FOR UPDATE 
USING (
    EXISTS (SELECT 1 FROM mvp.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Grant access
GRANT ALL ON mvp.interview_requests TO authenticated;
GRANT ALL ON mvp.interview_requests TO service_role;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION mvp.update_interview_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_interview_requests_updated_at ON mvp.interview_requests;
CREATE TRIGGER update_interview_requests_updated_at
    BEFORE UPDATE ON mvp.interview_requests
    FOR EACH ROW
    EXECUTE FUNCTION mvp.update_interview_requests_updated_at();
