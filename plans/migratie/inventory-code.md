# Code inventory: bestbikefit4u.eu → bikefitboost.com

Scope: worktree `/Users/ortwinverreck/Developer/bestbikefit4u-migratie` (branch `migratie/bikefitboost`), read-only scan on 2026-10-04.
Search: `grep -rIi bestbikefit4u` (+ `bbf4u`, `bestbikefit`, `bikefit4u`) over the whole tree incl. hidden files; excluded `node_modules`, `.next`, `.git`, `package-lock.json`, `plans/`.

- Outside `plans/`: **186 matching lines** (plus 25 file names containing the old brand).
- `plans/`: 410 files / 9,197 lines (historical plans and canvas snapshots, not runtime; ignore).
- `.tasks/`: 4 files (task-runner history; ignore).

Target values used below: site origin `https://www.bikefitboost.com`, mail sender domain `notifications.bikefitboost.com` (proposal, has to be verified in Resend first), mailbox `support@bikefitboost.com` / `security@bikefitboost.com` (proposal, mailboxes have to exist first).

> Note: `public/brand/LEESMIJ.md:4` currently says *"De bestaande e-mailadressen blijven behouden."* That decision has to be reversed explicitly if mail moves too.

---

## Key facts from the code

### Where the canonical origin comes from
- `shared/brand.ts:1` `DEFAULT_SITE_ORIGIN = "https://www.bikefitboost.com"` (already new).
- `shared/brand.ts:3` `LEGACY_SITE_HOSTS = ["bestbikefit4u.eu", "www.bestbikefit4u.eu"]`.
- `shared/brand.ts:6-18` `resolveSiteOrigin()` reads `NEXT_PUBLIC_SITE_URL`, then `SITE_URL`, and **ignores values whose host is in `LEGACY_SITE_HOSTS`**. That means a stale env var cannot break `SITE_ORIGIN` / `BRAND.siteUrl`.
- `src/config/brand.ts` and `convex/lib/brand.ts` derive `BRAND.siteUrl` and `BRAND.host` from `SITE_ORIGIN`. About 48 non-test files use `BRAND.siteUrl` / `SITE_ORIGIN`: metadataBase (`src/app/layout.tsx:41`), robots, sitemaps, llms.txt, JSON-LD, email layout, the Strava callback redirect target and the guide canonical validation.

### Code that reads raw `SITE_URL` and bypasses the legacy-host guard (these follow the env var as it is set)
| file:line | use |
|---|---|
| `convex/integrations/actions.ts:266-267` | Strava OAuth `redirect_uri = ${SITE_URL}/api/strava/callback` |
| `convex/emails/delivery.ts:8` | links in lifecycle emails (`SITE_URL ?? BRAND.siteUrl`) |
| `convex/emails/unsubscribeTokens.ts:57-69` | email-preferences page URL (`origin("SITE_URL")`) |
| `convex/authLocalDev.ts:37` | localhost dev-login guard |
| `src/app/api/stripe/portal/route.ts:16` | Stripe billing portal `return_url` |
| `src/config/stripeServer.ts:42` | Stripe checkout success/cancel URLs |
| `@convex-dev/auth` (library) | uses Convex `SITE_URL` to validate `redirectTo` and to build the redirect after the OAuth callback |

So **`SITE_URL` must be set to `https://www.bikefitboost.com` in both Convex prod and Vercel prod.** If it is not, Strava, Stripe and email links keep pointing at the old domain (they still work through the redirect, but Strava needs the callback domain to match).

### Env vars that hold URLs
- `SITE_URL`: Convex and Vercel. `scripts/check-vercel-env.mjs:59-63` requires it on a production deploy with billing enabled.
- `NEXT_PUBLIC_SITE_URL`: Next. Optional; read first by `shared/brand.ts`.
- `NEXT_PUBLIC_CONVEX_URL` (`*.convex.cloud`), `NEXT_PUBLIC_CONVEX_SITE_URL` (`*.convex.site`), `CONVEX_SITE_URL` (built-in Convex var): not domain-bound, no change.
- Scripts and QA only: `BASE_URL`, `SITEMAP_BASE_URL`, `SMOKE_BASE_URL`, `RB_VISUAL_ORIGIN`, `CONFIGURATOR_TEST_ORIGIN`.
- `AUTH_EMAIL_FROM` (Convex), `ANALYTICS_ADMIN_EMAILS` (Convex), `AUTH_RESEND_KEY`.

