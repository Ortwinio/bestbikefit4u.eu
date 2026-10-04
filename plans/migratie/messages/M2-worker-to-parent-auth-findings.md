# M2 worker findings (2026-10-04)

Worker scope is `audit/M2-auth.md`, this message, `src/app/api/strava/callback/route.test.ts`, and now `docs/GOOGLE_SIGNIN_ROLLOUT.md` per the user's explicit follow-up. Parent retains Google proxy routes/helper and `src/proxy.ts`; A retains origins and environment examples. No commits or production actions.

Critical integration check: installed `@convex-dev/auth` 0.0.95, `src/nextjs/server/request.ts:35` consumes any HTML GET with `code`, unless `shouldHandleCode` excludes it. Both Google signin (its verifier is named `code`) and Google callback must bypass this. **Also exclude `/api/strava/callback`**: a real Strava browser return contains `code` and Accept text/html. Current Strava route unit tests alone cannot cover middleware interception. Keep app landing pages eligible for Convex verification-code exchange and preserve `/api/auth` POST and localhost-dev behavior.

`CUSTOM_AUTH_SITE_URL=https://bikefitboost.com` controls BOTH signin and callback URLs (`src/server/implementation/signIn.ts:239`, `src/server/oauth/convexAuth.ts:12` in the installed package). Convex `SITE_URL=https://bikefitboost.com` separately controls landing URL validation. No trailing slash for CUSTOM_AUTH_SITE_URL. Keep NEXT_PUBLIC_CONVEX_SITE_URL on the Convex HTTP origin.

OAuth cookies are host-only, HttpOnly, Secure, SameSite=None, Path=/, Partitioned (`src/server/cookies.ts:3`); forward each Set-Cookie separately without comma splitting, and callback Cookie headers unchanged. Next auth cookies are separately SameSite=Lax. Installed callback handler does not serialize returned cookie-clearing instructions (`src/server/implementation/index.ts:322`); don't claim the proxy fixes that library behavior.

A recommendations: Google Console values and sequencing are in `audit/M2-auth.md` and the now-updated rollout doc. A retains .env.example. Strava intended callback is `https://bikefitboost.com/api/strava/callback`, not the stale direct-Convex comment at `convex/http.ts:37`. Strava app callback domain should be `bikefitboost.com`. Origin changes in actions remain A-owned.

## Completed handoff

The middleware concern above is resolved in the current parent source: `src/proxy.ts:274` bypasses Google namespaces and exactly the Strava callback. Parent handler/helper source reviewed; audit and rollout now describe that implementation. Worker scope is frozen at the four files listed above; parent can update README/aggregate manifests.

Validation: 19 Strava route tests pass; focused ESLint passes. Combined `./node_modules/.bin/vitest run src/app/api/strava/callback/route.test.ts src/lib/auth/oauthProxy.test.ts src/proxy.oauth.contract.test.ts` passes **61 tests across 3 files**. Scoped rollout-doc diff whitespace check passes. Mocked transport/middleware evidence only; real browser cookies/provider sign-in, Console state, combined build and release remain owner/parent gates. No builds/servers/new dependencies or actual environment edits.
