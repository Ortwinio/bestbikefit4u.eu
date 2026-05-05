# Step 03 — Sitemap and Robots Hardening

## Objective

Bring sitemap and robots behavior into sync with the canonical/indexability policy and make the validator part of reliable SEO QA.

## Background

Read:
- `plans/feature-technical-seo-implementation/05-step-02-canonical-and-hreflang.md`
- `src/app/robots.ts`
- `src/app/sitemap.xml/route.ts`
- `src/app/sitemap-pages.xml/route.ts`
- `src/app/sitemap-calculators.xml/route.ts`
- `src/app/sitemap-guides.xml/route.ts`
- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`
- `src/proxy.ts`

## Tasks

1. Align robots disallow rules with the route-policy source of truth.
2. Ensure sitemap routes only emit canonical, indexable public URLs.
3. Harden preview/non-production sitemap indexability behavior.
4. Decide whether unused sitemap sections such as blog stay reserved or are removed.
5. Expand validator coverage where needed and document how it is run.

## Validation

- `npm run seo:validate-sitemaps`
- Targeted sitemap route tests
- Manual `robots.txt` review

## Output

Write `output-06-step-03-sitemaps-and-robots.md`:
- behavior changed
- files changed
- validator coverage
- validation results
