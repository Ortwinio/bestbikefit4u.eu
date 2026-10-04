# Vercel Deployment Guide

Last updated: 2026-02-19

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

For production billing, also set `SITE_URL`, `STRIPE_SECRET_KEY`, and
`STRIPE_PRO_MONTHLY_PRICE_ID` in Vercel. The previous `STRIPE_PRO_PRICE_ID`
example is obsolete; checkout reads the monthly key. A yearly price is optional
under `STRIPE_PRO_YEARLY_PRICE_ID`.

Configure `STRIPE_WEBHOOK_SECRET` on **Convex**, where `/stripe/webhook` runs,
and align the backend plan catalog and Stripe price mappings before enabling
payments. A Vercel webhook-secret variable alone does not configure Convex.

To release with new payments paused, set both `STRIPE_BILLING_ENABLED=false`
and `NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false` in Vercel before building.
Checkout returns 503 without contacting Stripe and purchase controls display an
availability notice. Free signup and existing paid entitlements stay available;
the billing portal and verified webhooks remain available for existing subscribers
to manage or cancel their subscriptions. This does not cancel subscriptions or
pause renewals at Stripe. Re-enable both flags only after billing configuration
and end-to-end validation are complete, then rebuild the frontend.

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
- `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bikefitboost.com>`

CLI equivalent for Convex env:

```bash
npx convex env set SITE_URL https://bikefitboost.com --prod
npx convex env set AUTH_RESEND_KEY your_resend_api_key --prod
npx convex env set AUTH_EMAIL_FROM 'BestBikeFit4U <noreply@notifications.bikefitboost.com>' --prod
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
  - Verify `AUTH_EMAIL_FROM` stays `BestBikeFit4U <noreply@notifications.bikefitboost.com>`.
  - Probe Resend directly and inspect response:
    ```bash
    curl -sS https://api.resend.com/emails \
      -H "Authorization: Bearer $AUTH_RESEND_KEY" \
      -H "Content-Type: application/json" \
      -d '{"from":"BestBikeFit4U <noreply@notifications.bikefitboost.com>","to":["<test-email>"],"subject":"probe","html":"<p>probe</p>"}'
    ```
  - Pull recent production logs and match by request ID:
    ```bash
    npx convex logs --prod --history 200 --jsonl
    ```

## 7. Pre-Release Gate

Before production rollout, complete:

- `docs/RELEASE_READINESS_CHECKLIST.md`
