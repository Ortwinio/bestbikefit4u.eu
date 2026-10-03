# S4 — raw HTML crawl verification

Worktree: /Users/ortwinverreck/Developer/bestbikefit4u-seo, branch fix/seo-crawl-issues.
No original-worktree edits, commit, deployment or content/design changes.

## Result

Production baseline reproduces the findings. Fixed local production build passes **1,145 / 1,145**
page/user-agent checks with **zero findings**. Both runs cover the same 229 unique page URLs:
224 public pages and five private/query probes. The final local run needed no retries.

| Cause | Production baseline | Proof | Fix owner | Fixed acceptance |
| --- | --- | --- | --- | --- |
| Streamed metadata outside head | 191 responses across 90 guide URLs, for each of title/description/canonical/hreflang | crawl-prod-baseline.json source offsets and first-head boundary | A / S1 | All metadata inside head, unique title/description/self-canonical |
| Locale slug mismatch | 10 inlink findings to exactly /nl/bike-fitting and /en/bikefitting | findings with source, href and HTTP 404 target | A / S2 | No internal anchor/area targets return 404 |
| Incomplete alternates | 10 missing locale entries | per-UA alternate sets | A / S2 | NL/EN self-references and identical reciprocal sets; targets direct 200/indexable/self-canonical |
| Login hreflang | 15 observations: both logins and NL ?src variant × five UAs | private-hreflang findings | B / S3 | noindex, clean canonical, no alternates |
| Preferences canonical | 10 missing canonicals | both locale preference routes × five UAs | B / S3 | clean absolute canonical, noindex, no alternates |

Body-metadata title observations by UA: Googlebot 35; Screaming Frog 24; GPTBot 32; ClaudeBot 34;
Chrome 66. All are guides. The live result is timing/cache-sensitive; the earlier 47-URL export is not
treated as an invariant. This run also observed Googlebot responses with body metadata.

Production baseline: 2026-10-02 21:29:38–22:04:22 UTC; 224 sitemap URLs, 1,145 page checks,
1,844 sequential GET requests, 150 ms delay. Three page requests timed out (listed in JSON), causing
additional dependent link/hreflang availability findings. These are distinguished from confirmed 404s.
No retries were enabled in that original baseline; its evidence is preserved unchanged.

Fixed local run: 2026-10-02 23:54:16–23:54:45 UTC; 128 offline sitemap URLs plus 96 discovered guide
leaves and five private/query probes, 1,145 page checks, 1,528 loopback requests, zero findings/retries.
Production and local page URL sets are identical, although data can differ.

## Implementation and use

```sh
# Read-only production baseline or future post-release verification:
node scripts/seo-crawl-check.mjs --base https://bestbikefit4u.eu --label prod-baseline

# Fresh production build + local production crawl, free port chosen automatically:
node scripts/seo-crawl-check.mjs --local --label local-fixed --delay 0

# Reuse an already verified build, without racing another agent's Next build:
node scripts/seo-crawl-check.mjs --local --skip-build --label local-fixed --delay 0
```

- Five actual request User-Agent headers, raw HTML only; no browser/JavaScript rendering.
- Sitemap index recursion, direct loc entries, URL/UA cache, sequential requests, manual redirect tracking.
  Remote delay cannot be reduced below 150 ms. No concurrent remote requests.
- Existing JSDOM parses inert source with node locations: head membership requires the node's original
  offsets before the explicit first head end, and actual head containment. Body metadata is not repaired
  into a passing result. Comments/scripts containing fake tags and SVG titles do not inflate counts.
- Checks all sitemap URLs and linked guide leaves; internal anchor/area hrefs are checked once per UA.
  HTTP API/action destinations are listed but not requested. Asset preload/stylesheet hrefs are not
  navigation links; canonicals and hreflang have dedicated checks.
- Each hreflang target is checked with the same UA, including HTTP status, redirects, noindex, canonical,
  self-reference and complete reciprocal sets. Login/preferences must be noindex and have no alternates.
- Noindex uses both applicable meta robots and X-Robots-Tag. Canonicals are compared to production-origin
  clean URLs even while transport stays on loopback.
- Network errors have up to two sequential backoff retries, each recorded in network evidence. Persistent
  failures remain failures. No status/metadata finding is suppressed to force green.
- JSON includes source offsets, all metadata, navigation hrefs, failed inlinks, redirects and request status.
  Every run writes crawl-<label>.json and a short sibling Markdown summary, then exits nonzero on findings.
  Timing fields in the initial baseline include the polite delay; use A's dedicated S1 measurements for TTFB.

## Local production harness and coverage limits

The requested plain `next start` was attempted, but Next 16's loopback middleware rewrite yielded
self-307 loops. This is an established local harness limitation, independently reproduced by A.
The final runner uses the **same fresh production .next build**, served by Next's production API over
loopback HTTPS. It sets production hostname/Host so the unmodified deployment policy sees the actual
production origin; otherwise localhost intentionally emits X-Robots-Tag:noindex.

The throwaway certificate is trusted only for this loopback request adapter, with normal TLS verification
and explicit localhost servername. No global TLS bypass, host-file change, DNS change or application
middleware change. Redirects are still manual and all traffic stays on loopback. The server and certificate
are closed after the run. The temporary diagnostic plain-HTTP server was also stopped.

The fresh build uses NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:9 as an immediate offline fallback, without
production credentials. Guide indexes link all 96 repository guide leaves, which render and receive
480 full metadata checks (96 × five UAs). Live CMS-only records, editorial overrides and future blog
entries absent from repository fallbacks cannot be validated by this offline run. Production baseline
covers what the live sitemaps exposed. No private authenticated content or Search Console access is claimed.

## Gates

- Focused Vitest: eight parser tests pass.
- Full npm run lint: passes every stage.
- Full npm run typecheck: passes.
- Fresh npm run build: passes (log: crawl-local-fixed-build.log).
- Final crawler: green, zero findings.
- git diff --check: passes.

## References

Applied the linked fix-bestbikefit4u-technical-seo skill and both reference documents.
Checked current primary guidance:
- [Google valid page metadata](https://developers.google.com/search/docs/crawling-indexing/valid-page-metadata)
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)

This verifies technical output, not guaranteed indexing, traffic, or AI citations.
