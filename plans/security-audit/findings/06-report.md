# Security Audit: Consolidated Findings Report

**Date**: 2026-04-14
**Auditor**: Claude Code (automated code review)
**Scope**: BestBikeFit4U codebase — auth, Convex mutations, Next.js API routes, CSP, dependencies

---

## Executive Summary

19 findings were identified across 5 audit areas: 1 Critical, 4 High, 6 Medium, and 8 Low. A remediation pass has now closed all 19 of them in code and dependencies.

---

## Finding Inventory

| ID | Severity | Area | Title | Location | Status |
|----|----------|------|-------|----------|--------|
| F-01 | Critical | Auth | `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET` in client bundle | `src/app/(auth)/login/page.tsx:285` | Fixed |
| F-02 | High | Auth | Dev-login hostname check bypassed by client-supplied data | `convex/auth.ts:193` | Fixed |
| F-03 | Medium | Auth | Middleware doesn't verify `adminRole` for `/admin` paths | `src/proxy.ts:182` | Fixed |
| F-04 | Medium | Backend | `caseStudyLeads/submit` — unauthenticated, triggers emails, no rate limit | `convex/caseStudyLeads/mutations.ts:13` | Fixed |
| F-05 | Low | Backend | `updateGuide` / `importGuide` — `seoHints` accepts `v.any()` | `convex/guides/mutations.ts:133,642` | Fixed |
| F-06 | Low | Backend | `getFeatureFlags` — public query, no auth | `convex/system/queries.ts:3` | Fixed |
| F-07 | Medium | API Routes | `/api/preview` — `PREVIEW_SECRET` in URL query string | `src/app/api/preview/route.ts:15` | Fixed |
| F-08 | Medium | API Routes | `/api/marktplaats/image` — no auth, no rate limiting | `src/app/api/marktplaats/image/route.ts:13` | Fixed |
| F-09 | Medium | API Routes | IP rate limit bypassable via `X-Forwarded-For` spoofing | `src/lib/ipHash.ts:15` | Fixed |
| F-10 | Low | API Routes | `/api/health/config` — exposes deployment environment | `src/app/api/health/config/route.ts:27` | Fixed |
| F-11 | Low | API Routes | `/api/preview-exit` — unauthenticated | `src/app/api/preview-exit/route.ts` | Fixed |
| F-12 | Low | API Routes | `/api/stripe/checkout` — hardcoded production URL fallback | `src/app/api/stripe/checkout/route.ts:23` | Fixed |
| F-13 | High | CSP | `script-src 'unsafe-inline'` disables XSS protection | `next.config.ts:38` | Fixed |
| F-14 | Low | CSP | `style-src 'unsafe-inline'` | `next.config.ts:39` | Fixed |
| F-15 | Low | CSP | Missing `object-src`, `base-uri`, `form-action` directives | `next.config.ts:31` | Fixed |
| F-16 | High | Deps | `rollup` Arbitrary File Write — dev only | `node_modules/rollup` | Fixed |
| F-17 | High | Deps | `vite` — 3 CVEs affecting dev server | `node_modules/vite` | Fixed |
| F-18 | Medium | Deps | Stripe webhook — non-constant-time HMAC comparison | `convex/http.ts:195` | Fixed |
| F-19 | Low | Deps | `stripe` package major version behind | `package.json` | Fixed |

---

## Critical and High Findings (Detailed)

### F-01 — `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET` Exposed in Client Bundle

**Status**: Fixed

**Severity**: Critical
**Area**: Auth
**Location**: `src/app/(auth)/login/page.tsx:285`, `convex/auth.ts:176`

**Fix summary**: The client now posts to `/api/auth/localhost-dev`, and that route reads `LOCALHOST_DEV_LOGIN_SECRET` server-side before setting auth cookies. The login page no longer references `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET`.

**Estimated effort**: S (< 1 day)

---

### F-02 — Dev-Login Hostname Check Bypassed by Client-Supplied Data

**Status**: Fixed

**Severity**: High
**Area**: Auth
**Location**: `convex/auth.ts:193-196`

**Fix summary**: The spoofable hostname field was removed from the Convex provider, and localhost gating now happens in the Next.js route using the actual request hostname.

**Estimated effort**: S

---

### F-13 — `script-src 'unsafe-inline'` Disables XSS Protection

**Status**: Fixed

**Severity**: High
**Area**: CSP
**Location**: `next.config.ts:38`

**Fix summary**: `script-src` now uses a per-request nonce generated in middleware. Inline theme bootstrap and JSON-LD scripts receive the nonce, and GTM injection also applies it before appending the remote script.

**Estimated effort**: M

---

### F-16 & F-17 — Dev Dependency CVEs (rollup, vite)

