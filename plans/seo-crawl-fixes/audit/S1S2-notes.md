# S1 + S2 — metadata delivery and localized URLs

Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-seo`, branch `fix/seo-crawl-issues`.
No commit, deployment, visual/copy/style change, or edits in the original worktree.

## Root causes and changes

| Cause | Affected routes | Change | Acceptance |
| --- | --- | --- | --- |
| Next streams async metadata for agents outside its default limited-bot list | Dynamic guides and other async metadata pages | `next.config.ts`: only `htmlLimitedBots: /.*/` added | One title/description/canonical and reciprocal hreflang in raw head for each tested UA |
| Prefix-only language switching ignores translated slugs | NL bikefitting / EN bike-fitting, pressure calculator and weighted pressure pages | Central `src/i18n/localeRoutes.ts`, consumed by navigation, both alternate helpers and sitemap entries | Switches land on canonical translated routes, with query preserved |
| Obsolete language-switch targets return 404 | `/en/bikefitting`, `/nl/bike-fitting` | Explicit permanent proxy redirects derived from central pair | HTTP 308 directly to existing locale destination; query retained |

## Next verification

- Installed Next: **16.3.6**. Read
  `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/htmlLimitedBots.md`:
  its Disabling section explicitly documents `/.*/` for fully disabling metadata streaming.
- `node_modules/next/dist/server/config-shared.d.ts:1624` accepts `RegExp`.
  `node_modules/next/dist/server/lib/streaming-metadata.js` matches configured regex against the UA.
- Cross-checked [official Next documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots).
  No dependency upgrade or per-guide workaround.

## Central route map

- Bike-fitting landing pair now emits identical EN/NL/x-default sets and self-canonicals.
  Selective helper enriches only a registered pair; unknown single-language pages retain its prior behavior.
- Both marketing/mobile and account switches already call `buildLocaleSwitchHref`; that helper delegates
  to the mapped navigation function. No rendered markup or CSS needed changing.
- Public calculator slug pairs come from the existing calculator registry, not another hardcoded copy.
  Weighted pressure pairs share the bike-type translation map with the pressure page builders; all
  30 published combinations are tested in both directions and against metadata.
- `/bandenspanning/racefiets` and `/fiets-afstellen` have working same-slug bilingual pages, so retain
  same-slug switching. They are not falsely paired with another English content page.
- Landing sitemap seeds are merged into one paired entry, retaining both URLs and existing priorities/dates.
  No duplicated sitemap landing URLs or incorrect alternate targets.
- Redirect status is explicitly 308 in the proxy. No extra next.config redirect change; all existing
  nonpermanent redirect behavior stays 307. Destination requests do not loop.

## Production measurement method

- `audit/measure-metadata.mjs` builds isolated production snapshots with the installed Next and unchanged
  application source. Baseline source was captured before S1/S2 edits, at
  `/private/tmp/bbf-final-sweep-0ebf91d9f65960f7`; use optional third argument to select another baseline copy.
- Nonproduction Convex placeholder endpoint, no credentials or mutations. Local HTTPS, two guides,
  five explicit user agents, six sequential requests each. Discard first request per route/UA for warm
  summaries (25 observations per guide). TTFB proxy is elapsed time until response headers, not full-body time.
- Raw counts use actual HTML head, not hydrated DOM or serialized React payload. Full-site crawl is C's S4.
- The older visual harness omitted required script imports and its fetch wrapper ignored custom headers.
  The measurement runner therefore copies script dependencies and uses explicit HTTPS requests with real
  UA headers/manual redirect handling. Discarded preliminary measurements were replaced, not mixed.
- Baseline reproduced timing-dependent absent head metadata: 3/60 responses, all ClaudeBot in this run.
  This is a local reproduction, not a count of production URLs affected.
- Corrected build: **60/60 HTTP 200 responses** have exactly one title, description, canonical and
  three hreflang links in raw head. Both bad landing URLs return **308**, preserving `?src=header`;
  both destination pages return 200 and share the complete alternate set. Pressure sample pair likewise
  returns 200 with reciprocal alternates. No bad landing switch links remain in sampled HTML.
- Warm response-header latency (25 samples per guide across five UAs):

  | Guide | Before median | After median | Before P95 | After P95 |
  | --- | ---: | ---: | ---: | ---: |
  | EN fit-science | 149.45 ms | 130.28 ms | 207.35 ms | 160.30 ms |
  | NL saddle-height-guide | 146.64 ms | 142.17 ms | 236.88 ms | 215.75 ms |

  No regression observed in this local sample; the lower values do not establish a speed improvement.
  Raw observations and exact source hashes: `S1-before.json`, `S1-after.json`.
- Local timings are not a controlled field-performance study: no real CMS latency, CDN or network path;
  other agents may consume CPU. Blocking metadata necessarily waits for metadata work, so measure real
  deployment TTFB after release before making performance claims.

## Gates

- Focused Vitest: **62 tests / 10 files pass**, including switch hrefs, pair alternates, generated pressure
  pairs, redirect decisions, actual landing metadata, sitemap and existing header/login-switch regressions.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (runtime boundaries, tooltips, contrast, CSS tokens, image weight).
- `npm run build`: PASS, including final rerun after shared-helper normalization (238 generated pages).
- `git diff --check`: PASS.
- C's final S4 integration crawl: **PASS, zero findings**. `crawl-local-fixed.json` / `.md`:
  128 sitemap URLs plus linked guide leaves, 1,145 page/UA checks, 1,528 sequential GET requests,
  five UAs. HTTPS production-host transport, offline Convex fallback. Live-only CMS/blog coverage
  remains unavailable locally and needs the post-deployment crawl; no production indexing claim.
- A also ran C's unchanged full checker against the local HTTPS snapshot: 665 page/UA checks,
  1,458 GETs, with no head-metadata, canonical, reciprocal-pair or broken-link findings.
  This preliminary run reports only the intentional localhost `X-Robots-Tag: noindex` header
  (640 page findings plus 1,920 alternate-target findings), so it is **not claimed green**.
  Evidence: `crawl-a-https-fixed.json` / `.md`. C corrected the local transport to emulate the
  production Host while keeping every request on loopback; the deployment safety header stays unchanged.
  The subsequent two transient request aborts were resolved in C's final green run, not hidden
  by application changes or relaxed SEO assertions.
