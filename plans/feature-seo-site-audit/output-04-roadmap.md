# SEO Remediation Roadmap

## Recommended Execution Order

1. Fix preview and sitemap technical correctness
2. Fix sitemap reliability and validation confidence
3. Harden canonical/alternate consistency for large dynamic families
4. Add structured data to the highest-value clustered content
5. Improve internal linking on acquisition hubs
6. Refine titles/descriptions on top commercial and conversion pages

## Quick Wins

### WP0. Stop preview sitemap endpoints from looking indexable

- Problem:
  - preview/local noindex protection does not apply to dotted sitemap routes
- Target files:
  - [proxy.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/proxy.ts)
  - [xml.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/xml.ts)
- Approach:
  - add deployment-aware robots headers to sitemap XML responses or route-level noindex logic off-production
- Acceptance criteria:
  - preview sitemap routes do not emit `index, follow`
- Validation:
  - header check on preview/local `/sitemap.xml`

### WP1. Fix sitemap route validation failure

- Problem:
  - local validator fails because `/sitemap.xml` returns `500`
- Target files:
  - [sitemap.xml/route.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/sitemap.xml/route.ts)
  - [sources.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/sources.ts)
  - [validate-sitemaps.mjs](/Users/ortwinverreck/Developer/bestbikefit4u/scripts/seo/validate-sitemaps.mjs)
- Approach:
  - reproduce and isolate the failure in a clean local/preview runtime
  - fix the root cause
  - re-run validator successfully
- Acceptance criteria:
  - `node scripts/seo/validate-sitemaps.mjs` passes against the intended environment
- Validation:
  - script run
  - direct HTTP check for `/sitemap.xml`

### WP2. Decide whether empty blog sitemap stays in production

- Problem:
  - empty sitemap section adds noise
- Target files:
  - [sources.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/sources.ts)
  - [sitemap.xml/route.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/sitemap.xml/route.ts)
- Approach:
  - either keep intentionally and document it, or suppress until there is blog content
- Acceptance criteria:
  - sitemap index behavior is explicit and documented
- Validation:
  - sitemap index output matches the decision

## Medium Implementation Tasks

### WP3. Unify canonical/alternate generation on programmatic tire-pressure routes

- Problem:
  - the broadest programmatic family is more brittle than the rest of the site
- Target files:
  - [tire-pressure/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/tire-pressure/[slug]/page.tsx)
  - [bandenspanning/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/bandenspanning/[slug]/page.tsx)
  - [metadata.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/metadata.ts)
- Approach:
  - refactor to shared alternate/canonical builder
  - add focused tests for EN/NL reciprocity
- Acceptance criteria:
  - both route families use one canonical/alternate strategy
- Validation:
  - metadata tests
  - sitemap alternates check

### WP3b. Align robots/validator blocklists with real protected routes

- Problem:
  - `robots.txt` and sitemap validator do not fully reflect current protected route surfaces
- Target files:
  - [robots.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/robots.ts)
  - [config.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/config.ts)
  - [validate-sitemaps.mjs](/Users/ortwinverreck/Developer/bestbikefit4u/scripts/seo/validate-sitemaps.mjs)
- Approach:
  - update and centralize blocked-route definitions
- Acceptance criteria:
  - protected app routes are consistently excluded from robots and validator checks
- Validation:
  - inspect generated `robots.txt`
  - rerun sitemap validator

### WP4. Add FAQ + breadcrumb schema on clustered content pages

- Problem:
  - visible FAQ content is under-utilized in structured data
- Target files:
  - [PainPointPageTemplate.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PainPointPageTemplate.tsx)
  - [guides/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/guides/[slug]/page.tsx)
  - [use-cases/[slug]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/use-cases/[slug]/page.tsx)
  - SEO JSON-LD helpers
- Approach:
  - add reusable FAQPage and BreadcrumbList builders
- Acceptance criteria:
  - pain, guide, and use-case detail pages emit consistent schema where content exists
- Validation:
  - component tests for JSON-LD payloads
  - manual HTML inspection

### WP5. Improve internal-linking strategy on hubs

- Problem:
  - internal links exist but do not yet clearly reinforce key conversion clusters
- Target files:
  - `/pain`
  - `/guides`
  - `/use-cases`
  - `/pricing`
  - `/how-it-works`
- Approach:
  - define a hub-and-spoke link map around calculators, pain pages, case-study, and pricing
- Acceptance criteria:
  - key acquisition pages have deliberate next-step links, not generic navigation only
- Validation:
  - manual content review
  - link inventory check

## Structural Work

### WP6. Add repeatable SEO validation to release flow

- Problem:
  - technical SEO regressions are still too easy to ship
- Target files:
  - CI/release documentation
  - sitemap validation script integration
- Approach:
  - make sitemap validation part of release or CI checks
  - consider targeted metadata assertions for route families
- Acceptance criteria:
  - SEO checks become repeatable and expected for SEO-affecting changes
- Validation:
  - documented command path
  - CI or scripted release run

### WP7. Refine high-value titles and descriptions

- Problem:
  - metadata is present, but not always maximized for search intent
- Target files:
  - homepage
  - pricing
  - case-study
  - pain hub and detail pages
  - primary calculators
- Approach:
  - revise copy around real intent terms, not just brand positioning
- Acceptance criteria:
  - titles/descriptions clearly reflect problem, calculator, or conversion intent
- Validation:
  - copy review
  - metadata diff review

## Automation Opportunities

- extend sitemap tests to include route-family coverage expectations
- add JSON-LD helper tests for FAQ/breadcrumb schema
- optionally add a script to sample canonical and alternate tags from key routes
