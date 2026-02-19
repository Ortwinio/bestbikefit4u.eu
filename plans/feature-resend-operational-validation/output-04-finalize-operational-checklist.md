# Output 04: Finalize Operational Checklist

Date: 2026-02-19
Owner: `@codex`

## Result

Step 04 status: `PASS`

Produced a reusable pre-release checklist and incident playbook for Resend operations, and updated deployment/release docs accordingly.

## Pre-Release Email Verification Checklist

1. Confirm Convex production env:
   - `npx convex env list --prod`
   - Must include:
     - `SITE_URL=https://bestbikefit4u.eu`
     - `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`
     - `AUTH_RESEND_KEY=<set>`
2. Confirm Resend dashboard state:
   - Domain `notifications.bestbikefit4u.eu` is `Verified`.
   - API key belongs to the same team/workspace as the verified domain.
   - API key has sending permission for the sender domain.
3. Run direct API smoke send:
   - `curl -sS https://api.resend.com/emails ...`
   - Expect response with `id`.
4. Run production auth send path:
   - `npx convex run auth:signIn '{"provider":"resend","params":{"email":"<test-email>"}}' --prod`
   - Expect `{ "started": true }`.
5. Run production report-email path:
   - `npx convex run emails/actions:sendFitReport ... --prod --identity ...`
   - Expect `{ "success": true, "emailId": "<id>" }`.
6. Verify inbox artifacts:
   - Auth code email received.
   - Report email received.
   - Sender shown as `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`.

## Incident Playbook (Email Delivery Failures)

## Detection Signals

- Login flow or report modal surfaces send failures.
- Resend API returns `401`, `403`, or `422`.
- Convex function call fails with request ID.

## Immediate Diagnostics

1. Check env drift:

```bash
npx convex env list --prod
```

2. Reproduce with direct Resend probe:

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $AUTH_RESEND_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>","to":["<test-email>"],"subject":"probe","html":"<p>probe</p>"}'
```

3. Reproduce app send path:

```bash
npx convex run auth:signIn '{"provider":"resend","params":{"email":"<test-email>"}}' --prod
```

4. Pull logs and correlate by request ID:

```bash
npx convex logs --prod --history 200 --jsonl
```

## Recovery Actions

1. `401 API key is invalid`
   - Rotate key in Resend.
   - Update `AUTH_RESEND_KEY` in Convex prod env.
2. `403 Not authorized to send emails from ...`
   - Restore sender domain to verified domain.
   - Set `AUTH_EMAIL_FROM` back to `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`.
3. `422 Invalid from field`
   - Fix sender formatting to `Name <email@domain>`.
4. After any fix:
   - Re-run direct API probe.
   - Re-run auth/report app paths.
   - Confirm inbox receipt and sender identity.

## Documentation Updates Applied

- Updated `docs/RELEASE_READINESS_CHECKLIST.md`:
  - Added explicit sender/inbox verification checks.
  - Added Resend operational checks section.
- Updated `docs/VERCEL_DEPLOYMENT.md`:
  - Added concrete email validation commands.
  - Added troubleshooting commands for Resend probe + Convex logs.

## Evidence Index

1. `plans/feature-resend-operational-validation/output-01-audit-config-and-sender-alignment.md`
2. `plans/feature-resend-operational-validation/output-02-run-production-smoke-tests.md`
3. `plans/feature-resend-operational-validation/output-03-validate-failure-modes-and-logs.md`
4. `plans/feature-resend-operational-validation/output-04-finalize-operational-checklist.md`

## Exit Criteria Check

- [x] Pre-release checklist is actionable and short.
- [x] Incident playbook is concrete and command-driven.
- [x] Documentation references are updated and consistent.
- [x] Step status and evidence links are recorded.
