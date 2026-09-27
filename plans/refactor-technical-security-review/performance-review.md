# Public frontend performance and funnel review

Review date: 2026-09-27. Base commit: `a2da02d`. Implemented locally; production deployment and browser acceptance are integrated by the main agent.

## Verified findings and changes

### P2 — decorative video competed with initial content and ignored visitor preferences

`HeroBackground` originally rendered autoplay sources in the initial HTML, with WebM first. Existing local asset measurements:

| Asset | Bytes |
| --- | ---: |
| Hero poster JPEG | 67,539 |
| Hero WebM | 1,166,896 |
| Hero MP4 | 615,698 |

The server now renders the high-priority poster alone. The video is added after the initial page load, and MP4 is preferred: 551,198 fewer media bytes, or 47.2%, when the browser supports both existing formats. Visitors requesting reduced motion, data saving, or reporting a 2G/slow-2G connection keep the poster without starting the video. Preference changes are handled during the visit. These are measured file sizes and loading-policy changes, not claimed field Core Web Vitals improvements.

### P2 — unnecessary global client code and mounting

`FeedbackPanelProvider` eagerly imported and mounted the entire feedback form on every non-admin route, including visitors who never opened it. It now dynamically imports and mounts the dialog after the first open action, retaining the loaded component afterward so closing transitions and form reset behavior remain intact.

The public header eagerly imported the authenticated `UserMenu`. That menu imports both complete language dictionaries (`en.ts`: 130,545 source bytes; `nl.ts`: 135,542 source bytes). `HeaderAuthActions` now dynamically loads the menu only when authenticated. Auth decisions and URLs are unchanged. Source sizes describe the dependency graph, not compressed bundle-byte savings. The main agent also switched the root feedback import from the broad barrel to the provider module.

### P2 — below-fold showcase queried even when mobile CSS hid it

`BikeShowcaseSection` previously started a live backend query immediately for every homepage visitor. It now uses Convex's `skip` argument until its section approaches the viewport (400px margin). CSS-hidden mobile content never intersects, avoiding that unused subscription. Existing loading/empty-state content and working calculator CTA are preserved. Browsers without IntersectionObserver fall back to loading normally.

### P2 — secondary blog query delayed homepage content

The homepage awaited the latest blog query before returning the hero and primary calculator links. This secondary content now lives in the async `LatestBlogSection`, wrapped in Suspense, allowing the rest of the page to stream while the backend query completes. Empty/unavailable blog results still omit the section. Homepage blog images no longer preload; `BlogArticleCard` provides responsive image sizes.

### P2 — new visitors accepting cookies were omitted from funnel view tracking

`TrackMarketingEventOnView` marked a view as tracked before the logger checked consent. A fresh visitor accepting cookies later could therefore never produce that landing/pricing view. It now waits for consent, subscribes to preference changes, and deduplicates the actual event identity. Client navigation with new event properties records a new view. Essential-only visitors remain untracked.

Marketing mutation failures and CTA logging failures are now caught, avoiding unhandled promise rejections during navigation or login. This fixes a verified analytics blind spot; it does **not** establish why actual user records are missing. Registration/authentication and real email delivery are reviewed separately.

## Functionality and regression coverage

- New hero tests verify server poster-only HTML, deferred smaller video, reduced motion, data saver, slow connection, and runtime preference updates.
- New showcase tests verify skipped requests offscreen, eventual subscription, retained conversion link, and fallback without IntersectionObserver.
- New analytics tests verify accepting consent after page load, essential-only suppression, deduplication, navigation, and backend failure handling.
- Public header tests verify signed-out CTAs and eventual lazy authenticated menu rendering.
- Homepage and pricing tests cover campaign and post-campaign states with deterministic dates, including current calculator and login destinations.
- Repaired pre-existing public tests that imported server-only blog code into jsdom, rendered async JsonLd directly, depended on the real current date, or asserted superseded pre-redesign signup links. Calculator tests assert the shipped localized calculator/pricing destinations. Production copy and conversion design were preserved.

## Validation

Final targeted Vitest run: **15 files, 39 tests passed**, on Vitest 4.1.11 after the main agent's dependency installation. Covered homepage, pricing, FAQ, guide details, crank length, frame size, gearing, saddle height, saddle width, pressure CTA, header, marketing tracker, hero, showcase, and feedback helpers.

ESLint on all changed frontend implementation files and tests: **0 errors**. The guide test's intentional native-image double now has a narrowly scoped documented lint exemption. Full typecheck, production build, full test suite, and browser acceptance are owned by the main agent and documented in the integrated validation report.

### Integrated regression review

- Confirmed that first-open lazy feedback receives the current route options; the component remains mounted after closing and its existing `open` effect resets form state. Listener cleanup and route behavior are preserved. The main agent separately verified first-open feedback in a real browser.
- Confirmed `LatestBlogSection` is imported by the server homepage, while its data adapter retains the `server-only` boundary. It is never imported into a client component.
- Added `LatestBlogSection.test.tsx` exercising the real data adapter and article card: empty results, backend rejection fallback, asynchronously resolved EN/NL lists, localized post/index destinations, and lazy/non-preloaded images. Four new tests pass.
- Added hero regressions for browsers without Network Information and cleanup of pending playback/listeners on unmount.
- Verified current public CTA routing continues homepage → bike-fit calculator → login; post-campaign pricing still links to login.
- Identified a **P2 pre-existing missing persistence bridge**: the public bike-fit calculator's “Sign in to save results” CTA did not carry measurements into login, while the form retains results only in component state. A persistent intake handoff was not found. Corrected EN/NL public signup CTA/body copy to offer account creation, a rider profile and personalized follow-up, without claiming anonymous results transfer or save. This includes the repeated frame-size/crank/saddle-height signup descriptions and public pressure CTA translations/title. Real dashboard save actions are unchanged. Added EN/NL post-campaign bike-fit CTA checks. Persistent anonymous-to-account intake transfer remains a separate feature.
- Follow-up validation: hero/blog/guide tests **3 files, 16 tests passed**; copy/CTA/translation checks **6 files, 9 tests passed**; all follow-up files passed ESLint without errors or warnings. Scoped whitespace validation passed.

## Remaining limits / follow-up evidence

- No production RUM, traffic history, registration counts, or live inbox data were available to this frontend agent. Quantitative LCP/INP/CLS and real signup conversion improvements must be measured after release.
- Full registered-user flows, payment, PDF generation, and email verification are outside this frontend subtask; this report does not claim all functionality passed.
- Marketing's Convex provider remains global because public calculator/auth/header behavior currently depends on it; removing it would require a larger boundary redesign.
- Modern browsers lacking Network Information still receive the reduced-motion policy, but data-saver/connection detection depends on API availability.
- Browser acceptance should cover first-open feedback, signed-in header menu, English/Dutch mobile layouts, the showcase near the viewport, and reduced-motion poster-only rendering.

## Technical references

- [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading)
- [MDN Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN NetworkInformation.saveData](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)
