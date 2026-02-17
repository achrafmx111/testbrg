-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Applicant Details
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    country_city TEXT,
    
    -- Course Details
    course_slug TEXT NOT NULL,
    course_name TEXT NOT NULL,
    learning_mode TEXT, -- online, onsite, hybrid
    
    -- Additional Info
    message TEXT,
    extra_fields JSONB DEFAULT '{}'::jsonb, -- Store dynamic fields here
    
    -- Status Tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'contacted', 'accepted', 'rejected')),
    notes TEXT
);

-- Create contacts table (for general inquiries)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT, -- e.g., "Business Partnership", "General Inquiry"
    message TEXT NOT NULL,
    
    -- Meta
    role TEXT, -- talent_career, business_partnerships
    organization_name TEXT, -- for business
    website TEXT, -- for business
    
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'))
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Allow anyone (anon) to INSERT (submit forms)
CREATE POLICY "Allow anon to insert applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon to insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);

-- 2. Allow only authenticated users (service_role/admin) to SELECT/UPDATE
-- Note: By default, if no policy enables SELECT, no one can see rows. 
-- We will rely on the dashboard (which uses service_role) to view data.
