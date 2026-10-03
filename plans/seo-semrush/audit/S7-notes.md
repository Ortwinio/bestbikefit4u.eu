# S7 sitemaps

Worktree: bestbikefit4u-semrush, fix/seo-semrush. No commits/deploys/production calls.

- All four sitemap sections always appear in the index. Empty blog urlset remains valid and discoverable.
- Guide/blog reads have a 1,500 ms response deadline; failure, timeout or missing API falls back to local
  renderable guide rewrites and the empty static blog source. Timers are cleared and late rejections handled.
  Deadline bounds waiting; the Convex API request itself is not cancelled.
- Shared getGuideSitemapNodes provides merged static/CMS guide coverage to both index and guide endpoint.
  Existing locales/canonical filtering, cache policy, robots headers, ETags and conditional responses remain.
- Removed generic system timestamps and request-date fallbacks. Local content dates and valid actual CMS
  dates are used according to the same local-versus-CMS precedence as rendered guides. Unknown dates stay
  absent. Deduplication retains a real date over an undated duplicate, never invents one.
- XML and HTTP Last-Modified omit unknown dates. No manual Content-Length for GET, HEAD or 304.
- The sitemap validator now includes the blog endpoint and accepts missing lastmod while rejecting invalid
  supplied values. This follows the [Sitemaps protocol](https://www.sitemaps.org/protocol.html): lastmod is
  optional and must describe the content modification, not generation time.

68 focused source/XML/route/deduplication tests and three date-validator tests pass. Slow, failed and empty
sources, late rejection/timer cleanup, localization, cache headers and real-date precedence are covered.
Initial build exposed optional-date typing and overloaded mock typing; both fixed rather than skipped.
The first attempted crawl could not start from that failed build and is not counted as a passing gate.
See S7-source-notes.md and S7-route-tests-notes.md. Final gates recorded below when complete.

Concurrent S13 removed a CSS module and repaired its own checker; that transient lint failure is resolved
in S7-concurrent-gate.md. Those files are not B-owned. S10–S13 work is excluded from B's manifest.

S12/S13 shared-source integration: C's ready message asked B to replace 60 old weight URLs plus the
legacy mtb path with getPressureBikeEntries and add author/methods pages. B integrated those shared
source changes, keeping C's actual 2026-10-03 content dates. The intermediate crawl's 915 findings were
61 retired URLs × five agents × three checks. They are not ignored: their outdated sitemap seeds were
removed and canonical replacements asserted in source tests. No C-owned redirect/page implementation
was edited. Rebuild/crawl repeated on the integrated source.

Final integrated gates: 68 Vitest tests, three Node validator tests, typecheck, full lint and production
build pass. Local crawl passes all 880 checks (176 pages × five agents), zero findings. Evidence:
plans/seo-crawl-fixes/audit/crawl-s7.json and crawl-s7.md. Only canonical pressure pages remain.
