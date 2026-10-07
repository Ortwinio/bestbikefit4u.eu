# Vercel Deployment Guide

Last updated: 2026-10-07

This project is a Next.js frontend on Vercel with a Convex production backend.

## 1. One-Time Setup

1. Create or open your Convex production deployment.
2. Create a Vercel project and connect this Git repository.
3. Confirm `vercel.json` is respected:
- `installCommand`: `npm ci`
- `buildCommand`: `npm run build:vercel`

## 2. Configure Production Environment Variables

Set these in Vercel (Project Settings -> Environment Variables):

- `NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud`
- `PDF_RICH_RENDER_ENABLED=true` (optional; set `false` to force legacy PDF fallback)

Billing configuration and the restricted-key permissions are documented in section 8 below.
Deploy Convex before Vercel. Both billing flags remain OFF during release-hardening work.

For the approved domain cutover, set `SITE_URL=https://bikefitboost.com` and
`NEXT_PUBLIC_SITE_URL=https://bikefitboost.com` in Vercel. Set the matching
`SITE_URL` in Convex. These are owner-run release steps, not changes performed
by the migration branch. Verify the new Resend sending domain and support and
security mailboxes before changing mail configuration.

The canonical host has no `www`. In Vercel, replace the current apex-to-www
redirect with a www-to-apex 301 before release; do not add the reverse redirect
in app code while the existing Vercel redirect is active. Attach both legacy
domains and route them directly to the apex with path and query preserved.
Users sign in again on the new host; existing host-only cookies do not migrate.

Set these in Convex production deployment env after owner approval:

- `SITE_URL=https://bikefitboost.com`
- `AUTH_RESEND_KEY=your_resend_api_key`
- `AUTH_EMAIL_FROM=BikeFitBoost <noreply@notifications.bikefitboost.com>`

CLI equivalent for Convex env:

```bash
npx convex env set SITE_URL https://bikefitboost.com --prod
npx convex env set AUTH_RESEND_KEY your_resend_api_key --prod
npx convex env set AUTH_EMAIL_FROM 'BikeFitBoost <noreply@notifications.bikefitboost.com>' --prod
```

## 3. Deploy Convex Backend

Deploy backend code first:

```bash
npx convex deploy
```

## 4. Deploy Vercel Frontend

1. Push your branch (usually `main`).
2. Let Vercel auto-deploy, or trigger a manual deploy in Vercel.
3. In build logs, confirm this line appears:
- `Vercel deployment preflight passed.`

Notes:
- `npm run build:vercel` runs `scripts/check-vercel-env.mjs` before `next build`.
- The preflight fails if `NEXT_PUBLIC_CONVEX_URL` is missing, invalid, or points to `localhost`.
- Preview builds use production-mode Next.js compilation, but do not require
  production Stripe settings. `VERCEL_ENV`, when present, determines the target.
- The checked-in `vercel.json` build command takes precedence over the project's
  dashboard build command. It builds the frontend only; release Convex separately.

## 5. Validate Production

Run this smoke test after deploy:

1. Open `/login` and complete magic-code sign-in.
2. Confirm protected pages require auth (`/dashboard`, `/fit`).
3. Complete a fit flow from profile to results.
4. Verify PDF endpoint works for the owner:
- `GET /api/reports/[sessionId]/pdf`
5. Verify production email sending is working (Resend key present).

Recommended commands:

```bash
npx convex env list --prod
npx convex run auth:signIn '{"provider":"resend","params":{"email":"<test-email>"}}' --prod
```

For report-email flow, use a known owner session and recipient:

```bash
npx convex run emails/actions:sendFitReport '{"sessionId":"<owner-session-id>","recipientEmail":"<owner-email>"}' --prod --identity '{"subject":"<owner-user-id>|verification"}'
```

## 6. Quick Troubleshooting

- Build fails with missing env:
  - Add `NEXT_PUBLIC_CONVEX_URL` in Vercel and redeploy.
- Login links point to wrong domain:
  - Update Convex `SITE_URL` to the exact production domain and redeploy Convex.
- Emails not sent:
  - Verify Convex `AUTH_RESEND_KEY` and `AUTH_EMAIL_FROM`.
  - Verify `AUTH_EMAIL_FROM` stays `BikeFitBoost <noreply@notifications.bikefitboost.com>`.
  - Probe Resend directly and inspect response:
    ```bash
    curl -sS https://api.resend.com/emails \
      -H "Authorization: Bearer $AUTH_RESEND_KEY" \
      -H "Content-Type: application/json" \
      -d '{"from":"BikeFitBoost <noreply@notifications.bikefitboost.com>","to":["<test-email>"],"subject":"probe","html":"<p>probe</p>"}'
    ```
  - Pull recent production logs and match by request ID:
    ```bash
    npx convex logs --prod --history 200 --jsonl
    ```

