# Output 01 - Security Inventory and Threat Model

Date: `2026-02-23`  
Plan: `plans/security-website-security-audit-hardening`  
Step: `01-security-inventory-and-threat-model.md`

## 1) Executive Summary

This step mapped the current attack surface and trust boundaries of `bestbikefit4u.eu` based on code inspection of `src/`, `convex/`, CI, and deployment config.

Current state:
- Strong ownership checks exist in many backend paths (`requireSessionOwner`, `requireBikeOwner`, `requireRecommendationOwner`).
- Baseline security headers are configured.
- Major improvement areas are around public analytics endpoints, CSP hardening, abuse throttling, and security operations controls.

No confirmed `P0` from this static review.  
Multiple `P1/P2` risks are identified below with evidence and remediation direction.

## 2) Asset Inventory

### 2.1 Web Surface (Next.js)

Public pages:
- Marketing + SEO pages under `src/app/(public)/**`
- Localized routing via proxy rewrite/redirect (`src/proxy.ts`, `src/i18n/proxyDecision.ts`)
- XML sitemap routes (`src/app/sitemap*.xml/route.ts`)

Authenticated pages:
- Dashboard flows under `src/app/(dashboard)/**`:
  - `/dashboard`, `/fit/*`, `/bikes/*`, `/profile`

API routes:
- PDF report download: `src/app/api/reports/[sessionId]/pdf/route.ts`

### 2.2 Backend Surface (Convex)

Core domains:
- Auth and session handling: `convex/auth.ts`, `convex/authRateLimit.ts`, `convex/lib/authz.ts`
- Profiles: `convex/profiles/*`
- Bikes: `convex/bikes/*`
- Fit sessions: `convex/sessions/*`
- Questionnaire: `convex/questionnaire/*`
- Recommendations: `convex/recommendations/*`
- Emails: `convex/emails/*`
- Analytics: `convex/analytics/*`

### 2.3 Data Stores (Convex Tables)

From `convex/schema.ts`:
- `users`, `profiles`, `bikes`, `fitSessions`, `questionnaireResponses`, `recommendations`, `emailReports`, `questionDefinitions`, `marketingEvents` (+ auth tables).

### 2.4 External Integrations / Dependencies

- Convex Cloud (`NEXT_PUBLIC_CONVEX_URL`)
- Resend email provider (`AUTH_RESEND_KEY`)
- Google Tag Manager (`src/app/layout.tsx`)
- Vercel hosting/build
- Playwright runtime for rich PDF generation (`src/lib/pdf/htmlPdf.ts`)

## 3) Data Classification

High sensitivity:
- User account identifiers and email (`users`)
- Body and injury data (`profiles`)
- Pain points and riding context (`fitSessions`, `questionnaireResponses`)
- Personalized recommendation outputs (`recommendations`)

Medium sensitivity:
- Email delivery metadata (`emailReports`)
- Operational error metadata that may include context (`src/lib/telemetry.ts`)

Low sensitivity:
- Marketing funnel interaction events (`marketingEvents`)
- Public SEO content/routes

## 4) Trust Boundaries

1. Browser (untrusted input):
- User-entered profile, questionnaire, bike setup, auth email/code input.

2. Next.js app layer:
- Localized routing/proxy and page rendering.
- API route for PDF generation (server-side token-based access).

3. Convex backend:
- Source of truth for auth, ownership checks, and recommendation data.

4. Third-party services:
- Resend for email delivery.
- GTM for tracking.

5. Infrastructure boundary:
- Vercel env/config + Convex deployment configuration and team access.

## 5) AuthN/AuthZ Flow Snapshot

Observed controls:
- Auth is handled through `@convex-dev/auth` magic code flow (`convex/auth.ts`).
- Backend ownership helpers are used broadly (`convex/lib/authz.ts`).
- API PDF route requires server token via `convexAuthNextjsToken()`.

Observed gaps:
- Route-level proxy auth check only treats `/dashboard` as protected (`src/i18n/navigation.ts:isProtectedDashboardPath`), not `/fit`, `/bikes`, `/profile`.
- Analytics query access lacks explicit auth guard (`convex/analytics/queries.ts`).

## 6) Threat Model (STRIDE-Oriented)

### Spoofing
- Attempt to access other users’ sessions/recommendations by ID.
  - Mitigated in key paths via ownership checks.