### Auth providers (`convex/auth.ts`)
- `Email` provider with id **`resend`**: a magic **code** (7 characters, 15 minutes), sent through the Resend SDK with `emailSender()`. That uses the `AUTH_EMAIL_FROM` env var or falls back to `BRAND.authEmailFrom`, and always forces the display name to "BikeFitBoost".
- **Google** (`@auth/core/providers/google`): only active when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set (`convex/auth.ts:160-162`). The UI button is gated by `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`.
- `ConvexCredentials` id `localhost-dev`: dev only.
- `convex/auth.config.ts`: JWT issuer domain `CONVEX_SITE_URL ?? NEXT_PUBLIC_CONVEX_SITE_URL` (not site-domain-bound).
- Routes: `convex/http.ts:12` `auth.addHttpRoutes(http)`. **The OAuth callback is therefore `{CONVEX_SITE_URL}/api/auth/callback/google`, i.e. `https://<deployment>.convex.site/api/auth/callback/google`**, not on the site domain. `src/proxy.ts` (`convexAuthNextjsMiddleware`) only proxies the `/api/auth` sign-in and token POSTs from Next to Convex.
  - `docs/GOOGLE_SIGNIN_ROLLOUT.md:18` gives `https://bestbikefit4u.eu/api/auth/callback/google` as the prod redirect URI. That is inconsistent with the code; check the actual Google Cloud console value.
  - Domain-bound items in Google Cloud: OAuth consent screen authorized domains, homepage/privacy/terms links, and "Authorized JavaScript origins" (if set). Add `bikefitboost.com`.
- Other Convex HTTP routes: `/emails/unsubscribe` (List-Unsubscribe on `CONVEX_SITE_URL`), `/strava/callback`, `/stripe/webhook`. None of them are site-domain-bound.

### Redirect status code
- `next.config.ts:10-17` `redirects()`: for each `LEGACY_SITE_HOSTS` host, `source "/:path*"` with `has host` → `${SITE_ORIGIN}/:path*`, **`permanent: true` → 308**.
  - For 301: replace `permanent: true` with `statusCode: 301` (Next allows `statusCode` instead of `permanent`).
  - Update `next.config.test.ts:6-14`, which asserts `permanent: true`.
- `src/proxy.ts:64-69` `redirectToPath(... permanent ? 308 : 307)` handles locale redirects. `src/proxy.ts:161` sets CMS guide redirects to `match.statusCode` (301/302). Neither is host-bound.
- Apex `bikefitboost.com` → `www` is **not** in code; it has to come from the Vercel domain configuration.
- Vercel only applies the host redirect when the old domains are still attached to the project. `vercel.json` has no redirects.

---

## 1. Base URL & config
| file:line | value | use | proposal |
|---|---|---|---|
| `shared/brand.ts:3` | `LEGACY_SITE_HOSTS = ["bestbikefit4u.eu","www.bestbikefit4u.eu"]` | runtime redirect allowlist, CSP, URL rewrite | keep — redirect config |
| `shared/brand.test.ts:27-28` | `NEXT_PUBLIC_SITE_URL/SITE_URL=https://(www.)bestbikefit4u.eu` | test that legacy env values are ignored | keep — test fixture (tests the guard) |
| `.env.example:11` | `SITE_URL=https://bestbikefit4u.eu` | env template | `SITE_URL=https://www.bikefitboost.com` |
| `ide.yml:1` | `name: bestbikefit4u` | tmux-ide workspace name | optional; keep (local tooling) |
| `src/lib/seo/siteUrl.ts:1-18` (no literal) | `currentSiteUrl()` rewrites legacy-host URLs from CMS to `BRAND.siteUrl` | runtime CMS canonical/og rewrite | keep |
| `src/lib/seo/siteUrl.test.ts:6,13-15` | legacy URLs + spoof variants | test fixture | keep — tests the guard |

