# Prompt 02 — Saddle Width Calculation Engine

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), Convex backend, TypeScript.

You are implementing the saddle width calculation engine. This prompt covers:
1. Creating `src/lib/saddle-width-engine/config.ts` — admin-configurable constants
2. Creating `src/lib/saddle-width-engine/types.ts` — input/output TypeScript types
3. Creating `src/lib/saddle-width-engine/width-engine.ts` — Layer 1: width calculation
4. Creating `src/lib/saddle-width-engine/suitability-engine.ts` — Layer 2: shape/category classification
5. Creating `src/lib/saddle-width-engine/index.ts` — public exports
6. Creating `src/lib/saddle-width-engine/width-engine.test.ts` — unit tests

No UI work, no Convex imports in this prompt. All functions must be pure.

This engine is used by both the public marketing calculator and the dashboard saddle selector.

---

## Existing patterns to follow

- `src/lib/pressure-engine.ts` — similar pure-function calculation engine, study its structure
- `src/lib/publicCalculatorLogic.ts` — `PublicResultEnvelope`, `PublicFitConfidence`, confidence scoring patterns
- `convex/lib/fitAlgorithm/types.ts` — `BikeCategory` (`"road" | "gravel" | "mtb" | "city"`), `Ambition` (`"comfort" | "balanced" | "performance" | "aero"`)

---

## Part A — `src/lib/saddle-width-engine/config.ts`

All tunable constants live here. Do not hardcode these values in the calculation functions.

```typescript
// Posture index 0 = most aggressive, 4 = most upright
export const POSTURE_ADDITIONS_MM: Record<0 | 1 | 2 | 3 | 4, number> = {
  0: 10, // TT / extreme race position
  1: 15, // Aggressive road
  2: 20, // Balanced endurance / gravel
  3: 25, // Upright MTB / recreational
  4: 30, // Very upright commuter / leisure
};

export const BIKE_TYPE_ADJUSTMENTS_MM: Record<SaddleRidingType, number> = {
  tt_triathlon:      -3,
  road_race:          0,
  endurance_road:    +2,
  gravel:            +3,
  mtb:               +4,
  commuter_leisure:  +6,
  indoor_only:       +2,
};

// Symptom deltas: positive = widen, negative = narrow
export const SYMPTOM_DELTAS_MM = {
  numbness_or_pressure:   +6,
  chafing_or_blockage:    -6,
  neutral:                 0,
} as const;

// Width class bins (brand-agnostic)
export const WIDTH_BINS: Array<{ label: string; min: number; max: number }> = [
  { label: "XS", min: 125, max: 135 },
  { label: "S",  min: 136, max: 145 },
  { label: "M",  min: 146, max: 155 },
  { label: "L",  min: 156, max: 165 },
  { label: "XL", min: 166, max: 175 },
  { label: "XXL",min: 176, max: 190 },
];

export const CONFIDENCE_WEIGHTS = {
  measuredBase: 95,
  estimatedBase: 55,
  missingRidingType: -5,
  missingPosture: -5,
  conflictingSymptoms: -10,
  partialProfileData: -5,
} as const;

export const SIT_BONE_WIDTH_RANGE = { min: 60, max: 200 } as const;
export const HIP_CIRCUMFERENCE_RANGE = { min: 70, max: 160 } as const; // cm
```

---

## Part B — `src/lib/saddle-width-engine/types.ts`

### SaddleRidingType

```typescript
export type SaddleRidingType =
  | "tt_triathlon"
  | "road_race"
  | "endurance_road"
  | "gravel"
  | "mtb"
  | "commuter_leisure"
  | "indoor_only";
```

### SaddlePostureCategory

```typescript
export type SaddlePostureCategory = "aggressive" | "balanced" | "upright";
```

### SaddleInputMethod

```typescript
export type SaddleInputMethod = "measured" | "estimated";
```

### SaddleWidthInput (public calculator, Layer 1 + 2 inputs)

