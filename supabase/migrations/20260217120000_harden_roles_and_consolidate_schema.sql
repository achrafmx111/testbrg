-- Security hardening + schema consolidation
-- 1) Prevent role escalation in profile tables
-- 2) Normalize drifted notifications/messages/interview_requests columns

begin;

create or replace function mvp.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = mvp, public
as $$
declare
  actor_is_admin boolean := false;
begin
  if auth.uid() is not null then
    select exists (
      select 1
      from mvp.profiles p
      where p.id = auth.uid()
        and p.role = 'ADMIN'::mvp.role
    ) into actor_is_admin;
  end if;

  if tg_op = 'INSERT' then
    if auth.role() = 'service_role' then
      return new;
    end if;

    if not actor_is_admin and new.role not in ('TALENT'::mvp.role, 'COMPANY'::mvp.role) then
      raise exception 'Only TALENT or COMPANY roles are allowed for self-registration.';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    if auth.role() = 'service_role' or actor_is_admin then
      return new;
    end if;

    raise exception 'Role changes are restricted to admins.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on mvp.profiles;
create trigger prevent_profile_role_escalation
before insert or update on mvp.profiles
for each row
execute procedure mvp.prevent_profile_role_escalation();

create or replace function public.prevent_profile_role_escalation_public()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_is_admin boolean := false;
begin
  if auth.uid() is not null then
    select exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role, '')) = 'admin'
    ) into actor_is_admin;
  end if;

  if tg_op = 'INSERT' then
    if auth.role() = 'service_role' then
      return new;
    end if;

    if not actor_is_admin and lower(coalesce(new.role, '')) not in ('talent', 'company') then
      raise exception 'Only talent or company roles are allowed for self-registration.';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' and coalesce(new.role, '') is distinct from coalesce(old.role, '') then
    if auth.role() = 'service_role' or actor_is_admin then
      return new;
    end if;

    raise exception 'Role changes are restricted to admins.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation_public on public.profiles;
create trigger prevent_profile_role_escalation_public
before insert or update on public.profiles
for each row
execute procedure public.prevent_profile_role_escalation_public();

do $$
begin
  if to_regclass('mvp.notifications') is not null then
    alter table mvp.notifications add column if not exists message text;
    alter table mvp.notifications add column if not exists read boolean default false;
    alter table mvp.notifications add column if not exists action_link text;
    alter table mvp.notifications add column if not exists updated_at timestamptz default now();
    alter table mvp.notifications add column if not exists body text;
    alter table mvp.notifications add column if not exists read_at timestamptz;

    update mvp.notifications
    set body = coalesce(body, message, '')
    where body is null;

    update mvp.notifications
    set read_at = coalesce(read_at, case when coalesce(read, false) then coalesce(updated_at, created_at, now()) end)
    where read_at is null;

    alter table mvp.notifications alter column body set not null;
    alter table mvp.notifications alter column updated_at set not null;
    alter table mvp.notifications alter column updated_at set default now();
    alter table mvp.notifications alter column read set default false;
    alter table mvp.notifications alter column read set not null;
  end if;
end $$;

do $$
begin
  if to_regclass('mvp.messages') is not null then
    alter table mvp.messages add column if not exists metadata jsonb default '{}'::jsonb;
    alter table mvp.messages add column if not exists read boolean default false;
    alter table mvp.messages add column if not exists updated_at timestamptz default now();

    update mvp.messages
    set metadata = '{}'::jsonb
    where metadata is null;

    alter table mvp.messages alter column metadata set not null;
    alter table mvp.messages alter column read set default false;
    alter table mvp.messages alter column read set not null;
    alter table mvp.messages alter column updated_at set default now();
    alter table mvp.messages alter column updated_at set not null;
  end if;
end $$;

do $$
begin
  if to_regclass('public.interview_requests') is not null then
    alter table public.interview_requests add column if not exists employer_id uuid references auth.users(id) on delete cascade;
    alter table public.interview_requests add column if not exists recruiter_id uuid references public.profiles(id);
    alter table public.interview_requests add column if not exists talent_id uuid references public.profiles(id);
    if to_regclass('public.companies') is not null then
      alter table public.interview_requests add column if not exists company_id uuid references public.companies(id) on delete cascade;
    else
      alter table public.interview_requests add column if not exists company_id uuid;
    end if;
    alter table public.interview_requests add column if not exists message text;
    alter table public.interview_requests add column if not exists proposed_times jsonb;
    alter table public.interview_requests add column if not exists confirmed_time timestamptz;
    alter table public.interview_requests add column if not exists notes text;
    alter table public.interview_requests add column if not exists updated_at timestamptz default now();

    update public.interview_requests
    set recruiter_id = employer_id
    where recruiter_id is null
      and employer_id is not null;

    update public.interview_requests
    set employer_id = recruiter_id
    where employer_id is null
      and recruiter_id is not null;

    update public.interview_requests
    set message = coalesce(message, notes)
    where message is null;

    update public.interview_requests
    set notes = coalesce(notes, message)
    where notes is null;

    alter table public.interview_requests alter column updated_at set default now();
  end if;
end $$;

commit;