### Tampering
- Unauthorized modifications to bikes/profiles/sessions.
  - Mostly mitigated by authz helpers, but numeric input bounds are weak in several mutations.

### Repudiation
- Limited explicit security audit trail for sensitive operations.
  - Error logging exists, but structured security event logging is not defined.

### Information Disclosure
- Possible exposure of analytics KPI data through unauthenticated query.
- Error messages may be surfaced to users and browser console with contextual metadata.

### Denial of Service
- Public marketing event logging is unauthenticated and unthrottled.
- PDF generation endpoint can be computationally expensive and lacks explicit rate limiting.

### Elevation of Privilege
- No direct privilege-escalation path confirmed in inspected ownership-guarded data mutations.
- Defense-in-depth weakened by permissive CSP (`unsafe-inline`) and inline script usage.

## 7) Top Attack Paths

1. Analytics poisoning / cost inflation:
- Anonymous actor repeatedly calls `analytics/mutations:logMarketingEvent`.
- Result: noisy KPIs + storage/compute cost growth.

2. KPI data scraping:
- Anonymous actor calls `analytics/queries:getKpiDashboard`.
- Result: business analytics exposure.

3. PDF generation abuse:
- Authenticated attacker automates report downloads to stress rendering path.
- Result: expensive compute spikes, degraded service.

4. Script injection blast radius:
- Any future XSS vector has higher impact due inline script allowances in CSP.

## 8) Risk Register (Initial)

| ID | Risk | Severity | Evidence | Likely Owner |
|---|---|---|---|---|
| R-01 | KPI analytics query appears unauthenticated (data exposure) | P2 | `convex/analytics/queries.ts` | Backend |
| R-02 | Marketing event mutation is unauthenticated + no abuse throttling | P1 | `convex/analytics/mutations.ts` | Backend |
| R-03 | Proxy protection scope is narrow (`/dashboard` only) | P2 | `src/i18n/navigation.ts`, `src/i18n/proxyDecision.ts` | Frontend/Platform |
| R-04 | CSP allows `'unsafe-inline'` for scripts/styles | P2 | `next.config.ts` | Frontend/Platform |
| R-05 | GTM script injected globally in head before consent gating | P3 | `src/app/layout.tsx` | Frontend |
| R-06 | PDF route lacks explicit rate limiting / abuse controls | P2 | `src/app/api/reports/[sessionId]/pdf/route.ts` | Backend/Platform |
| R-07 | Error details can propagate to client messaging/log context | P2 | `src/lib/telemetry.ts`, dashboard result flows | Frontend/Backend |
| R-08 | Numeric/domain bounds are weak in several mutations | P2 | `convex/profiles/mutations.ts`, `convex/sessions/mutations.ts` | Backend |
| R-09 | Security CI gates do not include dependency/secret scans | P2 | `.github/workflows/ci.yml` | Platform |
| R-10 | Env preflight checks only a minimal subset of security-critical vars | P3 | `scripts/check-vercel-env.mjs` | Platform |
| R-11 | Email report recipient restriction depends on optional `user.email` presence | P2 | `convex/emails/actions.ts` | Backend |
| R-12 | No formal incident telemetry/alerting strategy defined in repo | P3 | repo-wide | Platform/Ops |

## 9) Existing Controls Worth Keeping

- Ownership authorization helpers are consistently used in core data domains.
- Email magic code generation uses secure randomness and verification request rate limiting.
- Security headers include frame deny, no-sniff, referrer policy, and permissions policy.
- PDF API responses set `Cache-Control: no-store`.
- HTML generation for email/PDF templates escapes dynamic user-facing text.

## 10) Open Questions for Step 02+

1. Is `analytics/queries:getKpiDashboard` intentionally public for a planned dashboard, or should it be admin-only?
2. Should `/fit`, `/bikes`, `/profile` be server-protected at proxy level like `/dashboard`?
3. Is GTM expected to load only after explicit consent?
4. Are there platform-level rate limits (WAF/edge) already configured for `/api/reports/*` and Convex mutation bursts?
5. What is the current secret rotation cadence and owner?

## 11) Handoff to Step 02

Step 02 should now run automated baseline checks to validate and quantify this register:
- Dependency + lockfile risk
- Secret leakage scanning
- Static checks for unsafe sinks and auth guard consistency
- Header/caching verification against deployed environment
- Reproducible command set for CI integration