```typescript
export interface SaddleWidthInput {
  // Anatomy — one of the two groups must be provided
  sitBoneWidthMm?: number;            // measured path
  heightCm?: number;                  // fallback path
  weightKg?: number;                  // fallback path
  hipCircumferenceCm?: number;        // fallback path

  inputMethod: SaddleInputMethod;

  // Riding context
  ridingType: SaddleRidingType;
  postureCategory: SaddlePostureCategory;

  // Optional — dashboard only
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  symptoms?: SaddleSymptomFlags;
  currentSaddleWidthMm?: number;
  currentSaddleTilt?: "nose_down" | "neutral" | "nose_up" | "unknown";
  currentSaddleShape?: "flat" | "waved" | "hammock" | "short_nose" | "unknown";
  flexibilityScore?: number;          // 1-5
  coreStabilityScore?: number;        // 1-5
  typicalRideLength?: "short" | "medium" | "long" | "ultra";
}
```

### SaddleSymptomFlags

```typescript
export interface SaddleSymptomFlags {
  sisBonePain: boolean;
  numbness: boolean;
  chafing: boolean;
  slidingForward: boolean;
  instability: boolean;
  lowerBackPressure: boolean;
  handPressure: boolean;
  asymmetry: boolean;
}
```

### SaddleWidthResult (Layer 1 output)

```typescript
export interface SaddleWidthResult {
  // Source
  inputMethod: SaddleInputMethod;
  resolvedSitBoneWidthMm: number;
  estimatedSitBoneRange?: { min: number; max: number }; // only if estimated

  // Width outputs
  targetSupportWidthMm: number;      // after posture factor
  adjustedWidthMm: number;           // after bike-type correction
  finalRecommendedWidthMm: number;   // after symptom delta (if any)
  widthRangeMinMm: number;           // finalRecommendedWidthMm - 5
  widthRangeMaxMm: number;           // finalRecommendedWidthMm + 5

  // Width class
  primaryWidthClass: string;         // "M", "L", etc.
  primaryWidthClassRange: { min: number; max: number };
  alternateWidthClasses: string[];

  // Confidence
  confidenceScore: number;           // 0-100
  confidenceLevel: "high" | "medium" | "lower";

  // Width match (if currentSaddleWidthMm was provided)
  widthMatchScore?: number;
  widthMatchAssessment?: "too_narrow" | "good_match" | "too_wide";

  // Explanation (template key + resolved values, UI formats into text)
  explanationKey: "measured_result" | "estimated_result";
  explanationParams: Record<string, string | number>;
}
```

### SaddleSuitabilityResult (Layer 2 output)

```typescript
export type SaddleFamily =
  | "short_nose_performance"
  | "endurance_allroad"
  | "gravel_mtb_support"
  | "comfort_upright";

export type SaddleNoseType = "short_nose" | "traditional_nose";
export type SaddleProfileShape = "flat" | "moderate_wave" | "waved";
export type SaddlePaddingPreference = "firm" | "medium" | "soft";

export interface SaddleSuitabilityResult {
  saddleFamily: SaddleFamily;
  noseType: SaddleNoseType;
  profileShape: SaddleProfileShape;
  cutoutRecommended: boolean;
  paddingPreference: SaddlePaddingPreference;
  fitInteractionWarnings: FitInteractionWarning[];
  shapeFlags: string[];             // reasons for shape choices
}

export interface FitInteractionWarning {
  code: string;
  severity: "info" | "warning";
  message: string;                  // en locale; dashboard formats with locale
}
```

### Combined output

```typescript
export interface SaddleCalculationResult {
  width: SaddleWidthResult;
  suitability: SaddleSuitabilityResult;
}
```

---

## Part C — `src/lib/saddle-width-engine/width-engine.ts`

Implement the following exported functions:

### `estimateSitBoneWidth(input)`

Used when `inputMethod === "estimated"`. Returns a range, not a single value.

```typescript
function estimateSitBoneWidth(input: {
  heightCm: number;
  weightKg: number;
  hipCircumferenceCm: number;
}): { estimatedMm: number; rangeMm: { min: number; max: number } }
```

