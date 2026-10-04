# Domain migration bestbikefit4u.eu → bikefitboost.com: step 1 inventory

Branch `migratie/bikefitboost` (worktree `~/Developer/bestbikefit4u-migratie`, from main @ 4279f71). The initial step-1 inventory made no changes.
Details: `inventory-code.md` (code/config, 186 hits outside `plans/`), `inventory-database.md` (prod DB, 72 tables, 19,469 docs).

Step-1 findings below describe the pre-migration baseline. **M1 complete, uncommitted:** apex resolver, legacy-host 301s, writers, docs/tests and domain guard. Final combined M1–M4 unit/contracts/typecheck/lint/Convex/build gates pass; local SEO crawl passes 875 page/UA checks; migration checker passes 684 redirects with zero findings, including C's legal OG correction. No production changes performed. Evidence and owner cutover boundaries: `audit/M1-notes.md`; M1 file manifest: `audit/files-M1.txt`.

## Platform
- **Hosting:** Vercel (Next.js 16, App Router). Domains on Vercel: bikefitboost.com, www.bikefitboost.com, bestbikefit4u.eu, www.bestbikefit4u.eu (old domain has wildcard DNS to Vercel).
- **Backend/database:** Convex (prod `elegant-panther-767`, EU). HTTP actions on `*.convex.site`.
- **Auth:** `@convex-dev/auth`, with two methods: email magic code (Resend) and Google OAuth (`@auth/core` Google provider).
  The OAuth callback today is `https://elegant-panther-767.eu-west-1.convex.site/api/auth/callback/google` (Convex env `CUSTOM_AUTH_SITE_URL`).
- **Mail:** Resend, sending domain `notifications.bestbikefit4u.eu` (DKIM `resend._domainkey`, `send.` MX/SPF to Amazon SES).
  bikefitboost.com already has Google Workspace MX/SPF and DMARC `p=none`.

## Current state (already live since the 4 Oct rebrand)
- Canonical origin is **https://www.bikefitboost.com** in one constant (`shared/brand.ts`, env-overridable; old hosts in env are ignored).
- Canonicals, hreflang, sitemap, robots, OG/Twitter, JSON-LD and llms.txt already use the new origin.
- `bestbikefit4u.eu/path?x` redirects to `https://www.bikefitboost.com/path?x` with **308** (code redirect), not 301.
- Convex prod `SITE_URL` is already set to `https://www.bikefitboost.com`.

## Findings per category (summary)
| # | Category | Finding | Proposal |
|---|---|---|---|
| 1 | Base URL | `shared/brand.ts` is central. Raw `process.env.SITE_URL` without the legacy guard is read in Strava redirect_uri (`convex/integrations/actions.ts:267`), Stripe return URLs (`src/config/stripeServer.ts:42`, `api/stripe/portal/route.ts:16`), email links (`convex/emails/delivery.ts:8`) and @convex-dev/auth redirectTo validation | Route everything through one helper; set `SITE_URL`/`NEXT_PUBLIC_SITE_URL` in Vercel (all envs) |
| 2 | Subdomain | `notifications.bestbikefit4u.eu` is only the Resend sending domain (fallback in `convex/lib/brand.ts:5`, `src/config/brand.ts:7`; real value Convex `AUTH_EMAIL_FROM`) | `notifications.bikefitboost.com` as the Resend sending domain (keeps the Google Workspace SPF on the root clean) |
| 3 | Hardcoded links | Templates, PDF and JSON already use `BRAND.siteUrl`; remaining hits are tests/docs/scripts | Update docs, scripts and tests |
| 4 | Email addresses | `support@bestbikefit4u.eu` in brand config, contact page (split with a span), privacy/terms, legal fixtures, `ANALYTICS_ADMIN_EMAILS`; `security@` in SECURITY.md; `noreply@notifications.bestbikefit4u.eu` | `support@bikefitboost.com`, `security@bikefitboost.com`, `noreply@notifications.bikefitboost.com` (mailboxes must exist) |
| 5 | CSP/hosts | `img-src` allows the old origins (`src/lib/csp.ts:5`); no CORS config | Keep the old origins temporarily, new one is already in |
| 6 | Cookies/sessions | No cookie domain set (host-only); keys `bbf4u:`, `bbf.`, `bf_` contain no domain | Keep the keys. Users log in again on the new domain and see the language choice and cookie banner again |
| 7 | Auth | Google callback on `convex.site`, so Google shows the Convex host, not bikefitboost.com. `docs/GOOGLE_SIGNIN_ROLLOUT.md` says `bestbikefit4u.eu/api/auth/callback/google` | Proxy `/api/auth/signin/*` and `/api/auth/callback/*` via `www.bikefitboost.com` to Convex (`CUSTOM_AUTH_SITE_URL=https://www.bikefitboost.com`) |
| 8 | SEO | Done; old domain robots.txt is not blocked (it redirects) | Verify 20+ URLs |
| 9 | Redirects | 308 instead of 301. `www.bestbikefit4u.eu` → `bestbikefit4u.eu` → new is **2 hops** (Vercel domain setting). `http://` → `https://` is an extra Vercel hop | Code `statusCode: 301`; in Vercel set both old domains as a 301 redirect to `www.bikefitboost.com` |
| 10 | External services | Strava callback domain (Strava app), Stripe (stubbed, no live webhooks), Resend domain, Google OAuth client `491678180647-…`, Google Search Console | Owner's manual actions |
| 11 | Database | 48 `guidePages.ogImageUrl` with `https://bestbikefit4u.eu/og/...` (+48 in `guideRevisions`). No inline links/canonicals. Audit/feedback/user rows: do not change | Migration script with backup + dry-run, rewrite `guidePages` (+ optionally revisions) |
| 12 | Tests/docs | ~100 hits | Update with the code |
| 13 | Brand name | **Already changed to BikeFitBoost** at the 3 Oct request (live). Remaining: feedback dialog "BestBikeFit" (`src/components/feedback/feedback-copy.ts`), guide meta-title suffix "\| BestBikeFit4U" in the DB (normalized at render time), asset file names, 11 unused old logo files | Separate decision |

