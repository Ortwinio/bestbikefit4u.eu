# U1 guard route inventory

`scripts/usability/routes.mjs` records the eleven calculators, both ordered journeys, thirteen public collapse boards, seventeen account fixture routes, all five checkout boards, homepage, pricing and login. Locale paths use the application's canonical Dutch and English routes.

## Exact thirteen content boards

| Canvas board | Real route |
| --- | --- |
| HowItWorks | `/how-it-works` |
| MeasurementGuide | `/measurement-guide` |
| PainIndex | `/pain` |
| PainDetail | `/pain/knee-pain-cycling` |
| WhyBikeFit | `/why-bikefit-matters` |
| BikeFittingLanding | NL `/bikefitting`, EN `/bike-fitting` |
| BikeSetup | `/fiets-afstellen`, currently redirects to BikeFittingLanding |
| Guides | `/guides` |
| GuideDetail | `/guides/saddle-height-guide` |
| BlogArticle | `/blog/[slug]`; existing offline `visual-article-1` fixture if no published CMS article |
| ScienceArticle | `/science/bike-fit-methods` |
| FAQ | `/faq` |
| PressureLanding | NL `/bandenspanning/racefiets`, EN `/tire-pressure/road-bike` |

These are precisely the thirteen public non-calculator, non-pricing boards containing `<details>` in the supplied canvas. `Feedback` also contains details but is an account page. Calculator and SaddleHeight are already in calculator coverage. The route test verifies this against the supplied files rather than just asserting a hard-coded count.

## Offline fixture reuse and limits

- `tests/visual/final-sweep/account-fixture.mjs` exports `prepareAccountFixtures({ root, origin, fetch })`. It bundles actual React account pages and dashboard layout with deterministic Convex/auth adapters, loading CSS from the running production login page. Supported routes include all seventeen registered account entries. It returns `origin`, `close`, and explicit `limitations`.
- Its asset server now accepts `staticDir`, preserving `.next-final-sweep/static` as the default. `prepareUsabilityFixtures` supplies `.next/static` for this guard.
- The existing account fixture does not prove middleware authorization, server metadata, writes, storage persistence or real Next navigation. It should be described as presentation coverage.
- `tests/visual/final-sweep/blog-fixture.mjs` exports `prepareBlogFixture`. The optional `serverRenderedContent` flag now renders the exact real article/Header/Footer entry tree and existing CMS fixture data on the server in isolated workers, then hydrates the matching client tree. Worker termination prevents React scheduler MessagePorts from keeping the guard alive. The usability adapter requires this SSR flag for `visual-article-1` in both locales and rejects a client-only result. It proves server HTML retention for this deterministic article; published CMS lookup and production metadata remain separate checks. Existing callers retain CSR by default. `discoverBlogSlug` in the existing final-sweep routes module can discover an actual article from the local sitemap.
- Checkout choice uses the real `/checkout` route. Account/review/success/failure now use `scripts/usability/fixtures.mjs` with the actual CheckoutFlow, clearly labelled deterministic presentation props, and callbacks that throw instead of authenticating, sending email or taking payment. Account/review advance through real Continue buttons and verify the resulting heading. Success/failure also verify their heading. Await `window.__usabilityFixtureReady` and assert the HTML `data-usability-fixture-state`. Anonymous `cancelled=1` does not independently prove failure coverage; the production page also deliberately rejects `preview=success`.
- BikeSetup has no independently rendered source page today: its 301 leads to the fitting landing. Report this as an unresolved board-parity review, not thirteen independent route implementations.
- The FitReport canvas is a report/download surface rather than a separate account route. Existing `/fit/[sessionId]/results` is registered; PDF/report presentation needs separate evidence and must not be credited from the results page alone.

## Validation

`node --test scripts/usability/routes.test.mjs scripts/usability/fixtures.test.mjs`: 9 passed, 0 failed. Checks cover route ownership uniqueness, real calculator directories, exact collapse-board coverage, canonical locale paths, fixture status metadata, exact ten pressure imports, strict local origins, adapter selection, cleanup on failure, and rejection of client-only blog content where SSR is required. The actual checkout presentation entry compiles through esbuild in memory; no Next build was run by this task.

The catalog itself makes no rule pass claims. The runner must retain manual and unavailable statuses per rule and must not treat absent fixtures or unavailable server HTML as automatic passes.

Quick fix is a `safetyStates` entry on the actual public saddle-height route, activated with the existing mode button and verified through `data-advice-mode="quick"`. There is no separate quick-fix route. Its practical safety paragraph needs state-specific rule 13 evidence.

Additional fixture checks: all five CheckoutFlow states rendered and reached their verified state in NL and EN in Chromium without page errors, including explicit preview failure while unauthenticated. Blog NL/EN response bodies contain actual localized article text and hydrate without page errors. These adapter checks use minimal test CSS and do not claim visual or usability-rule compliance.
