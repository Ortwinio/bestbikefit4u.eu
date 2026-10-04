# M1 backend and return-URL wiring

- Strava authorization uses the shared `resolveSiteOrigin()` for its callback URI.
- Lifecycle action links and email preference page links use the same dynamically resolved origin. Signed tokens and private fragment placement are unchanged.
- One-click unsubscribe still targets `CONVEX_SITE_URL`; its existing required HTTPS, credentials/path/query/fragment and `.convex.cloud` refusal remain intact.
- Stripe checkout's shared origin helper and the portal return URL now use the canonical fallback instead of trusting the incoming request host. Authentication and Stripe customer ownership checks remain unchanged.
- Local development auth uses the shared resolver and retains its NODE_ENV, VERCEL_ENV, production Convex deployment and localhost-only checks. Missing or invalid origins resolve to the production apex and therefore cannot enable local auth.
- The health config route only reads Convex endpoint presence, not SITE_URL; no change was necessary.

## Validation

- Focused Vitest: 6 files, 61 tests passed. Covers missing/malformed/credentialed origins, legacy hosts and subdomains, apex/www normalization, explicit localhost, Strava callback parameters, portal returns, email links, preference token validation and production auth refusal.
- Focused ESLint for all 12 changed source/test files: passed.
- `git diff --check`: passed.
- All tests are local with mocked network/service operations. No mail, OAuth request, Stripe operation, Convex deployment, production data operation or environment mutation was performed.

Shared full gates are owned by the parent M1 agent.

## Follow-up from combined unit gate

- Updated only expectations/fixtures in the email layout and template tests from the previous www origin to the canonical apex, including the image URL regex. No rendered markup or copy changed.
- Focused email layout/template rerun: 2 files, 36 tests passed.
- Other Convex www scan: guide mutation contract fixture/error expectations delegated to the documentation cleanup worker by the parent; origin regression tests intentionally retain www as alias input.
