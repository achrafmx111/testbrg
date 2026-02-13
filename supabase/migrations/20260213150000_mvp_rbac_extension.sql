do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'staff_role' and n.nspname = 'mvp'
  ) then
    create type mvp.staff_role as enum (
      'SUPER_ADMIN',
      'ACADEMY_ADMIN',
      'PROGRAM_MANAGER',
      'CAREER_COACH',
      'PLACEMENT_OFFICER',
      'FINANCE',
      'SUPPORT',
      'COMPANY_ADMIN',
      'RECRUITER'
    );
  end if;
end $$;

create table if not exists mvp.staff_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role mvp.staff_role not null,
  created_at timestamptz not null default now()
);

create table if not exists mvp.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role mvp.staff_role not null,
  resource text not null,
  action text not null,
  allowed boolean not null default true,
  unique (role, resource, action)
);

create index if not exists idx_mvp_staff_assignments_role on mvp.staff_assignments(role);
create index if not exists idx_mvp_role_permissions_role on mvp.role_permissions(role);

alter table mvp.staff_assignments enable row level security;
alter table mvp.role_permissions enable row level security;

drop policy if exists mvp_admin_staff_assignments_all on mvp.staff_assignments;
create policy mvp_admin_staff_assignments_all on mvp.staff_assignments
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_staff_assignments_select_own on mvp.staff_assignments;
create policy mvp_staff_assignments_select_own on mvp.staff_assignments
for select
using (user_id = auth.uid());

drop policy if exists mvp_admin_role_permissions_all on mvp.role_permissions;
create policy mvp_admin_role_permissions_all on mvp.role_permissions
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_role_permissions_select_all on mvp.role_permissions;
create policy mvp_role_permissions_select_all on mvp.role_permissions
for select
using (mvp.current_role() is not null);

grant select, insert, update, delete on mvp.staff_assignments to anon, authenticated, service_role;
grant select, insert, update, delete on mvp.role_permissions to anon, authenticated, service_role;

insert into mvp.role_permissions (role, resource, action, allowed)
values
  ('SUPER_ADMIN', 'all', 'all', true),
  ('ACADEMY_ADMIN', 'academy', 'manage', true),
  ('PROGRAM_MANAGER', 'cohorts', 'manage', true),
  ('CAREER_COACH', 'talent', 'review', true),
  ('PLACEMENT_OFFICER', 'pipeline', 'manage', true),
  ('FINANCE', 'invoices', 'manage', true),
  ('SUPPORT', 'tickets', 'manage', true),
  ('COMPANY_ADMIN', 'jobs', 'manage', true),
  ('RECRUITER', 'pipeline', 'manage', true)
on conflict (role, resource, action) do update
set allowed = excluded.allowed;
