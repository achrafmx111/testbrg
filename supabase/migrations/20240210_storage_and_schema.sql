-- PHASE 1: STORAGE & SCHEMA UPDATES

-- 1. Create Storage Bucket for Application Documents
-- Note: This requires the storage extension to be enabled (usually enabled by default)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('application-docs', 'application-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Update Applications Table Schema
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS cv_path TEXT,
ADD COLUMN IF NOT EXISTS passport_path TEXT,
ADD COLUMN IF NOT EXISTS cert_path TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_analysis_summary TEXT;

-- 3. Storage Security Policies (RLS)
-- Enable RLS on objects (usually enabled by default for storage)

-- Policy: Users can upload their own documents
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'application-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Users can view their own documents
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'application-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Admins can view ALL documents
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-docs' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Index for AI analysis performance if needed later
CREATE INDEX IF NOT EXISTS idx_applications_ai_analysis ON public.applications USING GIN (ai_analysis);
