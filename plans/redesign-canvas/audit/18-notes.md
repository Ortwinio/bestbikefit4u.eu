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

18.1 approved and committed as `2dccd9b`. Batch2 implementation below; batch3 awaits lead approval.

## Batch 18.3 — active; shared integration request

Codex D owns only the five batch-3 calculator routes, performance.ts/tests, and matching calculator dictionaries.
No shared UI, globals, or Header/Footer edits by D; no commit.

Request to layout owner: register `/calculators/gearing` as `gearing`, and `/calculators/power-speed`,
`/calculators/climb-planner`, `/calculators/ftp-wkg`, `/calculators/fuel-hydration` as `more` in
`src/components/layout/ConfiguratorHeaderSwitch.tsx`. These pages reuse ConfiguratorLayout and the four extra
pages supply MoreToolsNav. This enables the approved tools header without duplicating it inside page content.


## Batch18.2 — shared changes and lead fixes

Batch2 uses the approved configurator header on both pressure aliases and all three discipline routes, plus saddle-width and bike-fit. Header tests cover every route and preserve the marketing fallback for later batches. Calculator engines remain unchanged.

Reformatted batch1 and all batch2 touched code with the already-installed Prettier (no dependency changes), wrapping long copy and utility strings without changing their content. Named two existing public panel gradients in globals.css to keep full Tailwind utility tokens intact while meeting the120-column limit. AST review confirmed formatting-only string content and utility boundaries. Concurrent header/footer marketing edits are owned by their separate agent.

Mobile feedback is hidden below the xl breakpoint whenever ConfiguratorLayout renders its sticky result. Desktop feedback and mobile pages without a result retain the launcher. Added an opt-in local Playwright regression at tests/e2e/configurator-mobile.e2e.test.ts covering390/768/1440px, visibility, bar bounds and horizontal overflow across pilot/new calculators, plus the pricing-page control.

## Batch 18.2 — Saddle width

Owned paths: saddle-width page/form and their two test files; new `src/i18n/calculators/saddleWidth.ts`. Root dictionary registration `saddleWidthCalculator` owned by parent. All touched TSX/dictionary files formatted with installed Prettier, printWidth120; long copy/class/path expressions split without changing text.

Board elements: question heading, measured/estimated segmented paths, numbered input cards, seven riding-type option cards, posture segments, lime main result and true ±5mm test window, live schematic saddle/contact-spacing SVG, discrete width-class scale, measurement provenance, real confidence level, actual suitability family/shape details, ordered adjustment steps, account next step, fixed mobile main result via shared ConfiguratorLayout. Parent supplies tools header, so no duplicate nav. FAQs, trust/explanation blocks, related links and campaign CTA remain below calculator. Existing canonical, metadata, WebApplication and HowTo JSON-LD retained.

Source: unchanged calculateSaddleWidth/classifySaddleSuitability from `src/lib/saddle-width-engine`. Sit-bone 60–200mm, hip70–160cm from engine config; height140–220cm and weight40–150kg preserve actual public-page domains (engine only requires finite height/weight). All numeric steps1. Width classes use WIDTH_BINS, including actual adjacent-class results. Final width is never clamped to class range: if below125 or above190mm the UI explicitly says outside shown classes, removes active/adjacent styling, and keeps the actual width/test window. Shape/profile/padding labels translate actual suitability enums. No copied canvas formulas, invented confidence/measurements or geometry assurances.

Example/provenance: defaults125mm,180cm,75kg,100cm are visibly examples. Measured mode becomes personal only on sit-bone movement/confirmation; estimated mode requires each of height/weight/hip changed or a deliberate confirmation of the visible measurements. Mode changes never pass inactive measured/body data to the engine or persistence. Category/posture alone cannot confirm example measurements. Confidence is actual engine level; example context explicitly says it is not yet the user's measured confidence. Estimated sit-bone range is shown separately from the saddle-width test window.

Persistence: existing debounced createPublicSaddleWidthSession retained, but examples are never automatically saved. Full payload signature includes all active inputs (so differing measurements with the same recommendation are not accidentally deduplicated). Success alone records signature; rejections caught and localized notice shown. UI calculations stay available if save fails. Engine extreme values can lie outside backend persistence validation (e.g.60mm/TT aggressive final67mm vs backend minimum70); surfaced save failure is honest, backend/engine untouched.

