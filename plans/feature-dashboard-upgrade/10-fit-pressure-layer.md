# 10 — Fit-Pressure Interaction Layer

## Goal

Add pressure-aware modifiers to fit recommendations so that tire pressure and terrain context influence the comfort/stability/performance interpretation of a bike fit — without overwriting core fit values like saddle height.

## Background

The fit algorithm lives in `convex/lib/fitAlgorithm/`. The `recommendations` table stores the calculated fit output. The `pressureCalculations` table stores pressure with score outputs. This prompt connects the two by adding an interpretation layer on top of existing outputs.

**Constraint (from product spec):** Pressure must NOT directly change core fit values (saddle height, inseam reach). It modifies the "setup profile" and "risk interpretation layer" only.

## Interaction Rules (from product spec)

| Scenario | Effect |
|----------|--------|
| Low pressure + gravel/endurance terrain | Comfort-oriented setup bias; reduce aggressive drop recommendation |
| High pressure + road race use | Support performance posture if flexibility allows |
| MTB | Pressure influences control/stability more than aero position |
| Pressure too high for terrain | Warning: "Pressure may reduce grip and comfort on this surface" |
| Pressure too low for terrain | Warning: "Pressure may cause pinch flats and handling issues" |
| Aggressive setup + low pressure rough terrain | Warning: saddle comfort risk |

## Steps

### 1. Define the pressure-fit interpretation schema

Add a new field to `convex/schema.ts` in the `recommendations` table:
```ts
pressureInsights: v.optional(v.object({
  comfortBias: v.union(v.literal("comfort"), v.literal("balanced"), v.literal("performance")),
  stabilityScore: v.number(), // 0–1
  surfaceComplianceNote: v.optional(v.string()),
  warnings: v.array(v.string()),
  version: v.number(),
})),
```

This field is computed after the core fit and stores the pressure-influenced interpretation.

### 2. Create `convex/lib/pressureFitInteraction.ts`

This module takes a fit output, a pressure calculation, and bike context and returns `pressureInsights`:

```ts
export function computePressureInsights(
  fitOutput: FitOutput,
  pressureCalc: PressureCalculation | null,
  bike: Bike,
): PressureInsights {
  // No pressure data → return defaults
  if (!pressureCalc) return { comfortBias: "balanced", stabilityScore: 0.5, warnings: [], version: 1 };

  const warnings: string[] = [];
  let comfortBias: "comfort" | "balanced" | "performance" = "balanced";

  // Rule: low pressure + gravel/endurance
  if (pressureCalc.riderPriorityGoal === "comfort" && bike.bikeType === "gravel") {
    comfortBias = "comfort";
  }
  // Rule: high pressure + road
  if (pressureCalc.riderPriorityGoal === "speed" && bike.bikeType === "road") {
    if (fitOutput.flexibilityScore >= 3) comfortBias = "performance";
  }
  // Warning: pressure too high for terrain
  if (pressureCalc.surfaceType === "gravel" && pressureCalc.recommendedFrontBar > 4.5) {
    warnings.push("pressure_high_for_gravel");
  }
  // ... additional rules

  return { comfortBias, stabilityScore: ..., warnings, version: 1 };
}
```

The warning strings are keys that map to i18n copy (not raw text).

### 3. Compute pressure insights when a recommendation is generated

In `convex/recommendations/actions.ts` (or `internalMutations.ts`), after generating the core fit output:
1. Fetch the latest pressure calculation for the relevant bike only after a bike-linking strategy exists for recommendations or sessions
2. Call `computePressureInsights`
3. Save the result in `recommendations.pressureInsights`

This is additive — it does not change the core fit values.

### 4. Update the fit results UI

In `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` and/or the results components in `src/components/results/`:

Add a "Fit & Pressure Insights" section (only visible if `pressureInsights` is present):
- Show the `comfortBias` as a profile label: "Comfort-oriented setup" / "Balanced setup" / "Performance setup"
- Show a row of scores: Comfort · Stability · Surface compliance (small bar indicators using the `progress` component from the prototyper-ui migration)
- Show any warnings as yellow/red flag cards (each warning key maps to an i18n string with explanation)
- If no warnings: show a green "Setup looks well-matched to your pressure profile" note

### 5. Retroactively compute for existing recommendations

Add a one-time Convex action `backfillPressureInsights` that iterates existing `recommendations` records and computes `pressureInsights` where missing. Do NOT run this automatically — it should be triggered manually from the Convex dashboard if needed.

### 6. i18n

Add translation keys for warning messages and section labels. Add to both locale files:
- `fit.pressureInsights.title` — "Fit & Pressure Insights"
- `fit.pressureInsights.comfortBias.comfort` — "Comfort-oriented setup"
- `fit.pressureInsights.comfortBias.balanced` — "Balanced setup"
- `fit.pressureInsights.comfortBias.performance` — "Performance setup"
- `fit.pressureInsights.allGood` — "Setup looks well-matched to your pressure profile"
- `fit.pressureInsights.warnings.pressure_high_for_gravel` — "Your tire pressure may reduce grip and comfort on gravel surfaces."
- `fit.pressureInsights.warnings.pressure_low_general` — "Your tire pressure may cause handling issues or pinch flats."
- (add remaining warning keys)

## Acceptance Criteria

- [ ] `recommendations.pressureInsights` field exists in schema
- [ ] `computePressureInsights` function has unit tests covering the main rule scenarios
- [ ] Insights are computed and saved when a new fit recommendation is generated
- [ ] Fit results page shows the "Fit & Pressure Insights" section when insights exist
- [ ] Warning flags render correctly for each warning scenario
- [ ] Core fit values (saddle height, etc.) are unchanged by this logic
- [ ] `npm run typecheck` passes
