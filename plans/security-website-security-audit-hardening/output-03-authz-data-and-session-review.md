# Output 03 - Authorization, Data, and Session Review

Date: `2026-02-23`  
Plan: `plans/security-website-security-audit-hardening`  
Step: `03-authz-data-and-session-review.md`

## 1) Scope

Reviewed:
- Convex authz patterns for sessions, recommendations, profiles, bikes, questionnaire, emails, analytics.
- Session/cookie behavior in proxy and consent logic.
- API report access control path.
- Data exposure and validation boundaries.

## 2) Authorization Review Matrix

Strong/consistent ownership checks:
- Sessions: `convex/sessions/*`
- Recommendations: `convex/recommendations/*`
- Bikes: `convex/bikes/*`
- Questionnaire session operations: `convex/questionnaire/*`
- Email report ownership checks: `convex/emails/mutations.ts`, `convex/emails/queries.ts`
- PDF API route uses authenticated server token + owner-filtered Convex queries: `src/app/api/reports/[sessionId]/pdf/route.ts`

Weaker/non-uniform controls:
- Analytics:
  - `convex/analytics/mutations.ts` accepts public write events (no auth/rate limit).
  - `convex/analytics/queries.ts` has no explicit auth guard.

## 3) Session and Cookie Security

Observed:
- Locale cookie in proxy is `SameSite=Lax`, `Secure` in production (`src/proxy.ts`).
- Consent cookie is `SameSite=Lax` but not explicitly `Secure`/`HttpOnly` (`src/lib/cookieConsent.ts`).
- Auth cookies managed by `@convex-dev/auth`; repo does not explicitly enforce additional flags here.

Assessment:
- Locale/consent cookies are non-sensitive but should still use `Secure` in production.
- Need explicit verification in production for auth cookie attributes from the auth library.

## 4) IDOR/BOLA Review (Static)

Scenarios reviewed:
1. Access other user session by ID (`sessions.getById`) -> blocked by owner check.
2. Access recommendation by ID (`recommendations.getById`) -> blocked by `requireRecommendationOwner`.
3. Access email report by session (`emails.getBySession`) -> blocked by `requireSessionOwner`.
4. Update/delete bike by ID -> blocked by `requireBikeOwner`.
5. Complete questionnaire for other session -> blocked by `requireSessionOwner`.
6. Generate recommendation for other session -> blocked by `requireSessionOwner`.
7. Download PDF for other session -> blocked by owner-filtered queries.
8. Read analytics KPI -> currently not owner-gated.

Result:
- Core domain IDOR risk is low in reviewed flows.
- Analytics visibility/authz remains the outlier.

## 5) Data Exposure and Minimization

Observations:
- Telemetry helper logs raw error context to browser console (`src/lib/telemetry.ts`).
- UI surfaces server error messages directly in multiple flows.
- PDF and email templates escape dynamic text fields.

Risks:
- Over-detailed error messages can leak internal behavior/state.

## 6) Validation Coverage

Good:
- String length guardrails exist (`convex/lib/validation.ts`).
- Questionnaire response types validated against schema/logic.

Gaps:
- Multiple numeric fields accept unconstrained `v.number()` without safe domain bounds (e.g., profile/session updates).
- Analytics event paths and source tags accept free-text (length checked, but semantic validation is limited).

## 7) Findings and Severity

| ID | Finding | Severity | Evidence |
|---|---|---|---|
| A-03-01 | Analytics dashboard query lacks explicit auth gate | P2 | `convex/analytics/queries.ts` |
| A-03-02 | Marketing event mutation allows anonymous high-volume writes | P1 | `convex/analytics/mutations.ts` |
| A-03-03 | Proxy protected-path logic is narrow (`/dashboard` only) | P2 | `src/i18n/navigation.ts` |
| A-03-04 | Numeric bounds not consistently enforced on mutation inputs | P2 | `convex/profiles/mutations.ts`, `convex/sessions/mutations.ts` |
| A-03-05 | Client may surface/log internal error details | P2 | `src/lib/telemetry.ts`, auth/results flows |
| A-03-06 | Consent cookie lacks explicit production `Secure` flag | P3 | `src/lib/cookieConsent.ts` |

## 8) Remediation Directions

1. Require auth (and likely admin role) for analytics KPI query.
2. Add throttling/abuse control on analytics mutation; consider server-side sampling.
3. Expand server-side protected-route detection to include `/fit`, `/bikes`, `/profile`.
4. Add numeric domain validation helpers (min/max sanity limits) for profile/session inputs.
5. Introduce user-safe error mapping to avoid exposing raw backend messages.
6. Set production `Secure` flag on non-essential cookies and verify auth cookie attributes in production.

## 9) Completion Status

Step 03 completed with code-backed findings and prioritized remediation list.

