# Output 02: Value Mapping Matrix

Date: 2026-02-19
Owner: `@codex`

## Result

Step 02 status: `PASS`

This contract defines canonical source fields, formatting, fallback behavior, and test rules for the upgraded PDF report. It is designed to prevent mis-mapped measurement values.

## Canonical Sources

Primary objects:

1. Session:
   - `session._id`
   - `session.createdAt`
   - `session.completedAt`
   - `session.bikeType`
   - `session.primaryGoal`
   - `session.ridingStyle`
2. Recommendation:
   - `recommendation.algorithmVersion`
   - `recommendation.confidenceScore`
   - `recommendation.calculatedFit.*`
   - `recommendation.frameSizeRecommendations[]`
   - `recommendation.adjustmentPriorities[]`

Canonical source policy:

1. Numeric measurement values must come from `recommendation.calculatedFit` only.
2. Do not parse numeric measurements from free text fields (`recommendedValue`, `fitNotes`).
3. If canonical numeric source is absent, hide that numeric metric (or render `n/a`), do not infer.

## Units And Formatting Rules

Global rules:

1. `mm` values:
   - integer display by default.
   - one decimal allowed only for `crankLengthMm` if source contains `.5`.
2. `degree` values:
   - display with `°` symbol.
   - if source already includes symbol/string, pass through after validation.
3. Percent:
   - `confidenceScore` and `fitScore` display as integer percent with `%`.
4. Dates:
   - UTC date string format `YYYY-MM-DD` from epoch ms.
5. Missing values:
   - metadata fields: display `n/a`.
   - measurement ranges: omit the range chip/parenthetical if not canonical.

## Value Mapping Matrix

| Report value | Canonical source path | Display label (EN) | Format | Fallback | Validation rule |
|---|---|---|---|---|---|
| Session ID | `session._id` | Session | raw string | `n/a` | non-empty string |
| Created date | `session.createdAt` | Created | `YYYY-MM-DD` | `n/a` | epoch ms > 0 |
| Completed date | `session.completedAt` | Completed | `YYYY-MM-DD` | `n/a` | if present: epoch ms >= createdAt |
| Bike type | `session.bikeType` | Bike | humanized token (`tt_triathlon` -> `tt triathlon`) | `n/a` | enum-safe string |
| Goal | `session.primaryGoal` | Goal | title case/humanized | `n/a` | enum-safe string |
| Riding style | `session.ridingStyle` | Riding style | title case/humanized | `n/a` | enum-safe string |
| Algorithm version | `recommendation.algorithmVersion` | Algorithm | `v${value}` | `n/a` | semver-like string |
| Confidence | `recommendation.confidenceScore` | Fit confidence | `${int}%` | `n/a` | 0 <= value <= 100 |
| Saddle height | `recommendation.calculatedFit.saddleHeightMm` | Saddle height | `${int} mm` | `n/a` | value > 0 |
| Saddle height min | `recommendation.calculatedFit.saddleHeightRange.min` | Saddle height range min | `${int}` | hide range | if present: <= max |
| Saddle height max | `recommendation.calculatedFit.saddleHeightRange.max` | Saddle height range max | `${int}` | hide range | if present: >= min |
| Saddle setback | `recommendation.calculatedFit.saddleSetbackMm` | Saddle setback | `${int} mm` | `n/a` | value > 0 |
| Handlebar drop | `recommendation.calculatedFit.handlebarDropMm` | Handlebar drop | `${int} mm` | `n/a` | value >= 0 |
| Handlebar reach | `recommendation.calculatedFit.handlebarReachMm` | Handlebar reach | `${int} mm` | `n/a` | value > 0 |
| Stem length | `recommendation.calculatedFit.stemLengthMm` | Stem length | `${int} mm` | `n/a` | value > 0 |
| Stem angle | `recommendation.calculatedFit.stemAngleRecommendation` | Stem angle | validated string (`-6°`, `+6°`) | `n/a` | matches `/^[+-]?\\d+(\\.\\d+)?°$/` after normalization |
| Crank length | `recommendation.calculatedFit.crankLengthMm` | Crank length | `${intOrHalf} mm` | `n/a` | value > 0 |
| Handlebar width | `recommendation.calculatedFit.handlebarWidthMm` | Handlebar width | `${int} mm` | `n/a` | value > 0 |
| Frame stack target | `recommendation.calculatedFit.recommendedStackMm` | Frame stack target | `${int} mm` | `n/a` | value > 0 |
| Frame reach target | `recommendation.calculatedFit.recommendedReachMm` | Frame reach target | `${int} mm` | `n/a` | value > 0 |
| Effective top tube | `recommendation.calculatedFit.effectiveTopTubeMm` | Effective top tube | `${int} mm` | `n/a` | value > 0 |
| Frame guidance size | `recommendation.frameSizeRecommendations[0].size` | Frame guidance | raw string | `n/a` | non-empty string |
| Frame guidance score | `recommendation.frameSizeRecommendations[0].fitScore` | Frame fit score | `${int}%` | hidden | 0 <= value <= 100 |