## Planned changes in step 2 (after go)
1. Redirect 301 and one helper for every `SITE_URL` read; Vercel/Convex env per the table.
2. Google login via `www.bikefitboost.com` (auth proxy + `CUSTOM_AUTH_SITE_URL`), local test.
3. Email addresses and sender to @bikefitboost.com (fallbacks, contact, privacy/terms, SECURITY.md, `.env.example`).
4. DB migration script `guidePages.ogImageUrl` (backup, dry-run, counts).
5. Docs/tests/scripts cleanup; tighten the rebrand guard (old domain only allowed in redirect config).
6. Test checklist: 20+ old URLs → one 301, sitemap/robots/canonicals, login, emails.

## M2 implementation status (4 Oct)

Google signin/callback proxy handlers, pre-auth middleware bypass (including the exact Strava callback),
installed-source audit and Console/release instructions are complete. 62 focused tests, full typecheck,
lint and Convex standalone tsc pass. Evidence: `audit/M2-notes.md`, `audit/M2-auth.md`, `audit/files-M2.txt`.
A owns the single combined build/full suites/crawl; C owns email previews and the migration checker.
Real Google/browser/Console acceptance remains an owner release checklist. No commits, deployments,
production access, actual environment changes or mail sends were performed by M2.

## Owner decisions (4 Oct)
- **Canonical = `https://bikefitboost.com` (no www).** `www.bikefitboost.com` becomes an alias (301 → apex via the Vercel domain setting, NOT in code: Vercel currently redirects apex→www, so a code redirect www→apex would loop until the owner flips it).
- **Mail:** sender `noreply@notifications.bikefitboost.com` (Resend subdomain), contact `support@bikefitboost.com`, `security@bikefitboost.com`.
- **Brand name:** do not change any further in this branch; only list remaining mentions (category 13).

## Step 2 tasks (Codex, disjoint files; no commits/deploys/prod data/env changes/mails)
| ID | Owner | Scope |
|---|---|---|
| **M1 origin + redirects** | A | `shared/brand.ts` default `https://bikefitboost.com`; treat `www.bikefitboost.com` as a valid alias (not legacy); one exported helper (e.g. `resolveSiteOrigin`/`siteUrl()`) used by EVERY `SITE_URL`/`NEXT_PUBLIC_SITE_URL` read (Strava `convex/integrations/actions.ts`, Stripe `src/config/stripeServer.ts` + `api/stripe/portal/route.ts`, `convex/emails/delivery.ts`, unsubscribe/preferences, health route), safe in Convex schema evaluation (no top-level throwing env reads). `next.config.ts` legacy host redirects → **301** (`statusCode: 301`), path + query preserved, all old hosts (`bestbikefit4u.eu`, `www.bestbikefit4u.eu`, any `*.bestbikefit4u.eu` via a host regex). Tests incl. next.config tests, sitemap/canonical/hreflang/JSON-LD/llms/robots expectations on the apex. Then category 12: docs, scripts, tests, `.env.example`, `docs/*` updated to the new domain; tighten `scripts/check-rebrand-copy.mjs` so `bestbikefit4u.eu` is only allowed in redirect config, legacy constants, migration script and DB-history fixtures. |
| **M2 Google login** | B | Make Google OAuth run via the site: Next.js rewrites (or route handlers) proxying `/api/auth/signin/:path*` and `/api/auth/callback/:path*` to the Convex HTTP actions host (`NEXT_PUBLIC_CONVEX_SITE_URL`), keeping cookies, query strings and redirects intact; must not clash with `@convex-dev/auth` Next middleware (`/api/auth` POST) or `src/app/api/auth/localhost-dev`. Verify with the installed `@convex-dev/auth` source how `CUSTOM_AUTH_SITE_URL` builds redirect URIs and document the required value `https://bikefitboost.com`. Also check the Strava OAuth return path. Local end-to-end proof with a fake provider/mocked Google if feasible; otherwise a contract test of the proxy + written manual test. Write `audit/M2-auth.md` with the exact Google Cloud Console values (JS origins, redirect URIs, authorized domains, privacy/terms URLs). |
| **M3 mail + DB + test kit** | C | (a) Addresses: `noreply@notifications.bikefitboost.com` fallback sender (`convex/lib/brand.ts`, `src/config/brand.ts`), `support@bikefitboost.com` (brand configs, contact page incl. the span-split address, privacy/terms, legal fixtures, `ANALYTICS_ADMIN_EMAILS` default), `security@bikefitboost.com` (SECURITY.md); email previews regenerated. (b) DB migration: an internal Convex mutation with `dryRun` (default true) + paginated cursor that rewrites `https://bestbikefit4u.eu`/`https://www.bestbikefit4u.eu` absolute URLs → `https://bikefitboost.com` in `guidePages.ogImageUrl` and `guideRevisions.snapshot.ogImageUrl` only (never audit logs, feedback, users, authAccounts), returns counts; runbook in `audit/M3-db-runbook.md` incl. backup command (`convex export --prod`) — do NOT run it against prod. Verify `/og/illustrations/guides/*.jpg` is served by the app. (c) `scripts/domain-migration-check.mjs <origin> <legacy-origin>`: checks ≥25 old URLs (pages, guides, query strings, assets, sitemap, robots, old OAuth path) give exactly ONE 301 to the same path+query on the apex, plus sitemap/robots/canonical/og:url/hreflang on the new domain, no mixed content; runnable against a local build with Host headers and later against production. |

