# Release Plan — Sprint: Claim Sync, Analytics & SEO

**Date:** 2026-03-31
**Engineer:** Release team
**Scope:** Pricing config, claim sync, analytics events, ad conversions, sitemap/canonical, pain pages, case study flow

---

## 1. Route Runtime Audit

| Route cluster | Runtime | Reason |
|---|---|---|
| `/` (homepage) | **Static** (SSG) | Pure dictionary content, no user data, no dynamic segments. `generateMetadata` is server-only. |
| `/pricing` | **Static** | Content driven by `commercial.ts` constants — no runtime user data. |
| `/guides/[slug]` | **Static** (ISG via `generateStaticParams`) | `generateStaticParams` enumerates all slugs. No dynamic data at render time. |
| `/pain/[slug]` | **Static** (ISG) | Same as guides — all slugs known at build time from `PAIN_PAGE_SLUGS`. |
| `/use-cases/[slug]` | **Static** (ISG) | Same pattern. |
| `/calculators/*` | **Static** | No server-side data dependencies. Calculation happens client-side. |
| `/faq` | **Static** | Pure copy; `getCommercialFaqCopy` reads from compile-time constants. |
| `/about`, `/contact`, `/science/*` | **Static** | Copy-only pages. |
| `/sitemap*.xml` | **Node (route handler)** | Runs on-demand. Cache-Control headers set per file: `s-maxage=3600, stale-while-revalidate=86400` for content sitemaps; `s-maxage=900` for blog. No change needed. |
| `/robots.ts` | **Static** | Next.js generates at build time. |
| `/api/reports/[sessionId]/pdf` | **Node** | Already has `export const runtime = "nodejs"` — correct, PDF generation requires Node APIs. |
| `/dashboard/*`, `/fit/*` | **Node (dynamic)** | Requires Convex auth session — cannot be statically generated. Cookie-based route protection via `src/proxy.ts`. |
| `/api/marktplaats/image` | **Node** | `cache: "no-store"` already set. |

**Action required:**
None of the new pain pages or guide pages declare `export const dynamic`. Verify that `generateStaticParams` is exported correctly in each dynamic segment — if `generateStaticParams` is absent, Next.js defaults to dynamic rendering on Vercel, which eliminates the CDN cache benefit.

```bash
# Confirm these files export generateStaticParams
grep -rn "generateStaticParams" src/app/\(public\)/{pain,guides,use-cases}/\[slug\]/page.tsx
```

---

## 2. Environment Variables Checklist

### Convex (backend)
| Variable | Required | Notes |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Yes | Set in Vercel project settings, not in `.env` |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Public — safe to expose |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Yes | Required for Convex auth HTTP endpoints |
| `SITE_URL` | Yes | Used in Strava OAuth redirect and auth magic links. Must be `https://bestbikefit4u.eu` in production. |
| `AUTH_RESEND_KEY` | Yes | Resend API key for magic-link auth emails AND fit report delivery. A missing key silently falls back to console logs in dev — in production this breaks auth. |
| `AUTH_EMAIL_FROM` | Yes | Sender display name. Matches verified Resend domain. |
| `GOOGLE_CLIENT_ID` | If Google auth enabled | Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` only after confirming OAuth app is configured. |
| `GOOGLE_CLIENT_SECRET` | If Google auth enabled | Server-only. |

### Convex (env vars set in Convex dashboard, not Vercel)
| Variable | Required | Notes |
|---|---|---|
| `AUTH_RESEND_KEY` | Yes | Must also be set in Convex environment (used by `convex/emails/actions.ts`) |
| `AUTH_EMAIL_FROM` | Yes | Same |
| `SITE_URL` | Yes | Used in `convex/http.ts` for OAuth callbacks |
| `STRAVA_CLIENT_ID` | If Strava enabled | |
| `STRAVA_CLIENT_SECRET` | If Strava enabled | |
| `OPENAI_API_KEY` | If bike description AI enabled | `convex/bikes/description.ts` gracefully skips if absent |
| `ADMIN_BOOTSTRAP_SECRET` | Yes (one-time) | Required to bootstrap the first admin user |
| `ANALYTICS_ADMIN_EMAILS` | Yes | Comma-separated list for analytics dashboard access |

### Next.js / Client-side
| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | Optional | Falls back to hardcoded `GTM-KH48ZSSC`. Set explicitly in Vercel to avoid relying on hardcoded fallback. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | T04 | Google Ads conversion ID. Null-safe — if absent, conversion tags do not fire. |
| `NEXT_PUBLIC_META_PIXEL_ID` | T04 | Meta Pixel. Null-safe. |
| `NEXT_PUBLIC_GOOGLE_ADS_PRICING_SIGNUP_LABEL` | T04 | Label for `BikeFit_SignUp` conversion action |
| `NEXT_PUBLIC_GOOGLE_ADS_CASE_STUDY_LABEL` | T09 | Label for case study lead conversion |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | No | Default `false` |
| `SENTRY_DSN` | Recommended | Server-side error capture |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | Client-side error capture |
| `PDF_RICH_RENDER_ENABLED` | No | Default `true` |

**Risk:** `AUTH_RESEND_KEY` is required in **both** Vercel (for Next.js server routes) **and** the Convex dashboard (for Convex actions). A deployment with only one set will have silent email delivery failures. Verify both before release.

---

## 3. Cache Behavior, Headers, SEO Rendering

### Cache behavior
- Static pages (pain, guides, calculators, homepage) are served from Vercel Edge Network at CDN — no TTL concern.
- Sitemap route handlers use `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. After adding pain pages, the first request after deploy will warm the cache. This is correct.
- Dashboard routes are not cached — they require auth cookies and Convex queries per request.

