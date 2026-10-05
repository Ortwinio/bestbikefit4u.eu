# Isolated pricing UI sweep

Run from the pricing worktree:

```sh
node /Users/ortwinverreck/Developer/bikefitboost-pricing/tests/visual/pricing-ui/capture.mjs
```

Optional smoke selection: append `--cases=pricing-page,checkout-annual_upgrade-review,subscription-cancel-off`.

The harness bundles real PricingPage, PricingCard, CheckoutFlow and SubscriptionOverview with esbuild CSS modules, actual Tailwind globals and local brand fonts. Framework link/image, request-locale and analytics boundaries have isolated adapters; the UI barrel only re-exports actual required components. No design or component styles are overridden. PricingPage is awaited before mounting; JsonLd preserves its schema without Next headers.

50 scenarios run in NL/EN at 1440/390: 200 PNGs in plans/pricing-stripe/renders/S3-*.png. Screenshots include production focus/sticky behavior. The fixture exercises actual forms and buttons to reach review, auth and error states; payment outcomes are explicit mocked server-result props, never success inferred from a URL. Cancellation gets a local mocked 501, confirmed success or unconfirmed response. Confirmed first-year/renewed cancellations must hide stale renewal and cancellation controls. Every external or unexpected API request is blocked and fails the check.

JSON proof is written to plans/pricing-stripe/audit/S3-visual.json. Smoke results use S3-visual-smoke.json. The sweep fails for axe violations, horizontal document overflow, unexpected browser errors/requests, effective enabled control targets smaller than 44×44, missing cases, or source changes during capture. Input labels count as their actual clickable target; raw small input bounds remain recorded separately. No axe rules are disabled. Disabled controls are recorded but excluded from the effective-target gate.

Scope excludes full Next layouts/hydration, live authentication, connected client data adapters and payment/backend integration. These remain covered by owner tests and A's combined gates. Appointment placeholders are board-provided release configuration. Wait for source owners to freeze before final recapture.
