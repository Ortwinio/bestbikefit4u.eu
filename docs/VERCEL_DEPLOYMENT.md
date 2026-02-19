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

Set these in Convex production deployment env:

- `SITE_URL=https://bestbikefit4u.eu`
- `AUTH_RESEND_KEY=your_resend_api_key`
- `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`

CLI equivalent for Convex env:

```bash
npx convex env set SITE_URL https://bestbikefit4u.eu --prod
npx convex env set AUTH_RESEND_KEY your_resend_api_key --prod
npx convex env set AUTH_EMAIL_FROM 'BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>' --prod
```

## 3. Deploy Convex Backend

Deploy backend code first:

```bash
npx convex deploy --prod
```

## 4. Deploy Vercel Frontend

1. Push your branch (usually `main`).
2. Let Vercel auto-deploy, or trigger a manual deploy in Vercel.
3. In build logs, confirm this line appears:
- `Vercel deployment preflight passed.`

Notes:
- `npm run build:vercel` runs `scripts/check-vercel-env.mjs` before `next build`.
- The preflight fails if `NEXT_PUBLIC_CONVEX_URL` is missing, invalid, or points to `localhost`.

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
  - Verify `AUTH_EMAIL_FROM` stays `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`.
  - Probe Resend directly and inspect response:
    ```bash
    curl -sS https://api.resend.com/emails \
      -H "Authorization: Bearer $AUTH_RESEND_KEY" \
      -H "Content-Type: application/json" \
      -d '{"from":"BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>","to":["<test-email>"],"subject":"probe","html":"<p>probe</p>"}'
    ```
  - Pull recent production logs and match by request ID:
    ```bash
    npx convex logs --prod --history 200 --jsonl
    ```

## 7. Pre-Release Gate

Before production rollout, complete:

- `docs/RELEASE_READINESS_CHECKLIST.md`
