-- Create a table for interview requests
create table public.interview_requests (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade,
  recruiter_id uuid references public.profiles(id),
  talent_id uuid references public.profiles(id), -- This should be the talent associated with the application
  status text check (status in ('pending', 'approved', 'rejected', 'scheduled', 'completed', 'cancelled')) default 'pending',
  message text, -- Message from recruiter/company
  proposed_times jsonb, -- Array of timestamps
  confirmed_time timestamptz,
  meeting_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.interview_requests enable row level security;

-- Policies for interview_requests
-- Admin can view all
create policy "Admins can view all interview requests"
  on public.interview_requests for select
  using ( auth.uid() in ( select id from public.profiles where role = 'admin' ) );

-- Companies can view their own requests
create policy "Companies can view own requests"
  on public.interview_requests for select
  using ( auth.uid() = recruiter_id );

-- Talents can view requests related to them
create policy "Talents can view own requests"
  on public.interview_requests for select
  using ( auth.uid() = talent_id );

-- Insert/Update policies would be needed too, but this is a start.
-- Ideally trigger to notify admin/talent.
