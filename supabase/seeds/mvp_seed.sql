-- MVP seed data for schema mvp.
-- This script expects auth users to exist (created by scripts/seed-mvp-users.mjs).

insert into mvp.companies (id, name, industry, country)
values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Bridging Hiring GmbH', 'Technology', 'Germany')
on conflict (id) do update
set
  name = excluded.name,
  industry = excluded.industry,
  country = excluded.country;

insert into mvp.courses (id, title, description, level, track, duration)
values
  ('22222222-2222-4222-8222-222222222222'::uuid, 'SAP Foundation Bootcamp', 'Comprehensive introduction to SAP S/4HANA ecosystem.', 'Beginner', 'SAP Core', '4 Weeks')
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  track = excluded.track,
  duration = excluded.duration;

insert into mvp.jobs (id, company_id, title, description, required_skills, min_experience, location, salary_range, status)
values
  (
    '33333333-3333-4333-8333-333333333333'::uuid,
    '11111111-1111-4111-8111-111111111111'::uuid,
    'Junior SAP Consultant',
    'Entry-level SAP consultant role for graduates from Bridging Academy.',
    '["sap basics", "communication", "english"]'::jsonb,
    0,
    'Berlin',
    'EUR 35k - 45k',
    'OPEN'::mvp.job_status
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  required_skills = excluded.required_skills,
  min_experience = excluded.min_experience,
  location = excluded.location,
  salary_range = excluded.salary_range,
  status = excluded.status;

-- Sync Profiles
with target_users as (
  select id, email
  from auth.users
  where email in (
    'admin@bridging.academy',
    'company@bridging.academy',
    'talent@bridging.academy'
  )
),
admin_user as (
  select id from target_users where email = 'admin@bridging.academy'
),
company_user as (
  select id from target_users where email = 'company@bridging.academy'
),
talent_user as (
  select id from target_users where email = 'talent@bridging.academy'
)
insert into mvp.profiles (id, role, company_id)
select id, 'ADMIN'::mvp.role, null from admin_user
union all
select id, 'COMPANY'::mvp.role, '11111111-1111-4111-8111-111111111111'::uuid from company_user
union all
select id, 'TALENT'::mvp.role, null from talent_user
on conflict (id) do update set role = excluded.role, company_id = excluded.company_id;

-- Talent Profile
with talent_user as (
  select id
  from auth.users
  where email = 'talent@bridging.academy'
)
insert into mvp.talent_profiles (
  id,
  user_id,
  bio,
  languages,
  skills,
  years_of_experience,
  readiness_score,
  coach_rating,
  availability,
  placement_status
)
select
  '44444444-4444-4444-8444-444444444444'::uuid,
  id,
  'Motivated SAP learner preparing for first consulting role.',
  '["English", "German A2"]'::jsonb,
  '["sap basics", "excel"]'::jsonb,
  1,
  52,
  4.2,
  true,
  'LEARNING'::mvp.placement_status
from talent_user
on conflict (user_id) do update
set
  bio = excluded.bio,
  languages = excluded.languages,
  skills = excluded.skills,
  years_of_experience = excluded.years_of_experience,
  readiness_score = excluded.readiness_score,
  coach_rating = excluded.coach_rating,
  availability = excluded.availability,
  placement_status = excluded.placement_status;

-- Enrollment
with talent_user as (
  select id
  from auth.users
  where email = 'talent@bridging.academy'
)
insert into mvp.enrollments (id, talent_id, course_id, progress, status)
select
  '55555555-5555-4555-8555-555555555555'::uuid,
  id,
  '22222222-2222-4222-8222-222222222222'::uuid,
  30,
  'ACTIVE'::mvp.enrollment_status
from talent_user
on conflict (talent_id, course_id) do update
set
  progress = excluded.progress,
  status = excluded.status;

-- Application
with talent_user as (
  select id
  from auth.users
  where email = 'talent@bridging.academy'
)
insert into mvp.applications (id, job_id, talent_id, stage, score)
select
  '66666666-6666-4666-8666-666666666666'::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,
  id,
  'APPLIED'::mvp.application_stage,
  61.5
from talent_user
on conflict (job_id, talent_id) do update
set
  stage = excluded.stage,
  score = excluded.score;

-- Interview
insert into mvp.interviews (id, application_id, status, scheduled_at, meeting_link)
values (
  '77777777-7777-4777-8777-777777777777'::uuid,
  '66666666-6666-4666-8666-666666666666'::uuid,
  'SCHEDULED'::mvp.interview_status,
  now() + interval '3 days',
  'https://meet.example.com/bridging-interview'
)
on conflict (id) do update
set
  status = excluded.status,
  scheduled_at = excluded.scheduled_at,
  meeting_link = excluded.meeting_link;

-- Invoices
insert into mvp.invoices (id, company_id, amount, currency, status, due_date)
values 
  (
    '88888888-8888-4888-8888-888888888888'::uuid,
    '11111111-1111-4111-8111-111111111111'::uuid,
    12000,
    'MAD',
    'ISSUED'::mvp.invoice_status,
    current_date + 14
  ),
  (
    gen_random_uuid(),
    '11111111-1111-4111-8111-111111111111'::uuid,
    5000,
    'EUR',
    'PAID'::mvp.invoice_status,
    current_date - 30
  ),
  (
    gen_random_uuid(),
    '11111111-1111-4111-8111-111111111111'::uuid,
    7500,
    'EUR',
    'OVERDUE'::mvp.invoice_status,
    current_date - 5
  )
on conflict (id) do update
set
  amount = excluded.amount,
  status = excluded.status;

-- Registration Requests
insert into mvp.company_registration_requests (id, company_name, contact_name, email, industry, country, status)
values (
  '99999999-9999-4999-8999-999999999999'::uuid,
  'TechNova Inc',
  'Sarah Connor',
  'sarah@technova.com',
  'AI & Robotics',
  'International',
  'PENDING'
)
on conflict (id) do nothing;

-- Lessons
insert into mvp.lessons (id, course_id, title, content, "order")
values
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222'::uuid, 'Introduction to SAP', 'Content for introduction...', 1),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222'::uuid, 'Navigation and UI', 'How to use Fiori...', 2),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222'::uuid, 'Core Modules Overview', 'FI, CO, SD, MM...', 3)
on conflict do nothing;

-- Assessments
insert into mvp.assessments (id, course_id, title, passing_score, questions)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  'Foundation Module Exam',
  70,
  '[
    {"id": "q1", "text": "What does SAP stand for?", "options": ["System Applications Products", "Sales and Purchasing", "Super Awesome Program"], "correctAnswer": "System Applications Products"},
    {"id": "q2", "text": "Which UI technology is standard in S/4HANA?", "options": ["SAP GUI", "SAP Fiori", "Web Dynpro"], "correctAnswer": "SAP Fiori"}
  ]'::jsonb
)
on conflict (id) do nothing;
