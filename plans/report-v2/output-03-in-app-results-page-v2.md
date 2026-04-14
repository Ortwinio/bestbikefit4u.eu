# Output 03 — In-App Results Page V2

## Status

Implemented before this session and verified in the repo. This session added a small localization cleanup so the remaining report-v2 page strings now flow through the shared `reportV2` copy object instead of route-local EN/NL branches.

## Component Structure

Route:
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`

Route-local components:
- `src/app/(dashboard)/fit/[sessionId]/results/components/RiderProfileCard.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/BikeContextCard.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/PriorityTable.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/DetailedFitTable.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/AdjustmentSequence.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/TirePressureSection.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/ValidationPlan.tsx`
- Shared route primitives in `src/app/(dashboard)/fit/[sessionId]/results/components/ResultsPrimitives.tsx`

Data flow:
- Fetches `api.recommendations.queries.getReportV2`
- Maps via `src/lib/reports/reportV2Mapper.ts`
- Reads localized report copy via `src/lib/reports/reportV2Copy.ts`

## i18n Keys Added / Used

Existing `dashboard.results.reportV2` structure was already present and populated. This session added/verified:

- `shell.actionsTitle`
- `shell.fitPassActivated`
- `shell.summaryTitle`
- `shell.summaryFullAccess`
- `shell.summaryLimited`
- `shell.unlockTitle`
- `shell.unlockDescription`
- `shell.unlockItems`
- `rider.frameStack`
- `rider.frameReach`
- `rider.frameEffectiveTopTube`
- `tirePressure.quickStartColumns.weight`
- `tirePressure.quickStartColumns.tireSize`
- `tirePressure.quickStartColumns.psi`
- `paywall.emailUpgradeToast`
- `paywall.emailUpgradeButton`
- `paywall.pdfUpgradeToast`
- `paywall.pdfUpgradeButton`

## Deviations From Spec

1. The route is powered by the shared report-v2 payload, but the full detailed sections remain gated behind Fit Pass / Pro access. The free view currently shows the report hero, rider/bike context, and priority summary, not the entire v2 report.
2. `BikeContextCard` still keeps enum-value labels in a route-local lookup object rather than moving every localized option into `src/i18n/messages/*`.
3. The implemented route includes additional rider/bike context cards beyond the minimum spec because those are useful and already supported by the payload.

## Validation

- `npm run test:i18n` — passed (`30/30`)
- `npx vitest run src/lib/reports/reportV2Mapper.test.ts src/lib/reports/pdfLayoutTemplate.test.ts 'src/app/api/reports/[sessionId]/pdf/route.test.ts'` — passed (`21/21`)
- Report-v2 route wiring verified in:
  - `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
  - `src/lib/reports/reportV2Mapper.ts`
  - `convex/recommendations/queries.ts`

## Reused Legacy Components / Behavior

- Existing email-report flow kept intact
- Existing PDF download trigger kept intact, now with locale-aware query param
- Existing recommendation generation behavior kept intact
- Existing Fit Pass / Pro access checks preserved
