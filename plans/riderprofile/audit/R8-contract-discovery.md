# R8 contract discovery — historical, superseded

The original pause and proposed contract below are superseded by A-to-B-R9-query-contract.md,
A-to-BC-R9-final-integration.md and audit/R8-notes.md. R8 now uses the published implementation.

Read-only discovery in bestbikefit4u-rider, 3 October 2026. Lead changed the queue to R13 → R11 → R8; discovery stopped and this document records only findings already inspected. No R8 source, backend, schema, UI, commit or deploy changes. A's R9 contract was not present at inspection; suggestions below are not an agreed API.

Separate R7 status at handoff: policy + score tests rerun passed (116 tests / 2 files), scoped policy ESLint and whitespace check passed, and the full `npm run typecheck -- --incremental false` completed successfully. No R7-owned errors remain. UI owner already has 16 dashboard renders under `plans/riderprofile/renders/R7-dashboard-{nl,en}-{open,answered,hidden,unknown-ftp}-{1440,390}.png`; its `R7-dashboard-results.json` reports no overflow or browser errors. This sidecar inspected that manifest, did not create or visually certify those UI renders.

## Requirements versus board examples

Read PLAN §7 and `boards/RP7Advice.dc.html`, plus `messages/B-to-A-R8-contract-request.md`.

- Required groups: seating position; contact points; cockpit/reach; drivetrain; tires; performance/nutrition; frame size/purchase. Required fields: target and available range, current setting/difference, reliability with reason, status, date. Ordering follows engine changeOrder; 1–3 evidence-backed improvement actions per group.
- Board has My data / My advice / My bikes tabs, all/bike/rider filters, group scope and reliability, target/current/difference columns, improvement links and a calm stale banner. Its source contains seven groups despite a placeholder hint of six.
- Board lifecycle labels include Nieuw, Uitgevoerd, Verouderd, Wacht op rit; it also uses Actueel and Open. The displayed target values, ranges, Canyon name, weight-change narrative, predicted confidence gains and successful recalculation deltas are examples only.
- Board's Mark as done toggles local prototype state. It is not evidence that the application has an item-level implementation mutation. Review-state strip and example-data badge are not product requirements for live data.

## Existing sources and query shapes

| Source | Existing query/shape | Material cautions |
| --- | --- | --- |
| Fit recommendations | `convex/recommendations/queries.ts`: listByUser returns owned recommendation documents; getLatestByBike returns latest createdAt; getBySession returns the **oldest** recommendation for that session. getReportV2 returns session, recommendation, bike, bikeProfile, profile, user, questionnaireResponses and latestPressureCalculation. | A must choose consistent winning-record semantics. Do not independently fan out these queries from R8 or let client deduplication decide which result wins. |
| Saddle width | `convex/saddleWidth/queries.ts`: getLatestSaddleWidthSession({bikeId?}) returns one exact dashboard bike/rider scope or null; listSaddleWidthSessions returns dashboard records, default limit 10. | Actual target/range/confidence/current-width snapshot exist. Public anonymous records are not rider advice. |
| Gearing | `convex/gearing/queries.ts`: getLatestGearingSession({bikeId?}) returns exact scope; listGearingSessions returns dashboard records, optionally bike-filtered, default limit 10. | Stored math and suitability are actual computed outputs; the analyzed gear is not automatically a recommended replacement cassette. |
| Pressure | `convex/pressureCalculations/queries.ts`: getLatestForBike/getLatestByBike, latestWithoutBikeForUser, listForUser/listForBike and latestByBikeForUser. Latest-by-bike batch returns `{bikeId,latestCalculation|null}`. | Actual front/rear targets, optional declared current pressures, inputSnapshot and createdAt exist. No stored confidence percentage or target interval. |
| Calculator state | `convex/calculatorStates/queries.ts`: get({calculator,bikeId?}) returns state document or null. Eight calculator IDs are supported. | Stores **inputs only**, with updatedAt. No persisted result, algorithm version, used-observation snapshot, confidence, lifecycle state or calculation date. |

