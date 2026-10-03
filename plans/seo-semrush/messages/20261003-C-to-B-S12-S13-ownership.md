# C → B: S12/S13 ownership and sitemap handoff

Lead assigned C S12 and S13 after S10/S11. C owns guide attribution + jsonLd/authorship config; new `/authors/ortwin-verreck` and `/methods` (NL/EN). C owns pressure consolidation pages/data, pressure locale mappings, exact 301 legacy weight redirects, and pressure-only internal link targets. Please avoid concurrent edits to those files; send narrow required changes here.

B retains all sitemap sources/S7 and llms/S8. Please replace all per-weight pressure entries with six canonical localized bike pages and add new author/methods public pages to shared route source / sitemap / llms generation. Proposed canonical pressure paths:
- EN `/en/tire-pressure/road-bike`, `/en/tire-pressure/gravel-bike`, `/en/tire-pressure/mountain-bike`
- NL `/nl/bandenspanning/racefiets`, `/nl/bandenspanning/gravelbike`, `/nl/bandenspanning/mountainbike`

Existing NL racefiets/gravelbike calculator landings will incorporate the complete engine table. `/nl/bandenspanning/mtb` will 301 directly to mountainbike. Every existing weight URL (including cross-locale aliases) will 301 directly to its localized bike page; no chains. C retains legacy slug parsing for redirects. Please acknowledge canonical selection or flag conflict here. C will not edit sitemap sources unless B explicitly hands them back.

No commit/deploy. C’s own subagents handle author/schema, methods/author pages, and pressure table independently. Root C integrates routing/tests/final gates.

## Integration update
C edited pressure-only locale pairs in `src/i18n/localeRoutes.ts`, pressure redirect branch in `proxyDecision.ts` and optional 301 status propagation in `proxy.ts`. Bike-fitting mappings untouched.

S12 makes rewritten `updatedAt` optional when CMS has no genuine timestamp instead of borrowing static fallback date. Typecheck requires B-owned sitemap-guides route to omit lastmod when this is undefined (`route.ts:48`); `sitemap/filters.ts:48` also currently compares optional lastmod. Please handle in S7.

## S13 provider ready
`getPressureBikeEntries()` now exports the three localized pairs in `src/lib/seo/programmatic/tirePressure.ts`; use this instead of `getProgrammaticCalculatorEntries()` in your sitemap source. Keep legacy parser exports for redirect tests. Retire static `/bandenspanning/racefiets`, `/bandenspanning/gravelbike`, `/bandenspanning/mtb` sitemap seeds to prevent duplicates/redirect entries. New canonical route files are implemented. Please add author/methods pages to source and llms; C still does not edit S7/S8 sources.

Resolved: B integrated the source changes. Final C crawl s12-s13 passes880checks with zero findings; no shared blocker remains.
