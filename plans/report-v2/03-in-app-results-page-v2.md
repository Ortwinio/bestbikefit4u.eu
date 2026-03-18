# Step 03 — In-App Results Page V2

## Objective

Redesign `src/app/(dashboard)/fit/[sessionId]/results/` to render all v2 report sections using engine v2 data. The page must be fully bilingual (EN/NL) and use the `ReportV2Payload` from Step 02.

## Background

Read:
- `src/app/(dashboard)/fit/[sessionId]/results/` — current results page implementation
- `plans/report-v2/bestbikefit4u_v2_report_and_migration_plan (1).docx.md` — sections 1–6 for the target UX
- `plans/engine-v2-migration/output-07-ux-rollout.md` — what the UX rollout already landed
- `src/i18n/messages/en.ts` — existing i18n structure for adding new keys
- `src/components/results/` and `src/components/ui/` — existing rendering building blocks to reuse before adding new ones

## Page Sections to Implement

### Section 1 — Rider Profile Card
Display: session ID, bike type, riding style, goal, algorithm version, global confidence, data quality status, missing data list.

Use a compact table/card layout. Show a "Data quality" banner if any fields are pending — "Some recommendations require additional data. See tire pressure section for details."

### Section 2 — Priority Summary Table
For each fit parameter (cleat, saddle height, setback, bar drop, reach/stem):
- Target value with unit
- "Why it matters" — one sentence (from i18n — content written in Step 04)
- Rider validation cue — what the rider should feel when it's right (from i18n)
- Status chip: "Ready to apply" / "Pending data" / "Optional"

### Section 3 — Detailed Fit Table
For each parameter:
- Target (with range if confidence < 90%)
- Method label (e.g. "LeMond baseline + Holmes validation") — from static lookup / i18n
- Feel description — from i18n
- Watch-outs — from i18n

### Section 4 — Adjustment Sequence
Ordered list of adjustment steps with:
- Parameter name
- Exact measurement reference (e.g. "BB center to saddle top along seat-tube line")
- Guideline: "Change one variable at a time, max 2–5 mm per move"

### Section 5 — Tire Pressure
If tire pressure data exists: show front/rear pressure in psi and bar, confidence, surface condition used.
If pending: show "Pending required data" banner with list of missing inputs and a link to the bike setup page to add them.

### Section 6 — 14-Day Validation Plan
Static table (content in i18n dictionaries):
| Day block | Change | Ride duration | What to score |

### PDF Export Button
Keep existing "Download PDF" button. After Step 05, it will render the v2 PDF.

## i18n Requirements

All user-visible strings must go into `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts` under a new `results` namespace:
- Section headers
- Status chip labels
- "Why it matters" (placeholder in this step — real content added in Step 04)
- Rider validation cues (placeholder in this step)
- Watch-outs (placeholder in this step)
- Pending data messages
- 14-day plan table content

Add to both EN and NL. NL copy can be placeholder Dutch in this step; Step 04 provides final copy. Keep placeholders centralized and easy to replace.

## Component Structure

```
src/app/(dashboard)/fit/[sessionId]/results/
  page.tsx                        ← fetches ReportV2Payload via getReportV2 query
  components/
    RiderProfileCard.tsx
    PriorityTable.tsx
    DetailedFitTable.tsx
    AdjustmentSequence.tsx
    TirePressureSection.tsx
    ValidationPlan.tsx
```

Keep components simple — no new design system, use existing UI primitives from `src/components/ui/`.

## Tasks

1. Add i18n keys for all new strings (EN + NL placeholders)
2. Decide whether each section should be a new route-local component or an adaptation of an existing `src/components/results/` component; keep that decision consistent
3. Create the component files listed above only where reuse is not sufficient
4. Update `page.tsx` to use `getReportV2` query and pass data to components
5. Preserve existing loading, regeneration, email, and download behaviors unless there is a concrete reason to change them
6. Ensure locale is passed to all components for translation
7. Run `npm run test:i18n`, `npm run typecheck`, and any route/component tests affected by the refactor

## Output

Write `output-03-in-app-results-page-v2.md`:
- Component structure implemented
- i18n keys added (list of new keys)
- Any deviations from the spec and why
- Validation results and any reused legacy components
