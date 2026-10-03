# S8 generator and route tests

## Ownership

Only new `src/lib/seo/llms.test.ts`, `tests/integration/llms.integration.test.ts`, this note and the exact four-file manifest are owned here. Kepler owns `generateLlmsDocument(full: boolean): Promise<string>`; parent owns `/llms.txt` and `/llms-full.txt` routes. No generator, route, shared sitemap source, API, dependency or script edits.

## Generator coverage

- Concise and full documents must contain every localized URL from real sitemap page/calculator/merged-guide/blog helpers. The test computes expected URLs independently and fails on missing routes or extra localized non-sitemap URLs.
- All eleven calculators per locale, all 48 authored guide articles per locale, indexable science pages, pain hub/details, author/methods pages and canonical bicycle-type pressure pages are asserted explicitly.
- Canonical English/Dutch calculator and bike-fitting aliases are required; private/login routes, query/fragment URLs, old per-weight pressure destinations and cross-locale aliases are rejected.
- Only Convex CMS reads are mocked. Dynamic-only guide/blog records must appear in both document modes. A rejecting CMS must preserve the empty-CMS static coverage through the real shared helpers without leaking error details. Exact timeout timing remains in S7 source tests.
- Full document guide key answers must match the localized authored quick answers. Calculator answers must match the existing fit/equipment/performance answer builders, which evaluate the established engines. Whitespace/Markdown normalization permits formatting without accepting invented answers.
- The non-indexable calculation-engine utility is not forced into the inventory; indexable science routes follow sitemap policy.

## HTTP coverage

Five route-contract tests use a mocked generator: GET calls exactly the correct false/true mode and returns its content as UTF-8 plaintext; cache policy is public, s-maxage=3600, stale-while-revalidate=86400; nosniff is present; manual Content-Length and ETag are absent. Node/force-dynamic/3600 route config is checked. HEAD is bodyless, matches GET headers and never calls the generator, so it cannot initiate its CMS reads. Neither static public text duplicate may exist.

## Validation status

Initial run could not import the not-yet-created `src/lib/seo/llms.ts`. Test and route imports agree with the assigned export contract. Scoped ESLint passed on the initial two test files. Final validation is pending the generator landing.

No production/network calls, real user data, commits or deployments.
