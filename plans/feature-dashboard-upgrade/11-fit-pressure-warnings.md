# 11 — Fit-Pressure Warning Flags and Explanation Copy

## Goal

Expand the pressure-fit warning system with the full rule set, add a "Fit & Pressure" tab to the bike detail page, and ensure warnings surface proactively in the dashboard without requiring the user to navigate to the results page.

## Background

After prompt 10, `pressureInsights` is computed and shown on the fit results page. This prompt completes the warning rule set, adds explanatory copy for each scenario, and surfaces the most important warnings in the dashboard pressure card and the bike detail page.

## Steps

### 1. Complete the warning rule set

In `convex/lib/pressureFitInteraction.ts`, add the remaining warning rules from the product spec:

| Warning key | Trigger condition |
|-------------|------------------|
| `pressure_high_for_gravel` | gravel surface + front pressure > 4.5 bar |
| `pressure_low_general` | any surface + front pressure < 1.5 bar |
| `aggressive_setup_rough_terrain` | handlebar drop > 80mm + gravel/MTB terrain + pressure < 2.5 bar |
| `weight_mismatch` | rider weight outside the assumed range for the bike's pressure calculation (>20% diff from stored weight) |
| `gravel_road_conflict` | bike type is road + surface type is gravel |
| `mtb_pressure_stability` | MTB + pressure > 3.5 bar front → control/stability note |
| `performance_posture_low_pressure` | performance comfortBias + front pressure < 3.0 bar |

Each rule produces a human-readable warning key that maps to an i18n explanation string.

### 2. Write unit tests for warning rules

In `convex/lib/__tests__/pressureFitInteraction.test.ts`, test each warning rule with a valid trigger case and a non-trigger case. Use the existing test pattern in `convex/lib/fitAlgorithm/__tests__/`.

### 3. Add performance impact section to fit results

In the "Fit & Pressure Insights" section on the results page (from prompt 10), add a four-metric row:

| Metric | Source |
|--------|--------|
| Comfort | `pressureCalc.comfortScore` (0–1) |
| Grip | `pressureCalc.gripScore` (0–1) |
| Rolling efficiency | `pressureCalc.efficiencyScore` (0–1) |
| Stability | `pressureInsights.stabilityScore` (0–1) |

Render each as a small labeled bar using the progress or meter component style already present in the shared UI layer.

### 4. Surface warnings in the dashboard TirePressureCard

In `TirePressureCard.tsx` (from prompt 07), when the latest pressure calculation for the current bike has an associated recommendation with `pressureInsights.warnings.length > 0`:
- Show a compact warning indicator: a single amber flag icon with a count badge ("2 warnings")
- Clicking it navigates to the bike detail page `#pressure` section
- Do not show the full warning text in the card — it's too verbose for the dashboard

### 5. Add a "Fit & Pressure" section to the bike detail page

In `src/app/(dashboard)/bikes/[bikeId]/page.tsx`, add a section below the pressure block:

**Fit & Pressure Insights:**
- Fetches the most recent `recommendations` record that references this bike only after a real bike-link exists; otherwise defer this section behind the query-layer work from prompt 10
- Shows `pressureInsights` data: comfort bias label, performance impact bars, and warning cards
- "View full fit results" link → `/fit/[sessionId]/results`
- If no fit exists: "Run a fit session to see pressure-fit insights" CTA

### 6. Add `by_bike` index to `recommendations` (if missing)

In `convex/schema.ts`, check if `recommendations` has a `bikeId` field and index. If not:
- The `fitSessions` table has the link chain: `session → profile → bikes`
- Evaluate whether a `bikeId` denormalization on `recommendations` is worth adding, or if a join query is acceptable

If a join is used, document the query in `convex/recommendations/queries.ts` as `getLatestByBike`.

### 7. i18n

Complete the warning copy for all warning keys. Add to both locale files:
- `fit.pressureInsights.warnings.aggressive_setup_rough_terrain` — "Your aggressive handlebar position combined with low pressure on rough terrain may cause discomfort and control issues. Consider raising your bars or increasing tire pressure."
- `fit.pressureInsights.warnings.weight_mismatch` — "Your current weight differs from the weight used in your last pressure calculation. Consider recalculating."
- `fit.pressureInsights.warnings.gravel_road_conflict` — "Your road bike setup is paired with a gravel surface profile. Tire pressure may not be optimized for this use."
- `fit.pressureInsights.warnings.mtb_pressure_stability` — "Your front tire pressure is high for MTB use. Lower pressure improves grip and control on technical terrain."
- `fit.pressureInsights.warnings.performance_posture_low_pressure` — "Your performance posture assumption works best with firmer tires. Consider increasing pressure for road use."
- `fit.pressureInsights.performanceImpact.title` — "Performance impact"
- `fit.pressureInsights.performanceImpact.comfort` — "Comfort"
- `fit.pressureInsights.performanceImpact.grip` — "Grip"
- `fit.pressureInsights.performanceImpact.rolling` — "Rolling efficiency"
- `fit.pressureInsights.performanceImpact.stability` — "Stability"

## Acceptance Criteria

- [ ] All 7 warning rules have unit tests with pass and no-trigger cases
- [ ] Performance impact bars render correctly in fit results
- [ ] Warning count badge appears in the dashboard TirePressureCard when warnings exist
- [ ] Bike detail page shows the Fit & Pressure Insights section
- [ ] All warning messages have EN and NL translations
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
