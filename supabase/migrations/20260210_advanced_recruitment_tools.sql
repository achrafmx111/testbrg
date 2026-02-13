-- Phase 8: Advanced Recruitment Tools
-- - Controlled messaging between employer <-> candidate (scoped to shortlist)
-- - Pipeline event log for auditability

-- 1) Controlled messaging (immutable log)
CREATE TABLE IF NOT EXISTS public.recruitment_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('employer', 'candidate')),
    body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_recruitment_messages_thread_time
    ON public.recruitment_messages (employer_id, application_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_messages_application_time
    ON public.recruitment_messages (application_id, created_at DESC);

ALTER TABLE public.recruitment_messages ENABLE ROW LEVEL SECURITY;

-- Only allow messaging when the employer has shortlisted the candidate.
DROP POLICY IF EXISTS "Participants can view recruitment messages" ON public.recruitment_messages;
CREATE POLICY "Participants can view recruitment messages"
    ON public.recruitment_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.employer_favorites f
            WHERE f.employer_id = recruitment_messages.employer_id
              AND f.application_id = recruitment_messages.application_id
        )
        AND (
            auth.uid() = recruitment_messages.employer_id
            OR auth.uid() = (
                SELECT a.user_id FROM public.applications a WHERE a.id = recruitment_messages.application_id
            )
        )
    );

DROP POLICY IF EXISTS "Participants can send recruitment messages" ON public.recruitment_messages;
CREATE POLICY "Participants can send recruitment messages"
    ON public.recruitment_messages
    FOR INSERT
    WITH CHECK (
        recruitment_messages.sender_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.employer_favorites f
            WHERE f.employer_id = recruitment_messages.employer_id
              AND f.application_id = recruitment_messages.application_id
        )
        AND (
            (recruitment_messages.sender_role = 'employer' AND auth.uid() = recruitment_messages.employer_id)
            OR
            (recruitment_messages.sender_role = 'candidate' AND auth.uid() = (
                SELECT a.user_id FROM public.applications a WHERE a.id = recruitment_messages.application_id
            ))
        )
    );

GRANT ALL ON public.recruitment_messages TO authenticated;
GRANT ALL ON public.recruitment_messages TO service_role;

-- 2) Pipeline event log (audit)
CREATE TABLE IF NOT EXISTS public.employer_pipeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_employer_pipeline_events_thread_time
    ON public.employer_pipeline_events (employer_id, application_id, created_at DESC);

ALTER TABLE public.employer_pipeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view pipeline events" ON public.employer_pipeline_events;
CREATE POLICY "Participants can view pipeline events"
    ON public.employer_pipeline_events
    FOR SELECT
    USING (
        auth.uid() = employer_pipeline_events.employer_id
        OR auth.uid() = (
            SELECT a.user_id FROM public.applications a WHERE a.id = employer_pipeline_events.application_id
        )
    );

DROP POLICY IF EXISTS "Employers can insert pipeline events" ON public.employer_pipeline_events;
CREATE POLICY "Employers can insert pipeline events"
    ON public.employer_pipeline_events
    FOR INSERT
    WITH CHECK (
        auth.uid() = employer_pipeline_events.employer_id
    );

GRANT ALL ON public.employer_pipeline_events TO authenticated;
GRANT ALL ON public.employer_pipeline_events TO service_role;
