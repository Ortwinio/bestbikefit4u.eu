# 02 — Extend FitInputs and add climbing modifiers to algorithm

## Goal
Add `climbingLevel` to `FitInputs` and apply biomechanically-driven positional modifiers in the fit calculation.

## Steps

### 1. Extend `FitInputs` in `convex/lib/fitAlgorithm/types.ts`

```ts
export type ClimbingLevel = "rarely" | "occasional" | "regular" | "climbing_focused";

export interface FitInputs {
  // ... existing fields ...

  // Optional climbing context
  climbingLevel?: ClimbingLevel;
}
```

### 2. Add climbing modifier constants to `convex/lib/fitAlgorithm/constants.ts`

```ts
export const CLIMBING_MODIFIERS: Record<
  ClimbingLevel,
  { saddleHeightMm: number; saddleSetbackMm: number; barDropMm: number; reachMm: number }
> = {
  rarely:           { saddleHeightMm: 0,  saddleSetbackMm: 0, barDropMm: 0,   reachMm: 0   },
  occasional:       { saddleHeightMm: 1,  saddleSetbackMm: 0, barDropMm: -5,  reachMm: 0   },
  regular:          { saddleHeightMm: 3,  saddleSetbackMm: 2, barDropMm: -10, reachMm: -5  },
  climbing_focused: { saddleHeightMm: 4,  saddleSetbackMm: 3, barDropMm: -20, reachMm: -12 },
};
```

Values are additive on top of the base calculation. Negative `barDropMm` means less drop (bars raised relative to saddle). Negative `reachMm` means shorter reach.

### 3. Apply modifiers in `convex/lib/fitAlgorithm/calculations.ts`

In the main `calculateFit(inputs: FitInputs): FitOutputs` function, after all base calculations are complete and before validation/clamping, apply:

```ts
if (inputs.climbingLevel && inputs.climbingLevel !== "rarely") {
  const mod = CLIMBING_MODIFIERS[inputs.climbingLevel];
  outputs.saddleHeightMm = clamp(
    outputs.saddleHeightMm + mod.saddleHeightMm,
    outputs.saddleHeightRange.min,
    outputs.saddleHeightRange.max
  );
  outputs.saddleSetbackMm += mod.saddleSetbackMm;
  outputs.barDropMm = clamp(
    outputs.barDropMm + mod.barDropMm,
    outputs.barDropRange.min,
    outputs.barDropRange.max
  );
  outputs.saddleToBarReachMm = clamp(
    outputs.saddleToBarReachMm + mod.reachMm,
    outputs.reachRange.min,
    outputs.reachRange.max
  );
}
```

### 4. Thread `climbingLevel` from the session into `FitInputs`

In the recommendations engine (likely `convex/recommendations/seedEngine.ts` or the session result computation), locate where `FitInputs` is assembled from questionnaire responses. Add:

```ts
const climbingResponse = getResponseValue(responses, "climbing_importance");
if (climbingResponse && typeof climbingResponse === "string") {
  fitInputs.climbingLevel = climbingResponse as ClimbingLevel;
}
```

### 5. Update unit tests

In `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts`, add a test case verifying that:
- `climbing_focused` produces a higher saddle, more setback, less drop, and shorter reach than `rarely` with otherwise identical inputs
- All outputs remain within their respective safety clamps

## Acceptance criteria
- [ ] `climbingLevel` is accepted by `FitInputs` without breaking existing calls (field is optional)
- [ ] A `climbing_focused` rider receives measurably different saddle height, drop, and reach vs. a `rarely` rider
- [ ] All outputs remain within safety clamps after modifier application
- [ ] Existing algorithm unit tests pass unchanged
