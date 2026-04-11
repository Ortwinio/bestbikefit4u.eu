# Saddle Width Calculator Test Plan

## Goal

Define the acceptance, validation, and test coverage required to ship the saddle width calculator across:
- pure calculation engine
- public marketing calculator
- dashboard saddle selector
- SEO and navigation
- Convex data model and auth boundaries

This plan is the implementation gate for task 027. The feature is not complete until every validation contract in this file has a matching automated test, browser/UAT check, or schema verification.

## Success Criteria

- The width engine returns the exact expected outputs for all 10 canonical engine cases.
- Boundary handling is explicit for measured and estimated paths.
- Confidence logic is deterministic and matches the documented high/medium/lower bands.
- Public and dashboard calculators follow the documented mode, prefill, gating, collapse, save, and result-display behavior.
- EN/NL copy, SEO metadata, JSON-LD, footer/homepage navigation, and sitemap entries are correct.
- Convex schema and mutations enforce the documented auth and ownership rules.
- `npx tsc --noEmit` passes with zero errors.

## Test Levels

- Unit tests: pure engine functions, route registry helpers, metadata builders, schema helper guards.
- Component tests: public form, dashboard form, result cards, CTA switching, locale strings, save triggers.
- Integration tests: page-level public and dashboard route behavior with mocked Convex/profile/bike data.
- Browser/UAT checks: mobile 375px, collapse/expand interactions, locale switching, overflow, analytics firing once per unique result.
- Static validation: sitemap output, footer/homepage link presence, schema fields, auth enforcement.

## 1. Calculation Engine Tests

### 1.1 Canonical Engine Cases

Each case should assert:
- `resolvedSitBoneWidthMm`
- `targetSupportWidthMm`
- `adjustedWidthMm`
- `finalRecommendedWidthMm`
- `widthRangeMinMm`
- `widthRangeMaxMm`
- `primaryWidthClass`
- `confidenceLevel`
- symptom dominance and width-match assessment when applicable

| ID | Scenario | Input | Expected Output |
|---|---|---|---|
| E01 | Measured path, balanced endurance road | `sitBoneWidthMm=130`, `inputMethod=measured`, `postureCategory=balanced`, `ridingType=endurance_road` | `resolved=130`, `target=150`, `adjusted=152`, `final=152`, `range=147-157`, `class=M`, `confidence=high` |
| E02 | Measured path, aggressive TT | `sitBoneWidthMm=130`, `inputMethod=measured`, `postureCategory=aggressive`, `ridingType=tt_triathlon` | `resolved=130`, `target=140`, `adjusted=137`, `final=137`, `range=132-142`, `class=S`, `confidence=high` |
| E03 | Estimated path, mid-range body data | `heightCm=172`, `weightKg=72`, `hipCircumferenceCm=105`, `inputMethod=estimated`, `postureCategory=balanced`, `ridingType=endurance_road` | estimator returns `resolved=130`, `estimatedRange=120-140`, `target=150`, `adjusted=152`, `final=152`, `class=M`, `confidence=lower` |
| E04 | Upright commuter measured path | `sitBoneWidthMm=120`, `inputMethod=measured`, `postureCategory=upright`, `ridingType=commuter_leisure` | `resolved=120`, `target=150`, `adjusted=156`, `final=156`, `range=151-161`, `class=L`, `confidence=high` |
| E05 | Widen symptoms | `E01` plus `symptoms.numbness=true` | symptom classification `dominant=widen`, `delta=+6`, `final=158`, `range=153-163`, `class=L` |
| E06 | Narrow symptoms | `E01` plus `symptoms.chafing=true` | symptom classification `dominant=narrow`, `delta=-6`, `final=146`, `range=141-151`, `class=M` |
| E07 | Conflicting symptoms | `E01` plus `symptoms.numbness=true`, `symptoms.chafing=true` | symptom classification `dominant=conflicting`, `delta=0`, `final=152`, confidence deduction for conflicting symptoms applied, suitability warning `conflicting_symptoms` generated |
| E08 | Width match too narrow | `E01` plus `currentSaddleWidthMm=138` | width difference `14`, `widthMatchAssessment=too_narrow`, `widthMatchScore` in `60-89` band |
| E09 | Width match good match | `E01` plus `currentSaddleWidthMm=150` | width difference `2`, `widthMatchAssessment=good_match`, `widthMatchScore=90` |
| E10 | Missing estimated input | `inputMethod=estimated`, `heightCm=172`, `weightKg=72`, missing `hipCircumferenceCm` | engine throws or returns a typed error path; no result object is produced |

### 1.2 Boundary Tests

#### Measured path boundaries