Evidence: `convex/schema.ts` calculatorStates, saddleWidthSessions, gearingSessions, pressureCalculations, recommendations; corresponding query and mutation files. Several existing list/latest queries collect all rows before filtering/sorting. A owns aggregation, pagination/bounds, owner checks and scope normalization; those are not frontend adapter responsibilities.

Dashboard saddle-width and gearing mutations update the existing latest scoped record and reset createdAt. Their records are not immutable historical runs. Calculator-state upsert updates one user/calculator/bike record and sets updatedAt. UI must not reinterpret `_creationTime` or input updatedAt as a newly executed calculation.

## Actual fit engine fields

`recommendations.calculatedFit` persists:

- recommendedStackMm, recommendedReachMm, effectiveTopTubeMm;
- saddleHeightMm, saddleSetbackMm, saddleHeightRange `{min,max}`;
- handlebarDropMm, handlebarReachMm, stemLengthMm, stemAngleRecommendation (string);
- crankLengthMm, handlebarWidthMm.

`climbingCalculatedFit` is an optional alternative profile. Its scope/variant must remain explicit; do not mix its targets with baseline item metadata accidentally.

Optional `recommendationItems[]` has parameter, target, optional rangeLow/rangeHigh, confidence, method, why, feasibility, riskFlags and changeOrder. `convex/recommendations/seedEngine.ts:185` currently creates:

| Parameter | Suggested RP7 group | Stored range | changeOrder |
| --- | --- | --- | --- |
| saddleHeightMm | Seating position | Yes | 2 |
| saddleSetbackMm | Seating position | No | 3 |
| barDropMm | Cockpit/reach | Yes | 4 |
| saddleToBarReachMm | Cockpit/reach | Yes | 5 |
| crankLengthMm | Drivetrain | No | 6 |
| handlebarWidthMm | Contact points | No | 7 |

These are actual engine orders; do not renumber to suggest a missing first action. No stem item is generated by this function. Parameter aliases differ from calculatedFit (barDropMm → handlebarDropMm, saddleToBarReachMm → handlebarReachMm); normalize once at the agreed boundary. Prefer actual item.target for an item instead of silently substituting a separate aggregate target.

Raw `FitOutputs` also includes saddleTiltDeg, cleatOffsetMm, stemAngleDeg and spacerStackMm, but the persisted calculatedFit schema does not retain all those fields. Do not display them from board placeholders or infer them from string recommendations. frameSizeRecommendations contains actual size strings with optional brand/notes and fitScore; no universally persisted stack/reach uncertainty band.

## Confidence, status and ordering are different domains

- Recommendation confidenceScore is 0–100. Seed recommendationItems.confidence is 0–1 (`result.confidenceScore / 100`). Scale must be explicit; multiplying both kinds by 100 would be wrong.
- Saddle-width confidenceScore is 0–100; confidenceLevel validation is high / medium / **lower**. Gearing confidence.level is high / medium / **low**, with score, mathScore, suitabilityScore and reasons.
- Engine confidence is not automatically observation-based advice reliability. `shared/profileScore/index.ts` currently exports profile/bike scores; those whole-entity scores should not be relabeled as every advice row's reliability. A must supply outcome-specific inputs, reasons and normalization.
- Fit recommendation feasibility is direct / component_change_required / not_yet_evaluated. This is not a user implementation status.
- Fit session status is in_progress / questionnaire_complete / processing / completed / archived. Session completed does not mean a saddle or stem was physically adjusted.
- `rideFeedbackEntries.implementationStatus` is confirmed / partial / not_implemented and is session-level. `convex/rideFeedback/mutations.ts:submitBeta` is gated by ENGINE_V2_FEEDBACK_BETA_ENABLED. There is no inspected item-level “applied” timestamp or mark-done endpoint. Absence of feedback is not proof of “waiting for a ride.”
- Gearing suitability.publicVerdict is suitable / challenging / likely_overgeared; setupLabel is a descriptive gearing classification. Neither is RP7 lifecycle status.
- Suggested frontend group/status keys must be agreed with A. Do not turn missing lifecycle evidence into new/applied/current automatically. Keep unavailable lifecycle state explicit until contract defines it.

