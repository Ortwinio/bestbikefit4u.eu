# Step 02: Algorithm Calculation Unit Tests

## Objective

Test all 10 calculation steps of the fit algorithm against the docx specification formulas.

## Inputs

- `convex/lib/fitAlgorithm/calculations.ts` — all calculation functions
- `convex/lib/fitAlgorithm/constants.ts` — multipliers, offsets, tables
- `docs/Bikefit Calculation Engine.docx` — formula reference

## Tasks

1. Create `convex/lib/fitAlgorithm/__tests__/saddleHeight.test.ts`:
   - Test base calculation: inseam 780mm × 0.883 (road) = 688.74 → 689mm
   - Test all 4 category multipliers (road=0.883, gravel=0.880, mtb=0.875, city=0.870)
   - Test flexibility modifier: flex=2 (score 4, index -1) → delta = 1.5×(-1) = -1.5
   - Test core modifier: core=7 (index +2) → delta = 0.8×(+2) = 1.6
   - Test ambition offsets: comfort=-4, balanced=0, performance=+3, aero=+6
   - Test safety clamp: result stays within inseam×0.86 to inseam×0.91
   - Test MTB/city with aero falls back to performance

2. Create `convex/lib/fitAlgorithm/__tests__/saddleSetback.test.ts`:
   - Test base: SS0 = 0.070 × 780 - 5 = 49.6
   - Test category offsets
   - Test ambition offsets
   - Combined test with known inputs

3. Create `convex/lib/fitAlgorithm/__tests__/barDrop.test.ts`:
   - Test base: SH × Rbd for each category/ambition combination
   - Test flex/core/experience modifiers
   - Test clamping per category

4. Create `convex/lib/fitAlgorithm/__tests__/reach.test.ts`:
   - Test with torso + arm: SR0 = 0.47 × torso + 0.33 × arm + 25
   - Test fallback: SR0 = 0.33 × height
   - Test category/ambition offsets
   - Test flex/core modifiers

5. Create `convex/lib/fitAlgorithm/__tests__/components.test.ts`:
   - Saddle tilt: base by category, drop-based modifiers
   - Cleat offset: lookup by category/ambition
   - Handlebar width: road (round to 20), gravel (+ addition), MTB (×1.80, clamp), city (×1.60, clamp)

6. Create `convex/lib/fitAlgorithm/__tests__/frameTargets.test.ts`:
   - Stack/reach target calculation from saddle position + bar position
   - Stem/spacer solving (brute force search)

7. Create `convex/lib/fitAlgorithm/__tests__/integration.test.ts`:
   - Full `calculateBikeFit()` with a reference rider:
     - Height: 1700mm, Inseam: 780mm, Flex: 5 (avg), Core: 5 (avg)
     - Road, Balanced
     - Verify all outputs are within expected ranges
   - Test confidence scoring

## Deliverable

- Complete unit test coverage for all calculation functions
- Reference test case with known-good values

## Completion Checklist

- [ ] Each of the 10 calculation steps has dedicated tests
- [ ] All category × ambition combinations tested for saddle height and bar drop
- [ ] Edge cases (extreme heights, MTB/city aero fallback) covered
- [ ] Full integration test passes with reference rider
- [ ] Warning generation tested (saddle too high/low, flexibility risk)
