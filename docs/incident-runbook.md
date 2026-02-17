# Incident Runbook

## Severity Definitions
- `SEV1`: Platform unavailable or auth broken for most users.
- `SEV2`: Core flow degraded (applications, approvals, messaging).
- `SEV3`: Non-critical feature issue with workaround.

## Immediate Response (0-10 min)
- Assign incident owner.
- Capture timestamp, impacted routes, affected roles.
- Post initial update in internal support channel.

## Triage (10-25 min)
- Confirm if issue is frontend route, API, or Supabase auth/data.
- Check latest deployment and recent commits.
- Validate env vars for Supabase and runtime keys.

## Mitigation
- If deploy regression, rollback to previous stable release.
- If data query issue, disable impacted UI action and show fallback state.
- If auth issue, lock critical admin actions until verification passes.

## Verification
- Validate login for admin/company/talent.
- Validate approvals, ATS pipeline board, and talent jobs list.
- Verify browser console has no blocking runtime errors.

## Communication
- Update every 15 minutes for SEV1/SEV2.
- Include current impact, mitigation, and ETA.
- Publish closure summary with root cause and follow-up actions.

## Follow-up (within 24h)
- Add regression test for the failed flow.
- Add alerting or guardrail to detect similar failures sooner.
- Create a short postmortem with timeline and owners.
