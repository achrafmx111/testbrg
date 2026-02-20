
-- FULL MVP SCHEMA STABILIZATION
-- This script ensures the 'mvp' schema is fully populated with all tables required by the application.

CREATE SCHEMA IF NOT EXISTS mvp;

-- ENUMS
DO $$ BEGIN
    CREATE TYPE mvp.enrollment_status AS ENUM ('ACTIVE', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS mvp.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'TALENT', -- ADMIN, TALENT, COMPANY
    company_id UUID,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TALENT PROFILES
CREATE TABLE IF NOT EXISTS mvp.talent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    languages TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    years_of_experience INTEGER DEFAULT 0,
    readiness_score INTEGER DEFAULT 0,
    coach_rating DECIMAL(3,2) DEFAULT 0,
    availability BOOLEAN DEFAULT TRUE,
    placement_status TEXT DEFAULT 'LEARNING',
    sap_track TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 3. COMPANIES
CREATE TABLE IF NOT EXISTS mvp.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    country TEXT,
    website TEXT,
    size TEXT,
    description TEXT,
    location TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. JOBS
CREATE TABLE IF NOT EXISTS mvp.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES mvp.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    min_experience INTEGER DEFAULT 0,
    location TEXT,
    salary_range TEXT,
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. APPLICATIONS
CREATE TABLE IF NOT EXISTS mvp.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES mvp.jobs(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    stage TEXT DEFAULT 'APPLIED',
    score INTEGER DEFAULT 0,
    admin_rating INTEGER DEFAULT 0,
    admin_notes TEXT,
    status_message TEXT,
    missing_docs TEXT[] DEFAULT '{}',
    next_steps JSONB DEFAULT '{"text": "", "link": ""}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. COURSES & LESSONS
CREATE TABLE IF NOT EXISTS mvp.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    level TEXT,
    track TEXT,
    duration_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mvp.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES mvp.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ENROLLMENTS & ASSESSMENTS
CREATE TABLE IF NOT EXISTS mvp.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES mvp.courses(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    status mvp.enrollment_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(talent_id, course_id)
);

CREATE TABLE IF NOT EXISTS mvp.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES mvp.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    passing_score INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mvp.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES mvp.assessments(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INTEGER,
    passed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'submitted',
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. INVOICES
CREATE TABLE IF NOT EXISTS mvp.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES mvp.companies(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, ISSUED, PAID, OVERDUE
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. INTERVIEW REQUESTS (Modern refined table)
CREATE TABLE IF NOT EXISTS mvp.interview_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES mvp.companies(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES mvp.applications(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES mvp.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, scheduled, completed
    message TEXT,
    proposed_times JSONB DEFAULT '[]'::jsonb,
    confirmed_time TIMESTAMPTZ,
    meeting_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. COMPANY REGISTRATION REQUESTS
CREATE TABLE IF NOT EXISTS mvp.company_registration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. MESSAGES
CREATE TABLE IF NOT EXISTS mvp.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    thread_type TEXT DEFAULT 'DIRECT',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. RECRUITMENT MESSAGES (Employer <-> Candidate Mediated)
CREATE TABLE IF NOT EXISTS mvp.recruitment_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES mvp.applications(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL, -- 'employer', 'candidate'
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review', -- 'pending_review', 'approved_and_sent', 'rejected'
    metadata JSONB DEFAULT '{}'::jsonb,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES mvp.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. APPLICATION ACTIVITY LOGS (Detailed audit trail for recruiters/admins)
CREATE TABLE IF NOT EXISTS mvp.application_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES mvp.applications(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    actor_role TEXT, -- 'admin', 'employer', 'talent'
    actor_id UUID REFERENCES mvp.profiles(id),
    event_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. EMPLOYER FAVORITES
CREATE TABLE IF NOT EXISTS mvp.employer_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES mvp.profiles(id) ON DELETE CASCADE,
    notes TEXT,
    pipeline_status TEXT DEFAULT 'shortlisted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(employer_id, talent_id)
);


-- SCHEMA STABILIZATION REPAIR (Ensures existing tables are updated)
-- Use DO blocks to safely alter existing tables
DO $$ 
BEGIN
    -- Ensure interview_requests FKs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'interview_requests') THEN
        ALTER TABLE mvp.interview_requests DROP CONSTRAINT IF EXISTS interview_requests_talent_id_fkey;
        ALTER TABLE mvp.interview_requests ADD CONSTRAINT interview_requests_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
        
        ALTER TABLE mvp.interview_requests DROP CONSTRAINT IF EXISTS interview_requests_recruiter_id_fkey;
        ALTER TABLE mvp.interview_requests ADD CONSTRAINT interview_requests_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES mvp.profiles(id) ON DELETE SET NULL;
    END IF;

    -- Ensure talent_profiles user_id FK
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'talent_profiles') THEN
        ALTER TABLE mvp.talent_profiles DROP CONSTRAINT IF EXISTS talent_profiles_user_id_fkey;
        ALTER TABLE mvp.talent_profiles ADD CONSTRAINT talent_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Ensure applications talent_id FK
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'applications') THEN
        ALTER TABLE mvp.applications DROP CONSTRAINT IF EXISTS applications_talent_id_fkey;
        ALTER TABLE mvp.applications ADD CONSTRAINT applications_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Ensure enrollments talent_id FK
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'enrollments') THEN
        ALTER TABLE mvp.enrollments DROP CONSTRAINT IF EXISTS enrollments_talent_id_fkey;
        ALTER TABLE mvp.enrollments ADD CONSTRAINT enrollments_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Ensure submissions talent_id FK
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'submissions') THEN
        ALTER TABLE mvp.submissions DROP CONSTRAINT IF EXISTS submissions_talent_id_fkey;
        ALTER TABLE mvp.submissions ADD CONSTRAINT submissions_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Ensure messages FKs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'messages') THEN
        ALTER TABLE mvp.messages DROP CONSTRAINT IF EXISTS messages_from_user_id_fkey;
        ALTER TABLE mvp.messages ADD CONSTRAINT messages_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
        
        ALTER TABLE mvp.messages DROP CONSTRAINT IF EXISTS messages_to_user_id_fkey;
        ALTER TABLE mvp.messages ADD CONSTRAINT messages_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Ensure recruitment_messages FKs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'recruitment_messages') THEN
        ALTER TABLE mvp.recruitment_messages DROP CONSTRAINT IF EXISTS recruitment_messages_employer_id_fkey;
        ALTER TABLE mvp.recruitment_messages ADD CONSTRAINT recruitment_messages_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
        
        ALTER TABLE mvp.recruitment_messages DROP CONSTRAINT IF EXISTS recruitment_messages_sender_id_fkey;
        ALTER TABLE mvp.recruitment_messages ADD CONSTRAINT recruitment_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
        
        ALTER TABLE mvp.recruitment_messages DROP CONSTRAINT IF EXISTS recruitment_messages_reviewed_by_fkey;
        ALTER TABLE mvp.recruitment_messages ADD CONSTRAINT recruitment_messages_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES mvp.profiles(id) ON DELETE SET NULL;
    END IF;

    -- Ensure application_activity_logs FK
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'application_activity_logs') THEN
        ALTER TABLE mvp.application_activity_logs DROP CONSTRAINT IF EXISTS application_activity_logs_actor_id_fkey;
        ALTER TABLE mvp.application_activity_logs ADD CONSTRAINT application_activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES mvp.profiles(id) ON DELETE SET NULL;
    END IF;

    -- Ensure employer_favorites FKs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'mvp' AND table_name = 'employer_favorites') THEN
        ALTER TABLE mvp.employer_favorites DROP CONSTRAINT IF EXISTS employer_favorites_employer_id_fkey;
        ALTER TABLE mvp.employer_favorites ADD CONSTRAINT employer_favorites_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
        
        ALTER TABLE mvp.employer_favorites DROP CONSTRAINT IF EXISTS employer_favorites_talent_id_fkey;
        ALTER TABLE mvp.employer_favorites ADD CONSTRAINT employer_favorites_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES mvp.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- RLS POLICIES (BASIC)
ALTER TABLE mvp.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.interview_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.company_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.recruitment_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.application_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.employer_favorites ENABLE ROW LEVEL SECURITY;

-- SIMPLE OPEN ACCESS FOR MVP DEV (Replace with strict RLS for production)
-- Wrap in a function or separate blocks to avoid "policy already exists" if DROP fails for some reason
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'mvp'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Full access to authenticated users" ON mvp.%I', t);
        EXECUTE format('CREATE POLICY "Full access to authenticated users" ON mvp.%I FOR ALL TO authenticated USING (true)', t);
    END LOOP;
END $$;