`src/lib/reports/reportV2Mapper.ts:420` is a useful formatting reference but unsuitable as the RP7 semantic adapter: it creates synthetic rows/statuses for legacy data, uses a fixed parameter order instead of item.changeOrder, builds target labels from calculatedFit rather than item.target, and maps feasibility to ready/pending_data/optional. Its adjustment sequence assigns index+1. Reusing this payload would lose meaningful R9 fields and create unsupported lifecycle claims.

## Other calculators: real output versus saved state

- `src/lib/public-calculators/fitAdapters.ts`: runSaddleHeightCalculation returns `{height,range:{min,max}}`; runCrankLengthCalculation returns a number only; runFrameSizeCalculation returns quick estimatedSaddleHeight and estimatedFrameSize string. No crank interval or frame stack/reach band is supplied by these adapters. runBikeFitCalculation returns FitOutputs plus quickEstimate.
- State validation is numeric/enumerated validity, not proof that a required measurement was supplied: preserve saddle/bike-fit `source: missing|measured|estimated`, frame heightConfirmed/inseamConfirmed, crank confirmed and saddle compare/currentConfirmed. Never interpret stored default slider values as confirmed personal input.
- Saddle width has recommendedWidthMm, widthRangeMinMm/MaxMm, currentSaddleWidthMm when supplied, family/shape/nose/cutout/padding, confidence, explanationKey and warnings. Current saddle width is a session input snapshot, not necessarily today's measured bike setting.
- Gearing math has normalized chainrings/cassette, easiestGear/hardestGear, ratios, development, gear inches and optional cadence/speed/gain ratio. Suitability includes actual required/sustainable power, optional power gap/duration/cadence feasibility, assumptions/warnings/reasons. Preserve tooth pairs as structured pairs; do not subtract them as scalar mm or invent an upgrade recommendation from easiestGear.
- Pressure persists recommendedFront/RearBar and Psi, optional currentFront/RearBar, inputSnapshot and optional warningsJson. comfortScore/gripScore/efficiencyScore and pressureInsights.stabilityScore are not confidence. No stored pressure range exists.
- `src/lib/public-calculators/performance.ts`: speedAtPower returns speedKmh, limit below/above/null and power split; climbPlan adds band/multiplier/targetPowerWatts/minutes (nullable at solver limits); ftpEstimate returns ftpWatts/wattsPerKg/flat/climbMinutes; fuelHydration returns carbohydrate bands, actual generic fluid/sodium ranges, totals and heuristic selections.
- Nutrition engine explicitly labels selection basis heuristic-not-measurement. Small-ride carbohydrate gramsPerHour can be null; zero is valid for the none band. Missing/null must not become a numerical zero. Hydration bands are published guidance intervals, not personalized confidence intervals.
- Performance functions calculate from saved input states at runtime; an R9 recomputation from those inputs needs to distinguish reconstructed output from an originally persisted result. “Updated input” alone is not sufficient evidence for “advice recalculated.”

## Current settings and differences

Use only a compatible known current quantity. Inspected bike currentSetup has saddle height, setback, stem length/angle, handlebar width and crank length. Current reach/drop, saddle model/width, additional fit settings and tire state depend on C's later bike schema work or separate records; do not assume board fields exist. Frame currentGeometry fields are not interchangeable with rider cockpit reach.

For comparable numeric values, target minus current is a legitimate signed display delta in the same unit. Preserve zero and negative setback/drop semantics. For categorical sizes, paired pressures and tooth combinations, use structured display or an explicitly defined comparison; do not calculate numeric deltas from text. Distinguish live bike values from calculation input snapshots and keep the associated date/source visible where available.

## Staleness and actions: current gaps

