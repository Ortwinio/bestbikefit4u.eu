# M2 Google OAuth ownership

B implements dedicated Next route handlers for `/api/auth/signin/[...path]` and
`/api/auth/callback/[...path]`, a scoped proxy helper and contract tests. No edits to
`next.config.ts` are needed; A retains exclusive ownership of config/redirects.
B also owns the narrow `src/proxy.ts` OAuth namespace bypass, its focused tests,
Strava callback tests and `audit/M2-auth.md`.

Keep `NEXT_PUBLIC_CONVEX_SITE_URL` pointed at the Convex HTTP actions origin, never the app origin.
Required Convex `CUSTOM_AUTH_SITE_URL=https://bikefitboost.com` and `SITE_URL=https://bikefitboost.com`
will be documented; no environment changes are performed. A owns origin-helper changes in
`convex/integrations/actions.ts` and broader docs/environment examples.
