# Release Readiness Checklist

Last updated: 2026-02-15

Use this checklist before promoting to production.

## Quality Gates

- [ ] `npm run test:contracts` passes
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test:unit` passes
- [ ] `npm run test:e2e:communication` passes
- [ ] `npm run build -- --webpack` passes

## Functional Smoke Paths

- [ ] Public routes render (`/`, `/about`, `/pricing`, `/privacy`, `/terms`, `/faq`, `/contact`)
- [ ] Auth flow works (`/login` magic code flow)
- [ ] Profile create/edit works (`/profile`)
- [ ] Fit session creation works (`/fit`)
- [ ] Questionnaire save and complete flow works (`/fit/[sessionId]/questionnaire`)
- [ ] Recommendation generation and results page render (`/fit/[sessionId]/results`)
- [ ] Email report send path works for authorized user

## Security And Access Control

- [ ] Protected routes reject unauthenticated access
- [ ] Ownership checks hold for profile/session/recommendation/email endpoints
- [ ] No auth bypass for recommendation generation or report sending

## Recommendation Integrity

- [ ] Core score uses `profile.coreStabilityScore` (not flexibility proxy)
- [ ] Femur passthrough is preserved (`femurLengthCm` -> `femurMm`)
- [ ] Mapping tests pass (`convex/recommendations/__tests__/inputMapping.test.ts`)
- [ ] Questionnaire response validation tests pass (`convex/questionnaire/__tests__/responseValidation.test.ts`)

## Data And Migration Safety

- [ ] Schema changes reviewed for backward compatibility
- [ ] Seed/migration changes documented and tested
- [ ] Rollback approach documented for high-risk changes

## Incident Readiness

- [ ] Communication stability runbook reviewed (`docs/COMMUNICATION_STABILITY_RUNBOOK.md`)
- [ ] On-call owner can identify `convex_communication_error` log entries
- [ ] Rollback plan validated for communication-contract regressions

## Final Sign-Off

- [ ] Plan curation owner sign-off (`@ortwinverreck`)
- [ ] Quality gate owner sign-off (`@ortwinverreck`)
- [ ] Release owner sign-off (`@ortwinverreck`)

## Vercel Deployment

- [ ] Vercel production env var set: `NEXT_PUBLIC_CONVEX_URL`
- [ ] Convex production env vars set: `SITE_URL`, `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM`
- [ ] `npm run build:vercel` passes locally
- [ ] Vercel project build command is `npm run build:vercel`
- [ ] Vercel deploy runbook reviewed (`docs/VERCEL_DEPLOYMENT.md`)
