-- PHASE 6: RECRUITMENT PRO UPGRADE

-- 1. Add enhanced fields to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS german_level TEXT,
ADD COLUMN IF NOT EXISTS sap_track TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;

-- 2. Create Application Notes table for collaboration
CREATE TABLE IF NOT EXISTS public.application_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Notes
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- Only Admins can see/manage notes
CREATE POLICY "Admins can manage notes" 
ON public.application_notes
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 3. Create Activity Logs table for tracking and audit
CREATE TABLE IF NOT EXISTS public.application_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g., 'status_changed', 'cv_downloaded', 'note_added'
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store details like old_status, new_status
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Activity Logs
ALTER TABLE public.application_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can see activity logs
CREATE POLICY "Admins can view activity logs" 
ON public.application_activity_logs
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_notes_application_id ON public.application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_activity_application_id ON public.application_activity_logs(application_id);
