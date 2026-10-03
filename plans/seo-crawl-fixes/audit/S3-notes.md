# S3 — Noindex metadata and private-route review

Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-seo`, branch `fix/seo-crawl-issues`.
Read the plan, technical SEO skill and both references. No visual/copy/style changes, commits or deployments.
No edits to next.config, language switching, shared metadata helpers, proxy or sitemap sources.

## Changes and evidence

| Cause / URLs | Evidence | Change / owner | Acceptance |
|---|---|---|---|
| Login advertised noindex locale alternates: `/en/login`, `/nl/login`, all `?src=` variants | `src/app/(auth)/layout.tsx:14` returned the complete locale-alternates object | B now selects only its canonical | Both languages retain noindex/follow, clean absolute self-canonical and no languages |
| Email preferences lacked a canonical | `src/app/email-preferences/page.tsx:7` | B adds only a clean locale canonical | Existing noindex/nofollow and no-referrer remain; no languages/token/query in canonical |
| Account routes | `src/i18n/account/metadata.ts:14`, root metadata and dashboard route sources | No languages emitted already; no unnecessary account code changes | Existing behavior preserved; tests assert shared account metadata has no languages |

## Private-route verification

| Route family | Current protection / evidence | Result |
|---|---|---|
| `/profile` and descendants | `src/lib/seo/routePolicy.ts:63`; expanded to bare, EN and NL prefixes | Robots-disallowed; absent from public sitemap |
| `/fit`, questionnaires and `/fit/[sessionId]/results` | `src/lib/seo/routePolicy.ts:59` | Robots-disallowed for all locale forms; absent from sitemap |
| `/bikes` and bike detail | `src/lib/seo/routePolicy.ts:56` | Robots-disallowed for all locale forms; absent from sitemap |
| `/dashboard`, settings, fit history, feedback | `src/lib/seo/routePolicy.ts:53` | Robots-disallowed; no language alternates; absent from sitemap |
| PDF report `/api/reports/[sessionId]/pdf` | `src/lib/seo/routePolicy.ts:186` blocks `/api`; `src/app/api/reports/[sessionId]/pdf/route.ts:123` requires auth | Robots-disallowed, no sitemap entry; unauthenticated request returns 401 |
| Account `/tools/*` | Each `src/app/(dashboard)/tools/*/page.tsx:5` sets noindex/nofollow | No language alternates; absent from sitemap |

Login remains crawlable (not robots-disallowed), so its noindex directive can be read.
Tests inspect sitemap node URLs AND their alternates across all four static sections; no login,
preferences, profile, fit, bikes, dashboard, account tools or API routes occur. CMS guide/blog
entries are generated within their public content families; live coverage belongs to C's crawl.

## Reported gaps, not silently broadened

- P2 hardening: most private account pages have robots exclusions but no explicit metadata noindex.
  `src/app/(dashboard)/layout.tsx:1` is client-only; `src/i18n/account/metadata.ts:14` only supplies
  localized copy. This satisfies the requested **noindex and/or disallowed** audit criterion, not
  a guarantee that externally linked URL-only entries cannot appear. Shared server metadata or a
  carefully scoped response-header policy is a separate follow-up for the lead/A; no blanket
  change to public indexing or robots restrictions here.
- P2 hardening: PDF responses use no-store but do not explicitly emit X-Robots-Tag
  (`src/app/api/reports/[sessionId]/pdf/route.ts:279`). They are authenticated and `/api` is blocked.
- P3 registry drift: `/email-preferences` and `/tools` are absent from explicit route families
  (`src/lib/seo/routePolicy.ts:47`). They remain excluded by current sitemap source allowlists;
  preferences and every account tool have explicit noindex. Coordinate a route-policy follow-up
  rather than touching A's parallel shared SEO work.

Google notes that robots-disallowed URLs can still appear without content, because crawlers cannot
read their noindex: [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
No claim of guaranteed deindexing, indexing or AI discovery is made.

## Validation

- Focused Vitest: 6 files / 50 tests passed: login UI/metadata, preferences UI/metadata, route policy,
  sitemap sources and XML. Login cases cover EN/NL and clean/query variants.
- `npm run typecheck`: passed (rerun with approval after sandbox blocked the build-info cache write).
- `npm run lint`: passed all stages, including runtime boundaries, tooltip, contrast, CSS and image checks.
- `git diff --check`: passed.
- Production build and raw/rendered five-UA crawl are the shared A/C integration gates, not claimed
  as run by B. C was given the login query/preference checks in the coordination message.

Exact ownership manifest: `files-S3.txt`. Other agents' shared SEO edits are excluded.
