# S7 sitemap sources

Status: source worker implementation complete on fix/seo-semrush.

## Public contract

- getGuideSitemapNodes(): Promise<SitemapUrlNode[]> merges real local guide rewrites and published CMS guides. Parent guide route should call this function.
- getBlogSitemapNodes() retains its async interface; empty, failed or timed-out sources return an empty list.
- getSitemapIndexNodes() always returns pages, calculators, guides and blog.
- getSitemapIndexNodesWithDynamicBlog() retains its existing name but now loads guides and blog concurrently and derives section dates from their actual merged URL nodes.
- SitemapContentEntry, SitemapUrlNode and SitemapIndexNode lastmod are optional strings. getSitemapSectionLastmod returns string | undefined.
- normalizeLastmod accepts optional/null strings or numeric timestamps and returns YYYY-MM-DD or undefined. It validates actual calendar dates and timezone-qualified ISO timestamps; invalid, missing and ambiguous input never becomes today.

## Evidence and fallback

Removed SITEMAP_SYSTEM_LASTMOD, Date.now fallback and unevidenced static seed dates. Programmatic calculator seed dates are deliberately omitted in this source layer because their shared hardcoded date is not content evidence.

Fallback includes all 48 locally rendered guide rewrites in both languages plus the existing guides and why-bikefit-matters pages. Rewrite dates come directly from listGuideRewrites().updatedAt. CMS-only pages use valid record timestamps, preferring lastUpdatedAt, publishedAt, updatedAt, createdAt; missing dates remain absent.

For overlapping local guides, the date follows actual renderer precedence: local updatedAt remains authoritative unless a 44b CMS rewrite with both language bodies is rendered. Its date uses S12's getGuideUpdatedDate(lastUpdatedAt); unknown CMS rewrite dates remain absent and never borrow the local date. Guide nodes merge uniquely by URL. S12 authorship and rewrite files were read but not modified.

withSitemapTimeout bounds each source to SITEMAP_SOURCE_TIMEOUT_MS = 1500. Concurrent index reads cost one deadline rather than sequential deadlines. Success/failure clears timers; late rejected fetches are consumed; no error payloads are logged. The deadline bounds response waiting, not cancellation of the underlying Convex request.

## Validation

40 focused source tests passed, including missing, invalid and zero CMS rewrite dates:

```sh
npm test -- --exclude 'plans/**' src/lib/seo/sitemap/sources.test.ts
```

Coverage: local rewrite/date completeness; empty/failing/never-resolving CMS; one-deadline concurrent fallback; late rejection handling; timer cleanup; blog always indexed; real blog/index dates; undated posts; strict calendar/date validation; CMS merge and renderer date precedence; existing localized calculators, alternates and exclusions.

Focused ESLint passed on the six owned source/test files. Parent reported 66 source/XML/route tests and 3 date-validator tests passing. The previously reported parent typecheck green was a stale snapshot: the subsequent build failed on source-test mock typing. No successful build or crawl is claimed. Parent owns build/crawl and fixed the optional-date deduplication guard; this worker did not edit filters.ts.

No content query/CMS/data, dependencies, route files, XML files, commits, deployments or production operations were changed by this worker. Exact manifest: audit/files-S7-source.txt.

## S8 reuse API

Use getSitemapNodes("pages"), getSitemapNodes("calculators"), await getGuideSitemapNodes(), and await getBlogSitemapNodes() from src/lib/seo/sitemap/sources.ts for the same public route coverage as the sitemap. Static-only callers can use getSitemapEntries(section) or getSitemapNodes(section); the guides section already contains the full local rewrite fallback. getGuideSitemapNodes is the merged CMS/local authority, and every node retains localized alternates. No separate route catalog is needed.

## Final status

DONE S7 source scope. Notes and manifest finalized. No outstanding source edits. Parent confirms protocol validation against https://www.sitemaps.org/protocol.html: lastmod is optional and represents content modification, not the request date. Parent adjusts the existing sitemap validator accordingly. S8 should consume the source API above.

## Build typing correction

Both query-dispatch mocks now accept ...args: Parameters<typeof fetchQuery>, preserving Convex's overloaded rest-argument signature instead of narrowing callbacks to one argument. All 40 source tests pass after the correction. A fresh full npm run typecheck passes (exit 0) with the parent's optional-date filter fix. The first local attempt encountered build-cache write permissions and the old filter snapshot; the permitted rerun is the successful result. Parent must rerun build and crawl; their earlier failed/skipped results are not passes. Manifest unchanged.
