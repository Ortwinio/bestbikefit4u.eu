# Output 05: Validation And Cutover

Date: `2026-02-19`
Plan step: `05-validate-regression-and-cutover.md`

## Validation Summary

- Code quality gates passed (`lint`, `typecheck`, `test:unit`, `test:contracts`, production `build`).
- Runtime smoke checks on a fresh production build (`next start -p 3010`) show rebrand updates are present across public/auth routes and metadata titles.
- Residual reference audit is clean for active runtime/config surfaces.
- Production-readiness blocker found: auth email send from `bestbikefit4u.eu` is not yet authorized in Resend.

## Residual Reference Audit

Command:

```bash
rg -n "BikeFit AI|BikeFIT|support@bikefitai.com|bikefit-report-" src convex .env.example docs
```

Result:

- No active runtime/config matches.
- Expected intentional exceptions:
  - `docs/DEVELOPMENT_PLAN.md` (historical document title)
  - `src/config/brand.ts` (`legacyName` constant)

Internal package identifier check:

```bash
rg -n "bikefit-ai" package.json
```

- `package.json` still uses `"name": "bikefit-ai"` (explicitly deferred by design).

## Quality Gates

Executed:

1. `npm run lint` -> pass
2. `npm run typecheck` -> pass
3. `npm run test:unit` -> pass (`10 files`, `42 tests`)
4. `npm run test:contracts` -> pass (`5 files`, `15 tests`)
5. `npm run build -- --webpack` -> pass

Notes:

- Expected stderr appears in `pdf route` failure-path test (`Error: boom`) because the test intentionally asserts the 500 fallback behavior.

## Manual Smoke Evidence

## 1) Public pages + metadata (fresh build on `http://127.0.0.1:3010`)

Routes checked:

- `/` -> `307` to `/en` -> `200`, title `BestBikeFit4U - Personalized Bike Fitting Recommendations`
- `/about` -> title `How BestBikeFit4U Works - Bike Fitting Methodology`
- `/pricing` -> title `Pricing - BestBikeFit4U Plans and Features`
- `/faq` -> title `FAQ - BestBikeFit4U`
- `/contact` -> title `Contact Us - BestBikeFit4U`
- `/calculators/saddle-height` -> title `Saddle Height Calculator | BestBikeFit4U`

## 2) Auth login email flow

- `/login` -> `307` to `/en/login` -> `200`
- `/en/login` HTML includes:
  - `BestBikeFit4U` brand title
  - `Sign in to BestBikeFit4U`
  - `Send Login Code`
  - email-tooltip copy with `BestBikeFit4U account`

CLI auth trigger check:

```bash
npx convex run auth:signIn '{"provider":"resend","params":{"email":"qa-backdoor-1771162200@bikefit.ai"}}'
```

Result:

- Fails with: `Failed to send verification email: Not authorized to send emails from bestbikefit4u.eu`
- Interpretation: code path works, but production sender/domain verification is not complete.

## 3) Dashboard start session -> results

- `/dashboard` redirects to login when unauthenticated (`307` to `/en/dashboard`, then auth redirect).
- `/en/fit` and `/en/fit/fake-session/results` return `200` and render updated brand title.
- Existing behavior note from earlier audit remains: `/fit` protection is not enforced server-side like `/dashboard` (tracked separately, non-blocking for rebrand scope).

## 4) Report email/PDF generation paths

- PDF API unauth check:
  - `GET /api/reports/session_foo/pdf` -> `401 {"error":"Not authenticated."}` (expected)
- Report route unit test:
  - `src/app/api/reports/[sessionId]/pdf/route.test.ts` passed with updated `bestbikefit4u-report-*` filename + `BestBikeFit4U` report title assertions.
- Report email action path:
  - `test:contracts` `sendFitReport.contract.test.ts` passed (dev-mode send path validated).

## Production Cutover Checklist

## A) Convex Environment Updates

1. Confirm Convex prod env values:
   - `SITE_URL=https://bestbikefit4u.eu`
   - `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@bestbikefit4u.eu>`
   - `AUTH_RESEND_KEY=<valid production key>`
2. Deploy backend after env validation:
   - `npx convex deploy --prod`
3. Re-run auth smoke:
   - `npx convex run auth:signIn ...` should succeed (no sender authorization error).

## B) Vercel Environment Updates

1. Confirm `NEXT_PUBLIC_CONVEX_URL` points to production Convex deployment.
2. Confirm Vercel build command remains `npm run build:vercel`.
3. Trigger production deploy and verify preflight passes.

## C) Sender/Domain Verification

1. In Resend, verify domain `bestbikefit4u.eu`.
2. Ensure `noreply@bestbikefit4u.eu` is an authorized from-address.
3. Ensure `support@bestbikefit4u.eu` mailbox/forwarding is active.
4. Re-test:
   - login code email delivery
   - fit report email delivery

## D) Release Validation

1. End-to-end login in production (`/login` -> code -> dashboard).
2. New fit session flow to results.
3. PDF download from results page.
4. Send report email to authenticated user email.
5. Confirm no visible `BikeFit AI` strings remain in active routes.

## E) Rollback Plan

If critical issue appears post-release:

1. Revert to previous deployed frontend version in Vercel.
2. Revert Convex deploy to prior stable commit/deployment.
3. Temporarily set `AUTH_EMAIL_FROM` back to last known working sender identity.
4. Communicate incident + ETA in ops channel and freeze further config changes until stabilized.

## F) Post-Release Monitoring (first 24h)

1. Auth email send success/failure rate (Resend + Convex logs).
2. PDF endpoint error rate (`/api/reports/*/pdf`).
3. Login conversion and dashboard route errors.
4. Manual spot-check of EN/NL metadata and structured-data brand fields.

## Status

- Step 05 is **not complete yet** due one external blocker:
  - Resend sender authorization for `bestbikefit4u.eu`.
- After sender/domain verification is fixed and auth/report email smoke passes, Step 05 can be marked complete immediately.