Deviations: board saddle drawing is explicitly schematic, changing outline width/contact markers only, not pretending to identify a saddle model. Classes are white/ink from shared SizeScale, ranges shown below from actual bins. Public board/form have no advanced symptom/setup inputs; those remain in the account saddle selector, with accurate account CTA. Home-measurement help is an accessible details block. Account CTA says continue rather than claiming authentication automatically transfers a saved result. Anonymous session persistence is not represented as account save.

I18n module covers all new copy: heading/input/provenance/example states, measurement instructions, riding/posture labels, exact-engine confidence/family/nose/profile/padding enum labels, outside-class guidance, visual label, next steps, account/sticky text and save failure. Existing legacy inline SEO/FAQ prose remains unchanged.

Validation:8 targeted tests pass across form+page: NL/EN example/provenance labels, no spinbuttons/selects, keyboard updates/endpoints, real engine recommendation and live diagram, measured vs estimated payload omission, all estimated fields confirmed before saving, no example persistence, outside-bin recommendation handling, category/posture changes, metadata canonicals and retained CTA links. Targeted ESLint clean. Typecheck before parent registration only reported missing saddleWidthCalculator/tirePressureCalculator root keys; parent runs full validation/render comparison.


# Batch 18.2 — Bike-fit calculator

## Files and implementation

- Rebuilt `src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.tsx` with shared ConfiguratorLayout, StepCard, Slider, SegmentedControl, OptionCard/RadioGroup, ResultTile, StatusChip and AdjustOrder.
- New local `BikeFitVisual.tsx` draws the lime bike panel with actual height/reach/drop labels. The saddle and cockpit coordinates react to adapter measurements; signed drop changes handlebar elevation in the correct direction. Marked explicitly illustrative/not to scale. SVG labels stay inside the viewBox at supported input extremes.
- Updated page layout puts the interactive two-column tool first, retaining breadcrumbs, existing explanatory/trust blocks, FAQs, related links, campaign/account CTA behavior and all metadata/canonical/JSON-LD construction below/around it. One H1 from ConfiguratorLayout. Parent supplies tools header and fixed mobile result summary behavior.
- New `src/i18n/calculators/bikeFit.ts`: `bikeFitMessages.en/nl`, `BikeFitMessages` type. Parent registered root `bikeFitCalculator`; server page calls getDictionary and passes copy. Every newly written UI/help/warning/CTA string comes from this dictionary; localized number formatting and standard units. Existing copy in the preserved page sections is unchanged.

## Real engine / board corrections

- Existing `runBikeFitCalculation` adapter and all engine files remain untouched. All numeric outputs use its real return values; no temporary canvas fit or confidence formulas copied.
- Height now **130–210cm, step1**, correcting the old frontend's 140–220 mismatch. Inseam **55–105cm, step0.5**. Flexibility/core **1–5, step1**. Four real category and goal enums preserved.
- Initial 180/84 values are explicitly **example**. Source selector offers example/measured/estimated; moving sliders does not silently claim measurement confirmation. Confidence uses existing public baseline/requirements/validation helper, never click counts or invented percentages. Estimated source can still be high with complete context under the actual helper; this is not overridden.
- Real saddle guardrail and reach range are shown. Negative city/MTB drop is preserved in the tile, direction label and SVG marker. Frame shortlist uses actual quick-estimate cm bands for road/gravel and letter bands for city/MTB; no invented single size. Centimetre units render small beside the numeric band.
- Actual frame stack/reach targets retained. Setback now shown as an exact behind-bottom-bracket target, without ±. Aero on MTB/city is disclosed as the effective performance setting.
- Actual engine warning types map to translated rider-facing messages; unusual height/inseam ratios, saddle warnings, reach, flexibility and core cautions remain visible for confirmed inputs. Raw English engine messages and internal jargon are not surfaced.
- Board adjustment sequence stays qualitative and explicitly identifies the public-preview scope; copy explains full account flow includes cleats/current setup. No promised save: CTA goes to real /login, stating these calculator values are not saved automatically.
- No new unsupported advanced fields (torso/arm/foot/etc.) or engine inputs added. No current-bike inputs existed here; entered body measures remain unchanged as other controls move.

