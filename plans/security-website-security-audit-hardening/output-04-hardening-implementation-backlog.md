# Output 04 - Hardening Implementation Backlog

Date: `2026-02-23`  
Plan: `plans/security-website-security-audit-hardening`  
Step: `04-hardening-implementation-backlog.md`

## 1) Prioritized Backlog

### Immediate (P1/P2)

| Priority | Item | Scope | Owner | Target |
|---|---|---|---|---|
| P1 | Lock down analytics writes | Add auth/rate controls to `analytics/mutations:logMarketingEvent` | Backend | 2 days |
| P1 | Restrict analytics KPI read access | Add auth + role gate to `analytics/queries:getKpiDashboard` | Backend | 1 day |
| P2 | Expand protected-route logic | Protect `/fit`, `/bikes`, `/profile` in proxy decision path | Frontend/Platform | 1 day |
| P2 | Add numeric bounds validation | Shared min/max validators for profile/session numeric input | Backend | 2 days |
| P2 | Safe error mapping | Replace raw message exposure with user-safe generic errors + internal codes | Full-stack | 2 days |
| P2 | Add API/report rate limiting | Throttle PDF route and expensive generation paths | Platform/Backend | 2 days |

### Near-term (P2/P3)

| Priority | Item | Scope | Owner | Target |
|---|---|---|---|---|
| P2 | CSP tightening phase 1 | Reduce inline allowances; nonce/hash strategy for GTM and scripts | Frontend/Platform | 3-5 days |
| P2 | Security CI gates | Add dependency + secret + policy checks to CI | Platform | 2 days |
| P3 | Cookie hardening | Ensure consent cookie uses `Secure` in prod | Frontend | 0.5 day |
| P3 | GTM consent sequencing | Ensure optional analytics tags load only after consent | Frontend | 1 day |

### Planned (P3)

| Priority | Item | Scope | Owner | Target |
|---|---|---|---|---|
| P3 | Security event model | Add normalized security event taxonomy | Platform/Ops | 2 days |
| P3 | Internal security docs | Centralize security architecture and change log | Platform | 1 day |

## 2) Concrete Implementation Activities

1. Analytics protection:
   - Require authenticated user for `logMarketingEvent`.
   - Add anonymous fallback only for explicitly approved events with strict throttling.
   - Add owner/admin gate for KPI query.

2. Route protection hardening:
   - Update `isProtectedDashboardPath` to broader `isProtectedAppPath`.
   - Include `/dashboard`, `/fit`, `/bikes`, `/profile` (and nested paths).

3. Input validation hardening:
   - Add `validateNumberRange(field, value, min, max)` helper.
   - Apply to profile/body metrics, hours, distance, and similar mutable fields.

4. Error handling hardening:
   - Convert backend throws to stable error codes.
   - UI maps codes to safe text; remove raw error detail exposure in end-user messages.

5. API abuse controls:
   - Add token/IP/user rate limits for PDF route and costly actions.
   - Add logging for repeated failed attempts.

## 3) Security Regression Tests to Add

1. Unauthorized access test for analytics KPI query.
2. Throttling tests for marketing event logging and report generation.
3. Protected-path test matrix for localized URLs:
   - `/en/fit`, `/nl/fit`, `/en/bikes`, `/nl/profile`, etc.
4. Validation tests for out-of-range numeric payload rejection.
5. Error response test ensuring no sensitive internal detail leaks.

## 4) Acceptance Criteria for Step 04

1. Every P1/P2 finding has a concrete backlog item with owner and due date.
2. Backlog includes verification approach (test/monitoring signal) per item.
3. Quick wins are implementation-ready and decomposed into PR-sized tasks.
4. Dependencies between platform and application changes are explicit.

## 5) Execution Sequence Recommendation

Week 1:
1. Analytics auth/rate controls
2. Protected-path expansion
3. Numeric validation and safe error mapping

Week 2:
1. API/report rate limiting
2. CI security gates
3. CSP tightening phase 1

## 6) Completion Status

Step 04 completed: prioritized backlog and implementation sequence are defined and ready for execution.

## 7) Execution Update (Implemented in Code)

Executed hardening items:
1. Protected-route expansion:
   - `src/i18n/navigation.ts`: replaced narrow dashboard check with `isProtectedAppPath` for `/dashboard`, `/fit`, `/bikes`, `/profile`.
   - `src/i18n/proxyDecision.ts` and `src/proxy.ts` updated to use new protected-route logic.
   - Added regression coverage in `tests/integration/locale-routing.integration.test.ts`.

2. Analytics access control:
   - `convex/analytics/queries.ts` now requires authenticated user and an email allowlist from `ANALYTICS_ADMIN_EMAILS`.
   - Added `ANALYTICS_ADMIN_EMAILS` to `.env.example`.

3. Analytics abuse controls:
   - `convex/analytics/mutations.ts` now enforces:
     - anonymous event-type restrictions,
     - relative-path validation on `pagePath`/`ctaTargetPath`,
     - stricter `sourceTag` format checks,
     - timestamp freshness bounds,
    - token-bucket rate limiting (shared limiter table).

4. Numeric bounds validation rollout:
   - `convex/lib/validation.ts`: added `validateFiniteNumber` and `validateNumberRange`.
   - `convex/profiles/mutations.ts`: added domain bounds for body measurements, core score, age, and weight in `upsert`, `updateMeasurements`, and `updateAssessment`.
   - `convex/sessions/mutations.ts`: added bounds on `weeklyHours` and `longestRideKm`.

5. User-safe error mapping:
   - `src/lib/telemetry.ts`: `reportClientError` now returns sanitized user-facing messages while still logging full raw error context for debugging.

6. Report endpoint abuse throttling:
   - `src/app/api/reports/[sessionId]/pdf/route.ts`: added per-session/per-token in-memory token-bucket limiter with `429` + `Retry-After` response and warning log on threshold breach.

Validation evidence:
1. `npx vitest run tests/integration/locale-routing.integration.test.ts --bail=1` passed.
2. `npm run build -- --webpack` passed.
3. `npm run typecheck` passed (initial run required a build first due `.next/types` include behavior).
4. `npx vitest run src/app/api/reports/[sessionId]/pdf/route.test.ts --bail=1` passed.
5. Targeted ESLint on updated security files passed.

Remaining Step 04 items still open:
1. Replace in-memory report limiter with distributed rate limiter for multi-instance/serverless scale.
2. Extend numeric bound coverage to any remaining low-priority mutation surfaces not yet guarded.
3. Add dedicated alert pipeline for rate-limit trip events.
