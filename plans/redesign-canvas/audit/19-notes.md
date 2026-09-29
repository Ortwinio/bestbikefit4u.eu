# 19 — Marketing implementation

## Batch 1 scope

Section 0 shared marketing Header/Footer/mobile menu, home `/`, `/pricing`, and `/how-it-works` only. Designs: approved `canvas/Main.dc.html`, `canvas/Pricing.dc.html`, and corrected `drafts/HowItWorks.dc.html`. Three subagents implemented one page each; parent integrated the shared layout and owns final validation. No later batches started, no commits.

### Shared layout

- `src/components/layout/Header.tsx`: 120 px desktop margins at 1440, brand logo, Calculators / Hoe het werkt / Gidsen / Prijzen, NL/EN pill, text login, one petrol free-bike-fit action. Destinations are localized real routes; authenticated riders retain a text dashboard destination. `MarketingNavigation.tsx` preserves route/query on language changes and marks the active page. `MarketingLogo.tsx` fixes the light-surface logo variant independently of the user's theme.
- `HeaderMobileMenu.tsx`: same navigation and primary action, existing dialog/focus handling, Dutch/English accessible labels, 44 px targets, retained authenticated account links/sign-out. Collapses below 1280 px to avoid squeezed navigation.
- `Footer.tsx`: ink surface, negative logo, language switch, five real link columns, existing localized calculator/guide/legal destinations and current year. Legacy calculator logos replaced by eight Lucide stroke icons. Footer headings explicitly white because global heading defaults otherwise override inherited color.
- Shared new strings live in `src/i18n/marketing/layout.ts`; no changes to shared message dictionaries or `src/components/ui/*` / `globals.css`.

### Home

- `src/app/(public)/page.tsx` and `src/components/home/MarketingHome.module.css`: board composition, lime saddle-height teaser, proof strip, eight tools, three steps, pain links, original testimonials, report contents and account CTA. Existing guide/scenario routes remain in an expandable discovery section; real CMS latest-blog integration remains.
- `src/i18n/marketing/home.ts` holds NL/EN presentation copy; existing home content dictionaries remain source for real content and proof. Claims follow `audit/11-notes.md`: approved existing fit/brand/review figures retained; unsupported popularity and measurement-duration claims omitted with an explicit TODO comment. No placeholder text published.
- `SaddleHeightTeaser.tsx`: existing engine-equivalent default-context estimate and band, 55–105 cm / 0.5 cm steps; all 101 values tested against the real engine. Uses shared Slider, localized measurement help and a labeled live result. Mobile heading stacks to avoid crowding.
- Existing canonical/locale metadata, source JSON-LD and analytics retained. Home tests updated for the approved value-first layout instead of the removed legacy component arrangement.

### Pricing

- `src/app/(public)/pricing/page.tsx`, scoped CSS, and `src/i18n/marketing/pricing.ts`: light Free/dark Pro cards, real commercial prices/features, comparison table and lime calculator CTA.
- Billing uses existing `isStripeBillingEnabled()`, not a visual-only flag. When paused, visible localized notice plus disabled paid action; free account remains available. Existing campaign date gating/donation behavior retained, not forced on. Native FAQ/proof disclosures preserve real content and FAQ JSON-LD.
- Local development defaults to billing enabled when flags are absent; final production QA explicitly sets both existing billing flags to false to exercise the requested paused state. No environment files or billing configuration changed.

### How it works

- `src/app/(public)/how-it-works/page.tsx`, scoped CSS and `src/i18n/marketing/howItWorks.ts`: approved hero, three steps, preparation panel, real tool links and lime CTA. Real source copy, localized metadata, HowTo schema and analytics retained.
- Uses existing house race-bike/measurement illustrations. No app-wide styles or new raster assets.

## Validation

Evidence logs: `/private/tmp/bbf191-{typecheck,lint,unit,i18n,build,seo,render}.log`. Screenshots and matching board renders: `code-renders/19-1-*` (NL 1440/390 for all three pages, EN home 1440, mobile menu).

- Typecheck, lint (including tooltip/runtime-boundary/218 contrast checks), unit suite, 30 i18n tests and sitemap validation rerun after integration.
- Added marketing layout tests for navigation order/current-page semantics, one primary action/plain login, authenticated dashboard access, locale-switch query preservation, actual footer destinations/stroke icons and mobile dialog actions.
- Initial concurrent validation failures were outside ownership: calculator type import/test and account visual-harness lint. Those were left to owners; no edits to calculators, dashboard/account, shared UI or globals.
- Browser checks cover one H1, localized canonical, JSON-LD, horizontal overflow, image loading and runtime errors. Lazy images are decoded before final screenshots. No batch-2 work started; awaiting lead review.

### Final results

- `npm run typecheck`: PASS.
- `npm run lint`: PASS, including 218/218 contrast checks.
- `npm run test:unit`: PASS, 187 files / 837 tests.
- `npm run test:i18n`: PASS, 6 files / 30 tests.
- `STRIPE_BILLING_ENABLED=false NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false npm run build`: PASS, 230 generated pages. Build output snapshotted into `/private/tmp/bbf191-next` for the isolated preview because concurrent builds were replacing `.next`.
- `SITEMAP_BASE_URL=http://127.0.0.1:3001 npm run seo:validate-sitemaps`: PASS against that production snapshot.
- Final NL captures: home/pricing/how-it-works at 1440 and 390, all HTTP 200, no horizontal overflow, no broken images, one H1 and expected canonical/JSON-LD. EN home has the correct translated title. No browser runtime errors. Mobile menu opens/closes; parent visually inspected final layouts and paused-price notice/disabled paid CTA.
- Eight implementation PNGs plus three matching approved board PNGs in `code-renders/19-1-*`. Production preview flags are process-only; repository environment files untouched. No commit.