## Validation and formatting

10 tests pass across the updated real-engine form and existing page suites. Tests cover:
- honest example/confirmation and accessible sliders/choices;
- actual adapter outputs after decimal input;
- signed city drop and upward cockpit geometry, actual frame band and aero disclosure;
- both full height/inseam endpoints and preservation of the other measurement;
- actual range/frame-target/warning/confidence values and core refinement;
- Dutch comma/translated warnings/localized truthful account handoff;
- locale metadata/canonical/FAQ preservation and both active/inactive campaign CTAs.

Focused ESLint passes. Final typecheck passes; rerun output is `/private/tmp/bbf182-bikefit-types.log`. All six touched files formatted with existing Prettier at print-width120; audited every line and no line exceeds120. Long preserved page-copy literals were split by concatenation without changing their rendered text.

No commits; no shared component, engine, draft or canvas edits. Parent handles full gates and browser screenshots/board comparison.


## Tire pressure public family — 18.2

Rebuilt `PressureCalculatorForm` (public only; dashboard wizard/result components untouched) and main public content plus three discipline landing pages. Existing form API retains locale/defaultDiscipline/labels/resultLabels, adds optional `copy: TirePressureCopy`; dictionary fallback preserves standalone callers. `tirePressureMessages` NL/EN export is registered by parent under tirePressureCalculator. All authored strings use dictionary; existing pressure form/result dictionary warnings remain intact.

Board components: question heading, numbered steps, body/width/bike-weight sliders, discipline/tube/surface/goal option cards, explicit linking/unlinking for widths, advanced disclosure aria-expanded/controls, front/rear lime results with localized bar and actual returned PSI, two real-pressure gauges, warning panel, adjustment list, account continuation, fixed-mobile two-number summary via ConfiguratorLayout. No nested legacy max-width shell; tool gets 1440 canvas width/64px margins. Parent provides shared tools navigation. Defaults are clearly labeled examples until interaction.

Real engine remains `calculateBasicPressure`, validated with `validatePressureInput`; no copied canvas formulas or engine edits. Gauge domains reflect road4–9,gravel1.5–5,MTB0.8–3.5 clamps and explicitly state these are NOT equipment safety limits. All returned warning keys resolve through original localized warningMessages. Tire/rim maximum warning prominent (lowest manufacturer maximum wins). Front/rear output and rounding are the real engine. Public widths18–80mm step1, rider35–160kg step1, optional bike3–20kg step0.1. Rear follows front until manually adjusted, explicit button restores linking. Goal remains optional/unset; closing advanced removes bike weight but preserves chosen riding goal, matching existing behavior.

Discipline landing defaults preserved exactly (road/gravel/mtb only; original28mm/asphalt example retained, never silently substitute widths or surface on discipline change). Existing route redirects, metadata/canonical/JSON-LD, FAQ text, campaign CTA and related links preserved. Existing public pages never had saved session/preset state; account state/persistence untouched.

Deliberate board exclusions per lead scope: basic public form does not expose luggage/wet/casing/rim widths/max equipment inputs (those are account advanced contract). Explicit omitted-factors copy and account CTA remain; no invented safety margins, contribution percentages or confidence scores. Removed older above-tool marketing hero/rating; retained underlying requested JSON-LD. Board account warning placeholder replaced by actual basic engine warnings and clear equipment note.

Verification:8 tests in2 suites pass. Real input/output comparison, keyboard bounds/live meters, linked→independent→relinked widths, all3 discipline defaults/warnings/gauge domains, optional goal/bike weights and collapse semantics, English route CTA and canonical alias redirect. Focused ESLint passes. All touched code formatted with installed Prettier print-width110; long authored copy split with concatenation. Full typecheck initially blocked by pending dictionary registration and unrelated dashboard agent file, parent handles aggregate validation. No commits/drafts edits.



## Batch18.2 dictionary keys

