# Vercel Deployment Guide

Last updated: 2026-02-15

This project deploys as a Next.js app on Vercel, backed by Convex.

## 1. Prerequisites

- A Vercel project connected to this repository
- A Convex production deployment
- A Resend API key for production email delivery

## 2. Required Environment Variables

### Vercel project env vars

- `NEXT_PUBLIC_CONVEX_URL`
  - Example: `https://your-deployment.convex.cloud`
  - Used by frontend client and server routes

### Convex deployment env vars

- `SITE_URL`
  - Example: `https://your-domain.com`
  - Used for auth redirects and magic-link URLs
- `AUTH_RESEND_KEY`
  - Required for real verification/report emails in production
- `AUTH_EMAIL_FROM`
  - Example: `BikeFit AI <noreply@bikefit.ai>`
  - Sender identity for outbound emails

Convex usually provides `CONVEX_SITE_URL` automatically in deployment env. Auth config falls back to `NEXT_PUBLIC_CONVEX_SITE_URL` if needed.

## 3. Build Configuration

`vercel.json` enforces:

- `installCommand`: `npm ci`
- `buildCommand`: `npm run build:vercel`

`npm run build:vercel` runs a preflight check (`scripts/check-vercel-env.mjs`) before `next build`.

## 4. Deploy Backend (Convex)

Deploy Convex changes before or alongside Vercel frontend deploy:

```bash
npx convex deploy --prod
```

Set Convex env vars:

```bash
npx convex env set SITE_URL https://your-domain.com
npx convex env set AUTH_RESEND_KEY your_resend_api_key
npx convex env set AUTH_EMAIL_FROM 'BikeFit AI <noreply@bikefit.ai>'
```

## 5. Deploy Frontend (Vercel)

After setting `NEXT_PUBLIC_CONVEX_URL` in Vercel:

1. Push to your deployment branch (for example `main`)
2. Trigger a Vercel deployment (automatic or manual)
3. Confirm build log includes `Vercel deployment preflight passed.`

## 6. Post-Deploy Smoke Checks

- `/login` magic-code flow works end-to-end
- Authenticated dashboard routes require login
- `/fit` session flow completes through results
- `GET /api/reports/[sessionId]/pdf` returns a PDF for authenticated owner
