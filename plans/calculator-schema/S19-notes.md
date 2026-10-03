# S19 — calculator page schema

Removed WebApplication/SoftwareApplication markup from all eleven public calculators in EN/NL, including both localized pressure routes and the four performance tools. Removed the unused buildWebApplicationSchema helper. No llms source or copy referenced it. No ratings or reviews invented; visible copy, CSS and rendered controls unchanged.

The previous implementation only supplied breadcrumbs on bike-fit and did not supply WebPage on the other calculators. The replacement buildCalculatorPageSchemas reuses the exact existing localized schema name, description and canonical URL, supplies WebPage and BreadcrumbList, and allows bike-fit to retain its existing breadcrumb without duplication. Existing FAQPage/HowTo, Organization and Person markup is preserved.

Validation:
- 53 calculator page tests plus seven helper tests pass, covering NL/EN required schemas and absence of application/aggregate-rating markup.
- Three Semrush checker tests pass, including nested schemas, array-valued types and missing required types.
- npm run typecheck, npm run lint and npm run build pass. Build uses offline Convex endpoints; static guide fallback remains available.
- node scripts/seo-crawl-check.mjs --local --skip-build --label=s19 --delay=0 passes all 875 checks across five user agents. The explicit build was already completed, so the crawl reused it.
- node scripts/seo-semrush-check.mjs passes: all 22 calculator URLs have WebPage, BreadcrumbList and FAQPage, no WebApplication/SoftwareApplication/aggregateRating; six pressure tables, 65 redirects, 96 guide locales and existing author/methods checks also pass. Eight existing-template captures complete. S19-runtime.json records the calculator schema types and build ID.
- git diff --check passes.

Changes remain uncommitted. No deployment or production write. Hosted Semrush/Google results require their next crawl; local raw-HTML verification is complete.