- `saddleWidthCalculator`: eyebrow, title, description, measurements, riding, posture, method, measured, estimated, sitBone, height, weight, hip, sitBoneHint, heightHint, weightHint, hipHint, example, confirm, confirmed, exampleResult, result, range, view, measureHelp, measureSteps, measuredSource, estimatedSource, measuredTrust, estimatedTrust, exampleTrust, confidence, confidenceLevels, scale, recommended, alternate, outside, diagram, diagramNote, family, families, shape, nose, profiles, cutout, fullShell, padding, order, steps, account, accountNote, saveFailed, rides, postures. Nested localized options, messages and steps live in the corresponding module.

- `bikeFitCalculator`: eyebrow, title, description, bodyTitle, ridingTitle, height, heightHint, inseam, inseamHint, measureLink, source, sources, exampleNote, measuredNote, estimatedNote, category, categories, goal, goals, goalHints, aeroAdjusted, flexibility, flexibilityHint, flexibilityLevels, core, coreHint, coreLevels, example, resultTitle, visualHint, visualAlt, resultsLabel, confidenceLabel, confidence, saddle, saddleReference, saddleBand, reach, reachReference, reachBand, drop, barsAbove, barsBelow, barsLevel, frameSize, frameHint, frameTargets, stack, frameReach, targetsHint, setback, setbackReference, orderTitle, orderHeight, orderHeightHint, orderSetback, orderSetbackHint, orderBars, orderBarsHint, warningsTitle, warnings, limitsTitle, limits, accountCta, accountHint, stickyLink. Nested localized options, messages and steps live in the corresponding module.

- `tirePressureCalculator`: eyebrow, title, intro, body, tires, route, example, result, linked, advanced, unset, limit, excluded, adjustment, steps, save, saveText, warning, error, summary, related, gauge, scope, scale, preset. Nested localized options, messages and steps live in the corresponding module.


## Batch18.2 final validation and review handoff

- 58 targeted calculator/layout tests pass (14 files), including both batches and header aliases.
- Local browser regression:5/5 pass at390/768/1440px. Feedback hides only with the mobile result;
  ordinary mobile pages and desktop retain it. The regression also caught saddle-width method
  labels overflowing; bounded wrapping segments fix document width451→390px.
- i18n:30/30 tests pass. Contrast:218/218 checks pass. Runtime boundary check passes.
- Focused ESLint on the touched batch1/batch2 file inventory passes; diff whitespace check passes.
- Captures:all7 NL routes at1440/390 plus EN bike-fit desktop, with matching board copies.
  All final routes return200, have no horizontal overflow, retain canonical/JSON-LD, and pass
  keyboard Home/End bounds. No browser page errors. NL tire-pressure alias correctly resolves
  to the canonical bandenspanning-calculator. Development badge hidden only for captures.
- Engine implementation files unchanged by C. No commits. Batch3 not started by C.

Full shared-repository gates are NOT all green because parallel app work continued during QA.
Latest full unit run:804 pass,2 fail (homepage donation-copy assertions). Production compilation
passes but typecheck fails in concurrently added power-speed/PerformanceCalculator.tsx importing
an unexported MoreTool type. Full lint fails in account-batch1/runtime.jsx (hook naming); tooltip
coverage separately flags the concurrent home/SaddleHeightTeaser.tsx. These are outside batch2,
recorded for the lead in messages/20260929-2125-codex-c-to-lead-batch2-validation.md. Earlier shared
pricing missing CSS and dashboard mocks have resolved. Do not interpret DONE18.2 as a green
whole-repository gate; the lead must rerun those gates after parallel owners finish.

Visual review:calculator layouts and signed/real engine values reviewed against boards by page
owners. Pressure deliberately combines front/rear lime results and uses actual gauge bounds;
bike-fit uses2×2 result tiles and retains frame targets; saddle-width includes actual confidence,
suitability and range caveats. Shared concurrently rewritten Footer headings still inherit dark
heading color on ink; reported to its owner/lead, not overwritten here.

18.3 shared gate observation (21:30): own focused suites pass (18 tests), dictionary parity passes,
and all owned edited/new files have lines <=120. Full unit run: 835 passed, one failure in
`src/components/home/SaddleHeightTeaser.test.tsx` (missing named status `Startpunt voor je zadel`).
Request to Codex A: fix the home teaser regression. Full typecheck raced concurrent `.next/types`
regeneration (TS6053); D will retry after builds settle. No out-of-scope changes by D.

## Batch 18.3 — implementation and validation

