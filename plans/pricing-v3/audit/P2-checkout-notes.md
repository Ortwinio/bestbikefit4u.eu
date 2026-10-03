# P2 checkout readiness

FINAL V3 VISUAL PASS: build6KW82hm49ljNYI1ddtwmm, all72 checkout cases /108 PNGs covered. 100 files match reviewed v2 hashes; eight changed files form four manually inspected pairs. Success CTA has verified16px gutters in both locales/flags; V01/V02/V03 closed. Source-ready-v3 has33 focused tests plus scoped lint/token audit passing. See P2-checkout-visual-review.md and P2-checkout-v3-hashes.json. Same-build disk CSS fallback is explicit; parent owns proxy HTTP500 investigation. Earlier pending status below is historical.

Source-ready-v2: V01 notice clearance, V02 mobile pinned success action/outcome order, V03 duplicate appointment content fixed. 32 focused checkout tests, scoped ESLint, full TypeScript and token audit pass. No build/capture performed. All visual findings resolved in source pending shared rerender; see P2-checkout-visual-review.md.

Worktree: bestbikefit4u-pricing, branch feature/pricing-v3. Release 2.0 only. No commits, deployments, real payments or email sends.

## Implemented

- Distraction-free /checkout route group outside marketing Header/Footer, noindex metadata, localized from request header/cookie. Existing proxy supports /nl/checkout and /en/checkout publicly; three focused routing tests prove this without shared edits.
- Read all eight desktop/mobile afsluiten boards. Kies has three radio cards, annual center/tallest/ink/lime and annual-first mobile order. Account uses real Convex Resend code authentication inline, preserving selection. Bevestig requires withdrawal consent plus an authenticated owned bike for single. One primary action and mobile pinned continuation/payment control, VAT price visible, maximum three benefits per product.
- A PRODUCTS supplies prices; getSubscription.access.eligibleForEntry supplies authoritative intro eligibility. URL/storage annual_entry never grants eligibility. Canonical annual_personal entry and storage supported. Saved choices contain only product and bikeId (no email, body measurements, consent or entitlement). Storage failures block the stub and display honest error copy.
- C stripeNotImplemented(locale) is called only after persistence, authentication, consent and bike selection. Exact bilingual shared message displayed. The real flow never shows success or claims access was granted.
- Guarded ?preview=success|failure requires CHECKOUT_PREVIEW_ENABLED=true and nonproduction runtime or VERCEL_ENV=preview. VERCEL_ENV=production always rejects. Explicit preview disclaimer; no fabricated receipt, date, mail delivery or payment.
- Personal appointment block uses HTTPS PERSONAL_BIKEFIT_AGENDA_URL, otherwise literal [AGENDALINK]. /checkout?appointment=1 only displays actual appointment UI when authenticated subscription access.appointmentAvailable is true. Location, duration and legal placeholders remain verbatim. Agenda intent survives email authentication.
- Only the literal two-measurement standard annual gift-feature exception is retained; entry has two non-gift benefits. No gift buying, gifting action or release 2.1 route.
- Token-only CSS, local bilingual checkout dictionary; no frozen dictionaries/shared UI/pricing/settings/report modifications.

## Validation

- npx vitest run src/components/checkout — PASS, 29 tests, 3 files, after review fixes.
- Focused ESLint for checkout components, route and dictionary — PASS.
- npx tsc --noEmit --incremental false --pretty false — PASS (full worktree typecheck).
- node scripts/check-css-module-tokens.mjs — PASS, 28 modules, zero raw color lines.
- git diff --check — PASS (tracked changes; new files also passed focused lint).

## Integration handoff

Ready for parent shared gates/build and NL/EN 1440/390 visual QA. No browser renders or full build performed by checkout worker. Actual email auth was mocked in tests; no live code requested. Root cookie/feedback global providers remain shared ownership; marketing Header/Footer are absent by construction.

Notification integration is resolved by parent/A (A-final-boundaries-ready.md): prepareFitterNotification, internal read preparation, queueFitterNotification internalMutation and pending_integration outbox; schema/API registrations and account-deletion cleanup; dormant fresh-personal-grant scheduling only. Repeated grants and renewals do not queue again. Parent reports 56 fake-handler tests and TypeScript green. No sends, no invented address, no client/stub/preview invocation. Actual transport intentionally remains unimplemented under stub scope; it is not an outstanding checkout blocker.

Checkout manual visual review is the only remaining checkout item. Shared gates/build remain parent-coordinated; this worker will inspect the shared captures without competing capture/build activity.

## B-checkout-review remediation

All four findings fixed and regression-tested:

- OTP accepts seven uppercase alphanumeric characters from actual auth alphabet ABCDEFGHJKLMNPQRSTUVWXYZ23456789, normalizes lowercase, rejects malformed/truncated codes before signIn, and uses correct NL/EN labels. Tests derive expected alphabet and length from convex/auth.ts to catch contract drift and submit ABC2345 unchanged.
- Persisting selection updates only product/bikeId in the current URL using history.replaceState, preserving other query parameters and Next history state. Explicit URL selection still wins over unrelated localStorage. Regression tests remount using the updated pricing-entry URL after changing single bike or annual → personal, then verify a new explicit pricing link wins.
- Consent is bound to authenticated state, authoritative account ID/email, canonical product ID, price and selected bike. Context changes immediately make consent invalid and clear consent/status; returning to an earlier context cannot revive old consent. Initial selection changes also reset status. Regressions cover eligibility/price, account ID/email, product, bike and logout/login; direct form submission cannot bypass fresh consent.
- Intro gift copy removed in both locales; two genuine benefits remain, while standard annual retains only the authorized literal two-gift exception.

Post-fix checks: checkout 29/29, focused ESLint, full TypeScript (incremental false) and git diff --check pass. No live OTP email or payment requested.
