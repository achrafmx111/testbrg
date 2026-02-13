do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'interview_status' and n.nspname = 'mvp'
  ) then
    create type mvp.interview_status as enum ('SCHEDULED', 'COMPLETED', 'CANCELLED');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'invoice_status' and n.nspname = 'mvp'
  ) then
    create type mvp.invoice_status as enum ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'payment_status' and n.nspname = 'mvp'
  ) then
    create type mvp.payment_status as enum ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
  end if;
end $$;

create table if not exists mvp.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references mvp.applications(id) on delete cascade,
  status mvp.interview_status not null default 'SCHEDULED',
  scheduled_at timestamptz not null,
  meeting_link text,
  feedback text,
  created_at timestamptz not null default now()
);

create table if not exists mvp.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  thread_type text not null default 'DIRECT',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists mvp.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists mvp.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references mvp.companies(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'MAD',
  status mvp.invoice_status not null default 'ISSUED',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists mvp.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references mvp.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  method text,
  status mvp.payment_status not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table if not exists mvp.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_mvp_interviews_application_id on mvp.interviews(application_id);
create index if not exists idx_mvp_messages_from_user_id on mvp.messages(from_user_id);
create index if not exists idx_mvp_messages_to_user_id on mvp.messages(to_user_id);
create index if not exists idx_mvp_notifications_user_id on mvp.notifications(user_id);
create index if not exists idx_mvp_invoices_company_id on mvp.invoices(company_id);
create index if not exists idx_mvp_payments_invoice_id on mvp.payments(invoice_id);
create index if not exists idx_mvp_audit_logs_created_at on mvp.audit_logs(created_at);

alter table mvp.interviews enable row level security;
alter table mvp.messages enable row level security;
alter table mvp.notifications enable row level security;
alter table mvp.invoices enable row level security;
alter table mvp.payments enable row level security;
alter table mvp.audit_logs enable row level security;

drop policy if exists mvp_admin_interviews_all on mvp.interviews;
create policy mvp_admin_interviews_all on mvp.interviews
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_messages_all on mvp.messages;
create policy mvp_admin_messages_all on mvp.messages
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_notifications_all on mvp.notifications;
create policy mvp_admin_notifications_all on mvp.notifications
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_invoices_all on mvp.invoices;
create policy mvp_admin_invoices_all on mvp.invoices
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_payments_all on mvp.payments;
create policy mvp_admin_payments_all on mvp.payments
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_admin_audit_logs_all on mvp.audit_logs;
create policy mvp_admin_audit_logs_all on mvp.audit_logs
for all
using (mvp.is_admin())
with check (mvp.is_admin());

drop policy if exists mvp_interviews_select_role_based on mvp.interviews;
create policy mvp_interviews_select_role_based on mvp.interviews
for select
using (
  exists (
    select 1
    from mvp.applications a
    join mvp.jobs j on j.id = a.job_id
    where a.id = interviews.application_id
      and (
        (mvp.current_role() = 'TALENT'::mvp.role and a.talent_id = auth.uid())
        or (mvp.current_role() = 'COMPANY'::mvp.role and j.company_id = mvp.current_company_id())
      )
  )
);

drop policy if exists mvp_interviews_insert_company on mvp.interviews;
create policy mvp_interviews_insert_company on mvp.interviews
for insert
with check (
  mvp.current_role() = 'COMPANY'::mvp.role
  and exists (
    select 1
    from mvp.applications a
    join mvp.jobs j on j.id = a.job_id
    where a.id = interviews.application_id
      and j.company_id = mvp.current_company_id()
  )
);

drop policy if exists mvp_messages_select_own on mvp.messages;
create policy mvp_messages_select_own on mvp.messages
for select
using (auth.uid() = from_user_id or auth.uid() = to_user_id);

drop policy if exists mvp_messages_insert_own on mvp.messages;
create policy mvp_messages_insert_own on mvp.messages
for insert
with check (auth.uid() = from_user_id);

drop policy if exists mvp_notifications_select_own on mvp.notifications;
create policy mvp_notifications_select_own on mvp.notifications
for select
using (auth.uid() = user_id);

drop policy if exists mvp_notifications_update_own on mvp.notifications;
create policy mvp_notifications_update_own on mvp.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists mvp_invoices_select_company_own on mvp.invoices;
create policy mvp_invoices_select_company_own on mvp.invoices
for select
using (mvp.current_role() = 'COMPANY'::mvp.role and company_id = mvp.current_company_id());

drop policy if exists mvp_payments_select_company_own on mvp.payments;
create policy mvp_payments_select_company_own on mvp.payments
for select
using (
  mvp.current_role() = 'COMPANY'::mvp.role
  and exists (
    select 1 from mvp.invoices i
    where i.id = payments.invoice_id
      and i.company_id = mvp.current_company_id()
  )
);

drop policy if exists mvp_audit_logs_insert_own on mvp.audit_logs;
create policy mvp_audit_logs_insert_own on mvp.audit_logs
for insert
with check (actor_id = auth.uid());

grant select, insert, update, delete on mvp.interviews to anon, authenticated, service_role;
grant select, insert, update, delete on mvp.messages to anon, authenticated, service_role;
grant select, insert, update, delete on mvp.notifications to anon, authenticated, service_role;
grant select, insert, update, delete on mvp.invoices to anon, authenticated, service_role;
grant select, insert, update, delete on mvp.payments to anon, authenticated, service_role;
grant select, insert, update, delete on mvp.audit_logs to anon, authenticated, service_role;