Owner: Codex D; no commits. Code edits confined to the five specified calculator route directories,
`src/lib/public-calculators/performance.ts` and its test, plus matching
`src/i18n/calculators/{performance,gearing}.ts`. Shared UI, engines, globals and Header/Footer untouched by D.
The four new tools import one client form from the owned power-speed directory; no new shared-UI API needed.

### Per-page implementation and engine differences

- **Gearing / Gearing board:** question heading, numbered input cards, full public-domain sliders,
  drivetrain/cassette/wheel/bike/climb option cards, live chainring illustration, lime easiest ratio,
  real easiest/hardest pairs, development, speed, gear span, verdict and explanation, mobile result link.
  Existing public calculation/validation and automatic Convex session-saving behavior retained.
  Existing public adapter returns endpoint metrics, not a complete cassette tooth sequence; no invented
  intermediate cog table, target cadence or personal power verdict is shown. Original engine files have no diff.
  Invalid chainring/cog ordering clears the result and exposes the real validation messages.
  Manual cassette/wheel edits select the custom option; selecting custom preserves entered measurements.
- **Power ↔ speed / PowerSpeed board:** both input modes, mass/gradient sliders, bike and surface cards,
  engine-derived bike defaults, live speed gauge, power split, total-mass/speed tiles, ordered guidance
  and mobile main result.
  `calculateClimbPowerWatts` and `solveSpeedForPowerWatts` drive outputs directly. Decomposition calls the
  same power helper with zero CdA/Crr so constants and drivetrain loss stay consistent; no board arithmetic copied.
  Solver saturation is explicitly flagged, never presented as an exact speed prediction. No wind input is invented.
- **Climb planner / ClimbPlanner board:** distance/gradient/FTP/mass/bike inputs, dynamic slope profile,
  estimated time/speed/target power, real gearing link and mobile time result. Uses engine bike/CdA/Crr defaults,
  the existing <3/<8/<20/else length bands and duration multipliers 1.1/1/0.9/0.82, capped at 1.1 FTP.
  Time comes from the physics solver rather than a simplified board formula. No unsupported personal readiness score.
- **FTP W/kg / FtpWkg board:** known FTP, twenty-minute and ramp modes, distinct retained slider values,
  body mass, FTP/Wkg outputs, flat speed and the documented 5km/7% reference climb at FTP, mobile W/kg result.
  Proposed 0.95/0.75 conversion factors are named constants; reference bike/road/no-wind context is visible.
  No unverified athlete-level ranking or colored performance-category gauge is invented.
- **Fuel & hydration / FuelHydration board:** duration/intensity/temperature/sweat controls,
  ride-progress timeline and explicit `Advies volgt` / `Advice to follow` result, mobile duration summary.
  The source page contains no quantitative intake guidance. No grams, millilitres, bottle quantities,
  eating/drinking frequency or sodium recommendation is generated. Timeline labels mean start/halfway/finish,
  not recommended intake intervals. A numeric inventory input is omitted until intake guidance has a source.

### Contracts, copy and SEO

- `PROPOSED_RANGES` holds every new numeric input domain/default/step, explicitly marked awaiting approval
  per `05-new-tool-contracts.md`. FTP conversion factors are separately named `PROPOSED_FTP_FACTORS`.
  Runtime validation rejects non-finite/out-of-range values; the shared solver's 0.36–54km/h domain is explicit.
- New visible copy is in the directly loaded NL/EN calculator dictionaries. This avoids concurrent edits to
  the root message dictionaries. Dedicated recursive key-parity tests cover both new modules.
  Namespaces: performance titles, inputs, bikes/surfaces/modes/methods, estimates, physics caveats, pending advice,
  intensity/sweat, timeline and next-step labels; gearing inputs/presets/context, results/verdicts and caveats.
  Numbers use Intl.NumberFormat for locale-appropriate decimals and units; sliders have aria-valuetext.
- Original metadata, canonical alternates, OpenGraph, WebApplication/HowTo/FAQ JSON-LD and FAQ content retained.
  Existing below-tool explanation, FAQ and related-link sections remain. Old hero wrappers/rating decorations
  above the tools are replaced by the question layout, with a single H1. Removed narrow PublicPageShell wrapper
  so ConfiguratorLayout supplies the actual 16px mobile / 64px desktop margins.