### Security headers
Current `next.config.ts` sets: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

**Gap identified:** `frame-ancestors 'none'` is set in CSP but `X-Frame-Options: DENY` is redundant when CSP `frame-ancestors` is present in modern browsers. Both are fine to keep for backward compatibility.

**GTM CSP gap:** `script-src` allows `'unsafe-inline'` and `googletagmanager.com`. Meta Pixel scripts loaded via GTM will inject `facebook.com/tr` — verify `connect-src` includes `https://connect.facebook.net https://www.facebook.com` before enabling Meta Pixel, or it will be blocked.

```ts
// Add to connect-src when Meta Pixel is enabled:
"https://connect.facebook.net https://www.facebook.com"
// Add to script-src:
"https://connect.facebook.net"
```

### SEO rendering
- `generateMetadata` is exported on all public pages — titles, descriptions, hreflang, and canonical tags are rendered server-side and included in the HTML response. This is correct for Googlebot.
- `buildLocaleAlternates()` is called in every localized page's `generateMetadata`. The function must return `x-default` pointing to the EN variant — verify the implementation returns this.
- JSON-LD schemas (`buildFaqPageSchema`, `buildArticleSchema`, `buildWebApplicationSchema`) are injected via `<JsonLd>` server component — correct.
- Pain pages: `PainPointPageTemplate` renders as a server component import from a server page. The `"use client"` boundary is isolated to interactive sub-components only.

---

## 4. Preview Deployment Behavior

### Environment variable strategy for preview
Vercel supports scoped environment variables per environment (production / preview / development). Recommended setup:
- `NEXT_PUBLIC_GTM_ID`: Use a **separate GTM container** for preview/staging. Prefix it `GTM-STAGING-*` so staging traffic does not pollute production GA4 and Google Ads data.
- `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`: Set to **null/empty** on preview — ad pixels should never fire on preview URLs.
- `SITE_URL`: On preview, set to the Vercel preview URL pattern or use `VERCEL_URL` env injection. Convex auth redirects must point to the preview URL or magic links will break on preview deployments.
- `CONVEX_DEPLOYMENT`: Use a **separate Convex dev deployment** for preview to isolate preview database from production.

### Preview gotcha — Convex auth
Magic-link auth uses `SITE_URL` for the redirect URL in auth emails. On preview deployments, if `SITE_URL` still points to `https://bestbikefit4u.eu`, clicking a magic link from a preview email will land on production, not the preview branch. Either:
1. Set `SITE_URL=$VERCEL_BRANCH_URL` in preview scope (Vercel injects `VERCEL_BRANCH_URL` automatically), or
2. Document that auth is not testable on preview without this override.

---

## 5. Release Checklist

