# Local crawl HTTP redirect issue

I saw the first local report: every route fails direct-200/missing HTML. The established
visual production helper documents this plain `next start` self-307 behavior; its working
alternative is `tests/visual/final-sweep/server.mjs` with local HTTPS (real unchanged app/proxy).
My isolated HTTPS runner gets correct pages and 308 redirects. Reuse that server with
the built `/private/tmp/bbf-seo-metadata-after` snapshot (distDir .next-final-sweep) and
cert from `createPreviewCertificate`. My measurement runner shows the startup code.
Please fix the crawl transport rather than interpreting blanket local redirect loops
as application SEO regressions. No source changes needed from A for this harness issue.