- No checkout, account-save promise or new persistence introduced for the four new tools.

### QA status

- Focused new/updated tests: 27 passing across five suites (physics, performance interaction, gearing interaction,
  gearing page, and eight NL/EN SEO page cases). Real physics and public gearing engines are used in the form tests;
  only the existing Convex save mutation and async server JSON-LD wrapper are mocked.
- Full lint passes, including 218/218 contrast checks. i18n passes (30 tests). Full typecheck passes after
  generated .next types stabilized. Final production build passes (network-enabled font fetch; concurrent build lock cleared first).
- Final full unit run: 188 files / 845 tests PASS; the concurrent home-teaser failure is resolved.
  An additional public high-power saturation regression then passed in the focused performance suite (7/7).
- Desktop1440/mobile390 browser checks pass for all five pages: HTTP200, single translated H1, localized canonical,
  JSON-LD, no select/number inputs, no horizontal overflow, keyboard Home/End reaches supported bounds,
  aria-valuetext includes units, no page runtime errors. External backend/analytics traffic blocked during QA.
- Required page captures and comparison boards: `code-renders/18-{gearing,power-speed,climb-planner,ftp-wkg,
  fuel-hydration}-{desktop,mobile,board}.png`; EN power-speed capture also supplied. Additional mobile viewport
  captures prove the fixed result summary. Development overlay hidden only in screenshot harness.
- Every edited/new owned TypeScript/TSX line <=120 characters; git diff whitespace check clean.
- Shared tools-header registration is still requested above; D has not edited the layout owner's files.
  Current screenshots therefore include the existing marketing header; the four extra pages already have
  their MoreToolsNav row. The owner can enable the common tools header through the five route mappings.


### Final visual adaptations

The approved board comparisons are alongside the application PNGs. The production pages retain their existing
below-tool content, so they are longer than the design boards. Option cards wrap into two columns on small
screens; the power split uses a readable value list under its bar. The board's arbitrary ±5W sensitivity band
is omitted because the helper returns a point estimate, not an uncertainty interval. Gauge scale is the actual
solver speed domain. Account-save CTAs for new tools are replaced by working related-tool links; these tools
have no persistence API. Fuel intake inventory and athlete rankings remain explicitly unavailable.

Validation commands: `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:i18n`,
`npm run build`. Required gates pass as detailed above. No commits by D; ready for lead review of batch18.3.

## Checkpoint b40d638 — ownership and dictionary freeze follow-up

Read the new “Code phase: ownership & commits” rules. Continue from the integration checkpoint;
no checkpoint work reverted and no new commits made. C retains batch2 calculators, shared UI and
`globals.css`. Marketing layout files belong to A; later configurators belong to D. Any further
calculator header request will be recorded here for lead routing.

All NEW18.2 strings already reside in `src/i18n/calculators/bikeFit.ts`, `saddleWidth.ts`, and
`tirePressure.ts`. The frozen root dictionaries contain only the existing module registrations
plus formatting of older copy. A semantic comparison of both root dictionaries against2dccd9b
confirmed that the only value additions are `bikeFitCalculator`, `saddleWidthCalculator`, and
`tirePressureCalculator`; all preexisting values are unchanged. No string migration or root edit
is needed. No new root registration is requested. Future registrations are lead-owned.

### Files changed after b40d638 by this follow-up

- `plans/redesign-canvas/audit/18-notes.md`

### Historical18.2 implementation inventory, already included in b40d638

This is the batch2/formatting inventory for review, not a request to recommit checkpoint files.
Some previously shared files are now owned by another agent; this inventory grants no further
write ownership. The marketing Header/Footer/HeaderMobileMenu and frozen roots are intentionally
excluded from C’s future commit list. Their pre-freeze work is already integrated.

