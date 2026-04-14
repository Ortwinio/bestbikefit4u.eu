# Findings: Next.js API Route Audit

## Route Summary Table

| Route | Auth | Input Validated | Rate Limited | Severity |
|-------|------|----------------|--------------|----------|
| `/api/health/config` | None | N/A | No | Low (fixed) |
| `/api/guide-redirects` | None | N/A | No | Info (by design) |
| `/api/preview` | Convex token | Yes | No | Medium (fixed) |
| `/api/preview-exit` | Convex token | No | No | Low (fixed) |
| `/api/public-fit/lookup` | None (by design) | Yes | Yes (IP) | Medium |
| `/api/public-fit/quick-match` | None (by design) | Yes | Yes (IP) | Medium |
| `/api/reports/[sessionId]/pdf` | Convex token + tier | Yes (Convex) | Yes (Convex) | OK |
| `/api/strava/callback` | OAuth state param | N/A | No | OK |
| `/api/stripe/checkout` | Convex token | Partial | No | Low (fixed) |
| `/api/marktplaats/image` | Convex token | URL allowlist | Yes (IP) | Medium (fixed) |

---

## Findings

### [MEDIUM] F-07: `/api/preview` — `PREVIEW_SECRET` passed as URL query parameter

**Status**: Fixed

**Resolved in**: `src/app/api/preview/route.ts`, `src/components/admin/guides/GuideEditView.tsx`

**Original location**: `src/app/api/preview/route.ts:15`

**Original issue**: The preview secret was validated via a URL query parameter, which exposed it to logs, browser history, and referrers.

**Fix**: `/api/preview` is now POST-only, reads `{ id, locale }` from the JSON body, and relies on the authenticated Convex token plus the `getDraftGuide` authorization check. The frontend opens preview via a fetch request instead of a URL containing a secret.

---

### [MEDIUM] F-08: `/api/marktplaats/image` — no authentication, no rate limiting

**Status**: Fixed

**Resolved in**: `src/app/api/marktplaats/image/route.ts`

**Original location**: `src/app/api/marktplaats/image/route.ts:13`

**Issue**: The image proxy is completely unauthenticated and has no rate limiting. Anyone can use it to:
1. Hotlink Marktplaats images at scale, consuming egress bandwidth
2. Probe image URLs at marktplaats.nl (or its CDN) through your infrastructure, potentially tying your IP to unwanted traffic

The URL allowlist (`marktplaats.nl`, `www.marktplaats.nl`, `*.marktplaats.nl`, `*.marktplaats.com`) is correct, but without rate limiting the endpoint is trivially abused.

**Fix**: The route now requires a valid Convex auth token and applies a 20 requests / 60 seconds limiter using the hashed client IP.

---

### [MEDIUM] F-09: IP rate limiting bypassable via `X-Forwarded-For` spoofing

**Status**: Fixed

**Resolved in**: `src/lib/ipHash.ts`

**Original location**: `src/lib/ipHash.ts:15-18`

**Issue**: `getClientIp` takes the first value from the `X-Forwarded-For` header:

```ts
const forwarded = request.headers.get("x-forwarded-for");
if (forwarded) {
  return forwarded.split(",")[0]?.trim() ?? null;
}
```

A client can set `X-Forwarded-For: 1.2.3.4` in their request. This rotates the rate-limit key with each request, bypassing the 3 lookups / 5 minutes limit on `/api/public-fit/lookup` and `/api/public-fit/quick-match`.

**Reproduction**: Send `POST /api/public-fit/lookup` with `X-Forwarded-For: 1.2.3.4` (then `.5`, then `.6`, etc.) to bypass the 3-request limit.

**Fix**: `getClientIp` now prefers `x-vercel-forwarded-for`, then `x-real-ip`, and only falls back to the rightmost `x-forwarded-for` entry.

---

### [Low] F-10: `/api/health/config` — public, reveals deployment environment

**Status**: Fixed

**Resolved in**: `src/app/api/health/config/route.ts`

**Original location**: `src/app/api/health/config/route.ts:27`

**Original issue**: The endpoint exposed a `deploymentEnv` field publicly.

**Fix**: The response no longer includes `deploymentEnv`; it now returns only `ok`, required/optional presence flags, and a timestamp.

---

### [Low] F-11: `/api/preview-exit` — unauthenticated, anyone can disable draft mode

**Status**: Fixed

**Resolved in**: `src/app/api/preview-exit/route.ts`

**Original location**: `src/app/api/preview-exit/route.ts`

**Original issue**: No authentication check. Any user could call the route for their own browser session.

**Fix**: The route now requires a valid Convex auth token before draft mode is disabled.

---

### [Low] F-12: `/api/stripe/checkout` — hardcoded production URL fallback

**Status**: Fixed

**Resolved in**: `src/app/api/stripe/checkout/route.ts`

**Original location**: `src/app/api/stripe/checkout/route.ts:23`

**Original issue**: The fallback `SITE_URL` was hardcoded to production.

**Fix**: Production now requires `SITE_URL`; non-production falls back to `new URL(request.url).origin`.

---

## Specific Checks

### `/api/reports/[sessionId]/pdf` — Session ownership

The PDF route authenticates via Convex token, checks tier, and then calls `api.recommendations.queries.getReportV2`. That query (`convex/recommendations/queries.ts:106`) explicitly checks `session.userId !== userId` and returns `null` on mismatch. **Ownership is correctly enforced.** No IDOR.

### `/api/strava/callback` — OAuth CSRF

The callback validates the `state` parameter against `internal.integrations.queries.getStravaIntegrationByState`. The state also has an expiry check (`oauthStateExpiresAt`). **OAuth CSRF is correctly prevented.** Code exchange is server-side only.

### `/api/stripe/checkout` — Price ID source

`stripePriceId` is read from `process.env.STRIPE_PRO_PRICE_ID`. **Not user-controlled.** Dynamic price injection is not possible.

### `/api/marktplaats/image` — SSRF

URL validation is correctly enforced: only `https:` protocol and a strict hostname allowlist (`marktplaats.nl` and subdomains). **SSRF is prevented** by the allowlist, though an attacker could still enumerate Marktplaats at scale (F-08).

### IP rate limiting — storage

The rate limiter uses Upstash Redis when `UPSTASH_REDIS_REST_URL` is set (shared across serverless instances). Falls back to in-memory if Upstash is not configured. **In-memory rate limiting is per-instance and resets on cold start** — this is a known limitation documented in the `rateLimiter.ts` return value (`mode: "fail_open"` or `mode: "memory"`).
