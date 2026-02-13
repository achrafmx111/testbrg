create schema if not exists mvp;

grant usage on schema mvp to anon, authenticated, service_role;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'role' and n.nspname = 'mvp'
  ) then
    create type mvp.role as enum ('ADMIN', 'TALENT', 'COMPANY');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'placement_status' and n.nspname = 'mvp'
  ) then
    create type mvp.placement_status as enum ('LEARNING', 'JOB_READY', 'PLACED');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'job_status' and n.nspname = 'mvp'
  ) then
    create type mvp.job_status as enum ('OPEN', 'CLOSED');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'application_stage' and n.nspname = 'mvp'
  ) then
    create type mvp.application_stage as enum ('APPLIED', 'SCREEN', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'enrollment_status' and n.nspname = 'mvp'
  ) then
    create type mvp.enrollment_status as enum ('ACTIVE', 'COMPLETED');
  end if;
end $$;

create table if not exists mvp.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mvp.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role mvp.role not null,
  company_id uuid references mvp.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mvp.talent_profiles (
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
  updated_at timestamptz not null default now(),
  constraint talent_profiles_readiness_score_check check (readiness_score >= 0 and readiness_score <= 100),
  constraint talent_profiles_coach_rating_check check (coach_rating >= 0 and coach_rating <= 5)
);

create table if not exists mvp.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references mvp.companies(id) on delete cascade,
  title text not null,
  description text not null,
  required_skills jsonb not null default '[]'::jsonb,
  location text,
  salary_range text,
  status mvp.job_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mvp.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references mvp.jobs(id) on delete cascade,
  talent_id uuid not null references auth.users(id) on delete cascade,
  stage mvp.application_stage not null default 'APPLIED',
  score double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_job_talent_unique unique (job_id, talent_id)
);

create table if not exists mvp.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level text,
  track text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mvp.enrollments (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references mvp.courses(id) on delete cascade,
  progress integer not null default 0,
  status mvp.enrollment_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_progress_check check (progress >= 0 and progress <= 100),
  constraint enrollments_talent_course_unique unique (talent_id, course_id)
);

create index if not exists idx_mvp_profiles_role on mvp.profiles(role);
create index if not exists idx_mvp_profiles_company_id on mvp.profiles(company_id);
create index if not exists idx_mvp_talent_profiles_user_id on mvp.talent_profiles(user_id);
create index if not exists idx_mvp_jobs_company_id on mvp.jobs(company_id);
create index if not exists idx_mvp_jobs_status on mvp.jobs(status);
create index if not exists idx_mvp_applications_job_id on mvp.applications(job_id);
create index if not exists idx_mvp_applications_talent_id on mvp.applications(talent_id);
create index if not exists idx_mvp_applications_stage on mvp.applications(stage);
create index if not exists idx_mvp_enrollments_talent_id on mvp.enrollments(talent_id);

create or replace function mvp.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_mvp_companies_updated_at on mvp.companies;
create trigger set_mvp_companies_updated_at
before update on mvp.companies
for each row
execute procedure mvp.set_updated_at();

drop trigger if exists set_mvp_profiles_updated_at on mvp.profiles;
create trigger set_mvp_profiles_updated_at
before update on mvp.profiles
for each row
execute procedure mvp.set_updated_at();

drop trigger if exists set_mvp_talent_profiles_updated_at on mvp.talent_profiles;
create trigger set_mvp_talent_profiles_updated_at
before update on mvp.talent_profiles
for each row
execute procedure mvp.set_updated_at();

drop trigger if exists set_mvp_jobs_updated_at on mvp.jobs;
create trigger set_mvp_jobs_updated_at
before update on mvp.jobs
for each row
execute procedure mvp.set_updated_at();

drop trigger if exists set_mvp_applications_updated_at on mvp.applications;
create trigger set_mvp_applications_updated_at
before update on mvp.applications
for each row
execute procedure mvp.set_updated_at();

create or replace function mvp.enforce_company_application_stage_update()
returns trigger
language plpgsql
security definer
set search_path = mvp, public
as $$
begin
  if mvp.current_role() = 'COMPANY'::mvp.role then
    if new.job_id is distinct from old.job_id
      or new.talent_id is distinct from old.talent_id
      or new.score is distinct from old.score
      or new.created_at is distinct from old.created_at then
      raise exception 'COMPANY users can update only application stage.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_company_application_stage_update on mvp.applications;
