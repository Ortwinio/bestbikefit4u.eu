# Output 06 — Tire Pressure Integration and Current-vs-Target Deltas

## Status

Implemented before this session and verified in the shared mapper, dashboard components, and PDF template/tests.

## Tire Pressure Integration

Source / mapping:
- `convex/recommendations/queries.ts` → `getReportV2`
- `src/lib/reports/reportV2Mapper.ts`
- `src/lib/reports/reportV2Types.ts`

Dashboard rendering:
- `src/app/(dashboard)/fit/[sessionId]/results/components/TirePressureSection.tsx`

PDF rendering:
- `src/lib/reports/pdfLayoutTemplate.ts`

### Ready State

When the latest pressure calculation exists and required inputs are available, the report exposes:

- front PSI
- rear PSI
- front bar
- rear bar
- confidence
- surface label
- inputs used
- warning list

### Pending State

When required inputs are missing, the report exposes:

- `status: "pending_required_inputs"`
- list of missing fields
- quick-start lookup table

The dashboard component and PDF template both render this pending state instead of fabricating personalized values.

## Current-vs-Target Deltas

Deltas are carried on `ReportDetailedRow.delta` and formatted in:
- `src/app/(dashboard)/fit/[sessionId]/results/components/format.ts`
- `src/app/(dashboard)/fit/[sessionId]/results/components/DetailedFitTable.tsx`

Supported display states:
- increase
- decrease
- neutral / on target

The detailed-fit table only shows the delta column when at least one row has current-bike context.

## Validation

Verified through the shared report-v2 test suite:
- `src/lib/reports/reportV2Mapper.test.ts` — passed
- `src/lib/reports/pdfLayoutTemplate.test.ts` — passed
- `src/app/api/reports/[sessionId]/pdf/route.test.ts` — passed
- `npm run test:i18n` — passed

Scenarios covered by code/test inspection:
- complete tire-pressure data
- pending tire-pressure state
- delta formatting in the shared formatter path
- omission of empty report sections when source data is absent

## Notes

- The current dashboard implementation renders tire pressure only in the paid full-report surface.
- The pending-data UX is explicit and does not imply false precision.