## Derived Range And Fallback Contract

Supported measured ranges in v1:

1. Saddle height range:
   - from `calculatedFit.saddleHeightRange`.
   - display only if both `min` and `max` are present and valid.

Not canonically available as stored numeric ranges today:

1. Saddle setback range.
2. Handlebar drop range.
3. Handlebar reach range.
4. Cleat offset numeric value.

Rules for unavailable ranges/values:

1. Do not synthesize numeric min/max from static heuristics in the PDF output.
2. Do not parse numbers from `adjustmentPriorities.recommendedValue` for measured fields.
3. If UI requires these rows, render as:
   - target only without range, or
   - textual guidance without numeric claim.
4. Backlog item for later schema extension:
   - store `cleatOffsetMm`, `barDropRange`, `reachRange`, and optional `saddleSetbackRange` in `recommendation.calculatedFit`.

## Section-Level Mapping Contract

1. Header/meta:
   - `session._id`, `session.createdAt`, `session.bikeType`, `session.primaryGoal`, `recommendation.algorithmVersion`, `recommendation.confidenceScore`.
2. Summary cards:
   - `confidenceScore`, `saddleHeightMm`, `handlebarDropMm`.
3. Priority changes:
   - order from `recommendation.adjustmentPriorities` by ascending `priority`.
   - display text directly; do not numeric-parse.
4. Core targets table:
   - all numeric fields from `calculatedFit`.
5. Frame guidance:
   - first item from `frameSizeRecommendations` if present.
6. Implementation/troubleshooting:
   - static instructional content plus optional contextual text from `fitNotes`.

## Test Assertions (Required)

1. Mapping unit test (`mapPdfReportData`):
   - given fixture with unique sentinel values, every rendered metric equals its canonical source.
2. Mis-mapping prevention test:
   - intentionally change `adjustmentPriorities[].recommendedValue` to conflicting numbers; mapped numeric metrics must remain unchanged.
3. Range behavior test:
   - if `saddleHeightRange` is absent/invalid, saddle range is hidden and no fake range is shown.
4. Missing optional sections test:
   - empty `frameSizeRecommendations` renders `n/a` for frame guidance without crashing.
5. Format and unit test:
   - mm, %, degree, and date formats match contract exactly.
6. Invariant test:
   - `saddleHeightMm` must lie within range when range is present; invalid payload triggers safe fallback and warning log.
7. Route integration test:
   - PDF route still returns `200` and includes expected mapped markers for a known fixture.

## Implementation Notes For Step 03+

1. Add a dedicated mapper module:
   - `src/lib/reports/pdfValueMapping.ts`
2. Export typed output model:
   - `PdfReportViewModel`
3. Centralize formatting helpers:
   - `formatMm`, `formatPercent`, `formatDateIso`, `formatStemAngle`.
4. Ensure template consumes only `PdfReportViewModel`, never raw recommendation objects.

## Exit Checklist

- [x] Every displayed value has a canonical source.
- [x] Units/precision/fallback rules are explicit.
- [x] Test assertions for mapping correctness are defined.
- [x] Output file created.