### Pre-deploy
- [ ] `npm run build` completes with zero errors
- [ ] TypeScript strict check: `npx tsc --noEmit` passes (test files excluded)
- [ ] No new `console.error` or `console.warn` introduced in production code paths
- [ ] `AUTH_RESEND_KEY` confirmed set in **both** Vercel environment AND Convex dashboard
- [ ] `NEXT_PUBLIC_GTM_ID` is set explicitly in Vercel (not relying on hardcoded fallback)
- [ ] All new pain page slugs appear in `generateStaticParams` — run a local `next build` and check `.next/server/app/(public)/pain/[slug]` for generated HTML files
- [ ] `FitDisclaimer` component renders correctly on `/pain/knee-pain-cycling` and at least one guide page

### Build validation
- [ ] `next build` output shows pain pages as static (circle icon `○`) not dynamic (`λ`)
- [ ] No ISR fallback pages — all slugs in `PAIN_PAGE_SLUGS` must be pre-rendered
- [ ] Bundle size: run `ANALYZE=true next build` if bundle-analyzer is configured — flag any new chunks over 50KB gzipped
- [ ] Sentry source maps uploaded (handled by `withSentryConfig`) — verify in Sentry releases dashboard

### Post-deploy smoke tests (production URL)
- [ ] `https://bestbikefit4u.eu/pain/knee-pain-cycling` — renders without flash of unstyled content, canonical tag present, JSON-LD present
- [ ] `https://bestbikefit4u.eu/nl/pain/knee-pain-cycling` — NL content loads, `hreflang` alternates correct
- [ ] `https://bestbikefit4u.eu/sitemap.xml` — lists all sub-sitemaps; no 500 error
- [ ] `https://bestbikefit4u.eu/sitemap-pages.xml` — includes `/pain/*` slugs (or pain pages have their own sitemap registered in the index)
- [ ] `https://bestbikefit4u.eu/robots.txt` — `Disallow: /dashboard`, `Disallow: /api/`, `Sitemap:` directive present
- [ ] Homepage: "Reduce cycling pain" is no longer in the `<meta name="description">` tag
- [ ] Pricing page: no "money-back guarantee" text visible (feature flag is `false`)
- [ ] FAQ: pain answer includes physiotherapist referral text
- [ ] `FitDisclaimer` visible on `/guides/bike-fitting-for-knee-pain`

### Hydration mismatch check
- [ ] Open browser DevTools console on homepage — no React hydration warnings
- [ ] Check `CaseStudyOptIn` on the fit results page — component uses React state only (no `window.*` on first render); if it reads `sessionStorage` on mount, wrap in `useEffect` to avoid SSR mismatch. **Current implementation uses React state only — no risk.**
- [ ] `GTMConsentLoader` runs only in `useEffect` — no SSR/hydration mismatch risk
- [ ] `QuotesCarousel` — if it uses `Math.random()` for quote selection, it may cause hydration mismatch. The homepage uses `selectRandomHomeQuotesForLocale` server-side, which is fine.

### Analytics firing
- [ ] Log in with a test account → complete a full fit session → confirm `funnel_questionnaire_complete` and `funnel_results_view` appear in GA4 DebugView
- [ ] Click "Start Your Free Fit" on homepage → confirm `cta_click` event appears in GA4 DebugView with `section: "hero_primary"`
- [ ] Visit `/pain/knee-pain-cycling` → confirm `pain_page_view` event appears
- [ ] On fit results page, click "Yes, I'm interested" → confirm `case_study_opt_in_clicked` fires
- [ ] Submit case study opt-in form → confirm `case_study_submitted` fires
- [ ] Decline cookie consent → confirm GTM script is NOT loaded (check Network tab for `googletagmanager.com`)
- [ ] Accept cookie consent → confirm GTM script loads, GA4 `page_view` fires

### Ad conversion validation (T04)
- [ ] Complete sign-up on staging → confirm `login_verified` event fires with `isNewUser: true` in GTM Preview
- [ ] If Google Ads tag is live: confirm test conversion recorded in Google Ads Tag Assistant
- [ ] If Meta Pixel is live: confirm `CompleteRegistration` in Meta Events Manager Test Events
- [ ] Sign up twice as same user → confirm conversion fires only once

