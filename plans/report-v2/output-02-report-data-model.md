# Output 02 — Report Data Model

## Status

Already implemented before this session. Files verified and tests confirmed passing.

## Files

| File | Purpose |
|------|---------|
| `src/lib/reports/reportV2Types.ts` | `ReportV2Payload` type + all sub-types |
| `src/lib/reports/reportV2Mapper.ts` | `mapReportV2Payload(source)` mapper function |
| `src/lib/reports/reportV2Mapper.test.ts` | 3 passing tests |
| `convex/recommendations/queries.ts` → `getReportV2` | Convex query that fetches session + recommendation + bike + profile + pressure calculation |

## Type Design

`ReportV2Payload` contains:
- `profile`: `ReportProfileSection` — session meta, engine/algorithm version, confidence, data quality status
- `prioritySummary`: `ReportPriorityRow[]` — per-parameter key, target label, status, confidence
- `detailedFit`: `ReportDetailedRow[]` — full per-parameter data including range, feasibility, delta vs. current bike setup, current label
- `adjustmentSequence`: `ReportAdjustmentStep[]` — ordered list for the implementation walkthrough
- `tirePressure`: `ReportTirePressureSection` — either `ready` (with bar/psi values) or `pending_required_inputs` (with missing field list + quick-start table)
- `frameTargets`: stack/reach/ETT targets and recommended frame label
- `fitNotes`: string[]

## Convex Query Location

`convex/recommendations/queries.ts` → `getReportV2` — chosen because the payload is recommendation-centric; session aggregation is secondary. The query performs an inline ownership check (`session.userId !== userId`) rather than using `requireSessionOwner()`.

## Parameter Mapping

`recommendationItems[].parameter` (snake_case mm keys from the engine) are normalized to `ReportParameterKey` via `normalizeParameterKey()`:

| Engine key | ReportParameterKey |
|------------|-------------------|
| `saddleHeightMm` | `saddleHeight` |
| `saddleSetbackMm` | `saddleSetback` |
| `barDropMm` | `handlebarDrop` |
| `saddleToBarReachMm` | `handlebarReach` |
| `crankLengthMm` | `crankLength` |
| `handlebarWidthMm` | `handlebarWidth` |

`stem` is a synthetic row built from `calculatedFit.stemLengthMm` + `stemAngleRecommendation`.

## Static Lookup Fields

`methodLabel`, `feelDescription`, `watchOuts`, and `rationale` are not yet in the type — the current `ReportDetailedRow` type does not include them. These will be added as static lookup tables keyed by `ReportParameterKey` in Step 04 (education content), co-located with the i18n copy.

## Legacy Compatibility

The mapper handles `null` recommendation gracefully — returns empty arrays for `prioritySummary`, `detailedFit`, and `adjustmentSequence`. Legacy v1 recommendations are compatible because the mapper reads from `calculatedFit` (always present) and falls back to synthetic rows when `recommendationItems` is absent.

## Validation Run

- `npx vitest run src/lib/reports/reportV2Mapper.test.ts` — 3/3 passed
- `npm run typecheck` — clean