Coordination via `plans/migratie/messages/`. Gates: typecheck, lint, test:unit, test:contracts, build, Convex tsc, `scripts/seo-crawl-check.mjs --local` with `NEXT_PUBLIC_SITE_URL=https://bikefitboost.com`, email previews, the M3 check script against a local build. Notes `plans/migratie/audit/<id>-notes.md`, manifests `audit/files-<id>.txt`. Renders in `plans/migratie/renders/` (git-ignored). Print `DONE M1` / `DONE M2` / `DONE M3`.

## M4 — remove Strava (owner, 4 Oct) — Codex B
Remove the whole Strava integration (63 files reference it): settings connect/import UI (`StravaBikeImportSection`, `stravaBikeImport`, `StravaAutoImportTrigger`, `strava-auto-import`), `src/app/api/strava/callback`, the proxy exception for `/api/strava/callback` (M2), `convex/http.ts` `/strava/callback`, `convex/integrations/*` Strava actions/token/sync/queries/mutations, both Strava crons in `convex/crons.ts`, admin/overview/user-detail Strava bits, dashboard messages about Strava, i18n strings, feedback copy, profile-score/advice inputs that read Strava data (keep the score working without them), `.env.example` STRAVA_*, docs/PRODUCT.md, tests and visual fixtures.
**Keep the schema and existing data as legacy** (optional fields/union literals like `"strava"` bike source, `stravaGearId`, activity tables) so the Convex deploy validates against prod data — exactly like the Marktplaats removal (task 46). Bikes imported from Strava stay normal bikes. No user-facing mention of Strava remains, except a privacy-policy line only if legally needed (flag it in notes, do not invent legal text).
Add an **internal, admin-only, dry-run-first** mutation that clears stored Strava OAuth tokens/connection records (count first; never run it — the lead runs it after the owner's go), and note in the runbook that the owner should delete the Strava API app afterwards.
Gates as for M1–M3 (typecheck, lint, unit, contracts, Convex tsc, build, crawl). Coordinate with A (owner of shared release gates) via messages. Print `DONE M4`.

### M4 implementation status (4 Oct)

Complete: live Strava integration, callbacks, crons, UI and copy removed. This supersedes M2's earlier
Strava callback exception. Schema and legacy data remain unchanged; imported bikes remain usable.
Internal super-admin cleanup is dry-run-first and has **never been executed**. Owner-only cleanup and
provider-app deletion instructions: `audit/M4-cleanup-runbook.md`.
Final combined gates pass: typecheck, lint, 3,079 unit tests (20 existing skips), 556 contracts,
Convex tsc, production build, 875 local crawl checks and the migration checker (zero findings).
Evidence and exact changed/deleted paths: `audit/M4-notes.md`, `audit/files-M4.txt`.
No commits, deployments, production access, actual environment changes or mail sends.

## M3 complete — 4 October 2026

Mail/contact/security addresses and sender fallbacks are migrated in code; the empty runtime analytics-admin allowlist remains unchanged. The internal guide OG migration is bounded, paginated and dry-run by default; no database operation was executed. Runbook: `audit/M3-db-runbook.md`.

Final M3 checker passes 684 exact single-301 redirects over 228 paths, 170 HTML pages and all 48 guide JPEGs, with zero findings. Its four initial legal OG findings are fixed and verified. Combined M1–M4 gates pass: typecheck, lint, 3,079 unit tests (20 skips), 556 contracts, Convex tsc, build and 875 SEO crawl checks. Email previews: 26 bilingual HTML/text pairs and 52 screenshots pass. Evidence: `audit/M3-notes.md`, `audit/domain-migration-local.md`; manifest: `audit/files-M3.txt`. No commits/deploys, actual environment changes, production data operations or mail sends.
