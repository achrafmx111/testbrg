-- Phase 7: Education & Gamification

-- 1) Course enrollments (user progress per course)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed')),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_course_enrollments_user_course
    ON public.course_enrollments(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user
    ON public.course_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course
    ON public.course_enrollments(course_id);

-- 2) Course modules (units within a course)
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    content_url TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_course_modules_course_order
    ON public.course_modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_course_modules_course
    ON public.course_modules(course_id);

-- 3) User module completion (tracking finished modules)
CREATE TABLE IF NOT EXISTS public.user_module_completion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_module_completion_user_module
    ON public.user_module_completion(user_id, module_id);

CREATE INDEX IF NOT EXISTS idx_user_module_completion_user
    ON public.user_module_completion(user_id);

CREATE INDEX IF NOT EXISTS idx_user_module_completion_module
    ON public.user_module_completion(module_id);

-- Row Level Security
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_completion ENABLE ROW LEVEL SECURITY;

-- Policies: enrollments (users can manage their own)
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can view own enrollments"
    ON public.course_enrollments
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can insert own enrollments"
    ON public.course_enrollments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can update own enrollments"
    ON public.course_enrollments
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies: modules (public read)
DROP POLICY IF EXISTS "Allow public read course modules" ON public.course_modules;
CREATE POLICY "Allow public read course modules"
    ON public.course_modules
    FOR SELECT
    USING (true);

-- Policies: module completion (users can manage their own)
DROP POLICY IF EXISTS "Users can view own module completion" ON public.user_module_completion;
CREATE POLICY "Users can view own module completion"
    ON public.user_module_completion
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own module completion" ON public.user_module_completion;
CREATE POLICY "Users can insert own module completion"
    ON public.user_module_completion
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own module completion" ON public.user_module_completion;
CREATE POLICY "Users can update own module completion"
    ON public.user_module_completion
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own module completion" ON public.user_module_completion;
CREATE POLICY "Users can delete own module completion"
    ON public.user_module_completion
    FOR DELETE
    USING (auth.uid() = user_id);