- `src/app/(public)/bandenspanning-calculator/PressureCalculatorPageContent.tsx`
- `src/app/(public)/bandenspanning-calculator/page.test.tsx`
- `src/app/(public)/bandenspanning/gravelbike/page.tsx`
- `src/app/(public)/bandenspanning/mtb/page.tsx`
- `src/app/(public)/bandenspanning/racefiets/page.tsx`
- `src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.test.tsx`
- `src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.tsx`
- `src/app/(public)/calculators/bike-fit/BikeFitVisual.tsx`
- `src/app/(public)/calculators/bike-fit/page.test.tsx`
- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.test.tsx`
- `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.tsx`
- `src/app/(public)/calculators/crank-length/page.test.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.test.tsx`
- `src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.tsx`
- `src/app/(public)/calculators/frame-size/page.test.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.test.tsx`
- `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx`
- `src/app/(public)/calculators/saddle-height/page.test.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.test.tsx`
- `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx`
- `src/app/(public)/calculators/saddle-width/page.test.tsx`
- `src/app/(public)/calculators/saddle-width/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/globals.css`
- `src/components/features/pressure/PressureCalculatorForm.test.tsx`
- `src/components/features/pressure/PressureCalculatorForm.tsx`
- `src/components/feedback/FeedbackFloatingButton.test.tsx`
- `src/components/feedback/FeedbackFloatingButton.tsx`
- `src/components/layout/ConfiguratorHeaderSwitch.test.tsx`
- `src/components/layout/ConfiguratorHeaderSwitch.tsx`
- `src/components/layout/LanguageSwitch.tsx`
- `src/components/prototyper-ui/ui/slider.tsx`
- `src/components/public/BikeQuickCheckCard.tsx`
- `src/components/public/GuideLinkButton.tsx`
- `src/components/public/PublicFormFields.tsx`
- `src/components/public/PublicIconBadge.tsx`
- `src/components/public/PublicIllustrationPanel.tsx`
- `src/components/public/PublicInfoPanel.tsx`
- `src/components/public/PublicMetricPanel.tsx`
- `src/components/public/PublicPrimitives.tsx`
- `src/components/ui/ConfiguratorLayout.test.tsx`
- `src/components/ui/ConfiguratorLayout.tsx`
- `src/components/ui/Slider.test.tsx`
- `src/components/ui/Slider.tsx`
- `src/i18n/calculators/bikeFit.ts`
- `src/i18n/calculators/crankLength.ts`
- `src/i18n/calculators/frameSize.ts`
- `src/i18n/calculators/performance.ts`
- `src/i18n/calculators/saddleHeight.ts`
- `src/i18n/calculators/saddleWidth.ts`
- `src/i18n/calculators/tirePressure.ts`
- `tests/e2e/configurator-mobile.e2e.test.ts`

Batch2 capture artifacts already integrated:

- `plans/redesign-canvas/code-renders/18-bandenspanning-calculator-board.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-calculator-desktop.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-calculator-mobile.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-gravelbike-board.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-gravelbike-desktop.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-gravelbike-mobile.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-mtb-board.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-mtb-desktop.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-mtb-mobile.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-racefiets-board.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-racefiets-desktop.png`
- `plans/redesign-canvas/code-renders/18-bandenspanning-racefiets-mobile.png`
- `plans/redesign-canvas/code-renders/18-bike-fit-board.png`
- `plans/redesign-canvas/code-renders/18-bike-fit-desktop.png`
- `plans/redesign-canvas/code-renders/18-bike-fit-en-desktop.png`
- `plans/redesign-canvas/code-renders/18-bike-fit-mobile.png`
- `plans/redesign-canvas/code-renders/18-saddle-width-board.png`
- `plans/redesign-canvas/code-renders/18-saddle-width-desktop.png`
- `plans/redesign-canvas/code-renders/18-saddle-width-mobile.png`
- `plans/redesign-canvas/code-renders/18-tire-pressure-calculator-board.png`
- `plans/redesign-canvas/code-renders/18-tire-pressure-calculator-desktop.png`
- `plans/redesign-canvas/code-renders/18-tire-pressure-calculator-mobile.png`


## Lead approval and warning dedupe follow-up

18.2 approved in checkpoint b40d638. During20.4, removed the redundant tire/rim-maximum disclaimer
paragraph from the public PressureCalculatorForm; detailed static equipment guidance and all engine
warnings remain. Regression checks the single guidance paragraph and retains a real MTB width
warning. Exact files:src/components/features/pressure/PressureCalculatorForm.tsx and its.test.tsx.
Frozen dictionaries and marketing layout untouched by this follow-up.