## 7. Pre-Release Gate

Before production rollout, complete:

- `docs/RELEASE_READINESS_CHECKLIST.md`

## 8. Stripe billing deployment configuration

The only price source is `shared/pricing/products.ts`. The runtime validates retrieved
prices and the upgrade coupon before checkout. There are no monthly products.

| Variable | Vercel production | Vercel preview/development | Convex prod/dev |
|---|---|---|---|
| `STRIPE_BILLING_ENABLED` | Explicit `false` until approved go-live | Explicit `false` unless approved test exercise | Same value as matching Vercel deployment |
| `NEXT_PUBLIC_STRIPE_BILLING_ENABLED` | Same billing switch, baked into build | Same as server switch | Also required: backend checks both |
| `PAID_ACCESS_ENFORCED` | Explicit `false` until separate enforcement approval | Test decision | Same as matching Vercel deployment |
| `NEXT_PUBLIC_PAID_ACCESS_ENFORCED` | Same enforcement switch, baked into build | Same as server switch | Also required by shared access code |
| `STRIPE_MODE` | `live` when billing enabled | `test` when billing enabled | `live` in prod; `test` in dev; must match endpoint events |
| `STRIPE_SECRET_KEY` | Live restricted key | Test restricted key | Not required; webhook performs local signature verification |
| `STRIPE_ANNUAL_PRICE_ID` | Live annual yearly price | Test annual yearly price | Not required by runtime; reservation stores validated price mapping |
| `STRIPE_SINGLE_FIT_PRICE_ID` | Live single price | Test single price | Not required |
| `STRIPE_PERSONAL_FIT_ADDON_PRICE_ID` | Live bundle add-on price | Test add-on price | Not required |
| `STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID` | Live appointment price | Test appointment price | Not required |
| `STRIPE_UPGRADE_COUPON_ID` | Live once-only upgrade coupon | Test coupon | Not required |
| `STRIPE_WEBHOOK_SECRET` | Not used by Next billing routes | Not used by Next billing routes | Signing secret for that deployment's endpoint |
| `PERSONAL_FIT_SALES_ENABLED` | Default `false` | Default `false` | Authoritative reservation gate; mirror Vercel |
| `NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED` | Default `false`, presentation only | Default `false`, presentation only | Keep aligned; never grants purchase permission |
| `PERSONAL_BIKEFIT_AGENDA_URL` | Required HTTPS booking URL when personal sales enabled | Test booking URL when enabled | Required for checkout status and purchase mail |
| `FITTER_NOTIFICATION_EMAIL` | Check-only copy required by enabled-sales preflight; not public | Check-only test recipient when enabled | Delivery recipient for fitter notifications |

Deployment configuration checks cannot inspect another deployment's environment.
A green Vercel preflight does not prove Convex has matching flags or secrets. The owner
must configure and verify both. No recipient, secret or env value is returned by the
health route: `/api/health/config` exposes variable names and booleans only.

`assertStripeMode()` accepts standard or restricted secret keys with the correct
`sk_test_`/`rk_test_` or `sk_live_`/`rk_live_` prefix. A missing mode, invalid key or
mode mismatch fails before a provider call. Preflight requires live mode only when
`VERCEL_ENV=production`; preview, development and other targets require test mode.
The Convex handler verifies the signature, rejects an event whose boolean `livemode`
differs from `STRIPE_MODE` with HTTP 400, and does not process or record it.

### Webhook and release order

The webhook is **Convex**, not Vercel:
`https://<deployment>.convex.site/stripe/webhook`. Each environment needs its own
endpoint and signing secret. The shared `STRIPE_WEBHOOK_EVENTS` export in
`shared/billing/stripeWebhookEvents.ts` is the single subscription list for the
handler and provisioning script. Alongside the original twelve events, it includes
`refund.created` and `refund.updated`, handled by S1 to verify the specifically tagged
cancellation refund rather than relying on cumulative charge refunds. All fourteen
must be subscribed. Endpoint API version: `2026-06-24.dahlia`.

1. Deploy Convex code first with billing and enforcement OFF.
2. Configure matching variables in the corresponding Convex and Vercel deployments.
3. Run preflight and build Vercel; public switches are build-time values.
4. Complete the sandbox gate before owner-approved live configuration or payments.
5. Enable billing separately from paid-access enforcement, following the release plan.

When either billing flag is OFF, authenticated Stripe HTTP routes and the webhook
return `STRIPE_NOT_IMPLEMENTED` (HTTP 501), without provider calls. Unauthenticated
Next requests still return 401. This also stops the in-app portal, cancellation and
webhook processing; it does **not** cancel Stripe subscriptions or stop renewals at
Stripe. Existing stored entitlements remain. Before pausing, plan owner-operated
subscription support and later webhook redelivery; do not assume an OFF webhook
acknowledges payment events. Enforcement OFF continues to grant full app access.