### Canonical tag audit (sample)
- [ ] View source on `/pain/knee-pain-cycling` → `<link rel="canonical" href="https://bestbikefit4u.eu/en/pain/knee-pain-cycling">`
- [ ] View source on `/nl/pain/knee-pain-cycling` → `<link rel="canonical" href="https://bestbikefit4u.eu/nl/pain/knee-pain-cycling">`
- [ ] `hreflang="en"`, `hreflang="nl"`, `hreflang="x-default"` present on all pain pages

### Performance baseline
- [ ] Run Lighthouse on `/pain/knee-pain-cycling` (mobile) — target Performance ≥ 85, no layout shift (CLS < 0.1)
- [ ] Run Lighthouse on homepage — Performance ≥ 80 (GIF background image is the main LCP risk — verify it has a `<link rel="preload">` or is replaced with a poster image)
- [ ] Core Web Vitals in Vercel Analytics: check LCP, INP, CLS after 24h of production traffic

---

## 6. Vercel-Specific Recommendations

### 1 — Separate GTM container per environment
Create a `GTM-STAGING-*` container in GTM that points to a separate GA4 debug property. Configure the Vercel preview environment's `NEXT_PUBLIC_GTM_ID` to use this container. This prevents staging test events from appearing in production reports.

### 2 — Vercel Speed Insights + Web Analytics
Enable Vercel Web Analytics and Speed Insights for CWV monitoring. These are zero-config on Vercel — add `@vercel/analytics` and `@vercel/speed-insights` packages and import `<Analytics />` and `<SpeedInsights />` in `src/app/layout.tsx`.

### 3 — Deployment protection for preview URLs
Enable Vercel Deployment Protection (password or Vercel auth) on preview branches so that un-indexed preview URLs with test data are not publicly accessible. This prevents Google from crawling preview deployments.

### 4 — Font preloading
If the project uses a custom font, verify it is preloaded in `layout.tsx` with `<link rel="preload" as="font">`. A missing preload will cause a FOUT (flash of unstyled text) that affects CLS and LCP scores.

### 5 — GIF background LCP risk
The homepage uses a GIF background (`bestbikefit4u-home.gif`). GIFs are not LCP-optimized. If the GIF is large (>500KB), it will dominate LCP. Options:
- Convert to WebM/MP4 video loop (much smaller, GPU-decoded)
- Add a static poster image as a CSS background fallback that loads first
- If the GIF is purely decorative, ensure it loads lazily and does not block LCP

### 6 — Edge Middleware for locale routing
Verify `src/proxy.ts` (the auth middleware) is configured as Edge Middleware (`export const config = { matcher: [...] }`). Edge Middleware runs on Vercel Edge Network, not Origin — locale redirects and auth checks happen at the CDN layer. Confirm the middleware does NOT block static assets (`/_next/static`, `/images/`, `/logo/`).

### 7 — Convex connection in Serverless Functions
Convex uses WebSocket connections. Vercel Serverless Functions have a 10-second cold-start timeout on the Hobby plan, 30 seconds on Pro. If the PDF generation route (`/api/reports/[sessionId]/pdf`) is called rarely, cold-start + Convex query + PDF render may approach the timeout. Move this route to the Pro plan's 60-second timeout, or pre-warm with a Vercel cron job if necessary.

---

## Post-Release Monitoring (48h)

| Signal | Tool | Threshold to act |
|---|---|---|
| Build success | Vercel Dashboard | Any failed build triggers rollback |
| Error rate | Sentry | >1% of sessions with JS errors |
| 404 rate | Vercel Logs | >5 404s/hour on `/pain/*` paths |
| Core Web Vitals | Vercel Speed Insights | LCP >4s mobile, CLS >0.1 |
| GA4 event volume | GA4 Real-time | Zero `cta_click` events after 2h of traffic = GTM broken |
| Magic link delivery | Resend dashboard | Bounce rate >5% = Resend key misconfigured or domain warming needed |
| Sitemap indexing | Google Search Console | Submit updated sitemap, monitor for crawl errors within 48h |
| Ad pixel | Google Ads / Meta | Verify conversion status changes from "Unverified" to "Active" within 24h of first sign-up |
