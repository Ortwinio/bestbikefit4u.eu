# Output 04 — Route Policy and Indexability

## Route classification summary

- Added `src/lib/seo/routePolicy.ts` as the shared route-policy source of truth.
- Classified public indexable families including `/guides`, `/calculators`, `/pain`, `/tire-pressure`, `/bandenspanning`, `/bike-fitting`, `/bikefitting`, and `/fiets-afstellen`.
- Classified non-indexable public utility families as `/science/calculation-engine` and `/use-cases`.
- Classified private/app families including `/dashboard`, `/fit`, `/bikes`, `/profile`, `/settings`, `/saddle-selector`, `/shoe-cleat-fit`, `/gearing`, and the dashboard pressure calculator route.
- Classified API/system families including `/_next`, `/api`, `/robots.txt`, and the sitemap endpoints.

## Files changed

- `src/lib/seo/routePolicy.ts`
- `src/lib/seo/routePolicy.test.ts`
- `src/lib/seo/sitemap/config.ts`

## Unresolved policy decisions

- `/use-cases` remains intentionally non-indexable because detail pages redirect to newer guide destinations.
- `/science/calculation-engine` remains intentionally excluded as a public utility/support route rather than a search landing page.

## Validation results

- Added focused tests for route classification and robots disallow expansion.
- Verified locale-prefixed and non-prefixed private/auth/system paths resolve to the expected classification.