- B01: `sitBoneWidthMm=60`, `balanced`, `endurance_road` -> `final=82`, range `77-87`; class lookup must not crash even when below XS bin.
- B02: `sitBoneWidthMm=200`, `upright`, `commuter_leisure` -> `final=236`, range `231-241`; class lookup must clamp or return the highest supported class contract without throwing.
- B03: `sitBoneWidthMm=59` rejected as invalid input.
- B04: `sitBoneWidthMm=201` rejected as invalid input.

#### Estimated path boundaries

- B05: `hipCircumferenceCm=70`, `heightCm=140`, `weightKg=40` -> base `115`, corrections `-5`, `-3`, estimated `107`, range `97-117`.
- B06: `hipCircumferenceCm=160`, `heightCm=220`, `weightKg=150` -> base `160`, corrections `+6`, `+5`, unclamped `171`, clamped estimated `170`, range `160-180`.
- B07: estimator lower clamp: any path below `90` is returned as `90`.
- B08: estimator upper clamp: any path above `170` is returned as `170`.
- B09: `hipCircumferenceCm=69` rejected.
- B10: `hipCircumferenceCm=161` rejected.

### 1.3 Confidence Scoring Tests

Assert the score and band, not just the label.

- C01: measured + full riding context starts at `95`, no deductions -> `95`, `high`.
- C02: measured + missing riding type deduction -> `90`, remains `high` if the implementation allows missing riding type in low-level scoring helper.
- C03: measured + missing posture deduction -> `90`, remains `high`.
- C04: measured + missing riding type and posture -> `85`, `medium`.
- C05: measured + conflicting symptoms -> `85`, `medium`.
- C06: measured + partial profile data deduction only -> `90`, `high`.
- C07: estimated base with no extra deductions -> `55`, `lower`.
- C08: estimated + partial profile deduction -> `50`, `lower`.
- C09: confidence band mapping is deterministic:
  - `90-100` => `high`
  - `70-89` => `medium`
  - `<70` => `lower`

### 1.4 Symptom Classification Tests

- S01: `numbness=true` only -> `dominant=widen`, `widthDeltaMm=+6`
- S02: `sisBonePain=true` only -> `dominant=widen`, `widthDeltaMm=+6`
- S03: `instability=true` only -> `dominant=widen`, `widthDeltaMm=+6`
- S04: `chafing=true` only -> `dominant=narrow`, `widthDeltaMm=-6`
- S05: `slidingForward=true` only -> `dominant=shape_or_setup`, `widthDeltaMm=0`
- S06: `lowerBackPressure=true` only -> `dominant=shape_or_setup`, `widthDeltaMm=0`
- S07: `handPressure=true` only -> `dominant=shape_or_setup`, `widthDeltaMm=0`
- S08: `asymmetry=true` only -> `dominant=shape_or_setup`, `widthDeltaMm=0`
- S09: `numbness=true` and `chafing=true` -> `dominant=conflicting`, `widthDeltaMm=0`
- S10: no symptoms -> `dominant=none`, `widthDeltaMm=0`

### 1.5 Width Bin Mapping Tests

Verify every bin boundary and adjacent alternate labels.

- W01: `125` -> `XS`
- W02: `135` -> `XS`
- W03: `136` -> `S`
- W04: `145` -> `S`
- W05: `146` -> `M`
- W06: `155` -> `M`
- W07: `156` -> `L`
- W08: `165` -> `L`
- W09: `166` -> `XL`
- W10: `175` -> `XL`
- W11: `176` -> `XXL`
- W12: `190` -> `XXL`
- W13: below lowest bin handled gracefully
- W14: above highest bin handled gracefully

## 2. Public Calculator UX/UI Validations

### 2.1 Functional Acceptance

- P01: route `/calculators/saddle-width` loads without authentication in EN and NL.
- P02: default mode is measured.
- P03: switching from measured to estimated clears `sitBoneWidthMm`.
- P04: switching from estimated to measured clears `heightCm`, `weightKg`, `hipCircumferenceCm`.
- P05: switching mode clears any previously rendered result until new valid input exists.
- P06: measured result appears only when `sitBoneWidthMm`, `ridingType`, and `postureCategory` are valid.
- P07: estimated result stays blocked until `heightCm`, `weightKg`, `hipCircumferenceCm`, `ridingType`, and `postureCategory` are valid.
- P08: measured mode confidence badge only shows `High` or `Medium`.
- P09: estimated mode confidence badge always shows `Lower`.
- P10: result card shows:
  - recommended range
  - target width
  - saddle family
  - confidence badge
  - why-this-width explanation
  - what-to-check-if-it-feels-wrong guidance

### 2.2 Measurement UX

- P11: measurement help renders only in measured mode.
- P12: measurement help is collapsed by default.
- P13: expanding measurement help shows the documented steps in English.
- P14: expanding measurement help shows the documented steps in Dutch.
- P15: collapse/expand is keyboard accessible.

### 2.3 CTA and Campaign Behavior