### Runtime restricted key: code-audited permissions

Give the **Vercel runtime** key only these resource capabilities. Write access must
include the listed read operations. Stripe's dashboard may group subresources;
confirm the exact restricted-key controls during the sandbox permission test.

| Resource | Access | Calls verified in application code |
|---|---|---|
| Checkout Sessions | Write | `checkout.sessions.create` in `src/app/api/stripe/checkout/route.ts` |
| Customers | Write | `customers.create` in the checkout route |
| Prices | Read | `prices.retrieve` in `src/lib/billing/stripeCheckout.ts` |
| Coupons | Read | `coupons.retrieve` in `stripeCheckout.ts` |
| Subscriptions | Write (including read) | `subscriptions.retrieve`, `.update`, `.cancel` in `src/lib/billing/cancelSubscription.ts` |
| Customer portal | Write | **Both** `billingPortal.configurations.create` and `billingPortal.sessions.create` in `src/app/api/stripe/portal/route.ts` |
| Invoices | Read | `invoices.retrieve` in `cancelSubscription.ts` |
| Invoice Payments | Read | `invoicePayments.list` in `cancelSubscription.ts` |
| PaymentIntents | Read | `paymentIntents.retrieve` in `cancelSubscription.ts` |
| Refunds | Write (including read) | `refunds.list` and `refunds.create` in `cancelSubscription.ts` |

There are no runtime product writes, webhook-endpoint writes, direct charge calls,
Connect, balance, payout or transfer calls. Convex needs no provider key. This list
is verified against source, not a claim that a real restricted key was exercised.
The sandbox flow must verify permissions, including portal configuration and
Invoice Payments, before live setup. Use a separate key for each environment.
Stripe describes restricted keys in its [API authentication documentation](https://docs.stripe.com/api/authentication).

### Catalogue provisioning (owner-approved later step)

`scripts/stripe/sync-catalog.mjs` is separate operator tooling, not a runtime path.
It defaults to dry-run; `--apply` is explicit. A dry-run reads provider objects but
makes no writes. During hardening only mocked clients are used: do not run the CLI
against a real account yet. The key comes only from `STRIPE_SECRET_KEY`, never a
CLI flag or key file. Review the mode, diff and destination before applying later.

Provisioning requires Products, Prices and Coupons read/write; optional endpoint
provisioning also requires Webhook Endpoints read/write. Do not widen the Vercel
runtime key for this purpose. Prices are never overwritten or silently replaced
on mismatch. The obsolete appointment price is never recreated or reactivated.
Per the lead's hardening decision, new products use checked-in one-sentence
NL descriptions derived from the existing pricing copy. No descriptions file is
needed. Existing product names and descriptions are never rewritten: differences
are informational and do not prevent a matching catalogue from reporting
“no changes”. Prices still come only from the shared catalogue.
Tax-code configuration remains an owner decision; the current desired prices are
EUR tax-inclusive and no tax code is invented.

The optional endpoint URL must be HTTPS on the expected Convex webhook path.
The script uses the exact shared event list. A new endpoint signing secret is shown
once on creation for secure transfer to Convex; never save that output in logs,
commits, screenshots or audit files. Existing endpoint secrets are not displayed. All creates use deterministic
idempotency keys. If a create response is lost, an existing endpoint may be found on
retry without its secret; the script explicitly reports this. The owner must recover
or rotate that signing secret through Stripe Dashboard and update the matching
Convex setting before enabling billing. The script never silently deletes/recreates
an endpoint or claims the secret was recovered.

### Billing alerts

Next billing failures emit sanitized Sentry events tagged `area=billing` and a
stable error code. They contain no original provider exception, payload, user,
email address, request or breadcrumbs. In Sentry create an issue alert filtered by
`area:billing` at error level; route new/regressed failures to the operator and review
repeat failures during the go-live monitoring window. This task does not configure
an external alert destination.

Convex webhook processing failures emit one structured `BILLING_ALERT` line with
only `area` and a stable code. Filter Convex deployment logs for `BILLING_ALERT` and
alert on matches in the deployment's available log-alert integration. If the
Dashboard does not provide a saved alert in the current plan, forward deployment
logs to the team's alerting sink and apply that same exact prefix filter; do not
claim a live alert exists until its operator test passes. Never attach raw event
payloads to the alert. A 500 response leaves Stripe responsible for retry delivery.

### Stale branch

`origin/feature/pricing-model-v2` is an obsolete first draft without a merge base
with main. Do not use it for this release. Include this note in the release PR so
Ortwin can delete that branch; no branch deletion is part of hardening.
