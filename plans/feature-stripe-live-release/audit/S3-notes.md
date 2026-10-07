# S3 — mode guards, catalogue tooling, alerts and deployment configuration

Date: 2026-10-07. Worktree: `/Users/ortwinverreck/Developer/bikefitboost-stripe`.

## Delivered

- Published `shared/billing/stripeWebhookEvents.ts` early for A. The handler and catalogue tooling now share all 14 handled events: the original twelve plus `refund.created` and `refund.updated`, added by A for specifically tagged cancellation-refund evidence. An AST-based equality test traverses compound conditions and checks actual handler branches against the shared list.
- `assertStripeMode()` validates standard/restricted test/live key prefixes against `STRIPE_MODE` before constructing Next's provider client. Missing/invalid modes and keys fail closed. Billing OFF retains the existing disabled response before provider configuration is inspected.
- Convex validates its mode, verifies the local webhook signature, and rejects a missing/nonboolean/mismatched `livemode` with 400 before the processor is called. Invalid mode configuration returns 503. No event is processed or recorded through that handler on mismatch.
- Next caught billing failures use sanitized Sentry messages with only stable codes and `area=billing`. The scoped event processor removes ambient request, user, exception, breadcrumbs and extra data. Cancellation still rethrows the original error to its caller; no original exception is sent to Sentry. Convex processing failures emit structured `BILLING_ALERT` with a stable code, never the payload/error object.
- `sync-catalog.mjs` reads real shared catalogue amounts and the shared events module. It defaults to dry-run, validates key/mode before client construction, matches products by ID and prices by lookup key, validates all immutable attributes before any writes, and prints the environment mapping after explicit apply. The old inactive standalone price is neither recreated nor reactivated.
- Catalogue creates use deterministic idempotency keys. Tests cover interrupted and concurrent runs. Existing endpoint version mismatches fail rather than silently replacing/rotating the endpoint. Creation prints its signing secret once; existing endpoints never reveal a secret. A lost creation response triggers an explicit owner recovery instruction before billing is enabled.
- Per `messages/lead-C-descriptions.md`, new-product descriptions are short checked-in sentences from existing NL pricing copy. Existing product names/descriptions are preserved; differences are informational, so a matching sandbox can still report “no changes”. No external descriptions file is required. No product descriptions were fetched from Stripe.
- Shared deployment checks are reused by preflight and health. Enabled billing requires live mode only for `VERCEL_ENV=production`, test mode elsewhere, and a matching secret-key prefix. Personal sales require mirrored switches, HTTPS agenda without credentials, and one valid fitter recipient. Health exposes only names/booleans. CLI diagnostics never include invalid values; `--no-env-files` enables hermetic tests and module-relative paths avoid reading the main checkout.
- `.env.example` and `docs/VERCEL_DEPLOYMENT.md` document deployment ownership, default-OFF switches, the Convex webhook, backend-first order, and actual 501 paused behavior. The fitter address is a check-only Vercel copy and is used for delivery only in Convex.

## Restricted-key permissions verified from runtime calls

| Resource | Permission | Relevant operations |
|---|---|---|
| Checkout Sessions | Write | create |
| Customers | Write | create |
| Prices | Read | retrieve |
| Coupons | Read | retrieve |
| Subscriptions | Write, including read | retrieve/update/cancel |
| Customer portal | Write | configurations.create and sessions.create |
| Invoices | Read | retrieve |
| Invoice Payments | Read | list |
| PaymentIntents | Read | retrieve |
| Refunds | Write, including read | list/create |

The source-to-runbook regression test detects additions to this call inventory. Provisioning uses a separate operator key with Products/Prices/Coupons write and optional Webhook Endpoints write; these are not runtime permissions. Convex needs no Stripe API key. Exact dashboard grouping and real restricted-key effectiveness still require the later sandbox exercise.

## Validation

- Final focused integration: **319 tests passed in 20 files**, including webhook/checkout/event contracts, mode/client guards, cancellation, alerts, health, preflight and existing disabled-path behavior.
- The catalogue Vitest wrapper includes **31 mocked Node checks**; do not add those again to the 319 aggregate. They cover empty dry-run, repeat no-op, immutable mismatch before writes, all modes, malformed inputs, preserved existing copy, exact webhook events/version, creation-only secret output, concurrent convergence and lost-response handling.
- Two deployment documentation regressions pass, including runtime permission inventory.
- App `npm run typecheck`: passed at integrated checkpoint. Standalone Convex tsc: passed.
- Final full `npm run lint`: passed, including brand and pricing guards. Earlier failures in A's in-progress email files were reported and subsequently resolved, not suppressed.
- `git diff --check`: passed.
- Hermetic preflight subprocess tests prove OFF success without provider configuration; preview/test and production/live success with dummy values; mismatched/invalid modes and missing configuration failure; personal-fit configuration checks; and diagnostics without values. No provider requests occur in these checks.

A owns final combined unit/contracts/i18n gates, OFF/ON production builds, email previews and release output. B supplies the visual pricing/checkout matrix. C did not run competing builds or claim the whole release is complete.

## Operational limits and handoff

No real key permissions, live/sandbox catalogue, webhook endpoint, delivery or external alert destination was exercised. All provider clients in tests are mocked; HMAC tests run locally. Stripe Tax remains undecided, so no tax code is invented; unexpected existing tax codes stop provisioning for owner review. Endpoint API versions are immutable in the installed SDK update contract; a different existing version needs explicit owner remediation.

Billing OFF also pauses portal, cancellation and webhook processing. It does not stop provider renewals or revoke stored entitlements. Owner-operated support/redelivery must be considered when using that switch. The runbook documents Sentry and Convex log-alert setup without claiming an external alert was configured.

Include in the release PR: `origin/feature/pricing-model-v2` is an obsolete draft without a merge base with main and must not be used. Ortwin may delete it; this task did not modify branches.

No commits, pushes, deployments, environment-file changes other than the requested `.env.example` source update, production access, real Stripe calls or real mails. No credentials, rider data, raw webhook payloads, logs or renders were added to the audit. Source inventory: `files-S3.txt`.