- P16: campaign-off renders exactly 3 buttons:
  - login
  - pricing
  - bike-fit
- P17: campaign-on renders `CampaignCtaGroup` and bike-fit CTA.
- P18: login CTA tracks section `saddle_width_result`.
- P19: pricing CTA tracks section `saddle_width_pricing_cta`.
- P20: bike-fit CTA tracks section `saddle_width_bike_fit_cta`.

### 2.4 Locale and Responsive Checks

- P21: EN/NL locale switch changes all visible strings:
  - hero title/description/chips
  - trust cards
  - mode labels
  - disclaimer
  - result labels
  - CTA band
  - FAQ
- P22: mobile `375px` shows no horizontal overflow.
- P23: all inputs remain tappable at `375px`.
- P24: result panel remains readable at `375px`.

### 2.5 Analytics and Save Behavior

- P25: public session save mutation fires once per unique result payload.
- P26: rerender without a changed result does not create another save.
- P27: changing a driving input and generating a new result creates exactly one additional save.

## 3. Dashboard Selector UX/UI Validations

### 3.1 Prefill and Mode Selection

- D01: authenticated route `/dashboard/saddle-selector` loads for signed-in users.
- D02: `profile.sitBoneWidthMm` pre-fills anatomy section and auto-selects measured mode.
- D03: absence of `profile.sitBoneWidthMm` auto-selects estimated mode.
- D04: `profile.heightCm`, `profile.weightKg`, `profile.hipCircumferenceCm`, `profile.flexibilityScore`, and `profile.coreStabilityScore` pre-fill where present.
- D05: `?bikeId=` pre-fills riding type from bike type mapping.
- D06: `?bikeId=` pre-fills posture category from bike primary-goal mapping.
- D07: pre-filled fields are visibly marked as profile- or bike-derived.

### 3.2 Form Gating and Optional Sections

- D08: Section C current saddle is collapsed by default and skippable.
- D09: Section D symptoms is collapsed by default and skippable.
- D10: result still computes when Sections C and D remain untouched.
- D11: calculate button remains disabled until Section A and Section B required fields are complete.
- D12: calculate button becomes enabled once required anatomy and riding-profile fields are complete.
- D13: calculate runs only on explicit button press, not on every field change.

### 3.3 Result and Conditional Cards

- D14: width recommendation card shows target, range, width class, confidence, and optional width-match state.
- D15: width match card/rendered row appears only when `currentSaddleWidthMm` exists.
- D16: explanation card renders `explanationKey` with resolved params.
- D17: fit interaction warnings card renders only when `fitInteractionWarnings.length > 0`.
- D18: shape recommendation card renders family, nose type, profile shape, cutout, and padding.

### 3.4 Save, History, and Auth

- D19: save button persists through `createDashboardSaddleWidthSession`.
- D20: successful save shows confirmation feedback.
- D21: history list refreshes after save.
- D22: history shows at most 5 sessions.
- D23: history sort is newest-first.
- D24: unauthenticated user hitting dashboard route is redirected to `/login` by the dashboard auth flow and/or blocked by `requireUserId`.
- D25: mobile `375px` keeps all sections usable, with no clipping or unusable collapsed content.

## 4. SEO and Navigation Validations

- N01: `/calculators/saddle-width` is accessible without login.
- N02: EN metadata:
  - title `Saddle Width Calculator | BestBikeFit4U`
  - description `Calculate your ideal saddle width from sit-bone measurement or body data. Get a recommended width range, saddle family, and confidence score.`
- N03: NL metadata:
  - title `Zadelbreedtecalculator | BestBikeFit4U`
  - description `Bereken je ideale zadelbreedteaanbeveling op basis van zitbeenmeting of lichaamsgegevens. Inclusief zadelcategorie en betrouwbaarheidsscore.`
- N04: JSON-LD `WebApplication` schema is present on the public page.
- N05: JSON-LD `HowTo` schema is present on the public page.
- N06: footer calculators column includes Saddle Width Calculator link.
- N07: homepage calculator grid includes saddle width card.
- N08: dashboard sidebar includes Saddle Selector nav item.
- N09: `sitemap-calculators.xml` includes `/calculators/saddle-width`.
- N10: locale alternates for `/calculators/saddle-width` are correct for EN and NL.

## 5. Data Model and Security Validations

- M01: `saddleWidthSessions` exists in Convex schema.
- M02: `profiles.hipCircumferenceCm` exists in Convex schema as optional number.
- M03: `createPublicSaddleWidthSession` accepts unauthenticated execution.
- M04: `createPublicSaddleWidthSession` stores `userId=undefined` or the unauthenticated equivalent when no user exists.
- M05: `createDashboardSaddleWidthSession` enforces `requireUserId`.
- M06: `createDashboardSaddleWidthSession` validates `bikeId` ownership when a bike is supplied.
- M07: `getLatestSaddleWidthSession` returns the most recent authenticated session.
- M08: `listSaddleWidthSessions({ limit: 5 })` returns newest-first and respects the limit.
- M09: `npx tsc --noEmit` passes with zero errors.

