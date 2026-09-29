# 18 — Configurator pages

## Batch 1 (18.1) — implemented, awaiting lead approval

Scope: section 0 plus saddle-height, frame-size and crank-length only. Uncommitted. No batch 2/3 page work. Three subagents each owned a pilot page; parent integrated dictionaries, tools header, border fixes, mobile shell, validation and screenshots. Engine/adapters and `publicCalculatorLogic.ts` have no diff.

### Section 0 — border correction

- Audited `border`, `border-light`, `border-dark`, `dashboard-border-soft/strong` and all `panel-border*` aliases in both themes. Light decorative values already convert to **#DCE6E1**; dark values are muted green **#4A5F5A**, not ink. Panel/dashboard aliases resolve to these same palettes. The visible ink was invalid raw OKLCH channel tuples in shared component CSS, not a need to darken/lighten the palette again.
- Replaced invalid `border-[color:var(--border)]` declarations with semantic utilities across shared layout/public components; repaired header/footer surface and text utilities. Removed old invalid header/footer background gradients. Kept explicit ink `border-foreground` on outline buttons/login, which is intentional per brand rules, not decorative. Slider hover border now uses its semantic utility.
- Input outlines are separate: light `field-border`/`dashboard-field-border` use #4A5F5A; dark uses light petrol #77C7B3. Added actual normal field/background checks at 3:1 to the contrast script; decorative borders remain exempt. Public field wrappers use field-border rather than decorative border. **218/218 contrast checks pass.**
- Browser computed header and footer border is `oklch(0.915952 0.0126119 164.778)` (#DCE6E1) on every pilot page. Footer info box likewise uses semantic border, with original 80% opacity.

### Integration and behavior

- `ConfiguratorHeaderSwitch`: pilot routes only receive logo, full tools navigation, language switch and login. Marketing/later-batch routes retain existing header. Tools links use real localized routes and aria-current. Mobile uses contained horizontal scroll.
- `ConfiguratorLayout`: optional result bar is fixed at mobile bottom while editing, with reserved content padding. Feedback launcher moves above it on narrow screens.
- Removed duplicate slider label IDs; Base UI owns the generated label ID, covered by a uniqueness assertion and existing keyboard tests.
- Registered `saddleHeightCalculator`, `frameSizeCalculator`, `crankLengthCalculator` in both dictionaries. All new visible copy lives under `src/i18n/calculators/`; existing metadata and content translations retained.
- Mobile and desktop use no dropdowns or numeric text inputs. Example measurements are visibly distinguished from personal inputs. Exact adapter result values drive the UI; geometric SVG movement is illustrative only.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed, including 218 contrast checks.
- `npm run test:unit`: **171 files, 697 tests passed**. After the final shared label typing correction, the targeted slider/keyboard suites also passed (7 tests); production typecheck passed.
- `npm run test:i18n`: **6 files, 30 tests passed**.
- `npm run build`: passed. No invented secrets or engine modifications.
- Browser: six NL page/viewport combinations (1440 and 390) return HTTP200, exactly one question H1, valid localized canonicals, JSON-LD present, zero dropdowns/numeric text fields and zero horizontal overflow. Keyboard Home/End traverses real supported input ranges on each page and viewport. No browser runtime errors. EN saddle-height screenshot and translated question verified.
- Headless screenshot capture blocked external HTTPS analytics/backend requests for deterministic rendering; these calculators run locally and do not need a signed-in backend. No authentication, purchase or account save was performed.

### Visual review artifacts

In `../code-renders/`:

- `18-saddle-height-{desktop,mobile}.png`, `18-saddle-height-en-desktop.png`, `18-saddle-height-board.png`
- `18-frame-size-{desktop,mobile}.png`, `18-frame-size-board.png`
- `18-crank-length-{desktop,mobile}.png`, `18-crank-length-board.png`

Board PNGs copied from existing `drafts/_renders/` alongside page captures; drafts/canvas were not modified. Compared layouts and reviewed final renders. Corrected the crank tool's old narrow page wrapper and the dark frame-panel heading during visual review. Existing below-tool content remains and makes production pages longer than their canvas boards.


# Step 18.1 — Saddle height

Files: `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx`, `page.tsx`, the two existing tests, and new `src/i18n/calculators/saddleHeight.ts`.

## Board implementation

- Question-led ConfiguratorLayout, 540px input column plus large result column, responsive stack, fixed mobile result supplied through the shared layout. Shared route-aware tools header supplied by parent; no duplicated local tabbar.
- Numbered white input cards; inseam 55–105cm / 0.5cm, category and riding goal segments, flexibility/core sliders 1–5 / 1. Filled brand sliders and mono numbers with small units.
- Ink result panel, large lime height, actual safe starting band, lime illustration of the pedal stroke. SVG hip/knee/seat coordinates visibly follow the real calculated height; copy explicitly says no personal knee angle is measured or inferred.
- Measurement instructions, optional current-height comparison, status chip with text, actual signed target-minus-current difference, ordered adjustment advice, limitations, and useful CTA to the existing full bike-fit flow. Polite atomic screen-reader announcement for the main result.
- Source/confirmation cards retain example vs personal distinction: 84cm is explicitly an example until measured/estimated selected. Merely moving the slider does not assert it is measured. Actual confidence derives from the existing helper and requirements; measured default context is high, estimated is medium.
- Optional current measurement starts with a separately labeled 750mm example and requires its own confirmation. Its value remains unchanged through inseam/category/goal/refinement changes and when hiding/reopening comparison. No recommendation-dependent clamping.

## Engine and honest adaptations

- Calls unchanged `runSaddleHeightCalculation` directly; the existing baseline validator and confidence helper remain the only confidence logic. No adapter/engine changes or board arithmetic copied.
- Displays returned `height` and `range.min/max` exactly. No invented ±3mm tolerance, fixed knee angle, confidence percentage, or unsupported personalization.
- Optional current-height slider has a fixed **400–1100mm comparison-only UI range**, 1mm step. This is a UI range spanning all supported saddle guardrails, not a validation contract from the engine. The board's moving min/max include current ±40mm; fixed limits were chosen so the controls and current value never move when advice changes. Current measurement is not passed to the saddle engine.
- Board save-account action becomes a link to the real complete bike-fit flow; no false persistence. Copy explains that destination. Current comparison uses a white section for reliable slider contrast rather than embedding light-theme controls directly in the ink panel.
- Adjustment advice stays qualitative: small changes and test rides. No arbitrary exact adjustment count/amount presented as engine guidance.

## i18n / SEO

- `saddleHeightMessages.en/nl` exported, registered by parent as `saddleHeightCalculator` in root dictionaries. Page uses `getDictionary(locale)` and passes the copy to the client form. All newly written interface, help, error/example, CTA, illustration and status text comes from that dictionary. SI units remain standard; Dutch decimal comma/English decimal point via Intl.NumberFormat.
- Existing metadata/canonical alternates, WebApplication/HowTo JSON-LD, FAQ text, related links and campaign/next-step CTA logic preserved. Existing explanatory/trust sections moved below the interactive tool. Previous hero/rating presentation replaced by board question layout, keeping one H1.

## Tests

7 tests across the form and page suites pass. The form tests use the real adapter (no mock): example state, actual result/range after confirmation, source-dependent confidence, category/flexibility live recalculation and SVG change, native keyboard range endpoints, unchanged current measurement and correct delta through 55/105cm changes, Dutch formatting/copy and localized CTA. Page tests preserve EN CTA behavior, NL FAQs and locale canonical/metadata.

Typecheck and focused ESLint pass. Parent handles full-suite/build and desktop/mobile browser comparisons. No commits and no drafts/canvas/shared component changes.

## Batch 18.1 — Frame size

Owned files: `src/app/(public)/calculators/frame-size/{FrameSizeCalculatorForm.tsx,FrameSizeCalculatorForm.test.tsx,page.tsx,page.test.tsx}`, new `src/i18n/calculators/frameSize.ts`.

Implemented the approved FrameSize question heading/eyebrow, two-column input/result arrangement, four category option cards, height and inseam sliders, lime shortlist panel, discrete size scale, live proportions visual, dark next-step card, actual secondary saddle estimate, and mobile main-result summary through ConfiguratorLayout. Parent supplies the route-aware tools header and fixed mobile result behavior. Existing explanatory/trust sections, campaign/account CTA band, FAQs and related links now sit below the calculator. Metadata/canonicals/OpenGraph/JSON-LD remain unchanged. No engine/adapters/shared components changed.

Real domains: height 130–210 cm step 1; inseam 55–105 cm step 0.5; road/gravel/mtb/city. Values initialize as explicit examples (180/84). Both individual measurements must be moved or confirmed before copy says personal shortlist. Category selection alone does not confirm measurements. Initial example label also appears in the fixed summary.

Sizing calls the unchanged `runFrameSizeCalculation`. Scale bands are deduplicated real results obtained by enumerating the public height domain per category; there is no duplicated sizing threshold formula. Road/gravel render actual cm bands, MTB/city actual letter bands; no universal letters/inches, inferred adjacent-size certainty or invented confidence. Inseam does not change the frame band; its real separate effect on estimated saddle height is retained and explained.

The proportions graphic displays plain inseam/height arithmetic as a fraction of height with a moving marker; it is explicitly measurement context. Historical canvas three-zone/proportional-sizing implication omitted, since the engine offers no geometry decision from this ratio. Existing baseline validation produces localized unusual-proportion remeasurement messages, not a size adjustment. No invented confidence scores or claimed geometry database integration. Dark CTA links to actual full-fit calculator and stack/reach explainer routes. Old upper-page rating decoration removed; schema rating preserved with existing JSON-LD.

Dictionary: `frameSizeMessages.en/nl` registered by parent as root `frameSizeCalculator`; includes eyebrow/question/body guidance, all field/category labels and descriptions, confirmation/example states, result/scale/proportions context, units-independent guidance and CTA/sticky labels. Engine validation retains existing NL/EN localization. Page calls getDictionary and supplies copy to client form; form retains isNl fallback for compatibility.

Validation: targeted ESLint clean; 7 tests pass across form/page, testing NL/EN labels and explicit example confirmation, native slider keyboard Home/End/arrows and domain bounds, actual engine size selection/category scale counts, decimal comma, unchanged frame band when inseam changes, live real saddle estimate/ratio visual, warning state, preserved localized canonical metadata and existing next-step CTA destinations. Full typecheck at handoff had only the concurrently edited crank test's obsolete isNl prop, no frame errors. Parent runs full checks and captures desktop/mobile frame screenshots.

Visual QA follow-up: compared `18-frame-size-desktop.png` to `18-frame-size-board.png`. Fixed the dark next-step panel heading with explicit brand white text, since the global h2 rule overrode inherited color. Regression assertion added in both locale cases; seven targeted tests still pass. Main visual differences intentionally remain the split numbered input cards (explicit example confirmation), vertically stacked proportions/retained saddle estimate/next-step sections instead of the board's paired secondary panels, plain measurement-fraction visual rather than unsupported colored sizing zones, and white unselected tiles from the shared component. Parent refreshes screenshots after heading fix.

## Crank length — batch 18.1

Owned page/form/tests and new `src/i18n/calculators/crankLength.ts`. Root dictionary registration is handled by parent. New exported `crankLengthMessages` has NL/EN objects, exported `CrankLengthCopy`. Server page uses `getDictionary(locale).crankLengthCalculator`; form props `{locale,copy,initialInseamCm?,initialCategory}`.

Implemented board question header, numbered inseam slider and bike option cards, 540px desktop input column, lime result, live SVG crank geometry driven by the real result, discrete SizeScale generated from engine `CRANK_LENGTH_TABLE`, adjustment order and honest account continuation CTA; parent owns tools header and fixed mobile result shell. Label and live status identify real recommendation, with localized decimal comma. Default 84cm is explicitly marked Example starting point (Voorbeeldstartpunt), including mobile summary; only input adjustment or valid URL input switches to personal wording. Example provenance is estimated; valid/edited input measured. Invalid incoming inseam replaced with disclosed example, disappearing once edited.

Engine unchanged. `runCrankLengthCalculation` uses actual discrete thresholds and MTB correction. Inseam range55–105cm, step0.1 from audit/existing UI, intentionally differs from canvas0.5. SVG geometry is presentation only. Long-crank category warning still uses existing validator.

Not implemented: board step3 compare-current, neighboring outlined borderline recommendation, automatic replacement/difference advice or saved-calculator promise. Engine does not return those recommendations and app does not persist this calculator output. Account CTA says build rider profile and links to localized login. Existing explanatory guidance, FAQ answers, related links, campaign-aware fit/pricing CTAs, metadata/canonical/JSON-LD are preserved; visible rating/social proof removed from above tool, existing structured schema retained as instructed. Inline preexisting metadata copy remains unchanged; all newly authored visible copy is dictionary-backed.

Tests: 5 cases in 2 suites pass. Real-engine live transition81.9→82cm changes170→172.5mm and SVG geometry; keyboard Home/End respect bounds165/177.5; category90cm road175→MTB172.5; current scale, button pressed semantics, mobile anchor value, invalid URL example and personal wording transition; page canonical/Dutch FAQ and original CTA behavior. Focused ESLint passes; full repo typecheck passed before final copy-only/label changes (parent final verification).

No commits; no other pages, engine, shared components or canvas/drafts modified.


## New dictionary keys

Each namespace below is present in both `en` and `nl`; nested category/goal/step/FAQ keys are defined in its module.


- saddleHeightCalculator: eyebrow, title, description, bodyTitle, contextTitle, inseam, inseamHint, sourceLabel, measured, measuredHint, estimated, estimatedHint, example, exampleHint, measuredStatus, estimatedStatus, category, categories, goal, goals, flexibility, flexibilityHint, flexibilityLevels, core, coreHint, coreLevels, measuringTitle, measuringSteps, result, exampleResult, reference, band, bandHint, confidence, confidenceLevels, confidenceHint, visualTitle, visualAlt, visualDisclaimer, compareTitle, compareToggle, compareHide, current, currentHint, currentExample, currentConfirm, currentConfirmed, delta, raise, lower, equal, inside, below, above, comparePending, orderTitle, orderSteps, limitsTitle, drivers, limits, accountCta, accountHint, stickyLink

- frameSizeCalculator: eyebrow, title, description, body, bike, height, inseam, heightHint, inseamHint, confirmHeight, confirmInseam, confirmed, example, exampleResult, shortlist, scale, recommended, limit, proportions, ratio, ratioHint, low, high, measurementCheck, saddle, saddleHint, nextTitle, nextBody, startFit, geometry, resultLink, categories

- crankLengthCalculator: eyebrow, title, intro, measure, inseam, measureHint, choose, category, categories, categoryHint, result, exampleResult, personalIntro, recommendation, resultHint, visual, sizes, recommended, adjustment, steps, scope, scopeText, guidance, guidancePoints, next, nextTitle, nextText, start, pricing, save, saveHint, aside, faqTitle, faqs, related, trustTitle, trustText, trust, invalid, warning


## Remaining gates

Batch 2 is not started. Wait for lead approval of 18.1 before proceeding.

## Batch 18.3 — active; shared integration request

Codex D owns only the five batch-3 calculator routes, performance.ts/tests, and matching calculator dictionaries.
No shared UI, globals, or Header/Footer edits by D; no commit.

Request to layout owner: register `/calculators/gearing` as `gearing`, and `/calculators/power-speed`,
`/calculators/climb-planner`, `/calculators/ftp-wkg`, `/calculators/fuel-hydration` as `more` in
`src/components/layout/ConfiguratorHeaderSwitch.tsx`. These pages reuse ConfiguratorLayout and the four extra
pages supply MoreToolsNav. This enables the approved tools header without duplicating it inside page content.
