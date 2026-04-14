# Prompt 03 — Next.js API Route Audit

## Context

Read `plans/security-audit/README.md` first.

## Routes to audit

Read each file listed below in full. For every route, answer:
1. Is it authenticated? (How?)
2. Are inputs validated before use?
3. Does it expose sensitive data?
4. Does it have appropriate rate limiting?
5. Any other security concern?

### Routes

**`src/app/api/health/config/route.ts`**
- GET, no auth
- Returns which env vars are present: `AUTH_RESEND_KEY`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`
- Issue to investigate: Does revealing which env vars are configured help an attacker profile the deployment?
- Check if this should be restricted to internal/admin requests only

**`src/app/api/guide-redirects/route.ts`**
- GET, no auth required (by design — redirect data is public)
- Called internally by `src/proxy.ts` with `x-bbf-redirect-fetch: 1` header
- Issue: the route doesn't enforce the internal header — it's callable by anyone
- Check if this is intentional (public data) or if it needs rate limiting

**`src/app/api/preview/route.ts`**
- GET, validates `secret` query param against `process.env.PREVIEW_SECRET`
- Also requires Convex auth token
- Issue: Secret is in the URL query string — may appear in access logs, Referer headers, browser history
- Verify: Does it use `convexAuthNextjsToken()` to check admin role, or just any authenticated user?

**`src/app/api/preview-exit/route.ts`**
- Read the file — check if it has any abuse potential (can anyone disable draft mode?)

**`src/app/api/public-fit/lookup/route.ts`** and **`public-fit/quick-match/route.ts`**
- These are unauthenticated (by design — bike passport sharing)
- Check rate limiting implementation: reads `getClientIp`, `hashIp`, `consumeRateLimit`
- Is rate limit per-IP sufficient or can it be bypassed with X-Forwarded-For spoofing?
- Check `src/lib/ipHash.ts` and `src/lib/rateLimiter.ts`

**`src/app/api/reports/[sessionId]/pdf/route.ts`**
- Generates PDF for a session — must verify session ownership
- Check: Does it call `requireUserId()` or equivalent? Does it verify `session.userId === requestUserId`?

**`src/app/api/strava/callback/route.ts`**
- OAuth callback — handles `code` parameter from Strava
- Check: Is the `state` parameter validated to prevent CSRF on OAuth flow?
- Check: Is the code exchanged server-side only?

**`src/app/api/stripe/checkout/route.ts`**
- Creates Stripe checkout session
- Must be authenticated — check auth enforcement
- Check: Are the price IDs hardcoded or read from env? (hardcoded is fine, dynamic is risky)
- Check: Stripe webhook handling — is the signature verified?

**`src/app/api/marktplaats/image/route.ts`**
- Check: Does this proxy external images? If so, is the URL validated against an allowlist to prevent SSRF?

## IP extraction and rate limiting

Read `src/lib/ipHash.ts` and `src/lib/rateLimiter.ts`.

Check:
- Does `getClientIp` trust `X-Forwarded-For`? If so, can clients spoof it to bypass rate limits?
- Is the rate limit storage (in-memory? Redis? Convex?) shared across serverless instances?
- If in-memory: rate limits are per-instance and reset on cold start — note this as a limitation

## Output

Write findings to `plans/security-audit/findings/03-api-routes.md`.

Include a summary table:

| Route | Auth | Input Validated | Rate Limited | Severity |
|-------|------|----------------|--------------|----------|

Then list all findings using the severity format from prompt 01.
