-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT, -- Rich text content (HTML or Markdown)
    image_url TEXT,
    
    category TEXT NOT NULL CHECK (category IN ('careers', 'trends', 'mobility', 'news')),
    read_time_minutes INTEGER DEFAULT 5,
    published_date DATE DEFAULT CURRENT_DATE,
    
    is_published BOOLEAN DEFAULT true,
    author_name TEXT DEFAULT 'Bridging Academy Team'
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Allow public (anon) to READ published posts
CREATE POLICY "Allow public read published posts" ON public.blog_posts 
    FOR SELECT USING (is_published = true);

-- 2. Allow authenticated users (service_role/admin) to CRUD
-- We'll add this later when we set up Auth. For now, service_role bypasses RLS.

-- Seed Initial Data (from Blog.tsx)
INSERT INTO public.blog_posts (slug, title, excerpt, category, read_time_minutes, published_date)
VALUES 
(
    'future-sap-careers-2025',
    'The Future of SAP Careers in 2025',
    'Explore the emerging trends and skills that will define SAP professional success in the coming years.',
    'careers',
    8,
    '2024-12-15'
),
(
    's4hana-cloud-guide',
    'S/4HANA Cloud: What You Need to Know',
    'A comprehensive guide to SAP S/4HANA Cloud and why enterprises are making the switch.',
    'trends',
    6,
    '2024-12-10'
),
(
    'germany-visa-relocation',
    'Working in Germany: Visa and Relocation Guide',
    'Everything you need to know about moving to Germany for an SAP career.',
    'mobility',
    12,
    '2024-12-05'
),
(
    'new-partnership-announcement',
    'New Partnership Announcement: Expanding Our Network',
    'We''re excited to announce new partnerships that will benefit our students and graduates.',
    'news',
    4,
    '2024-12-01'
),
(
    'abap-vs-cap',
    'ABAP vs. CAP: Which Development Path to Choose?',
    'Compare traditional ABAP development with the modern Cloud Application Programming model.',
    'trends',
    10,
    '2024-11-28'
),
(
    'success-story-morocco-munich',
    'Success Story: From Morocco to Munich',
    'How one of our graduates landed their dream SAP job in Germany through TalentFlow.',
    'careers',
    5,
    '2024-11-25'
);