create trigger enforce_company_application_stage_update
before update on mvp.applications
for each row
execute procedure mvp.enforce_company_application_stage_update();

drop trigger if exists set_mvp_courses_updated_at on mvp.courses;
create trigger set_mvp_courses_updated_at
before update on mvp.courses
for each row
execute procedure mvp.set_updated_at();

drop trigger if exists set_mvp_enrollments_updated_at on mvp.enrollments;
create trigger set_mvp_enrollments_updated_at
before update on mvp.enrollments
for each row
execute procedure mvp.set_updated_at();

create or replace function mvp.current_role()
returns mvp.role
language sql
stable
security definer
set search_path = mvp, public
as $$
  select p.role
  from mvp.profiles p
  where p.id = auth.uid();
$$;

create or replace function mvp.is_admin()
returns boolean
language sql
stable
security definer
set search_path = mvp, public
as $$
  select coalesce(mvp.current_role() = 'ADMIN'::mvp.role, false);
$$;

create or replace function mvp.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = mvp, public
as $$
  select p.company_id
  from mvp.profiles p
  where p.id = auth.uid();
$$;

grant execute on function mvp.current_role() to anon, authenticated, service_role;
grant execute on function mvp.is_admin() to anon, authenticated, service_role;
grant execute on function mvp.current_company_id() to anon, authenticated, service_role;

alter table mvp.profiles enable row level security;
alter table mvp.talent_profiles enable row level security;
alter table mvp.companies enable row level security;
alter table mvp.jobs enable row level security;
alter table mvp.applications enable row level security;
alter table mvp.courses enable row level security;
alter table mvp.enrollments enable row level security;

drop policy if exists mvp_admin_profiles_all on mvp.profiles;
create policy mvp_admin_profiles_all on mvp.profiles
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_talent_profiles_all on mvp.talent_profiles;
create policy mvp_admin_talent_profiles_all on mvp.talent_profiles
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_companies_all on mvp.companies;
create policy mvp_admin_companies_all on mvp.companies
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_jobs_all on mvp.jobs;
create policy mvp_admin_jobs_all on mvp.jobs
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_applications_all on mvp.applications;
create policy mvp_admin_applications_all on mvp.applications
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_courses_all on mvp.courses;
create policy mvp_admin_courses_all on mvp.courses
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_enrollments_all on mvp.enrollments;
create policy mvp_admin_enrollments_all on mvp.enrollments
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_profiles_select_own on mvp.profiles;
create policy mvp_profiles_select_own on mvp.profiles
for select
using (auth.uid() = id);

drop policy if exists mvp_profiles_insert_own on mvp.profiles;
create policy mvp_profiles_insert_own on mvp.profiles
for insert
with check (auth.uid() = id);

drop policy if exists mvp_profiles_update_own on mvp.profiles;
create policy mvp_profiles_update_own on mvp.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists mvp_talent_profiles_select_own on mvp.talent_profiles;
create policy mvp_talent_profiles_select_own on mvp.talent_profiles
for select
using (mvp.current_role() = 'TALENT'::mvp.role and user_id = auth.uid());

drop policy if exists mvp_talent_profiles_insert_own on mvp.talent_profiles;
create policy mvp_talent_profiles_insert_own on mvp.talent_profiles
for insert
with check (mvp.current_role() = 'TALENT'::mvp.role and user_id = auth.uid());

drop policy if exists mvp_talent_profiles_update_own on mvp.talent_profiles;
create policy mvp_talent_profiles_update_own on mvp.talent_profiles
for update
using (mvp.current_role() = 'TALENT'::mvp.role and user_id = auth.uid())
with check (mvp.current_role() = 'TALENT'::mvp.role and user_id = auth.uid());

drop policy if exists mvp_companies_select_own on mvp.companies;
create policy mvp_companies_select_own on mvp.companies
for select
using (mvp.current_role() = 'COMPANY'::mvp.role and id = mvp.current_company_id());

drop policy if exists mvp_companies_update_own on mvp.companies;
create policy mvp_companies_update_own on mvp.companies
for update
using (mvp.current_role() = 'COMPANY'::mvp.role and id = mvp.current_company_id())
with check (mvp.current_role() = 'COMPANY'::mvp.role and id = mvp.current_company_id());

