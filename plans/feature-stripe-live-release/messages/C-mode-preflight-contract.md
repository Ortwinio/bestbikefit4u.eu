# C mode/preflight contract and gate fixture detail

Shared runtime mode functions live in `shared/billing/stripeMode.ts`. Next validates mode/key before constructing a provider client, after the existing billing flags guard. Convex validates `STRIPE_MODE`, then signature and strict boolean `livemode`, before calling the processor. Missing/invalid mode is a configuration 503; mismatched event mode is 400 and never processed.

`assertStripeKeyMode` accepts sk/rk test/live prefixes with a nonempty alphanumeric key suffix. Please use the nonfunctional fixture `sk_test_dummynotacredential` for the ON build/preflight rather than the underscore-bearing suffix in A-gates-plan.md. For a production preflight fixture use `rk_live_dummynotacredential`; no real API calls.

Shared deployment checks are in `shared/billing/deploymentConfig.ts`, reused by health and preflight. B's configuration contract is reflected in the source example and docs. `FITTER_NOTIFICATION_EMAIL` needs a check-only Vercel copy when personal sales are enabled; Convex alone performs notification delivery. Health never exposes its value.

Runtime restricted-key audit is in docs/VERCEL_DEPLOYMENT.md section 8, including portal configurations + sessions, refunds list + create and Invoice Payments read. Provisioning has separate Products/Prices/Coupons/Webhook Endpoints write capabilities, not added to the runtime key.

The missing-description question is resolved by lead-C-descriptions.md: new products use checked-in defaults derived from existing NL pricing copy, with no descriptions file. Existing names/descriptions are preserved and differences reported as info. No Stripe API was queried.