## 2. Subdomains (`notifications.bestbikefit4u.eu`)
| file:line | value | use | proposal |
|---|---|---|---|
| `src/config/brand.ts:7` | `authEmailFrom: "BikeFitBoost <noreply@notifications.bestbikefit4u.eu>"` | email sender fallback (Next side; check whether it is still used) | `noreply@notifications.bikefitboost.com` after Resend verification |
| `convex/lib/brand.ts:5` | same | **email sender fallback** for `emailSender()` when `AUTH_EMAIL_FROM` is empty | same |
| `.env.example:18` | `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>` | env template | `BikeFitBoost <noreply@notifications.bikefitboost.com>` |
| `docs/VERCEL_DEPLOYMENT.md:44,51,109,115` | same sender (incl. a Resend curl probe) | docs | update |
| `docs/RELEASE_READINESS_CHECKLIST.md:25,26,62,69` | sender + "Resend domain `notifications.bestbikefit4u.eu` Verified" | docs/checklist | update |
| `scripts/check-rebrand-copy.test.ts:12` | `noreply@notifications.bestbikefit4u.eu` as an *allowed* string | test fixture | update with code |

No other subdomains (`*.bestbikefit4u.eu`) are in the code. **The actual sender lives in the Convex prod env `AUTH_EMAIL_FROM`; the code only overrides the display name.**

## 3. Hardcoded links in templates/components/emails/PDF/JSON
| file:line | value | use | proposal |
|---|---|---|---|
| `src/app/(public)/contact/page.tsx:56,79` | `"Address: support@bestbikefit4u.eu"` / `"Adres: …"` | UI copy (contact) | `support@bikefitboost.com` |
| `src/app/(public)/contact/page.tsx:126,134` | `mailto:support@bestbikefit4u.eu` | mailto link + CTA tracking target | same |
| `src/app/(public)/contact/page.tsx:127` | `support@bestbikefit<span>4</span>u.eu` (split text, **not found by a plain grep**) | visible address | `support@bikefitboost.com` (adjust markup) |
| `src/app/(public)/privacy/content.ts:92,95,183,186` | `support@bestbikefit4u.eu` | privacy policy text | new address |
| `src/app/(public)/terms/content.ts:75,149` | same | terms text | new address |
| `src/app/(public)/privacy/legalBaseline.fixture.ts:90,93,181,184,255,327` | same | legal baseline test fixture | test fixture, update with code |
| `src/lib/contentBrand.ts:5-6` | regex `(?:www\.)?bestbikefit4u\.eu…` | runtime: replaces the brand name "BestBikeFit4U" in CMS copy but **deliberately leaves URLs/emails with the old domain** | decide: also rewrite `bestbikefit4u.eu` → new domain, or migrate the CMS data |
| Email templates (`convex/emails/**`) | none | all links via `BRAND.siteUrl` / `SITE_URL` / `CONVEX_SITE_URL` | OK |
| PDF (`src/lib/reports/**`) | none | footer via BRAND | OK |
| `public/site.webmanifest`, `src/app/manifest.webmanifest/route.ts` | none | already BikeFitBoost | OK |

**Persisted CMS data (Convex DB, guides/blog `canonicalUrl`, `ogImageUrl`, body text)** may still contain `bestbikefit4u.eu`. Canonical and og are rewritten at render time (`currentSiteUrl` in `src/app/(public)/guides/[slug]/page.tsx`, `blog/[slug]/page.tsx`, `blog/data.ts`), but body links and email addresses are not. New saves are blocked by `convex/guides/mutations.ts:69` (`Canonical URL must use ${BRAND.host}`). I could not verify the DB contents (no network).

