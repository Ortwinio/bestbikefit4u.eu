# Coordinated frontend and backend release

Prepared: 2026-09-27

## Candidate

- Application commit: `a7283c0` (`Fix signup reliability, security boundaries, and page loading`).
- Branch: `codex/technical-security-review`.
- Previous main commit: `a2da02d`.
- Targets: existing Vercel frontend and Convex production backend.
- Validation: 742 tests, lint, typecheck, production build, 20 HTTP route checks and dependency audit passed. See [validation-report.md](validation-report.md).

## Included changes

- Frontend: reliable login hydration and verification handling, complete onboarding validation, CSP fixes, dependency upgrades, deferred client components and homepage media.
- Backend: explicit email configuration failure, verified-login timestamps, Stripe ownership and webhook checks, shared storage-reference protection, bounded external downloads and hardened PDF rendering.
- Schema: new user profile-image and bike photo-reference indexes. Deploy these with the Convex functions that use them.

## Rollout

1. Confirm the selected production Convex deployment matches Vercel's public Convex URL. Check auth delivery configuration, Stripe prices/plans and legacy customer metadata without printing secrets.
2. Verify the candidate frontend builds in the existing Vercel project. Inspect deployment failures before promotion; GitHub currently reports failures for both Vercel projects on `a2da02d`.
3. Release the Convex functions and schema with the installed CLI (`npx convex deploy`; this command selects production by default). Wait for successful schema/index validation.
4. Promote the matching frontend revision immediately after the backend succeeds. The old frontend's checkout can call the removed customer-binding mutation, so minimize the interval between releases.
5. Check the deployed public pages, auth redirects and login CSP. Complete real email verification, first profile/fit, report export and billing checks with an authorized test identity.

## Recovery

Keep the previous frontend deployment and Git revision available. If the frontend fails after backend deployment, prioritize a forward fix; the old frontend may depend on removed functions. Restoring the old backend reintroduces security weaknesses and needs an explicit incident decision. Do not reset production data or remove storage objects to recover a code deployment.

## Outstanding evidence

- Email request reached the code-entry screen; mailbox receipt and verification remain unconfirmed.
- Google OAuth, live billing and the complete authenticated production fit/report journey have not been exercised.
- Production Stripe plan/price configuration and legacy customer metadata need verification.
- The user authorized production deployment. The release is published in [PR #1](https://github.com/Ortwinio/bestbikefit4u.eu/pull/1); main and production have not been changed.

## Deployment preflight results

### Vercel failure diagnosis

The primary preview failed in `scripts/check-vercel-env.mjs` before Next.js built:
`STRIPE_WEBHOOK_SECRET` and `STRIPE_PRO_MONTHLY_PRICE_ID` were missing. The
production-mode Node environment incorrectly classified previews as production.
The preflight now respects explicit `VERCEL_ENV` and no longer requires the
Convex-only webhook secret on Vercel. Five process-level regression tests cover
preview builds, production requirements and localhost rejection. The environment
template now uses the monthly price variable actually consumed by checkout.

Production's monthly price and Convex billing setup remain incomplete. The owner
authorized this release with Stripe payments disabled. Both billing flags are
false for production and previews in the two existing Vercel projects. New checkout
requests return 503 without contacting Stripe; English/Dutch purchase controls
show availability notices while free signup and existing paid access are preserved.
Existing subscriber portal access and verified webhooks are retained for account
management; this release does not cancel subscriptions or pause Stripe renewals.
Final local validation: 196 files / 764 tests pass, typecheck and lint pass.
Deployment is pending completion of the coordinated rollout.

- Convex production dry run passed against `elegant-panther-767.eu-west-1.convex.cloud`, including schema validation and both new indexes. No indexes would be deleted.
- Production auth configuration names are present and `SITE_URL` matches the live domain. No Stripe environment names or plan documents are present; confirm frontend billing status and align configuration before rollout.
- GitHub CI for `03c4abc` passed contracts, dependency audit, lint, typecheck, unit tests and build.
- Both Vercel previews failed. Inspect deployment logs after restoring Vercel sign-in; CLI credentials are empty and the browser requires login.
- CodeQL identified request-forgery data flow and a case-sensitive smoke-test script regex. Follow-up changes reconstruct fetch destinations from six fixed marketplace/image origins and reject other subdomains; the smoke check now includes uppercase script tags and asserts that boot scripts exist. The 21 affected fetch/import/proxy tests, typecheck and changed-file lint pass. CodeQL must rerun before promotion.
- Production release is held until frontend deployment can be completed alongside the backend. See [CodeQL request-forgery guidance](https://codeql.github.com/codeql-query-help/javascript/js-request-forgery/) for the fixed-origin construction rationale.
