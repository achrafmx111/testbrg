
-- Create lessons table in mvp schema
create table if not exists mvp.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references mvp.courses(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create assessments table in mvp schema
create table if not exists mvp.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references mvp.courses(id) on delete cascade,
  title text not null,
  description text,
  questions jsonb not null default '[]'::jsonb,
  passing_score integer not null default 70,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create submissions table in mvp schema
create table if not exists mvp.submissions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references mvp.assessments(id) on delete cascade,
  talent_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score integer,
  status text default 'submitted', -- submitted, graded
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table mvp.lessons enable row level security;
alter table mvp.assessments enable row level security;
alter table mvp.submissions enable row level security;

-- Policies for lessons
create policy "Admins can manage lessons"
  on mvp.lessons
  for all
  using (mvp.is_admin());

drop policy if exists "Talents can view lessons" on mvp.lessons;
create policy "Talents can view lessons"
  on mvp.lessons
  for select
  using (mvp.current_role() = 'TALENT'::mvp.role OR mvp.is_admin());

-- Policies for assessments
create policy "Admins can manage assessments"
  on mvp.assessments
  for all
  using (mvp.is_admin());

create policy "Talents can view assessments"
  on mvp.assessments
  for select
  using (mvp.current_role() = 'TALENT'::mvp.role OR mvp.is_admin());

-- Policies for submissions
create policy "Admins can manage submissions"
  on mvp.submissions
  for all
  using (mvp.is_admin());

create policy "Talents can view own submissions"
  on mvp.submissions
  for select
  using (talent_id = auth.uid());

create policy "Talents can create submissions"
  on mvp.submissions
  for insert
  with check (talent_id = auth.uid());