## 4. Email addresses & senders
| file:line | value | use | proposal |
|---|---|---|---|
| `convex/lib/brand.ts:7`, `src/config/brand.ts:8` | `supportEmail: "support@bestbikefit4u.eu"` | runtime support address (emails/UI) | `support@bikefitboost.com` |
| `convex/lib/brand.ts:5`, `src/config/brand.ts:7` | `noreply@notifications.bestbikefit4u.eu` | sender fallback | see §2 |
| `.env.example:39` | `ANALYTICS_ADMIN_EMAILS=support@bestbikefit4u.eu` | **authorization allowlist** (`convex/analytics/queries.ts:73`) | add the new address; also check the Convex prod env |
| `SECURITY.md:31,175` | `security@bestbikefit4u.eu` | security contact | `security@bikefitboost.com` |
| `src/components/admin/users/admin-users-data.ts:98,110,135,147` | `anna@/bram@/daan@/elsa@bestbikefit4u.eu` | admin mock/demo data | optional → `@bikefitboost.com` or `@example.com` |
| `docs/CONVEX_RUNTIME_BOUNDARIES.md:57` | `qa-runtime-check@bestbikefit4u.eu` | docs (QA sign-in) | update |
| `convex/lib/brand.test.ts:6-7` | `sender@bestbikefit4u.eu` | test fixture (only the display name is tested) | keep or update |
| Convex env `AUTH_EMAIL_FROM` (not in repo) | presumably `…@notifications.bestbikefit4u.eu` | **actual sender** | set after Resend verification of the new domain |

## 5. CORS/CSP/allowed hosts
| file:line | value | use | proposal |
|---|---|---|---|
| `src/lib/csp.ts:5,38` | `brandImageOrigins = [SITE_ORIGIN, ...LEGACY_SITE_HOSTS]` in `img-src` | CSP | keep for now (old absolute image URLs in CMS); remove later |
| `src/lib/csp.test.ts:9-10` | asserts legacy origins in img-src | test fixture | update with code |
| `src/lib/analytics/marketing.ts:105-106` | `isProductionMarketingHost = hostname === BRAND.host` | analytics only on www.bikefitboost.com | OK (no literal) |
| `convex/guides/mutations.ts:69` | canonical host must equal `BRAND.host` | CMS validation | OK |
| `convex/authLocalDev.test.ts:22,80` | `bestbikefit4u.eu` as a non-localhost host | test fixture | update with code (optional) |
| `src/lib/analytics/marketing.test.ts:56,60`, `src/lib/seo/sitemap/xml.test.ts:20,27` | `preview-bestbikefit4u.vercel.app`, `bestbikefit4u.vercel.app` | test fixture (Vercel preview host) | keep (Vercel project name); rename optional |
| CORS | none | no `Access-Control-Allow-Origin` / `allowedOrigins` in the code | — |

## 6. Cookies/sessions/storage keys
None contain `bestbikefit4u`. Short prefixes that are persisted:
| file:line | key | proposal |
|---|---|---|
| `src/components/integrations/strava-auto-import.ts:19` | sessionStorage `bbf4u:strava:auto-import` | keep — persisted key, do not rename |
| `src/lib/newsletter/signupIntent.ts:4` | `bbf.newsletter-signup` | keep — persisted key |
| `src/lib/cookieConsent.ts:3` | `bf_cookie_consent` | keep — persisted key (**origin-bound: consent and localStorage do not carry over to the new domain**, so users see the banner again; unavoidable) |
| `src/i18n/config.ts:6` | cookie `bf_locale` | keep (host-only cookie; resets on the new domain) |
| Convex Auth cookies (`__convexAuth*`, set by the library) | host-only | keep. **Sessions do not carry over: users on the old domain have to log in again on the new domain.** |
| `src/proxy.ts:109` | header `x-bbf-redirect-secret` | keep |
| GTM events `bbf_cta_click`, `bbf_marketing_event`, `bbf_conversion` | analytics event names | keep (renaming breaks GTM/GA4 triggers) |
| `src/lib/previewToken.ts:67` | `typ: "BBF_PUBLIC_FIT_PREVIEW"` | keep |

