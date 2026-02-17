-- ============================================================================
-- MASTER SCHEMA SYNC SCRIPT
-- Run this to ensure your database has ALL tables and columns required by the app.
-- It is safe to run multiple times (Idempotent).
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS mvp;

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS mvp.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhance Companies (from 20260216120001)
ALTER TABLE mvp.companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE mvp.companies ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE mvp.companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE mvp.companies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE mvp.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS mvp.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role mvp.role NOT NULL,
    company_id UUID REFERENCES mvp.companies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhance Profiles (from 20260216120001)
ALTER TABLE mvp.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE mvp.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE mvp.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. JOBS
CREATE TABLE IF NOT EXISTS mvp.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES mvp.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    location TEXT,
    salary_range TEXT,
    status mvp.job_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhance Jobs (from 20260216140000)
ALTER TABLE mvp.jobs ADD COLUMN IF NOT EXISTS min_experience INTEGER DEFAULT 0;

-- 4. APPLICATIONS
CREATE TABLE IF NOT EXISTS mvp.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES mvp.jobs(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage mvp.application_stage NOT NULL DEFAULT 'APPLIED',
    score DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(job_id, talent_id)
);

-- 5. TALENT PROFILES
CREATE TABLE IF NOT EXISTS mvp.talent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  bio text,
  languages jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  readiness_score double precision not null default 0,
  coach_rating double precision not null default 0,
  availability boolean not null default true,
  placement_status mvp.placement_status not null default 'LEARNING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enhance Talent Profiles (from 20260216140000)
ALTER TABLE mvp.talent_profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

-- 6. INTERVIEWS
CREATE TABLE IF NOT EXISTS mvp.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES mvp.applications(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. INVOICES
CREATE TABLE IF NOT EXISTS mvp.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES mvp.companies(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. COMPANIES TEAM (The new one)
CREATE TABLE IF NOT EXISTS mvp.companies_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES mvp.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'recruiter', 'viewer')) DEFAULT 'recruiter',
    status TEXT CHECK (status IN ('active', 'pending', 'invited')) DEFAULT 'active',
    invited_email TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, user_id),
    UNIQUE(company_id, invited_email)
);

-- Fix Foreign Key for Team (Important!)
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

-- 9. MESSAGES & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS mvp.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mvp.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    thread_type TEXT NOT NULL DEFAULT 'DIRECT',
    body TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. ENABLE RLS ON ALL TABLES
ALTER TABLE mvp.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.companies_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.messages ENABLE ROW LEVEL SECURITY;

-- 11. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA mvp TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA mvp TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA mvp TO anon, authenticated, service_role;
