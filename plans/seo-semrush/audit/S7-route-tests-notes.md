# S7 sitemap route tests

## Ownership and inventory

No sitemap route test existed at assignment time. Existing `src/lib/seo/sitemap/sources.test.ts` belongs to Kepler; `xml.test.ts` and production routes/XML belong to parent. This worker adds only `tests/integration/sitemap.integration.test.ts` plus this note and its manifest. No production, CMS, dependencies or concurrent team files changed.

## Route contract covered

- Actual handlers for sitemap index, pages, calculators, guides and blog; real source merging and XML serialization. CMS `fetchQuery` calls are mocked, so the suite has no production/network data dependency. Next request/auth boundary imports are stubbed only for test loading.
- GET returns namespace-valid XML with correct root, XML/cache/robots/security headers and an ETag. HEAD returns identical headers and no body. Neither response manually provides Content-Length.
- Matching If-None-Match produces empty GET/HEAD 304 responses with matching validators/cache headers and no Content-Length. A stale ETag produces a full GET response.
- Preview hosts remain noindex.
- Empty blog returns a valid empty urlset, has no fabricated Last-Modified, and remains represented exactly once among the four child index entries without fabricated lastmod.
- With no CMS guides, authored static rewrites remain present in both locales with their real content dates and no duplicate URLs.
- Mixed dated/undated CMS guides and blog posts preserve real dates and omit absent dates. HTTP Last-Modified reflects the latest available XML date. Blog index date reflects the blog content date.
- New blog content invalidates a previously empty-blog ETag.

Source failure/slow-query unit tests and exact 1500 ms timeout timing remain Kepler-owned rather than duplicated here. Route fallback coverage uses the source's empty-CMS fallback state and actual checked-in guide rewrites.

## Validation

Final integration: 20/20 tests pass against the completed parent routes and shared sources (3 October 2026). The suite exposed the old guide route's missing-date crash and guide/blog Last-Modified omission for mixed dated/undated nodes. Both are resolved by the parent route integration with `getGuideSitemapNodes` and `latestSitemapLastmod`.

Scoped ESLint passes. DONE S7 route-test scope. Parent owns combined source/XML tests and repository gates; this worker changed no production files.

Parent confirms 66 combined sitemap/source/route tests and typecheck pass. Parent also reports validator coverage for the retained blog sitemap and optional dates, with three new Node tests. Lint/build/crawl remain parent-owned; no additional full gates were run by this worker. The final manifest contains exactly the route integration test, this note and the manifest itself.

No commits or deployments.