## 7. Auth (OAuth/magic code/callbacks)
| item | where | proposal |
|---|---|---|
| Magic-code sender | Convex env `AUTH_EMAIL_FROM`, fallback `convex/lib/brand.ts:5` | new domain after Resend verification |
| Magic-code links / redirectTo validation | `@convex-dev/auth` against Convex `SITE_URL` | Convex prod `SITE_URL=https://www.bikefitboost.com` |
| Google OAuth callback | `{CONVEX_SITE_URL}/api/auth/callback/google` (code) | unchanged; but update the consent screen domains/links and check whether the console has a site-domain URI (docs say so) |
| `docs/GOOGLE_SIGNIN_ROLLOUT.md:18` | `https://bestbikefit4u.eu/api/auth/callback/google` | docs; correct to the convex.site pattern |
| Strava OAuth | `convex/integrations/actions.ts:267` → `${SITE_URL}/api/strava/callback` → `src/app/api/strava/callback/route.ts` proxies to `{CONVEX_SITE_URL}/strava/callback` → redirect to `SITE_ORIGIN/settings` | Strava app "Authorization Callback Domain" → `www.bikefitboost.com`, at the same time as `SITE_URL` (a mismatch makes Strava refuse the authorization) |
| Auth tests `convex/__tests__/auth.contract.test.ts:58-60,124` | `https://bestbikefit4u.eu/nl/login?code=…` | test fixture (locale detection) | update with code |

## 8. SEO (canonical, sitemap, robots, OG, JSON-LD, hreflang, llms.txt)
All runtime SEO is derived from `BRAND.siteUrl` (no literals): `src/app/layout.tsx:41` metadataBase, `src/app/robots.ts` (sitemap + host), `src/lib/seo/sitemap/config.ts:10`, `src/app/sitemap*.xml/route.ts`, `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`, JSON-LD (`src/lib/seo/jsonLd*`), hreflang (`src/i18n/metadata*`). There is no static `public/robots.txt`, `public/llms.txt` or `public/sitemap.xml`.

Literals only in QA scripts and tests:
| file:line | use | proposal |
|---|---|---|
| `scripts/seo-discovery-check.mjs:21,24,56,73,80,83,92` | SEO QA script (host header + canonical/hreflang expectations) | `www.bikefitboost.com` |
| `scripts/seo-semrush-check.mjs:88,100,104` | SEO QA script | same |
| `scripts/seo-crawl/html.test.ts:5,6,28,53-57` | parser test fixture | test fixture, update optional |
| `tests/visual/guides-audit/audit.mjs:9,10,17` | default base/canonical origin | `https://www.bikefitboost.com` |
| `tests/visual/guides-audit/audit.mjs:153` | expects title suffix ` \| BestBikeFit4U` | ` \| BikeFitBoost` (stale) |
| `tests/visual/marketing-batch5a/capture.mjs:79` | expected canonical | new origin |
| `src/lib/seo/social-image.test.ts:17` | legacy og URL → rewrite | test fixture (tests the rewrite) |
| `src/app/(public)/blog/page.test.tsx:169-181`, `src/app/(public)/guides/[slug]/page.test.tsx:608,620` | legacy canonical/og in CMS → rewrite | keep — tests the rewrite |

## 9. Redirects
| file:line | what | proposal |
|---|---|---|
| `next.config.ts:10-17` | host redirect for both legacy hosts → `SITE_ORIGIN/:path*`, `permanent: true` (308) | `statusCode: 301` instead of `permanent: true` |
| `next.config.test.ts:6-14` | asserts `permanent: true` | update with code |
| `tests/visual/final-sweep/assets.test.mjs:40` | QA asset server with `host: bestbikefit4u.eu` | test fixture |
| Vercel domains (not in repo) | old domains must stay attached to the project so the host redirect fires; apex `bikefitboost.com` → www via Vercel | dashboard |