- `convex/lib/pressureStaleness.ts` only compares calculation date with profile.weightUpdatedAt and tire-setup updatedAt. `isBikePressureStale` returns isStale/lastCalcAt/weightUpdatedAt/pressureInputUpdatedAt. This is not a generic dependency-aware stale check across all calculators.
- At inspection, no listAdviceGroups/recalculateAll or used-observation-ID outcome snapshot implementation was found in convex/shared. A's R9 must define historical fallback, changed-field reasons, source scope, latest-result choice and action capabilities.
- Existing recalculatePressureForAllBikes requires newWeightKg and autoNoteSource, finds active wheel/tire setups and returns recalculatedCount. It is not an implementation of “recalculate every stale advice.” Recommendation generate is session-oriented and can return early for existing recommendations; do not loop it from the client as a replacement contract.
- No verified row-level mark-as-done capability, target-specific implementation tracking or cross-calculator batch result exists. Show no active control for those until A exposes an authorized action. Report partial success/pending/failure from its real response; never replay the board's hardcoded successful deltas.
- Improvement actions must be backed by missing or weak inputs actually used by each advice, sorted by defensible gain and limited to three. Global next-profile prompts alone do not prove per-advice relevance. Board claims like “two more measurements shrink ±12 to ±8” have no inspected supporting return contract.

## Proposed frontend adapter boundary (not implemented)

Consume A's single owner-scoped `listAdviceGroups` return type directly (derive with Convex FunctionReturnType once exported). Add one pure frontend adapter near the RP7 feature, taking that return and locale. Its responsibility is grouping/presentation labels, unit/date/number formatting, supported route resolution and explicit null handling. It should not query source tables, choose winning outcomes, run engines, calculate reliability/staleness, infer implementation status or create mutation capabilities.

Suggested normalized data requirements to agree with A:

- stable advice ID + source kind/source ID/calculator ID; group key; rider/bike scope (bikeId/name); optional variant;
- typed target (number, categorical text or structured pair), nullable unit/range with its meaning, nullable current/source/date and compatible delta;
- nullable reliability score with stated scale, optional level and structured reason keys; lifecycle status separate from feasibility, with unavailable state supported;
- real calculation/source-update timestamps distinguished, changeOrder when supplied, stale flag and reason keys/changed-input metadata;
- zero to three improvement actions with actual gain, stable field/effect identifiers and supported destinations;
- explicit supported action metadata, especially mark-done and batch-recalculation eligibility/result states.

Sorting: preserve A's group order and actual engine changeOrder; stable documented fallback for records without it, never manufacture engine ranks. Group reliability must be supplied/defined by A, not an arbitrary mean of incompatible source scores. Unknown parameter/status/reason keys should degrade to unavailable/source-detail presentation rather than guessing or dropping an entire group. Keep IDs in navigation only where needed; never place body measurements or result values in URLs, analytics or logs.

## Existing account destinations

Use withLocalePrefix and real account routes, not board filenames or public calculator aliases:

| Purpose | Existing route |
| --- | --- |
| Profile / measuring help | /profile; /profile/improve/body-measurements; /profile/improve/flexibility; /profile/improve/core-stability; /profile/score |
| Full fit / result detail | /fit; /fit/{sessionId}/results; /fit-history |
| Bike setup | /bikes; /bikes/{bikeId}; /bikes/{bikeId}/edit |
| Saddle height/frame/crank | /tools/saddle-height; /tools/frame-size; /tools/crank-length |
| Bike-fit calculator | /tools/bike-fit |
| Saddle width | /saddle-selector (supports bikeId selection) |
| Gearing | /gearing (supports bikeId selection) |
| Pressure | /pressure-calculator?bikeId=… (page explicitly reads bikeId) |
| Performance/nutrition | /tools/power-speed; /tools/climb-planner; /tools/ftp-wkg; /tools/fuel-hydration |
| Shoe/cleat education | /shoe-cleat-fit — inspected page is educational guidance plus fit CTA, not a saved cleat-position calculation |

AccountFitCalculator currently calls its state hook without bikeId for saddle/frame/crank; do not promise a bike-context deep link that the route does not consume. No account advice route was present in the inspected profile tree; parent owns choosing/mounting the RP7 tab after A's contract. The public route registry includes aliases overlapping account paths, so it is not an account-link resolver.

## Resume checklist for parent / A

Confirm exact R9 endpoint and type exports; group keys; result selection/deduplication and variants; confidence scale versus reliability; nullable/range semantics; lifecycle evidence and mark-done support; observation dependency/stale fallback for legacy inputs; source dates; per-action capability and batch outcomes; actual missing-input improvement actions. Until then build no backend substitute and save no invented advice records. Resume R8 only after the revised queue permits it.