Hip circumference bands → base value:
- < 90 cm → 115 mm
- 90–95 → 120; 96–100 → 125; 101–106 → 130; 107–112 → 138
- 113–118 → 145; 119–124 → 152; ≥ 125 → 160

Height correction:
- < 160 cm → −5; 160–175 → 0; 176–185 → +3; > 185 → +6

Weight correction:
- < 60 kg → −3; 60–80 → 0; 81–95 → +3; > 95 → +5

`estimatedMm = clamp(base + height_correction + weight_correction, 90, 170)`
`rangeMm = { min: estimatedMm - 10, max: estimatedMm + 10 }`

### `mapPostureToIndex(postureCategory, ridingType)`

```typescript
function mapPostureToIndex(
  postureCategory: SaddlePostureCategory,
  ridingType: SaddleRidingType
): 0 | 1 | 2 | 3 | 4
```

Rules:
- `aggressive` + `tt_triathlon` → 0
- `aggressive` → 1
- `balanced` → 2
- `upright` + `commuter_leisure` → 4
- `upright` → 3

### `classifySymptoms(symptoms)`

```typescript
function classifySymptoms(symptoms: SaddleSymptomFlags): {
  widthDeltaMm: number;
  dominant: "widen" | "narrow" | "shape_or_setup" | "conflicting" | "none";
}
```

Symptoms suggesting wider: `numbness`, `sisBonePain`, `instability`
Symptoms suggesting narrower: `chafing`
Symptoms suggesting shape/setup (no width delta): `slidingForward`, `lowerBackPressure`, `handPressure`, `asymmetry`

If both widen and narrow symptoms present → `conflicting`, delta = 0
If only setup/shape symptoms → `shape_or_setup`, delta = 0
Apply `SYMPTOM_DELTAS_MM.numbness_or_pressure` or `SYMPTOM_DELTAS_MM.chafing_or_blockage` per direction.

### `findWidthClass(widthMm)`

```typescript
function findWidthClass(widthMm: number): {
  label: string;
  range: { min: number; max: number };
  alternates: string[];
}
```

Find the bin where `min <= widthMm <= max`. Return up to two adjacent bin labels as alternates.

### `calculateSaddleWidth(input)` — main exported function

```typescript
export function calculateSaddleWidth(input: SaddleWidthInput): SaddleWidthResult
```

Follow the steps:
1. Resolve `sitBoneWidthMm` (measured or estimate)
2. Map posture to index → look up posture addition from `POSTURE_ADDITIONS_MM`
3. Apply bike-type correction from `BIKE_TYPE_ADJUSTMENTS_MM`
4. Apply symptom delta (if symptoms provided) from `classifySymptoms`
5. Calculate width range: `[final - 5, final + 5]`
6. Find width class via `findWidthClass`
7. Calculate confidence score: start from base, apply deductions per `CONFIDENCE_WEIGHTS`
8. Calculate width match score if `currentSaddleWidthMm` provided:
   - Within 5 mm of recommended → `good_match`, score 90
   - 6–15 mm off → score scales linearly 60–89
   - > 15 mm off → `too_narrow` or `too_wide`, score < 60
9. Build and return `SaddleWidthResult`

---

## Part D — `src/lib/saddle-width-engine/suitability-engine.ts`

```typescript
export function classifySaddleSuitability(
  input: SaddleWidthInput,
  widthResult: SaddleWidthResult
): SaddleSuitabilityResult
```

Implement the following decision logic:

**Nose type**
- `short_nose` if `ridingType === "tt_triathlon"` OR (`postureCategory === "aggressive"` AND NOT `symptoms?.slidingForward`)
- `traditional_nose` otherwise

**Profile shape**
- `flat` if `ridingType === "gravel"` OR `ridingType === "mtb"` OR (`flexibilityScore` >= 4)
- `waved` if `symptoms?.slidingForward` OR (`ridingType === "endurance_road"` AND `flexibilityScore` < 3)
- `moderate_wave` otherwise