## 10. Webhooks & external services
| service | code | domain-bound? | action |
|---|---|---|---|
| Stripe webhook | `convex/http.ts:165` `{CONVEX_SITE_URL}/stripe/webhook` | no | none |
| Stripe checkout/portal return URLs | `src/config/stripeServer.ts:42`, `src/app/api/stripe/portal/route.ts:16` (raw `SITE_URL`) | yes | Vercel `SITE_URL`; Stripe dashboard: business website / customer portal links / branding |
| Strava | see §7 | yes | callback domain in the Strava app |
| Resend | sender + domain verification | yes | verify `notifications.bikefitboost.com` (DNS: SPF/DKIM/DMARC/return-path) |
| Google OAuth | see §7 | partly | consent screen |
| GTM/GA4/Meta pixel/Google Ads | `NEXT_PUBLIC_GTM_ID`; firing gate `isProductionMarketingHost` = `BRAND.host` | yes (data stream URL, conversion domains, referral exclusion for the old domain) | dashboards |
| Sentry | DSN; no domain allowlist in code | possibly "Allowed Domains" in the Sentry project | dashboard |
| Upstash, OpenAI, Convex | not domain-bound | — | — |
| `src/app/api/health/config/route.ts:13` | checks presence of `NEXT_PUBLIC_CONVEX_SITE_URL` | no | — |

## 11. Tests/fixtures (update together with the code; all "test fixture, update with code" unless noted)
- `convex/emails/__tests__/lifecycle.contract.test.ts:109` (`SITE_URL=https://bestbikefit4u.eu`)
- `convex/emails/__tests__/newsletter.contract.test.ts:77`, `convex/emails/__tests__/preferences.test.ts:50,97` (`bestbikefit4u.example`: neutral, optional)
- `convex/feedback/__tests__/mutations.contract.test.ts:119`, `convex/guides/__tests__/mutations.contract.test.ts:427` (rejection of the legacy canonical: keep)
- `convex/__tests__/auth.contract.test.ts:58-60,124`, `convex/authLocalDev.test.ts:22,80`, `convex/lib/brand.test.ts:6-7`
- `shared/brand.test.ts:27-28` (keep — tests the guard)
- `src/lib/csp.test.ts:9-10`, `src/lib/seo/siteUrl.test.ts:6,13-15` (keep), `src/lib/seo/social-image.test.ts:17` (keep), `src/lib/contentBrand.test.ts:6-28`
- `src/app/(public)/contact/page.test.tsx:59,60,64,92`, `src/app/(public)/blog/page.test.tsx:169-181`, `src/app/(public)/guides/[slug]/page.test.tsx:608,620`
- `src/lib/analytics/marketing.test.ts:56,60`, `src/lib/seo/sitemap/xml.test.ts:20,27` (vercel.app hosts)
- `scripts/check-vercel-env.test.ts:32`, `scripts/seo-crawl/html.test.ts`, `scripts/check-rebrand-copy.test.ts:4-5,11-12`
- `scripts/check-rebrand-copy.mjs:8-11`: the rebrand guard **explicitly allows** `*@*.bestbikefit4u.eu`, `bestbikefit4u.eu` and `bestbikefit4u*` asset file names. Tighten it after the migration so the old domain is caught.
- `scripts/rebrand-assets-capture.mjs:55-56` (same allowance)
- `tests/visual/**` (see §8), `tests/visual/final-sweep/assets.test.mjs:40`, `tests/visual/site-metadata/check.mjs:11,17` (expects "BestBikeFit4U" titles: stale), `tests/visual/final-sweep/nl-language.*`

## 12. Docs only
- `README.md:1,3,40` (title/name + absolute path to the old repo dir)
- `PRODUCT.md:1,12`
- `SECURITY.md:5,31,154,175`
- `docs/VERCEL_DEPLOYMENT.md:42,44,49,51,109,115` (incl. `npx convex env set SITE_URL https://bestbikefit4u.eu --prod`)
- `docs/RELEASE_READINESS_CHECKLIST.md:25,26,62,69`
- `docs/GOOGLE_SIGNIN_ROLLOUT.md:18`
- `docs/CONVEX_RUNTIME_BOUNDARIES.md:57`
- `docs/CONTENT_LOCALIZATION_STYLE_GUIDE.md:3`
- `data/README.txt:1`, `data/convex_seed.ts:1` (comment)
- `.tasks/**` (4 files, history), `scripts/guides-batch-c/bbf-illustraties/*.py:1` (docstring)
- `public/brand/LEESMIJ.md:4` (says the existing email addresses stay: decision point)

