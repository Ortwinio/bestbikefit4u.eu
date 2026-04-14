# Prompt 02 — Convex Mutation and Query Audit

## Context

Read `plans/security-audit/README.md` first.
Read `convex/lib/authz.ts` and `convex/admin/authz.ts` to understand the auth helpers.

## What to review

There are ~136 Convex mutations and actions across ~35 modules under `convex/`. Audit each module directory for auth coverage.

### Module list to audit

For each directory under `convex/`, read `mutations.ts`, `actions.ts`, and `queries.ts` (if they exist) and answer:

| Module | Has auth? | Auth helper used | Notes |
|--------|-----------|-----------------|-------|

Directories:
- `convex/profiles/`
- `convex/bikes/`
- `convex/bikeProfiles/`
- `convex/sessions/`
- `convex/recommendations/`
- `convex/questionnaire/`
- `convex/fitPass/`
- `convex/stripe/`
- `convex/gearing/`
- `convex/saddleWidth/`
- `convex/geometry/`
- `convex/guides/` (new CMS code — tasks 048–054)
- `convex/marktplaats/`
- `convex/feedback/`
- `convex/caseStudyLeads/`
- `convex/users/`
- `convex/analytics/`
- `convex/messages/`
- `convex/releases/`
- `convex/admin/`
- `convex/emails/`
- `convex/system/`
- `convex/rideFeedback/`
- `convex/validationCaptures/`
- `convex/files/`
- `convex/wheelsets/`
- `convex/tireSetups/`
- `convex/pressureCalculations/`
- `convex/pressureProfiles/`
- `convex/bikeImports/`
- `convex/bikePhotos/`
- `convex/integrations/`
- `convex/marktplaats/`

### Specific things to flag

**A. Unauthenticated mutations** — any `mutation({ handler: async (ctx, args) => { ... } })` that does NOT call any auth helper and modifies data

**B. Missing ownership checks** — mutations that call `requireUserId()` but then operate on a record without checking `record.userId === userId` (IDOR pattern)

**C. Overly permissive queries** — public queries (`query(...)` without `internalQuery`) that return sensitive user data with no auth check

**D. Validator completeness** — args that use `v.any()` or `v.string()` where a tighter validator should be used (e.g. ID fields should use `v.id("tableName")`, not `v.string()`)

**E. New CMS mutations** — for `convex/guides/mutations.ts` and the guideAuditLog additions from task 054, verify:
- `publishGuide` and `unpublishGuide` require admin role (not just any authenticated user)
- `changeSlug` requires admin role
- `createRedirect` / `deleteRedirect` require admin role
- `updateGuide` only allows editors or above (not public)

**F. Internal actions used as public actions** — any `action(...)` that should be `internalAction(...)` 

### Rate limiting

Check `convex/authRateLimit.ts` and `convex/reportRateLimit.ts`. List which mutations/actions call these and which don't but probably should (e.g. any mutation callable without auth, any action that sends emails or makes external calls).

## Output

Write findings to `plans/security-audit/findings/02-convex-mutations.md`.

Include the completed audit table and all flagged findings using the severity format from prompt 01.