## 6. User Acceptance Tests

### UAT 1 — Public measured path

1. Open `/en/calculators/saddle-width`.
2. Keep measured mode selected.
3. Enter `130` mm, choose `Endurance road`, choose `Balanced`.
4. Confirm a result appears with target `~152 mm`, range `147-157 mm`, `M` class, and `High` confidence.
5. Expand measurement help and verify English copy.
6. Switch to `/nl/calculators/saddle-width` and verify Dutch labels and Dutch help copy.

Pass condition:
- inputs are usable
- locale text is correct
- result matches expected engine outcome
- no mobile overflow at `375px`

### UAT 2 — Public estimated path

1. Open the public page.
2. Switch to estimated mode.
3. Confirm old measured value and result clear.
4. Enter `172 cm`, `72 kg`, `105 cm`, select `Endurance road`, `Balanced`.
5. Confirm result shows `Lower` confidence and estimated explanation.
6. Change one field, confirm exactly one new analytics/session save occurs when the result changes.

Pass condition:
- gating works
- confidence is lower
- analytics do not duplicate on rerender

### UAT 3 — Dashboard prefill and calculate

1. Sign in and open `/dashboard/saddle-selector?bikeId=<owned-bike-id>`.
2. Confirm profile values pre-fill.
3. Confirm mode auto-selects to measured when `profile.sitBoneWidthMm` exists.
4. Confirm riding type and posture category pre-fill from the bike.
5. Calculate without opening Sections C and D.
6. Confirm result renders successfully.

Pass condition:
- prefill behavior is correct
- optional sections are skippable
- calculate button gating is correct

### UAT 4 — Dashboard current saddle and symptoms refinement

1. Open Section C and enter current saddle width.
2. Open Section D and select `numbness` and `handPressure`.
3. Calculate.
4. Confirm width match row appears.
5. Confirm fit interaction warnings appear and include the non-width hand-pressure note.
6. Save the recommendation.

Pass condition:
- conditional cards render only when expected
- save succeeds
- history refreshes with newest item first

### UAT 5 — Navigation and SEO smoke

1. Visit the homepage and verify a saddle width calculator card exists.
2. Check the footer calculators column for the saddle width link.
3. Open the public page source/head and verify title, meta description, and both JSON-LD blocks.
4. Check `sitemap-calculators.xml` for `/calculators/saddle-width`.
5. Open dashboard sidebar and verify Saddle Selector nav item.

Pass condition:
- public discoverability and internal navigation are complete

## 7. Suggested Test File Mapping

- `src/lib/saddle-width-engine/width-engine.test.ts`
  - canonical cases
  - boundaries
  - confidence
  - symptom classification
  - width bins
- `src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.test.tsx`
  - mode toggle
  - field clearing
  - confidence badge
  - help accordion
  - CTA switching
  - locale copy
  - analytics save dedupe
- `src/app/(public)/calculators/saddle-width/page.test.tsx`
  - metadata
  - JSON-LD
  - FAQ and related links presence
- `src/app/(dashboard)/saddle-selector/SaddleSelectorForm.test.tsx`
  - profile and bike prefill
  - gating
  - optional sections
  - conditional result cards
  - save and history refresh
- `src/app/(dashboard)/saddle-selector/page.test.tsx`
  - auth route shell
  - nav and header presence
- Convex tests or query/mutation unit tests
  - schema presence
  - public mutation auth-open behavior
  - dashboard mutation auth and ownership enforcement
- sitemap/navigation tests
  - footer
  - homepage card
  - sidebar
  - sitemap output

## 8. Release Gate

The saddle width calculator is ready only when all of the following are true:
- all unit and component tests defined above pass
- browser/UAT checks pass on EN and NL at desktop and `375px`
- schema and auth validations pass
- SEO/navigation validations pass
- TypeScript passes with zero errors
- the 12 validation checks below are documented in this artifact and traceable to real checks

## Validation Contracts

- V01: tsc passes with zero errors
- V02: engine unit tests: all 10 cases pass
- V03: public page: mode toggle clears inactive fields
- V04: public page: Mode B blocks result until all 3 body fields present
- V05: public page: confidence badge correct per mode
- V06: public page: campaign CTAs switch correctly
- V07: dashboard: profile data pre-fills anatomy section
- V08: dashboard: calculate button disabled until A+B complete
- V09: dashboard: save persists to Convex and shows confirmation
- V10: SEO: page title, description, JSON-LD present
- V11: footer and homepage grid include saddle width calculator
- V12: sitemap includes /calculators/saddle-width
