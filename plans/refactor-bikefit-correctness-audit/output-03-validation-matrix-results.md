# Output 03: Algorithm Validation Matrix Results

Date: 2026-02-19  
Scope: deterministic + boundary validation of bikefit calculations, invariants, and recommendation mapping.

## Test Execution Summary

Commands executed:

```bash
npm run test -- convex/lib/fitAlgorithm/__tests__/invariants.test.ts convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts convex/recommendations/__tests__/generate.mapping.integration.test.ts
npm run test -- convex/lib/fitAlgorithm/__tests__/ convex/recommendations/__tests__/
```

Observed result:
- `8` test files passed
- `35` tests passed
- `0` failing tests

Primary evidence:
- `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts`
- `convex/lib/fitAlgorithm/__tests__/invariants.test.ts`
- `convex/recommendations/__tests__/generate.mapping.integration.test.ts`
- `convex/lib/fitAlgorithm/__tests__/validation.test.ts`

## Validation Matrix (Expected vs Actual)

| ID | Scenario Type | Scenario | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|
| M01 | Nominal profile | Road, balanced, 1750/810, FS=5, CS=5 saddle-height component | `height=715`, `range=697..737` | `height=715`, `range=697..737` | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:40` |
| M02 | Nominal profile | Gravel measured reach with torso/arm (`580/620`) | `reach=492`, `range=450..610` | `reach=492`, `range=450..610` | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:106` |
| M03 | Boundary min/max clamp | Bar drop low clamp (road comfort, low scores) | clamped to `40` | `40` | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:74` |
| M04 | Boundary min/max clamp | Bar drop high clamp (road aero, high scores + advanced exp) | clamped to `150` | `150` | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:74` |
| M05 | Boundary min/max clamp | Reach low clamp (city comfort fallback, low scores) | clamped to `300` | `300` | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:106` |
| M06 | Boundary min/max clamp | Reach high clamp (road aero, large torso/arm, high scores) | clamped to `630` | `630` | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:106` |
| M07 | Category/goal combination | City + aero remaps to performance for setback path | `56` | `56` | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:62` |
| M08 | Category/goal combination | MTB + aero remaps to performance for cockpit outputs | aero equals performance for drop/setback/cleat/reach | equality confirmed | pass | `convex/lib/fitAlgorithm/__tests__/invariants.test.ts:63` |
| M09 | Missing optional measurements | No torso/arm uses fallback reach branch | fallback branch used; clamp respected | fallback branch + clamp confirmed | pass | `convex/lib/fitAlgorithm/__tests__/formulaComponents.test.ts:120` |
| M10 | Inconsistent anthropometrics | Inseam must be `<` height | calculation throws validation error | throws expected error | pass | `convex/lib/fitAlgorithm/__tests__/invariants.test.ts:105` |
| M11 | Inconsistent anthropometrics | Outlier inseam ratio warning path | `measurement_warning` emitted | warning emitted | pass | `convex/lib/fitAlgorithm/__tests__/validation.test.ts:65` |
| M12 | Invariant | Larger inseam should not reduce saddle height | non-decreasing sequence across inseams `[650..950]` | non-decreasing confirmed | pass | `convex/lib/fitAlgorithm/__tests__/invariants.test.ts:20` |
| M13 | Invariant | Higher aggression should trend larger drop/reach (road) | non-decreasing across comfort->balanced->performance->aero | trend confirmed | pass | `convex/lib/fitAlgorithm/__tests__/invariants.test.ts:42` |
| M14 | Recommendation E2E mapping | Session+profile -> `buildFitInputs` -> `calculateBikeFit` -> persisted `calculatedFit` | all mapped fields equal algorithm output mapping | exact object equality confirmed | pass | `convex/recommendations/__tests__/generate.mapping.integration.test.ts:23` |

## Coverage Gaps

1. Canonical docx mismatches found in Step 02 are not yet encoded as failing spec tests.
   - Gap: guardrail clamp (`0.865..0.890`) vs implementation (`0.86..0.91`), missing setback refinement terms.
   - Evidence: `plans/refactor-bikefit-correctness-audit/output-02-formula-audit.md`, `convex/lib/fitAlgorithm/calculations.ts:119`, `convex/lib/fitAlgorithm/calculations.ts:132`.

2. No automated parser-backed oracle from `docs/Bikefit Calculation Engine.docx`.
   - Gap: expected values are currently manually curated in tests.
   - Risk: formula drift may not be immediately detected if constants change without synchronized tests.

3. Geometry-aware recommendation flow remains partially unvalidated end-to-end.
   - Gap: integration test validates mapping persistence, but not a full geometry-fed stem solve path from questionnaire/session.
   - Evidence: `convex/recommendations/inputMapping.ts:79`, `convex/lib/fitAlgorithm/index.ts:116`.

4. Experience-level behavior remains untested through questionnaire mapping.
   - Gap: algorithm supports experience modifier, but questionnaire mapping does not currently feed it.
   - Evidence: `convex/lib/fitAlgorithm/calculations.ts:181`, `convex/recommendations/inputMapping.ts:79`.

## Failures and Root-Cause Hypotheses

Runtime test failures observed in this step: `none`.

Actionable correctness failures remain from formula audit (spec conformance):

1. Saddle-height guardrail mismatch (spec drift)
   - Hypothesis: clamp values were widened intentionally during implementation to reduce warning frequency, but not reconciled with canonical docx.
   - Evidence: `convex/lib/fitAlgorithm/calculations.ts:119`.

2. Setback refinement terms absent (incomplete implementation)
   - Hypothesis: only v1 base formula and offsets were implemented; optional anthropometric refinements were deferred.
   - Evidence: `convex/lib/fitAlgorithm/calculations.ts:132`.

3. Reach fallback behavior differs in real-world flow when profile auto-estimates torso/arm
   - Hypothesis: profile normalization populates torso/arm defaults, bypassing docx fallback path for many users.
   - Evidence: `convex/profiles/mutations.ts:76`, `convex/lib/fitAlgorithm/calculations.ts:210`.

## Step 03 Completion Checklist

- [x] Boundary and nominal scenarios are covered
- [x] Deterministic expected values are documented
- [x] Invariants are tested
- [x] Failures are actionable and reproducible
