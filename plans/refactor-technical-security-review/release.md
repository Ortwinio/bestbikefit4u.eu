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
- This record does not claim a successful deployment. Publication and deployment status will be recorded after the requested release scope is confirmed.
