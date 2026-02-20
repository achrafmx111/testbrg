
-- Consolidate Education Schema to MVP
-- Ensures all tables exist in 'mvp' schema and fixes naming inconsistencies.

CREATE SCHEMA IF NOT EXISTS mvp;

-- 1. COURSES
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

-- 2. LESSONS (Equivalent to course_modules)
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

-- 3. ENROLLMENTS
CREATE TABLE IF NOT EXISTS mvp.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES mvp.courses(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status mvp.enrollment_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(talent_id, course_id)
);

-- 4. ASSESSMENTS
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

-- 5. SUBMISSIONS
CREATE TABLE IF NOT EXISTS mvp.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES mvp.assessments(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INTEGER,
    passed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'submitted', -- submitted, graded
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ENABLE RLS
ALTER TABLE mvp.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp.submissions ENABLE ROW LEVEL SECURITY;

-- SEED MOCK DATA if empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mvp.courses LIMIT 1) THEN
        INSERT INTO mvp.courses (title, level, track, description, duration_hours)
        VALUES 
        ('SAP FI Fundamentals', 'Beginner', 'Finance', 'Learn core SAP Financial Accounting.', 20),
        ('SAP ABAP Development', 'Intermediate', 'Developer', 'Master ABAP programming language.', 40);
        
        INSERT INTO mvp.lessons (course_id, title, "order", content)
        SELECT id, 'Introduction to Module', 1, 'Welcome to the course!' FROM mvp.courses;
    END IF;
END $$;
