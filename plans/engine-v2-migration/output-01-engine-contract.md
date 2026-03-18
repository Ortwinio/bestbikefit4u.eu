# Output 01 — Engine V1 Contract Baseline

## Purpose

Lock the current recommendation engine into an explicit baseline before Engine v2 adds envelopes, profiles, and shadow-mode comparison.

## Current Source of Truth in Repo

- fit math: `convex/lib/fitAlgorithm/`
- input mapping: `convex/recommendations/inputMapping.ts`
- recommendation generation scheduling: `convex/recommendations/mutations.ts`
- action execution and persistence: `convex/recommendations/actions.ts`
- storage: `convex/recommendations/internalMutations.ts`

## Current Engine V1 Input Contract

The current deterministic engine consumes a `FitInputs` object with:

- bike category
- ambition
- height and inseam in millimeters
- flexibility and core scores mapped onto the internal 0-10 scale
- optional torso, arm, shoulder width, foot length, femur length
- optional frame stack and frame reach

The extracted reusable builder for this phase is now:

- `buildEngineV1FitInputs()` in `convex/recommendations/seedEngine.ts`

## Current Engine V1 Output Contract

The fit algorithm returns `FitOutputs` including:

- saddle height, setback, tilt
- bar drop and saddle-to-bar reach
- crank length, handlebar width, cleat offset
- frame stack/reach targets
- stem/spacer solution
- ranges for saddle height, bar drop, and reach
- confidence score
- algorithm version
- warnings and optional deltas

The persistence-facing mapping for the current recommendation table is now:

- `mapStoredCalculatedFit()` in `convex/recommendations/seedEngine.ts`

## Current Recommendation Persistence Shape

The current stored recommendation shape remains:

- `calculatedFit`
- `confidenceScore`
- `algorithmVersion`
- `frameSizeRecommendations`
- `fitNotes`
- `adjustmentPriorities`
- optional `painPointSolutions`

This phase does not change the schema. It only makes the mapping explicit and reusable.

## Shadow-Mode Comparison Baseline

The current comparison snapshot for v1 versus v2 should use:

- `saddleHeightMm`
- `saddleSetbackMm`
- `barDropMm`
- `saddleToBarReachMm`
- `stemLengthMm`
- `crankLengthMm`
- `handlebarWidthMm`
- `confidenceScore`

The reusable snapshot builder for this phase is:

- `buildEngineComparisonSnapshot()` in `convex/recommendations/seedEngine.ts`

## Known V1 Limitations Preserved Intentionally

- effective top tube is still estimated as reach plus a fixed offset
- recommendation persistence is still centered on `fitSessions -> recommendations`
- no confidence envelope or feasibility object exists yet
- no shadow record is stored yet
- no validation or feedback overlay is applied yet

## Phase 1 Exit Status

- [x] current engine inputs are documented and extracted
- [x] current engine output mapping is explicit
- [x] shadow comparison fields are defined
- [x] targeted tests added for the extracted seed contract
