# 19 — Marketing implementation

## 19.5a — About, FAQ, Contact and Case Study (Codex B)

### Token-only follow-up

- Lead-expanded scope: blog, Guides and DashboardBikeGarage CSS modules now use tokens only.
  Semantic surfaces/text adapt to dark mode; fixed lime panels retain explicit ink text.
  Shared Header/Footer and global tokens were not edited by B.
- Manifest `audit/files-19.5a.txt` now contains 22 paths, including the three modules and theme harness.
- Theme browser matrix passes 12/12 live NL cases: blog index, guide index and guide leaf,
  light/dark at 1440/390. No overflow or runtime errors; computed surface/text tokens switch correctly.
  Dark screenshots were visually inspected. Blog currently has no published CMS articles.
  Proof: `code-renders/19-5a-token-themes.json` and `19-5a-tokens-*.png`.
- CSS token gate passes: 17 modules, zero raw-color lines; this supersedes the historical 49-line blocker below.
  Latest full lint is blocked only by three no-require-imports errors in the concurrently added
  `tests/visual/marketing-dark/render.cjs`, outside B's ownership. Log: `/tmp/19.5a-token-lint.log`.
  No commits.

- Source boards: `canvas/About.dc.html`, `FAQ.dc.html`, `Contact.dc.html`, `CaseStudy.dc.html`.
  Three page workers handled About/FAQ/Contact; parent handled Case Study and final integration.
- About keeps the original real NL/EN content in its own dictionary with the illustration-led board layout.
  FAQ keeps all twelve questions/answers per language and the exact FAQPage payload, with native disclosures.
  Contact remains mailto-only: configured support address, response times and FAQ tracking remain unchanged.
- Case Study uses the gravel illustration, context panel, single-column form and supporting cards from the board.
  `CaseStudyRecruitmentForm.tsx` is unchanged: original required fields, optional goal, consent, mutation payload,
  source/pain attribution, pending indication, analytics, success/reset and error/retry behavior are tested.
  No submission was sent to the live backend; filled browser captures use `.invalid` synthetic input only.
- Shared Header/Footer, frozen dictionaries, redirects, backend and metadata/canonicals are unchanged.
  New copy lives in the four assigned marketing modules. No invented contact form, claims or review-state strips.