### File names with the old brand (asset filename)
| file | referenced by | proposal |
|---|---|---|
| `public/bestbikefit4u-home.mp4`, `.webm` | `src/components/home/HeroBackground.tsx:77-78`, `scripts/check-image-weight.mjs:5` | keep (URL path, not visible) or rename + update refs |
| `public/bestbikefit4u-home-poster.jpg` | `src/components/home/HeroBlock.tsx:50` | same |
| `public/bestbikefit4u-beginner-intermediate-advanced.webp` | `src/components/questionnaire/questions/ExperienceLevelSelector.tsx:34` | same |
| `public/mascote/bestbikefit4u-mascote-on-bike-transparent.webp` | `src/app/not-found.tsx:125` | same |
| `public/measure/*-bbf4u.webp` (5) | `src/components/measurements/measurementIllustrations.ts:21-49` | keep |
| `public/logo/bestbikefit4u_*.svg/.png`, `logo-bestbikefit4u-v2.*`, `bestbikefit4u-logo.png` (11) | no runtime reference (only `scripts/images/optimize-public.mjs`, `tests/visual/image-weight`) | candidates for removal (SVG aria-labels "BestBikeFit4U") |
| `docs/bestbikefit4u_guides_cms_backlog_v1{,_nl,_en}.csv/.xlsx` | `src/lib/guides/backlog.ts:78`, guides-batch export scripts, tests | keep (internal data file) |
| `BestBikeFit4U_ExampleReport_EN_v2.pdf` (repo root) | not referenced | old example report; remove or replace |

## 13. Old brand name mentions (runtime / user-visible) — owner decision
| file:line | text | visible? |
|---|---|---|
| `src/components/feedback/feedback-copy.ts:130,132` | "…make **BestBikeFit** even better", "Together we create the **BestBikeFit** experience" | **yes, the feedback dialog (EN)**. Missed by the rebrand guard because the "4U" is missing |
| `src/components/feedback/feedback-copy.ts:274,276` | "wat **BestBikeFit** nog beter kan maken", "**BestBikeFit**-beleving" | **yes (NL)** |
| `src/components/feedback/feedback-copy.test.ts:24` | asserts the above text | test |
| `src/lib/contentBrand.ts:5-6` | runtime rewrite of "BestBikeFit4U" → BikeFitBoost in CMS copy | intended; means the DB still contains the old name |
| `public/logo/bestbikefit4u_*.svg:1` | `aria-label="BestBikeFit4U …"` | only if the assets are used (they are not) |
| `src/app/(public)/faq/page.test.tsx:75` | test helper | no |
| `tests/visual/guides-audit/audit.mjs:153`, `tests/visual/site-metadata/check.mjs:11,17` | expect old titles | stale QA scripts |
| Docs (`README.md`, `PRODUCT.md`, `SECURITY.md`, `docs/CONTENT_LOCALIZATION_STYLE_GUIDE.md`, `data/*`) | name | no (repo docs) |
| `ide.yml:1`, `.claude` skills "bestbikefit4u-huisstijl" | tooling | no |

---

## Checklist of non-code steps that follow from this inventory
1. Resend: verify `notifications.bikefitboost.com`, then set Convex prod `AUTH_EMAIL_FROM`, then update the fallback in `convex/lib/brand.ts:5` / `src/config/brand.ts:7`.
2. Convex prod + Vercel prod: `SITE_URL=https://www.bikefitboost.com` (and optionally `NEXT_PUBLIC_SITE_URL`).
3. Strava app callback domain → `www.bikefitboost.com`, at the same moment as step 2.
4. Google OAuth consent screen domains/links; check the redirect URI (convex.site).
5. Support/security mailboxes on the new domain, then update `supportEmail`, contact/privacy/terms, SECURITY.md, `ANALYTICS_ADMIN_EMAILS`.
6. `next.config.ts` 308 → 301 (`statusCode: 301`) + test.
7. CMS data: search the DB for `bestbikefit4u.eu` in body/canonical/og (and the "BestBikeFit4U" name) and migrate it, or extend `currentBrandCopy`.
8. After the migration: tighten `scripts/check-rebrand-copy.mjs` and fix "BestBikeFit" in `feedback-copy.ts`.
