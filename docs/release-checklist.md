# Release Checklist

## Pre-Release
- Ensure required Vercel env variables are set for preview and production.
- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Run `npm run build`.
- Run `npx playwright test --list` and verify critical flows are present.

## Security
- Confirm CSP and security headers are active in `vercel.json`.
- Check for accidental secrets in changed files.
- Validate role guards for admin/company/talent dashboard routes.

## Product QA
- Admin: approvals queue opens and actions update status.
- Company: ATS pipeline board renders stages and cards.
- Talent: jobs board ranking and semantic search behave correctly.
- Dashboard shell: command palette (`Ctrl+K`) and notifications open.

## Deployment
- Deploy preview from current branch.
- Perform smoke navigation for `/dashboard/admin`, `/dashboard/company`, `/dashboard/talent`.
- Promote to production only after smoke passes.

## Post-Release
- Monitor client errors and runtime logs for 30 minutes.
- Verify no spike in auth failures.
- Log a short release note with key user-facing changes.