- Exact source/test/harness list: `audit/files-19.5a.txt` (18 paths; excludes other agents' files and plans artifacts).
  All eighteen implementation/test/harness files are checked for lines no longer than 120 characters.
- Focused tests: About 7, FAQ 8, Contact 8, Case Study 6. Whole unit suite: 219 files / 1065 tests pass.
  Typecheck, production build (230 static pages), 30 i18n tests and sitemap validation pass.
- Whole lint passes ESLint/runtime/tooltips and 218 contrast checks, but the newly added CSS-module token gate
  reports 59 raw-color lines in prior/concurrent modules: blog, guides, DashboardBikeGarage and LegalPage.
  None are in the four 19.5a modules. Routed to the lead/owners rather than changing files outside this batch.
  `/tmp/19.5a-lint.log` and `/tmp/19.5a-unit.log` retain the results. No green whole-lint claim.
- Browser harness: `tests/visual/marketing-batch5a/capture.mjs`; NL/EN at 1440/390 with FAQ expanded and Case Study filled.
  Proof and board references: `code-renders/19-5a-*`. Parent visual review caught a mobile About overflow and clipped
  first form label; both are corrected before the final capture refresh. Final matrix result is recorded below.
- Final parent checks: all four metadata functions compare unchanged against `ce354bc`; shared form/Header/Footer,
  proxy and frozen dictionaries have no diffs. Final typecheck/scoped ESLint and 120-character scan pass.
  The latest CSS-token gate rerun is reduced to 49 raw-color lines in blog/guides/DashboardBikeGarage after the
  legal owner corrected its module. See `/tmp/19.5a-css-final.log`; this remaining cross-batch gate is routed to lead.
- Final browser refresh passes **24/24 cases** with no overflow, image/runtime errors or canonical changes.
  **40 PNGs** include four board references; FAQ all-open and single-expanded states are verified, Contact has
  mailto links and no form, and Case Study values are never submitted live. Proof: `code-renders/19-5a-results.json`.
  Final focused rerun passes all 29 tests. No commits; ready for lead review.


## 19.3 — Guides and blog (Codex B)

- Sources: approved `canvas/Guides.dc.html`, `GuideDetail.dc.html`, `BlogIndex.dc.html`, `BlogArticle.dc.html`. Two disjoint page-family subagents implemented guides and blog; parent owns integration and final checks. No commits.
- Presentation: illustration-led library/index heroes, topic/article cards, lime next-step bands, guide quick-answer panel and contents rail, responsive article typography, blog filtering/pagination and sticky contents. No board review strips, example chips, missing-source placeholders or invented articles ship.
- Content contracts preserved: real guide backlog/CMS selection, draft preview and exit, localized body/FAQs, authenticated tracked closing CTAs, blog publication filters and pagination, images, dates, author, TOC targets and related links. Existing hub classification is unchanged: saddle-height and crank-length currently resolve as hubs under the existing backlog logic; handlebar-width supplies the live leaf example. Existing hub FAQ data is now visible and its contents link has a real target. Existing source-language fallback (including some English CTA/related-link labels on NL) is preserved rather than rewriting CMS/resolver content outside scope.
- SEO audit: all four `generateMetadata` functions, both `generateStaticParams` functions and the three JSON-LD JSX schema expressions compare byte-for-byte with checkpoint `14f7ea4` using the TypeScript AST. CMS adapters, `src/proxy.ts`, shared Header and Footer retain their starting hashes. No frozen dictionary, backend or shared UI edits.
- New copy is confined to `src/i18n/marketing/guides.ts` and `blog.ts`. Exact source/test/harness commit list: `audit/files-19.3.txt` (19 paths; excludes plans and other owners' files).
- Visual proof: `code-renders/19-3-*`; actual local guide/index/hub/leaf routes and real empty blog, plus isolated populated/category/page-2/article blog fixtures. The CMS supplied no published blog articles, so synthetic data exists only in the test harness. NL/EN at 1440/390; four board PNG references alongside. Reproduction and precise fixture boundaries: `tests/visual/marketing-batch3/README.md`.
- Focused checks: guides 16 tests and blog 15 tests pass, including preview/fallback/FAQ/TOC links, CMS localization, pagination, metadata and not-found behavior. Initial integration exposed one test expectation and one mock signature issue; both corrected without changing CMS/SEO behavior. Final whole-tree results are recorded below.

### 19.3 final checks

| Check | Result |
| --- | --- |
| `npm run test:unit -- --maxWorkers=2` | PASS: 215 files / 1024 tests; `/tmp/19.3-unit-final.log` |
| `npm run lint` | PASS, including 218 contrast checks; `/tmp/19.3-lint-final.log` |
| `npm run test:i18n` | PASS: 30 tests |
| `npm run seo:validate-sitemaps` | PASS against local frontend, repeated after route changes |
| Metadata/static-params/JSON-LD AST comparison | PASS against `14f7ea4`; source expressions unchanged |
| Browser matrix | PASS: 36 cases, 58 PNGs including four board references; no overflow, broken images, missing TOC targets or runtime errors |
| Unknown guide/blog routes | PASS: both return HTTP 404 |
| `git diff --check` | PASS |
| `npm run typecheck` / `npm run build` | Owned slice passes and webpack compiles; final whole-tree gates blocked by concurrent science files, detailed below |

Final build/typecheck failures outside 19.3 ownership: `src/components/science/EditorialLayout.tsx:57` (nullable Card variant), `src/i18n/marketing/science.ts:22` (missing MethodItem), `src/i18n/marketing/science.ts:174` (missing EngineCard). Routed to lead/science owner via `messages/20260929-2226-codex-b-to-lead-info-19-3-build.md`; no edits to those files. This is **not** a claim of a green final whole-tree build.

Final visual evidence and fingerprints: `code-renders/19-3-results.json`; all `code-renders/19-3-*.png`. Parent inspected guide library/detail/true leaf, blog empty/filled/article and mobile layouts. The guide leaf keeps long real CMS content, so its page is taller than the sample board. No source-content truncation to force board height. Work is ready for lead review; no commits.


## Ownership checkpoint and exact file list

Read the README's new “Code phase: ownership & commits” rules. Continue from integration checkpoint `b40d638`; do not recreate or revert its in-progress changes. All new batch-19.1 strings already live in the four marketing dictionary modules below. Codex A added no strings to `src/i18n/messages/nl.ts` or `en.ts`; no migration or lead-only dictionary change is required. Both frozen files have no working-tree changes relative to that checkpoint at this verification. Existing dictionary reads remain unchanged.

Batch-19.1 implementation/test files (including work already captured by the lead's integration checkpoint):

```text
src/app/(public)/page.tsx
src/app/(public)/page.test.tsx
src/app/(public)/pricing/page.tsx
src/app/(public)/pricing/page.test.tsx
src/app/(public)/pricing/pricing.module.css
src/app/(public)/how-it-works/page.tsx
src/app/(public)/how-it-works/page.test.tsx
src/app/(public)/how-it-works/how-it-works.module.css
src/components/home/MarketingHome.module.css
src/components/home/MarketingHome.test.tsx
src/components/home/SaddleHeightTeaser.tsx
src/components/home/SaddleHeightTeaser.test.tsx
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/layout/HeaderMobileMenu.tsx
src/components/layout/MarketingNavigation.tsx
src/components/layout/MarketingLogo.tsx
src/components/layout/MarketingLayout.test.tsx
src/i18n/marketing/home.ts
src/i18n/marketing/pricing.ts
src/i18n/marketing/howItWorks.ts
src/i18n/marketing/layout.ts
```

Batch-19.1 documentation and rendered evidence:

```text
plans/redesign-canvas/README.md
plans/redesign-canvas/audit/19-notes.md
plans/redesign-canvas/code-renders/19-1-home-1440.png
plans/redesign-canvas/code-renders/19-1-home-390.png
plans/redesign-canvas/code-renders/19-1-home-en-1440.png
plans/redesign-canvas/code-renders/19-1-home-board.png
plans/redesign-canvas/code-renders/19-1-pricing-1440.png
plans/redesign-canvas/code-renders/19-1-pricing-390.png
plans/redesign-canvas/code-renders/19-1-pricing-board.png
plans/redesign-canvas/code-renders/19-1-how-it-works-1440.png
plans/redesign-canvas/code-renders/19-1-how-it-works-390.png
plans/redesign-canvas/code-renders/19-1-how-it-works-board.png
plans/redesign-canvas/code-renders/19-1-mobile-menu.png
```

The README is shared with the lead; commit only the batch-19.1 progress entry when not already integrated. Do not include unrelated agents' layout, account, calculator, shared UI, globals, frozen dictionaries, or `.claude/` files. This ownership follow-up changes only this audit note; application code and prior validation results are unchanged. No commit by Codex A; awaiting batch-1 review.

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

## Batch 19.2 and lead follow-ups

Scope: `/measurement-guide`, `/fit-pass`, `/pain`, and `/pain/[slug]`, plus the four explicitly requested batch-1 fixes. Three subagents own measurement-guide, fit-pass, and the pain route family; parent owns integration/QA. No batch-3 work, shared UI/global styling, calculator/account changes, frozen dictionary edits, or commits.

### Batch-1 corrections

- Removed the floating home `Voorbeeldgegevens`/`Example measurements` chip. Localized instruction now appears inside the teaser card: `Schuif naar jouw maat` / `Slide to your measurement`.
- Rating sentence now uses Figtree; only `4,8` / `4.8` and `380+` use DM Mono. Tests assert the number-only spans and absence of the canvas chip.
- Removed the unverified Pro popularity badge from pricing, including unused scoped badge CSS. Commercial pricing data stays untouched; a regression assertion prevents displaying the badge again.
- Reformatted home `page.tsx` using the existing installed formatter with 100-character print width. No lines exceed 140 characters; source content, links, metadata and analytics remain intact.

### Batch-1 correction file list

```text
src/app/(public)/page.tsx
src/app/(public)/pricing/page.tsx
src/app/(public)/pricing/page.test.tsx
src/app/(public)/pricing/pricing.module.css
src/components/home/MarketingHome.module.css
src/components/home/MarketingHome.test.tsx
src/components/home/SaddleHeightTeaser.tsx
src/i18n/marketing/home.ts
```

### Batch-2 implementation

- Measurement Guide follows its approved hero/preparation/seven-measurement-card design. All original required/optional values, ranges/units, instructions, mistakes, tool lists and related links remain in a dedicated NL/EN dictionary. Canonical metadata and tracked CTA sections preserved; seven diagrams are separate labeled elements. Content parity and route-render tests cover both locales.
- Fit Pass follows its approved hero, product illustration, features, process, native FAQ and lime CTA. Existing authentication, already-Pro, campaign and checkout logic stays in `FitPassLandingCta`; its only behavior addition is an optional localized loading label. Payment-pause notice renders server-side independently of auth loading. Both billing gates and real CTA destinations are tested; no invented account fixture or canvas switcher.
- Pain index and one reusable local detail template follow approved PainIndex/PainDetail. All five real slugs retain their NL/EN source content, clinical caveat, related links, metadata, static params, unknown-slug notFound, Article/FAQPage/BreadcrumbList JSON-LD and analytics. Existing shared legacy template remains untouched. Native FAQ summaries are keyboard accessible; all five slugs are covered in both locales by focused tests.

### Exact batch-2 implementation file list

In addition to the eight correction files listed above:

```text
src/app/(public)/measurement-guide/page.tsx
src/app/(public)/measurement-guide/measurement-guide.module.css
src/app/(public)/measurement-guide/measurement-guide.test.ts
src/app/(public)/measurement-guide/page.test.tsx
src/i18n/marketing/measurementGuide.ts
src/app/(public)/fit-pass/page.tsx
src/app/(public)/fit-pass/page.test.tsx
src/app/(public)/fit-pass/fit-pass.module.css
src/i18n/marketing/fitPass.ts
src/components/features/fitpass/FitPassLandingCta.tsx
src/components/features/fitpass/landing-loading.test.tsx
src/app/(public)/pain/page.tsx
src/app/(public)/pain/[slug]/page.tsx
src/app/(public)/pain/PainDetail.tsx
src/app/(public)/pain/pain.module.css
src/app/(public)/pain/page.test.tsx
src/i18n/marketing/pain.ts
```

### Batch-2 validation and evidence

- `npm run typecheck`: PASS.
- `npm run lint`: PASS, including tooltip coverage, runtime boundaries and 218 contrast checks.
- `npm run test:unit -- --maxWorkers=2`: PASS, 211 files / 985 tests. Reduced worker count avoids contention with other agents' builds; an earlier unrestricted run hit load-related timeouts.
- `npm run test:i18n`: PASS, 6 files / 30 tests. Frozen shared dictionaries have no A changes.
- `STRIPE_BILLING_ENABLED=false NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false npm run build`: PASS, 230 generated pages. Earlier build failures came from concurrently edited progress-bar/bike types; their owners resolved them, not A.
- Final production preview uses `/private/tmp/bbf192-preview` with the build snapshot `/private/tmp/bbf192-next` and module/public links. Merely overriding `distDir` was insufficient because serialized Next configuration restored `.next`; the separate preview directory avoids concurrent-build manifest removal. No repository configuration/environment changes.
- `SITEMAP_BASE_URL=http://127.0.0.1:3002 npm run seo:validate-sitemaps`: PASS.
- All twelve NL captures (four new pages + two corrected pages × 1440/390) return HTTP 200, one H1, correct canonical/JSON-LD, no horizontal overflow, no broken images or browser errors. EN Measurement Guide renders correctly. All five pain slugs return 200; unknown slug returns 404. Parent visually inspected desktop/mobile page layouts and the corrected home typography.
- Browser-computed rating font is Figtree; only the two numeric spans use DM Mono. Canvas example chip and unverified pricing popularity badge are absent. Home page has zero lines over 140 characters.
- Fit Pass screenshot explicitly shows account-status loading because browser external network is blocked; paused-payment status is rendered independently on the server. No fabricated authentication state. Signed-out, active-member, loading, billing and campaign/checkout behavior are covered by the 16 Fit Pass tests.
- Logs: `/private/tmp/bbf192-{typecheck,lint,unit,i18n,build,seo,render}.log`. No commit; batch 3 remains unstarted pending lead review.

Exact documentation/evidence files for this batch:

```text
plans/redesign-canvas/README.md
plans/redesign-canvas/audit/19-notes.md
plans/redesign-canvas/code-renders/19-2-measurement-guide-1440.png
plans/redesign-canvas/code-renders/19-2-measurement-guide-390.png
plans/redesign-canvas/code-renders/19-2-measurement-guide-en-1440.png
plans/redesign-canvas/code-renders/19-2-measurement-guide-board.png
plans/redesign-canvas/code-renders/19-2-fit-pass-1440.png
plans/redesign-canvas/code-renders/19-2-fit-pass-390.png
plans/redesign-canvas/code-renders/19-2-fit-pass-board.png
plans/redesign-canvas/code-renders/19-2-pain-1440.png
plans/redesign-canvas/code-renders/19-2-pain-390.png
plans/redesign-canvas/code-renders/19-2-pain-board.png
plans/redesign-canvas/code-renders/19-2-pain-knee-1440.png
plans/redesign-canvas/code-renders/19-2-pain-knee-390.png
plans/redesign-canvas/code-renders/19-2-pain-knee-board.png
plans/redesign-canvas/code-renders/19-2-home-fix-1440.png
plans/redesign-canvas/code-renders/19-2-home-fix-390.png
plans/redesign-canvas/code-renders/19-2-pricing-fix-1440.png
plans/redesign-canvas/code-renders/19-2-pricing-fix-390.png
```


## Batch 19.4 — marketing landings and science

Implemented the WhyBikeFit, BikeFittingLanding, BikeSetup and ScienceArticle presentation in the seven
owned route files. Scoped editorial components reuse the shared UI Card, illustrations, Header and Footer.
Added bilingual copy under `src/i18n/marketing/{why,landing,setup,science}.ts` and a stack/reach SVG figure.
The existing article content, related links, metadata, canonical URLs and JSON-LD remain in place.
The landing pair retains its locale-specific 404 behavior. WhyBikeFit omits the unverified testimonials,
following the approved board decision in audit/12-notes.md, with a provenance TODO in source.

Validation:
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, including runtime boundaries, tooltip coverage and 218 contrast checks.
- `npm run test:unit -- --maxWorkers=2`: PASS, 216 files / 1,028 tests.
- `npm run test:i18n`: PASS, 6 files / 30 tests.
- `npm run build`: PASS.
- `npm run seo:validate-sitemaps`: PASS against localhost:3000.
- New editorial page tests cover EN/NL rendering, canonical URLs, JSON-LD and wrong-locale landing guards.
- All 15 owned source/test/style/dictionary files have no lines longer than 120 characters.

Browser evidence: `audit/19-4-browser.json` records 16 successful captures at 1440 and 390 pixels,
including the seven routes and an extra EN science page. No horizontal overflow, broken images or browser
errors. Both wrong-locale landing requests return 404 with noindex. Screenshots include opened landing
and setup FAQs and mobile viewport captures. All captures use actual localhost pages, without fixtures.
Approved board PNGs sit alongside the screenshots under `code-renders/19-4-*`.

Exact source ownership list: `audit/files-19.4.txt` (15 paths, no files owned by other agents).
Logs: `/tmp/19-4-{types-final,lint-final,unit,i18n,build,seo,render}.log`.
No shared Header/Footer, UI components, global styles or other agents' routes were edited. No commit.


### 19.4b — CSS Module token follow-up

Replaced all 27 raw-color lines in `src/components/science/editorial.module.css` with existing
`--bbf-*` tokens matching the exact previous colors. Layout and computed palette are unchanged.
Verified `files-19.4.txt` includes the stylesheet; no additional source files were needed.
All stylesheet lines remain <=120 characters and diff whitespace checks pass.
`npm run lint` rerun: ESLint, runtime boundaries, tooltip coverage and contrast checks pass.
The CSS Module gate reports no science violations; the shared run still fails on 92 raw-color lines
in other owners' modules. See `/tmp/19-4b-lint.log`. No other owners' files edited; no commit.

### 19.2b — Token-only home styles

Only source change: `src/components/home/MarketingHome.module.css` (already in `files-19.2.txt`).
Replaced raw colors and fallbacks with existing brand/semantic tokens, including the shadow.
Scoped home aliases adapt backgrounds, cards, text, borders and links to dark mode; lime panels
retain ink text and petrol focus outlines. No global styles, shared UI or dictionaries changed.

Real `/nl` home screenshots refreshed in `code-renders/`:
- `19-2b-home-light-1440.png`
- `19-2b-home-light-390.png`
- `19-2b-home-dark-1440.png`
- `19-2b-home-dark-390.png`

All four captures return HTTP 200 with no horizontal overflow. Browser-computed body, teaser and
secondary-link contrast exceeds 4.5:1 in both themes (lowest measured ratio: 13.55:1).
`git diff --check` passes for the stylesheet. `npm run lint` rerun: ESLint, runtime boundaries,
tooltip coverage and contrast checks pass. Home has no CSS token violations; the final shared
CSS gate still fails on 49 raw-color lines in `src/components/blog/blog.module.css`,
`src/components/dashboard/DashboardBikeGarage.module.css` and `src/components/guides/Guides.module.css`.
Those concurrent owners' files were left untouched. Logs: `/private/tmp/bbf192b-lint.log` and
`/private/tmp/bbf192b-render.log`. No commit.


## Batch19.5b — Codex C legal and programmatic pressure pages

Assigned by lead after20.4 approval/commit177642c. This batch owns only privacy/terms, the two
programmatic pressure slug routes, and their local templates/data/tests/copy. No commits by C.
Codex A’s shared Header/Footer are reused unchanged; frozen root dictionaries stay untouched.
Other half19.5 (/about,/faq,/contact,/case-study) remains with its assigned owner.

# 19.5b legal presentation

Implemented one shared server-rendered legal template for privacy/terms, with the existing public layout.
Large readable hero, real last-updated date, localized legal-document navigation, sticky numbered TOC,
numbered reading sections, existing terms warning treatment, and original tracked footer CTA.
Mobile layout stacks the TOC and article at 900px and uses 20px gutters at 390px.

All original NL/EN content was extracted without text changes. Frozen pre-redesign fixture captures
all original metadata, dates, body paragraphs, headings, bullets, section order, and privacy contactText.
Terms section 6 still calls getSubscriptionTermsCopy(locale); fixture uses a sentinel for that dynamic
value, with a separate assertion against the actual function. Existing paid Pro wording in this source
may differ from paused public payment messaging; preserved as explicitly required, outside presentation scope.
No review-only board excerpt notices or invented legal provisions. Existing canonicals/OpenGraph unchanged;
there were no page-specific JSON-LD schemas to carry over. CTA labels/destinations/tracking sections retained.

Validation: targeted LegalPage.test.tsx 10/10 passing, owned ESLint clean, all owned source lines <=120.
Parent owns full build/sitemap/browser screenshots; no commits, root dictionary, header/footer or drafts edits.

Exact files:
- src/app/(public)/privacy/page.tsx
- src/app/(public)/privacy/content.ts
- src/app/(public)/privacy/LegalPage.tsx
- src/app/(public)/privacy/LegalPage.module.css
- src/app/(public)/privacy/LegalPage.test.tsx
- src/app/(public)/privacy/legalBaseline.fixture.ts
- src/app/(public)/terms/page.tsx
- src/app/(public)/terms/content.ts
- src/i18n/marketing/legal.ts

Post-review: replaced all legal CSS colors with full --bbf-* tokens to satisfy new lint:css-modules
rule (legal module has zero violations; current unrelated blog/guides findings remain outside scope).
Reduced mobile title fluid size to avoid orphan 'en' at the end of Dutch Gebruiksvoorwaarden at390.
Audit agent layout16 refreshing legal screenshots. Full tsc --noEmit also passed.


# 19.5b — programmatic pressure landing pages

Completed owned English/Dutch pressure landing presentation against
`plans/redesign-canvas/canvas/PressureLanding.dc.html` and step19.
No commit. No changes to source data, pressure engine, parsers, sitemap, shared Header/Footer,
root dictionaries, static calculator entrypoints, or files outside assigned route scope/copy module.

## Exact files
- `src/app/(public)/tire-pressure/[slug]/page.tsx`
- `src/app/(public)/bandenspanning/[slug]/page.tsx`
- `src/app/(public)/tire-pressure/[slug]/PressureLanding.tsx` (new shared route-local template)
- `src/app/(public)/tire-pressure/[slug]/PressureLanding.module.css` (new)
- `src/app/(public)/tire-pressure/[slug]/PressureLanding.test.tsx` (new)
- `src/i18n/marketing/pressureLanding.ts` (new direct-import NL/EN copy)

## Presentation
- Board-aligned question-size headline with existing data-derived page title, localized introduction,
  approved existing tire-pressure illustration, soft-petrol assumptions panel, lime tubeless table row,
  three baseline guidance cards, native FAQ disclosure, lime next-step panel and related guide cards.
- Uses board's semantic front/rear pressure table rather than previous generic paired cards; parent
  confirmed board takes priority. Header/Footer remain shared and untouched.
- Real computed bar/PSI values, locale formatting, no hardcoded example pressure values.
- Assumptions explicitly show route weight plus engine8kg default bike weight, actual28/40/57mm
  widths, actual discipline surface defaults, balance riding goal, and no personal-bike profile claim.
- Existing engine-derived explanatory content retained semantically and localized: tire width,
  tubeless configuration and readable surface label; NL no longer prints the engine's English
  sentence/raw underscore surface key.
- Native table row/column headers and FAQ summary/details, visible link focus, responsive350px
  content width without horizontal table scrolling, existing brand illustration with localized alt.
- All colors are complete --bbf-* values; no raw OKLCH tuple var used as a CSS color.

## Route/content/SEO preservation
- Both routes keep their existing fixed locale, staticparams30each, parser acceptance of arbitrary
  numeric weights, invalid-slug notFound and noindex metadata behavior.
- Metadata values/keywords/canonicals/hreflang/OpenGraph preserved exactly; long descriptions only
  split via string concatenation for <=120 columns.
- Same BreadcrumbList, FAQPage, WebApplication schemas and names/descriptions/URLs/FAQ wording.
- Same plain localized calculator URL and selected bike guide URL, tracked CTA sections/labels/path.
  Destination does NOT implement route weight prefills: no fabricated query or prefill promise added.
- Same related-link registry entries and locale prefixing. Source slugs/sitemap remain unchanged.

## Verification
- Targeted Vitest:74/74 pass. Every one of60 generated route/locale combinations checks metadata,
  actual pressure-engine output in bar/PSI, assumptions, schema types/breadcrumb URLs/FAQ content,
  calculator/guide CTAs and related-link destinations. Also tests staticparams exact ordering,
  valid72kg outside staticlist, native FAQ disclosure, invalid-language/malformedslug404+noindex.
- Targeted ESLint on all route TS/TSX/copy files: passes.
- Prettier applied; all six files <=120 columns.
- Logs: `/private/tmp/bbf195b-pressure-tests.log`, `/private/tmp/bbf195b-pressure-lint.log`.
- Parent owns aggregate typecheck/build/unit/i18n/sitemap and1440/390 browser screenshot checks.


### Final19.5b validation

- Typecheck:PASS. Production build:PASS (230 generated pages).
- Full unit suite:PASS,220 files /1,139 tests, including all84 new legal/pressure assertions.
- i18n:PASS,30 tests. Sitemap validator:PASS against localhost3000, before and after the redesign.
- ESLint, runtime-boundary, tooltip and contrast checks:PASS;218 contrast pairs pass.
- Full `npm run lint` is NOT green: newly introduced `lint:css-modules` reports49 existing raw-color
  lines in `src/components/blog/blog.module.css`, `src/components/guides/Guides.module.css`, and
  `src/components/dashboard/DashboardBikeGarage.module.css`. Both19.5b CSS modules pass. Routed
  those findings to the lead; C has not edited another owner’s files to clear the gate.
- All15 owned source/test/data/style/copy files are formatted<=120 columns; no formatter added.
- Browser:19/19 actual localhost cases pass; no fixtures, horizontal overflow or runtime errors.
  Legal NL/EN full body/date equality, TOC targets/clicks and canonical/metadata checked. Pressure
  all3 bike types in both locales verify bar/PSI against the original engine, canonical/hreflang,
  BreadcrumbList+FAQPage+WebApplication, two FAQ entries and disclosure interaction. Valid77kg
  non-generated route stays200; malformed slugs in both languages return404. No routing tightening.
- Nine final1440/390 screenshots and three matching board copies: `code-renders/19-5b-*.png`.
  Machine-readable browser evidence: `audit/19-5b-browser.json`. Only the Next development badge
  was hidden during captures; existing production feedback button remains.
- Source `src/lib/seo/programmatic/tirePressure.ts`, engine, sitemap entries and shared layouts
  have zero batch diff. Metadata and existing legal clauses retained; no new legal advice authored.

Visual differences intentionally preserve source truth: Legal shows all original clauses rather than
board excerpts. Terms subscription wording still comes from the existing commercial helper even
where it differs from paused-upgrade messaging elsewhere; a content decision belongs to the lead.
Pressure shows the true source defaults and computed values, keeps the same plain calculator link,
and makes no unsupported promise to carry route weight into the calculator.

Exact lead commit inventory: `audit/files-19.5b.txt` (source plus evidence/handoff artifacts).
Validation logs: `/private/tmp/bbf195b-{types,unit,i18n,lint,build,sitemaps,render}.log`.
No commits; ready for lead diff review with the shared CSS-lint finding above.
