# Final-sweep route inventory

`tests/visual/final-sweep/routes.mjs` enumerates the exact 70 source routes in
`plans/redesign-canvas/audit/route-map.md`: 43 public pages, 25 authenticated account pages,
one login page, and one installation page. Each has both locale-prefixed URLs and both viewport sizes
(280 cases). Account pages use visual fixtures; their rendered HTTP response is not evidence of
production authentication or backend authorization behavior.

The current app also contains `/design-system`, added after the audited inventory. It is excluded
from this explicitly requested 70-route sweep rather than silently increasing the denominator.

## Dynamic examples

- Pain: `knee-pain-cycling`, from `src/content/painPages.ts`.
- Guide: `saddle-height-guide`, from `src/lib/guides/content/setup-parameters.ts`.
- Legacy use-case: `back-pain-cycling`, mapped to `/guides/bike-fitting-for-lower-back-pain`
  by `src/lib/guides/redirects.ts`.
- Pressure: `75kg-road-bike` and `75kg-racefiets`, within supported weights and bike types in
  `src/lib/seo/programmatic/tirePressure.ts`.
- Bike/session: `visual-bike` and `visual-session`, from the existing account visual fixtures.
- Blog: prefer a real published slug discovered from `/sitemap-blog.xml`. The local sitemap returned
  an empty URL set during setup. Without a CMS slug, the detail page is explicitly marked as the
  existing `visual-article-1` fixture from `tests/visual/marketing-batch3/runtime.jsx`; this is not a
  claim that a production article with that slug exists. The blog index remains a production page.

## Expected route behavior

- `/nl/bike-fitting` and `/en/bikefitting`: 404 by locale.
- `/use-cases`: 307 to the locale's `/guides`.
- `/use-cases/back-pain-cycling`: 307 to the locale's lower-back-pain guide.
- `/nl/tire-pressure-calculator`: 308 to `/nl/bandenspanning-calculator`.
- `/en/bandenspanning-calculator`: 308 to `/en/tire-pressure-calculator`.
- The two dynamic pressure source routes force their respective content language even when requested
  with the other locale prefix. Both source-route variants remain in the sweep; no exception hides
  any language-check failure.

Inventory verification: 70 unique source routes, 70 existing source files, no unresolved path
parameters, and exact set equality with the route-map table. Static science pages need no fixture.