drop policy if exists mvp_jobs_select_role_based on mvp.jobs;
create policy mvp_jobs_select_role_based on mvp.jobs
for select
using (
  (mvp.current_role() = 'TALENT'::mvp.role and status = 'OPEN'::mvp.job_status)
  or (mvp.current_role() = 'COMPANY'::mvp.role and company_id = mvp.current_company_id())
);

drop policy if exists mvp_jobs_insert_company_own on mvp.jobs;
create policy mvp_jobs_insert_company_own on mvp.jobs
for insert
with check (mvp.current_role() = 'COMPANY'::mvp.role and company_id = mvp.current_company_id());

drop policy if exists mvp_jobs_update_company_own on mvp.jobs;
create policy mvp_jobs_update_company_own on mvp.jobs
for update
using (mvp.current_role() = 'COMPANY'::mvp.role and company_id = mvp.current_company_id())
with check (mvp.current_role() = 'COMPANY'::mvp.role and company_id = mvp.current_company_id());

drop policy if exists mvp_jobs_delete_company_own on mvp.jobs;
create policy mvp_jobs_delete_company_own on mvp.jobs
for delete
using (mvp.current_role() = 'COMPANY'::mvp.role and company_id = mvp.current_company_id());

drop policy if exists mvp_applications_select_talent_own on mvp.applications;
create policy mvp_applications_select_talent_own on mvp.applications
for select
using (mvp.current_role() = 'TALENT'::mvp.role and talent_id = auth.uid());

drop policy if exists mvp_applications_select_company_jobs on mvp.applications;
create policy mvp_applications_select_company_jobs on mvp.applications
for select
using (
  mvp.current_role() = 'COMPANY'::mvp.role
  and exists (
    select 1
    from mvp.jobs j
    where j.id = applications.job_id
      and j.company_id = mvp.current_company_id()
  )
);

drop policy if exists mvp_applications_insert_talent_own on mvp.applications;
create policy mvp_applications_insert_talent_own on mvp.applications
for insert
with check (
  mvp.current_role() = 'TALENT'::mvp.role
  and talent_id = auth.uid()
  and exists (
    select 1
    from mvp.jobs j
    where j.id = applications.job_id
      and j.status = 'OPEN'::mvp.job_status
  )
);

drop policy if exists mvp_applications_update_talent_own on mvp.applications;
create policy mvp_applications_update_talent_own on mvp.applications
for update
using (mvp.current_role() = 'TALENT'::mvp.role and talent_id = auth.uid())
with check (mvp.current_role() = 'TALENT'::mvp.role and talent_id = auth.uid());

drop policy if exists mvp_applications_update_company_jobs on mvp.applications;
create policy mvp_applications_update_company_jobs on mvp.applications
for update
using (
  mvp.current_role() = 'COMPANY'::mvp.role
  and exists (
    select 1
    from mvp.jobs j
    where j.id = applications.job_id
      and j.company_id = mvp.current_company_id()
  )
)
with check (
  mvp.current_role() = 'COMPANY'::mvp.role
  and exists (
    select 1
    from mvp.jobs j
    where j.id = applications.job_id
      and j.company_id = mvp.current_company_id()
  )
);

drop policy if exists mvp_courses_select_all_authenticated on mvp.courses;
create policy mvp_courses_select_all_authenticated on mvp.courses
for select
using (mvp.current_role() is not null);

drop policy if exists mvp_enrollments_select_talent_own on mvp.enrollments;
create policy mvp_enrollments_select_talent_own on mvp.enrollments
for select
using (mvp.current_role() = 'TALENT'::mvp.role and talent_id = auth.uid());

drop policy if exists mvp_enrollments_insert_talent_own on mvp.enrollments;
create policy mvp_enrollments_insert_talent_own on mvp.enrollments
for insert
with check (mvp.current_role() = 'TALENT'::mvp.role and talent_id = auth.uid());

drop policy if exists mvp_enrollments_update_talent_own on mvp.enrollments;
create policy mvp_enrollments_update_talent_own on mvp.enrollments
for update
using (mvp.current_role() = 'TALENT'::mvp.role and talent_id = auth.uid())
with check (mvp.current_role() = 'TALENT'::mvp.role and talent_id = auth.uid());

grant select, insert, update, delete on all tables in schema mvp to anon, authenticated, service_role;
grant usage, select on all sequences in schema mvp to anon, authenticated, service_role;

alter default privileges in schema mvp grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema mvp grant usage, select on sequences to anon, authenticated, service_role;