**Status**: Fixed

**Severity**: High
**Area**: Deps
**Location**: `node_modules/rollup`, `node_modules/vite`

**Fix summary**: `next`, `eslint-config-next`, `vitest`, `@sentry/nextjs`, and related transitive packages were upgraded, and `npm audit` is now clean.

**Estimated effort**: S (< 1 hour)

---

## Medium Findings (Summary)

| ID | Location | Issue | Recommendation |
|----|----------|-------|----------------|
| F-03 | `src/proxy.ts:182` | `/admin` paths: middleware only checks auth, not adminRole | Fixed |
| F-04 | `convex/caseStudyLeads/mutations.ts:13` | Unauthenticated mutation triggers emails, no rate limit | Fixed |
| F-07 | `src/app/api/preview/route.ts:15` | `PREVIEW_SECRET` in URL query string (logs, history, Referer) | Fixed |
| F-08 | `src/app/api/marktplaats/image/route.ts:13` | No auth, no rate limit on image proxy | Fixed |
| F-09 | `src/lib/ipHash.ts:15` | `X-Forwarded-For` spoofing bypasses rate limits | Fixed |
| F-18 | `convex/http.ts:195` | Stripe webhook HMAC comparison is not constant-time | Fixed |

---

## Low and Info Findings (Summary)

- **F-05**: `seoHints: v.any()` in guide mutations — fixed with a typed validator
- **F-06**: `getFeatureFlags` public query — fixed by returning `{}` to unauthenticated callers
- **F-10**: `/api/health/config` revealed `deploymentEnv` — fixed by removing the field
- **F-11**: `/api/preview-exit` no auth — fixed by requiring a Convex auth token
- **F-12**: Stripe checkout hardcoded prod URL fallback — fixed with request-origin fallback outside production
- **F-14**: `style-src 'unsafe-inline'` — fixed by replacing inline style usage with static CSS bucket selectors and tightening CSP to `style-src 'self'`
- **F-15**: Missing `object-src`, `base-uri`, `form-action` CSP directives — fixed
- **F-19**: `stripe@21` → `22` — fixed
- **Info**: `IP_HASH_SALT`, `UPSTASH_REDIS_REST_URL/TOKEN` were missing from `.env.example` — fixed
- **Info**: `ENGINE_V2_DYNAMIC_VALIDATION_ENABLED`, `PDF_RICH_RENDER_ENABLED` undocumented — fixed

---

## Remediation Roadmap

### Remaining roadmap

No open findings remain from this audit pass.

---

## What is Working Well

- **`requireX` ownership pattern** — all 35+ Convex modules consistently use `requireUserId()` + record ownership checks. No IDOR vulnerabilities found.
- **Admin role enforcement** — full chain (middleware → layout → mutation) is correct for all existing admin routes. `requireAdminRole()` double-checks at the DB layer.
- **Admin middleware** — `/admin` now rejects authenticated non-admin users before the layout renders.
- **Stripe webhook** — raw body used for HMAC verification, timestamp tolerance enforced, and the signature comparison now uses a constant-time helper.
- **Localhost dev login secret** — moved entirely server-side; no longer exposed in the browser bundle.
- **Preview flow** — no longer places a secret in the URL, and preview-exit now requires auth.
- **Public route hardening** — Marktplaats image proxy now requires auth and rate limiting; health config no longer reveals deployment environment.
- **Rate limit IP handling** — prefers proxy-trusted headers instead of the spoofable leftmost `X-Forwarded-For` value.
- **Feature flag exposure** — unauthenticated callers no longer receive live feature flag values.
- **Auth rate limiting** — magic code limited to 3 / 15 min per email. Marketing events have inline token-bucket limiting.
- **Strava OAuth CSRF** — `state` parameter validated against the database with expiry. Correct.
- **PDF session ownership** — `getReportV2` query checks `session.userId !== userId` before returning data.
- **CSP headers** — `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy` are all set.
- **Staging noindex** — `X-Robots-Tag: noindex, nofollow, noarchive` correctly applied to all non-production hostnames.
- **Source maps** — disabled in Sentry production upload. No stack traces exposed via Sentry.
- **No secrets committed** — no `.env` files in git history.
- **No non-registry dependencies** — all packages install from npm with standard integrity checks.
- **Marktplaats SSRF prevention** — URL allowlist correctly restricts the image proxy to `*.marktplaats.nl` / `*.marktplaats.com` over HTTPS only.

---

## Verification

`npm audit --json` reports 0 vulnerabilities. `npm run build` passes on Next.js `16.2.3`, and `npm run typecheck` passes after regenerating `.next/types`.

**Current status: 19 findings total; 19 fixed. Audit, build, and typecheck pass.**
