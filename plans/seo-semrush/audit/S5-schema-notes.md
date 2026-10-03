# S5 schema removal

Status: schema worker complete on `fix/seo-semrush` in `/Users/ortwinverreck/Developer/bestbikefit4u-semrush`.

## Changes

- Removed the calculator rating constant, rating input type/parameter, and conditional aggregateRating output from the shared JSON-LD builder.
- Removed rating imports and arguments from bike-fit, crank-length, frame-size, gearing, saddle-height, saddle-width, and shared pressure calculator content.
- Retained WebApplication, SportsApplication, operatingSystem, publisher, and the free EUR Offer.
- Replaced the rating-positive helper test with a free-offer / no-rating regression.
- Removed schema-builder mocks from all seven route test files. Fourteen EN/NL regression cases parse serialized JSON-LD from the real builders, require a WebApplication and free Offer, and reject both aggregateRating properties and AggregateRating nodes across all emitted schemas.
- The async JsonLd boundary is replaced with a synchronous script serializer in route unit tests; pressure tests await the shared async content directly. Real request/CSP rendering remains with the parent's render checks.

## Validation

Passed: 8 focused test files, 38 tests (2026-10-03). Command:

```sh
npm test -- --exclude 'plans/**' src/lib/seo/jsonLd.test.ts 'src/app/(public)/calculators/bike-fit/page.test.tsx' 'src/app/(public)/calculators/crank-length/page.test.tsx' 'src/app/(public)/calculators/frame-size/page.test.tsx' 'src/app/(public)/calculators/gearing/page.test.tsx' 'src/app/(public)/calculators/saddle-height/page.test.tsx' 'src/app/(public)/calculators/saddle-width/page.test.tsx' 'src/app/(public)/bandenspanning-calculator/page.test.tsx'
```

`git diff --check` passed. Source search for `CALCULATOR_AGGREGATE_RATING|aggregateRating|AggregateRating` under `src`, excluding tests, found no matches.

The first test run also discovered archived pre-change tests under `plans/seo-semrush/audit/S5-before-source/`; the archived positive rating assertion fails against the updated helper. The successful focused run explicitly excludes `plans/**`. Parent should account for these archived test files when running broad gates. Initial pressure test failures from rendering a nested async Server Component in jsdom were corrected by awaiting the shared content.

## Handoff

Changed files are listed in `audit/files-S5-schema.txt`. Home files, shared layout, dependencies and other task files were not edited. Parent owns home work, renders, broad typecheck/lint/build/crawl gates, and plan README integration. No commit, deployment, or production operation performed.
