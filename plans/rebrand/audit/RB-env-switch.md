# Release environment switch — lead only

No environment file, hosted variable, DNS record, auth provider, production record or mail was changed.
The code default is `https://www.bikefitboost.com`; `shared/brand.ts` is the canonical origin constant.
The old apex and www hosts permanently redirect to that origin with the original path and query.

| Variable / setting | Release action |
|---|---|
| Vercel `NEXT_PUBLIC_SITE_URL` | Set `https://www.bikefitboost.com`, rebuild frontend. Overrides the shared public origin. |
| Vercel `SITE_URL` | Set the same origin if configured; existing server billing/auth callbacks must agree. |
| Convex `SITE_URL` | Set the same origin: magic-code redirect validation, email CTAs/preferences, Strava return URLs. |
| Convex `NEXT_PUBLIC_SITE_URL` | If configured, align or remove stale override; it takes precedence in shared origin resolution. |
| `CONVEX_SITE_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` | Keep actual Convex deployment endpoints; these are NOT the public website origin. |
| `NEXT_PUBLIC_CONVEX_URL` | Keep the actual Convex data endpoint. |
| `AUTH_EMAIL_FROM` | Preserve sender address/domain. Code normalizes only the display name to BikeFitBoost. |
| OAuth/Strava allowed callback/origin settings | Lead verifies new frontend origin and existing Convex callback endpoints in provider dashboards. No automatic provider changes. |
| Vercel domain settings | Lead verifies apex bikefitboost.com redirects to www, old domains remain attached for redirects, certificates valid. |

Keep delivery/support addresses on `@bestbikefit4u.eu`, including `noreply@notifications.bestbikefit4u.eu`.
Neither the old host redirects nor a UI rename migrates accounts, cookies, saved browser state or OAuth
sessions across domains. Require sign-in again on the new host; do not copy authentication tokens.

Before release: verify NL/EN magic-code sign-in on the new origin; check email logo and CTAs, absolute
canonical/hreflang/OG/sitemaps, old-host deep-link/query redirects, installable manifest and unsubscribe
links. Keep the previous host allowlist for images until the redirect is proven. No Stripe activation
or pricing-v3 merge is part of this release. Rollback requires coordinated frontend/Convex origins;
do not point the shared override at an old host while host redirects are enabled (redirect loop).
