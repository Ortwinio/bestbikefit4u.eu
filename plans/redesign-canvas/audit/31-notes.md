# 31 — Production PDF access hotfix

Implemented by Codex C on 2026-09-30; ready for lead review/release. No commit or deployment.

## Cause and access rule

The campaign expired on June 4 while production checkout remained paused. The PDF route
therefore rejected Free users with `403 pro_required` even though they could not buy Pro.

`isReportAccessOpen(now)` now shares the rule between the server route and results UI:
`isConsumerCampaignActive(now) || !isStripeBillingEnabled()`.

| Campaign | Billing | Free PDF route |
| --- | --- | --- |
| Active | Enabled or paused | Allowed |
| Ended | Paused | Allowed |
| Ended | Enabled | 403 pro_required |

Pro and legacy premium access remain allowed. Missing auth still returns 401; the current-user
check, ownership enforcement, rate-limit mutation and rendering flow are unchanged. The
results page retains its existing session-entitlement display behavior; the PDF route retains
its existing Pro/premium tier rule when billing is enabled. No fit-session purchasing or
account-plan behavior was changed. Existing public/private billing flag semantics are reused;
production has both flags false, and both must be enabled to restore paid-only exports.

## UI and errors

The results download and shared dashboard/history report actions now map HTTP responses to
shared NL/EN copy: 401 sign in, 403 PDF is part of Pro, 404 report missing, 409 report not ready,
429 wait 30 seconds, and a localized fallback. Raw server error strings are no longer shown.
The dashboard viewer fetches and checks the response before assigning a PDF blob URL to the
iframe or full-page link. A denied response shows the localized error in the dialog; download
also shows the same specific error in its toast. Results no longer show the report paywall
when report access is open, including paused billing.

Audited campaign/tier checks and all PDF endpoint callers in dashboard, report components,
report libraries and fit-pass components. Fit creation/landing campaign checks and settings
plan labels concern purchasing/session limits, not PDF authorization, so remain unchanged.
Root NL/EN dictionaries remain frozen; new copy is in `src/i18n/account/reportErrors.ts`.

## Validation

- Focused Vitest: 5 files, 63 tests passed. Includes all campaign/billing flag combinations
  (including unset flags), paused Free -> 200 PDF, enabled Free -> 403, Pro -> 200, existing
  auth/ownership/rate-limit tests, paused results UI without paywall, localized 403/404/409/429
  on results and dashboard viewer, download toast and successful viewer blob URL.
- `npm run typecheck`: passed.
- `npm run lint`: passed, including 254/254 contrast checks and CSS token lint.
- `npm run build:vercel`: passed preflight and production build.
- `git diff --check`: passed.

Local logs: `/tmp/bbf31-tests.log`, `/tmp/bbf31-types.log`, `/tmp/bbf31-lint.log`,
`/tmp/bbf31-build.log`. This validates the local build; production rollout belongs to the lead.

Exact source/tests/copy/notes manifest: `files-31.txt`. Shared README changes already present
belong to other ongoing work and are excluded. No images or unrelated files are included.
