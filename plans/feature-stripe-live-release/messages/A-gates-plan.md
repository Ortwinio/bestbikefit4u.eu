# A final gate plan and ordering review

Prepared 2026-10-07. Planning only: no builds, gates, provider requests, mail, env-file changes or deployment actions run by this reviewer. C owns preflight/serverStripe tests and documentation. Run final gates after A/B/C integration settles; do not overlap builds in this worktree.

## Exact OFF regression fixture

`src/app/api/stripe/checkout/route.test.ts:33` exercises checkout, portal, cancel and refund in NL/EN for all eight non-enabled flag combinations. It asserts authenticated 501, exact `stripeNotImplemented(locale)` JSON, `Cache-Control: no-store`, and zero Stripe/Convex/fetch calls. Unauthenticated calls remain 401. `:60` covers malformed JSON. This is an equality fixture, not a stored snapshot: capture the serialized checkout response as additional gate evidence if a literal snapshot artifact is required.

Run from an explicitly selected absolute workdir, never an inferred cwd:

```sh
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe exec -- vitest run --root /Users/ortwinverreck/Developer/bikefitboost-stripe src/app/api/stripe/checkout/route.test.ts
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe run typecheck
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe run lint
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe run test:unit
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe run test:contracts
npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe run test:i18n
/Users/ortwinverreck/Developer/bikefitboost-stripe/node_modules/.bin/tsc --noEmit -p /Users/ortwinverreck/Developer/bikefitboost-stripe/convex/tsconfig.json
node /Users/ortwinverreck/Developer/bikefitboost-stripe/scripts/render-email-previews.mjs --output=/Users/ortwinverreck/Developer/bikefitboost-stripe/plans/feature-stripe-live-release/audit/email-previews
```

`lint` includes prices and brand. Email renderer produces NL/EN HTML/text/PNG and checks, intercepts assets locally and aborts other network requests. Inspect the newly wired purchase, welcome, expired, renewal, cancellation and transition previews. B supplies pricing/checkout 1440/390 NL/EN personal-fit on/off visual evidence.

## Build and preflight command matrix

Use process-only values. No `.env` edits and no production config changes. Dummy key below is deliberately nonfunctional. Builds should run sequentially because they share `.next`.

OFF build:

```sh
env STRIPE_BILLING_ENABLED=false NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false PAID_ACCESS_ENFORCED=false NEXT_PUBLIC_PAID_ACCESS_ENFORCED=false PERSONAL_FIT_SALES_ENABLED=false NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED=false NEXT_PUBLIC_CONVEX_URL=https://release-fixture.convex.cloud AUTH_RESEND_KEY= SENTRY_AUTH_TOKEN= npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe run build
```

ON build (preview/test mode, all presentation flags compiled ON):

```sh
env VERCEL_ENV=preview STRIPE_MODE=test STRIPE_BILLING_ENABLED=true NEXT_PUBLIC_STRIPE_BILLING_ENABLED=true PAID_ACCESS_ENFORCED=true NEXT_PUBLIC_PAID_ACCESS_ENFORCED=true PERSONAL_FIT_SALES_ENABLED=true NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED=true NEXT_PUBLIC_CONVEX_URL=https://release-fixture.convex.cloud STRIPE_SECRET_KEY=sk_test_dummy_not_a_credential STRIPE_ANNUAL_PRICE_ID=price_fixture_annual STRIPE_SINGLE_FIT_PRICE_ID=price_fixture_single STRIPE_PERSONAL_FIT_ADDON_PRICE_ID=price_fixture_addon STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID=price_fixture_standalone STRIPE_UPGRADE_COUPON_ID=coupon_fixture_upgrade PERSONAL_BIKEFIT_AGENDA_URL=https://example.invalid/agenda FITTER_NOTIFICATION_EMAIL=fixture@example.invalid AUTH_RESEND_KEY= SENTRY_AUTH_TOKEN= npm --prefix /Users/ortwinverreck/Developer/bikefitboost-stripe run build
```

For preflight, use the same process-only OFF/ON assignments but replace the final npm invocation with:

