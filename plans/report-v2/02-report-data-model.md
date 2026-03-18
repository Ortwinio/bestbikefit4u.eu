# Step 02 — Report Data Model

## Objective

Define a clean, typed report payload that maps engine v2 recommendation outputs to every section of the v2 report. This becomes the single contract between the backend (Convex) and the frontend (in-app results page and PDF renderer).

## Background

Read:
- `plans/report-v2/bestbikefit4u_v2_report_and_migration_plan (1).docx.md` — the full v2 spec (sections 1–6, data model additions in Part B §2, API mapping in Part B §4)
- `plans/engine-v2-migration/output-04-05-seed-engine-and-envelope.md` — what the v2 recommendation envelope looks like in the current codebase
- `src/lib/reports/pdfValueMapping.ts` — the existing value mapping used by the PDF renderer
- `convex/recommendations/queries.ts` and `convex/sessions/queries.ts` — current recommendation/session read paths in Convex
- `src/app/api/reports/[sessionId]/pdf/route.ts` — the current report fetch path that will need to consume the same payload

## Tasks

### 1. Audit what engine v2 already produces

Read the v2 recommendation shape. For each report section, identify which fields are already available:

| Report section | Required fields | Available in v2? |
|----------------|----------------|-----------------|
| Rider profile | bikeType, ridingStyle, goal, confidence, sessionId, algorithmVersion | ? |
| Priority table | per-parameter: target, rationale, riderValidationCue, status | ? |
| Detailed fit table | per-parameter: targetMm, methodLabel, feelDescription, watchOuts, range | ? |
| Adjustment sequence | orderedList of parameters with measurementReference | ? |
| Tire pressure | frontPsi, rearPsi, confidence, pendingFields | ? |
| 14-day plan | dayBlock, change, rideDuration, scorePrompts | Static content — no backend data needed |

### 2. Define the `ReportV2Payload` TypeScript type

Create `src/lib/reports/reportV2Types.ts` with a complete `ReportV2Payload` type covering all sections. Use the v2 spec's field names from Part B §4 as a guide.

Include:
```typescript
type ReportV2Payload = {
  profile: ReportProfile
  fit: ReportFitSection
  adjustmentSequence: AdjustmentStep[]
  tirePressure: TirePressureSection | { status: "pending_required_inputs"; required: string[] }
  dataQuality: DataQualitySection
  // 14-day plan is static content rendered from i18n — no data needed here
}
```

Also define how legacy recommendation shapes are normalized into this payload so the UI and PDF can remain compatible during rollout.

### 3. Create a mapper function

Create `src/lib/reports/reportV2Mapper.ts`:
- Input: v2 recommendation object from Convex + session data
- Output: `ReportV2Payload`
- Use `pdfValueMapping.ts` as a reference for the existing field mappings
- For fields not yet present in v2 (e.g. `methodLabel`, `feelDescription`, `watchOuts`), define them as static lookup tables keyed by parameter name (`saddleHeight`, `saddleSetback`, `handlebarDrop`, `handlebarReach`, `stem`, `crankLength`) — these will be moved to the i18n system in Step 04

### 4. Add a Convex query for the report payload

Add the report query in the existing read path that best fits this repo, but make the choice explicit in the output. Prefer `convex/recommendations/queries.ts` if the payload is recommendation-centric; use `convex/sessions/queries.ts` only if session aggregation is clearly dominant.

The query should:
- Takes `sessionId` as arg
- Uses `requireSessionOwner()` or `requireUserId()` plus an explicit ownership check through `convex/lib/authz.ts`
- Returns the full data needed to build `ReportV2Payload` (recommendation + session + tire pressure if available)
- Validates ownership (user can only access their own sessions)

### 5. Write tests

Add tests to `src/lib/reports/reportV2Mapper.test.ts`:
- Maps a full v2 recommendation to a complete `ReportV2Payload`
- Handles missing tire pressure data (returns pending status)
- Handles missing current-bike fields (omits delta display)
- Handles legacy recommendation shapes without throwing

## Output

Write `output-02-report-data-model.md`:
- `ReportV2Payload` type design decisions
- Chosen Convex query location and why
- Which v2 engine fields map to which report sections
- Fields that needed static lookup tables (to be localized in Step 04)
- Any gaps found in the v2 engine output that need to be addressed
