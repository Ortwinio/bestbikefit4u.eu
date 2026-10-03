# S8 — sitemap-derived LLM discovery

Completed 3 October 2026. No commit or deployment.

Both `/llms.txt` and `/llms-full.txt` are generated from the same page, calculator, guide and blog sitemap APIs. The obsolete public/llms.txt is removed. CMS timeouts/failures inherit the sitemap fallback; published CMS-only URLs remain discoverable without fabricated summaries. The full document reuses actual calculator answer providers, guide quick answers, science/pain copy, author/methods copy and consolidated pressure assumptions. All eleven calculators, 48 local guides, author/methods pages and six pressure pages are covered in EN/NL.

Discovery follows the indexable sitemap scope: intentionally noindex utilities (including the calculation-engine utility and login), private URLs and redirects are excluded. The generator has no second route inventory. Exact-set tests fail if a sitemap route is omitted; dynamic CMS entries and source failure are covered. CMS-only pages honestly direct readers to their published content rather than inventing a key answer. HEAD performs no content/CMS work; plaintext cache and nosniff headers are tested.

Validation: 105 focused Vitest tests pass across S8/S9 and affected regressions; full typecheck, lint and production build pass. The offline-CMS production build supplies all local guides. `scripts/seo-discovery-check.mjs` verifies both documents contain exactly the same 170 URLs as the rendered sitemap, with no stale pressure/setup URLs. `scripts/seo-crawl-check.mjs --local --skip-build --label=s8-s9 --delay=0` passes 875 raw-HTML checks across five user agents with zero findings. Runtime evidence: `audit/S8-S9-runtime.json`; crawl summary: `../seo-crawl-fixes/audit/crawl-s8-s9.md` (relative to this plan directory). Live CMS-only content was not available in the offline build; source fallback/dynamic coverage is unit-tested.

B handed over its initial routes and tests; C integrated the generator/content resolver and completed all gates. This supersedes the earlier S12/S13 note about B's pending llms module.