```sh
node /Users/ortwinverreck/Developer/bikefitboost-stripe/scripts/check-vercel-env.mjs --no-env-files
```

`npm run build` does not run preflight (`build:vercel` does); collect explicit preflight evidence separately. For negative preflight cases use a clean child environment built from explicit fixture values, with `--no-env-files`, to prevent inherited variables from accidentally satisfying missing-value tests. Do not execute Stripe catalogue CLI against the network; its mocked unit tests provide dry-run/idempotency evidence.

## Preflight cases for C / final evidence

| Case | Expected |
| --- | --- |
| OFF, valid Convex URL, no Stripe/payment configuration | pass |
| ON preview with complete dummy test config | pass |
| ON production with dummy live key and mode live | pass; preflight only, never provider calls |
| ON production mode test | fail STRIPE_MODE |
| ON preview mode live | fail STRIPE_MODE |
| ON key/mode mismatch (sk/rk × test/live) | fail STRIPE_SECRET_KEY |
| ON malformed or absent key/mode | fail corresponding names |
| ON each required price/coupon absent separately | fail corresponding name |
| Personal sales false in both flags, booking vars absent | pass |
| Personal sales true, each booking var absent separately | fail corresponding name |
| Personal sales true, HTTP/invalid/credential-bearing agenda | fail PERSONAL_BIKEFIT_AGENDA_URL |
| Personal sales true, malformed or multiple-recipient email | fail FITTER_NOTIFICATION_EMAIL |
| Personal flags disagree or have invalid string values | fail personal flag check |
| Missing/malformed Convex URL | fail |
| VERCEL=1 and Convex URL localhost/127.0.0.1/IPv6 loopback | fail |
| Health result with secret dummy marker values | names/booleans only; marker absent |

## Service mail event-ordering findings

- `convex/stripe/events.ts:165-175`: initial invoice can write a paid entitlement without payment intent. Keep welcome queued but unsendable until signed invoice-payment linkage exists. `:228-252` links later and applies any earlier full refund. Test both invoice/payment orders plus refund before either and refund between them; after linkage, reread current entitlement and refund ledger before sending.
- `convex/stripe/events.ts:200-225`: refund ledger persists even before entitlement, and keeps maximum refunded amount/full status. Suppress purchase/welcome when ledger is fully refunded, not only when checkout status happens to be refunded. Partial refunds preserve access. Refund suppression must be scoped by mail kind: cancellation confirmation still needs to communicate an actual refund.
- `src/lib/billing/cancelSubscription.ts:77-97`: subscription cancellation precedes refund creation, so deletion can arrive first. Do not send a renewed cancellation confirmation with zero refund at deletion and consume its once-per-period key. Keep pending until signed refund evidence matches expected pro-rata amount, or use a confirmed server result through an appropriate authenticated bridge. Delaying by an arbitrary timeout alone does not establish evidence. For genuine zero-refund end-of-period cancellations, no refund event will arrive.
- `convex/stripe/events.ts:182-196`: deletion shortens entitlement expiry, but billing-period `periodEnd` remains the original end. Use billing period dates and immutable provider end time for the pro-rata calculation. Select the current period; do not notify once for every historical entitlement visited by this loop. Early deletion before invoice also requires scheduling when that invoice later materializes.
- `convex/emails/delivery.ts:15-22`: existing send path supports a provider idempotency key. Combine durable internal send keys with provider keys and an atomic claim; do not mark sent before success. Recheck refund/current cancellation state in the sender rather than trusting scheduled payload snapshots. Provider delivery and database commit are separate, so crash-after-send retries need the same provider key. Avoid describing unlimited-time external delivery as an atomic exactly-once guarantee.
- Stable logical keys: purchase by payment intent; welcome/cancellation by subscription + period start; renewal by subscription period; expiry by entitlement; transition/reminder by recipient + campaign kind. Cron eligibility must use current access: a later renewal must suppress old expiry jobs and cancellation must suppress renewal reminders.

Shared event module is ready at `shared/billing/stripeWebhookEvents.ts` (C message); B env contract requires HTTPS agenda without credentials and single-recipient fitter address, default OFF. No application sources changed by this reviewer.
