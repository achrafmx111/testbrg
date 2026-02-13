# Bridging Academy MVP (Supabase-first)

This repo keeps the legacy app untouched and introduces an MVP layer backed by Supabase under `mvp.*` only.

## What was added

- MVP database migration in `supabase/migrations/20260213090000_mvp_schema_and_rls.sql`
- Domain expansion migration in `supabase/migrations/20260213143000_mvp_v1_domain_expansion.sql`
- RBAC extension migration in `supabase/migrations/20260213150000_mvp_rbac_extension.sql`
- MVP seed SQL in `supabase/seeds/mvp_seed.sql`
- Auth users seed script in `scripts/seed-mvp-users.mjs`
- Typed MVP Supabase wrapper in `src/integrations/supabase/mvp.ts`
- Role-routed dashboard areas:
  - `/admin/*`
  - `/talent/*`
  - `/company/*`
- Extended dashboard modules:
  - Admin: Academy, Readiness, Pipeline, Messaging, Finance, Support, Analytics, Settings
  - Talent: Assessments, Coaching, Messages, Alumni
  - Company: Profile, Talent Pool, Offers, Billing, Messages
- Auth pages:
  - `/login`
  - `/register` (alias of `/signup`)

## Supabase API setting (required)

Because all MVP queries use `supabase.schema("mvp").from("...")`, you must expose schema `mvp` in Supabase API.

1. Open Supabase Dashboard
2. Go to `Project Settings` -> `API`
3. In `Exposed schemas`, add `mvp`
4. Save

If `mvp` is not exposed, web queries to `mvp.*` fail.

## Environment setup

Copy `.env.example` to `.env` and fill values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (needed for seed scripts only)

Security reminder:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Use it only in local scripts like `scripts/seed-mvp-users.mjs`.

## Apply migration and seed

### Option A: Supabase CLI (recommended local workflow)

```bash
supabase db push
npm run db:seed:mvp:users
supabase db query < supabase/seeds/mvp_seed.sql
```

### Option B: No Supabase CLI (current environment)

Use Supabase Dashboard SQL Editor:

1. Run `supabase/migrations/20260213090000_mvp_schema_and_rls.sql`
2. Run `supabase/migrations/20260213143000_mvp_v1_domain_expansion.sql`
3. Run `supabase/migrations/20260213150000_mvp_rbac_extension.sql`
4. Run `npm run db:seed:mvp:users` locally (needs `SUPABASE_SERVICE_ROLE_KEY`)
5. Run `supabase/seeds/mvp_seed.sql` in SQL Editor

## E2E smoke tests (Playwright)

Install test tooling and browser:

```bash
npm install
npx playwright install chromium
```

Set test credentials in `.env` or your shell (defaults match seed script values):

- `E2E_BASE_URL` (default `http://192.168.11.160:8080`)
- `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`
- `E2E_COMPANY_EMAIL` / `E2E_COMPANY_PASSWORD`
- `E2E_TALENT_EMAIL` / `E2E_TALENT_PASSWORD`

Run tests:

```bash
npm run test:e2e
```

Optional:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
```

Covered smoke scenarios:

- Login redirects by role (admin, talent, company)
- Role guard redirect (talent blocked from `/admin`)
- End-to-end MVP flow:
  - company creates a job
  - talent applies
  - company moves application stage
  - admin marks talent `JOB_READY`

## Run app

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Verification checklist

- [ ] Login redirects by `mvp.profiles.role`:
  - `ADMIN` -> `/admin`
  - `TALENT` -> `/talent`
  - `COMPANY` -> `/company`
- [ ] Route guards block cross-role access (`/admin`, `/talent`, `/company`)
- [ ] Company creates a job from `/company/jobs`
- [ ] Talent sees open jobs and applies from `/talent/jobs`
- [ ] Company views applicants and updates stage from `/company/applicants`
- [ ] Admin marks talent as `JOB_READY` from `/admin/talents`
- [ ] No `public.*` tables were modified for MVP features

## Notes

- MVP database objects live under `mvp.*` only (tables, enums, functions, policies).
- Wrapper `src/integrations/supabase/mvp.ts` centralizes all MVP data access.
- Legacy dashboards/routes remain present and untouched.
- Keep `mvp` in Supabase exposed schemas, otherwise `supabase.schema("mvp")` queries fail.