**Cutout**
- `true` if `symptoms?.numbness` OR `indoorOutdoor === "indoor"` OR (`postureCategory === "aggressive"`)

**Padding**
- `firm` if `ridingType === "road_race"` OR `ridingType === "tt_triathlon"` OR `typicalRideLength === "long"` OR `typicalRideLength === "ultra"`
- `soft` if `ridingType === "commuter_leisure"` AND `postureCategory === "upright"`
- `medium` otherwise

**Saddle family**
- `short_nose_performance` if `noseType === "short_nose"`
- `gravel_mtb_support` if `ridingType === "gravel"` OR `ridingType === "mtb"`
- `comfort_upright` if `ridingType === "commuter_leisure"` AND `postureCategory === "upright"`
- `endurance_allroad` otherwise

**Fit interaction warnings**

Generate a `FitInteractionWarning` for each applicable condition:
1. `symptoms?.numbness` AND `currentSaddleTilt === "nose_down"`:
   - code: `"numbness_tilt_likely"`, severity: `"warning"`, message: "Your reported numbness may be partly caused by a nose-down saddle tilt. Check tilt before attributing it to saddle width alone."
2. `symptoms?.handPressure`:
   - code: `"hand_pressure_not_width"`, severity: `"info"`, message: "Increased hand pressure is more likely related to reach or drop than saddle width."
3. `symptoms?.asymmetry`:
   - code: `"asymmetry_not_width"`, severity: `"warning"`, message: "One-sided symptoms often point to pelvic tilt or cleat issues rather than saddle width."
4. `widthResult.widthMatchAssessment === "good_match"` AND `symptoms?.numbness`:
   - code: `"good_width_check_setup"`, severity: `"info"`, message: "Your current saddle width is close to the recommendation. Tilt and setback are more likely the contributing factor."
5. `classifySymptoms(symptoms).dominant === "conflicting"`:
   - code: `"conflicting_symptoms"`, severity: `"warning"`, message: "Your symptoms point in different directions. A professional fit assessment may be more effective than a width change alone."

---

## Part E — `src/lib/saddle-width-engine/index.ts`

```typescript
export { calculateSaddleWidth } from "./width-engine";
export { classifySaddleSuitability } from "./suitability-engine";
export type {
  SaddleWidthInput,
  SaddleWidthResult,
  SaddleSuitabilityResult,
  SaddleCalculationResult,
  SaddleRidingType,
  SaddlePostureCategory,
  SaddleInputMethod,
  SaddleSymptomFlags,
  SaddleFamily,
  FitInteractionWarning,
} from "./types";
```

---

## Part F — Unit Tests

Create `src/lib/saddle-width-engine/width-engine.test.ts`.

Test cases required:

1. **Measured path, balanced road**: SBW 130 mm, balanced, endurance_road → final ≈ 152 mm, class M, confidence High
2. **Measured path, aggressive TT**: SBW 130 mm, aggressive, tt_triathlon → lower final (posture 0 + −3 bike), class S
3. **Estimated path, mid-range body data**: height 172 cm, weight 72 kg, hip 105 cm → SBW estimate ~130 mm, confidence Lower
4. **Posture upright commuter**: SBW 120 mm, upright, commuter_leisure → final = 120 + 30 + 6 = 156 mm, class L
5. **Symptom widen**: SBW 130 mm, balanced, road + numbness → final = 152 + 6 = 158 mm
6. **Symptom narrow**: SBW 130 mm, balanced, road + chafing → final = 152 − 6 = 146 mm
7. **Conflicting symptoms**: numbness + chafing → dominant = conflicting, delta = 0, warning generated
8. **Width match — too narrow**: SBW 130 mm, balanced endurance → recommended ~152 mm, current 138 mm → matchAssessment = too_narrow
9. **Width match — good match**: same as above but current 150 mm → matchAssessment = good_match
10. **Missing inputs — estimated without hip circumference**: should throw or return error indicator
