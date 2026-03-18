# Prompt 01 — Convex Schema Extension + Pressure Engine

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), Convex backend, TypeScript.

You are implementing the tire pressure module. This prompt covers:
1. Extending `convex/schema.ts` with four new tables
2. Implementing the pressure calculation engine at `src/lib/pressure-engine.ts`

No UI work in this prompt.

---

## Part A — Extend `convex/schema.ts`

The file is at `/convex/schema.ts`. It uses `defineSchema`, `defineTable`, and `v` from Convex. Existing tables: `users`, `profiles`, `bikes`, `fitSessions`, `questionnaireResponses`, `recommendations`, `emailReports`, `questionDefinitions`, `reportRateLimits`, `marketingEvents`.

Add four new tables **after** the existing `bikes` table definition.

### Table: `wheelsets`

```ts
wheelsets: defineTable({
  bikeId: v.id("bikes"),
  userId: v.id("users"),                          // for auth checks without joining bikes
  name: v.string(),                               // e.g. "Zipp 303 S"
  rimType: v.union(v.literal("hooked"), v.literal("hookless")),
  internalRimWidthFrontMm: v.optional(v.number()), // 17–35 mm typical
  internalRimWidthRearMm: v.optional(v.number()),
  isActive: v.optional(v.boolean()),              // active wheelset for this bike
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_bike", ["bikeId"])
  .index("by_user", ["userId"])
```

### Table: `tireSetups`

```ts
tireSetups: defineTable({
  wheelsetId: v.id("wheelsets"),
  userId: v.id("users"),
  name: v.string(),                               // e.g. "GP5000 tubeless 32mm"
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  widthFrontMm: v.number(),                       // e.g. 28, 32, 50; validation: 18–80
  widthRearMm: v.number(),
  tubeType: v.union(
    v.literal("inner_tube"),
    v.literal("latex_tube"),
    v.literal("tubeless")
  ),
  casingType: v.optional(v.union(
    v.literal("race_light"),
    v.literal("allround"),
    v.literal("reinforced")
  )),
  maxPressureBar: v.optional(v.number()),         // from tire sidewall; 3.5–10 bar
  isActive: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_wheelset", ["wheelsetId"])
  .index("by_user", ["userId"])
```

### Table: `pressureProfiles`

A named preset combining a tire setup, use case and recommended pressures.

```ts
pressureProfiles: defineTable({
  bikeId: v.id("bikes"),
  tireSetupId: v.id("tireSetups"),
  userId: v.id("users"),
  name: v.string(),                               // e.g. "Race setup", "Nat weer"
  useCase: v.union(
    v.literal("race"),
    v.literal("endurance"),
    v.literal("wet_weather"),
    v.literal("gravel_mixed"),
    v.literal("comfort"),
    v.literal("custom")
  ),
  targetSurface: v.optional(v.string()),          // free text, e.g. "smooth asphalt"
  targetGoal: v.optional(v.string()),             // free text
  recommendedFrontBar: v.number(),
  recommendedRearBar: v.number(),
  lastCalculatedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_bike", ["bikeId"])
  .index("by_user", ["userId"])
```

### Table: `pressureCalculations`

Each run of the pressure calculator (basic or advanced) stored for history/comparison.

```ts
pressureCalculations: defineTable({
  userId: v.id("users"),
  bikeId: v.optional(v.id("bikes")),
  tireSetupId: v.optional(v.id("tireSetups")),
  sourceType: v.union(
    v.literal("public_basic"),    // used by non-logged-in users (saved later on login)
    v.literal("dashboard_basic"),
    v.literal("dashboard_advanced")
  ),
  // Inputs snapshot (so calculation is reproducible)
  inputSnapshot: v.object({
    bodyWeightKg: v.number(),
    bikeWeightKg: v.optional(v.number()),
    extraLuggageKg: v.optional(v.number()),
    discipline: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mtb"),
      v.literal("tt")
    ),
    widthFrontMm: v.number(),
    widthRearMm: v.number(),
    tubeType: v.union(
      v.literal("inner_tube"),
      v.literal("latex_tube"),
      v.literal("tubeless")
    ),
    casingType: v.optional(v.string()),
    rimType: v.optional(v.union(v.literal("hooked"), v.literal("hookless"))),
    internalRimWidthFrontMm: v.optional(v.number()),
    internalRimWidthRearMm: v.optional(v.number()),
    surface: v.union(
      v.literal("smooth_asphalt"),
      v.literal("average_asphalt"),
      v.literal("rough_asphalt"),
      v.literal("hardpack_gravel"),
      v.literal("loose_gravel"),
      v.literal("trail")
    ),
    ridingGoal: v.optional(v.union(
      v.literal("speed"),
      v.literal("balance"),
      v.literal("comfort")
    )),
    isWet: v.optional(v.boolean()),
    routeDistanceKm: v.optional(v.number()),
    routeElevationM: v.optional(v.number()),
    offRoadPercent: v.optional(v.number()),
  }),
  // Output
  recommendedFrontBar: v.number(),
  recommendedRearBar: v.number(),
  recommendedFrontPsi: v.number(),
  recommendedRearPsi: v.number(),
  // Current pressure (for comparison; only in advanced mode)
  currentFrontBar: v.optional(v.number()),
  currentRearBar: v.optional(v.number()),
  // Scores 0–100
  comfortScore: v.optional(v.number()),
  gripScore: v.optional(v.number()),
  efficiencyScore: v.optional(v.number()),
  // Warnings as JSON array of warning keys
  warningsJson: v.optional(v.string()),
  // Route context stored as JSON
  routeContextJson: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_bike", ["bikeId"])
  .index("by_user_created", ["userId", "createdAt"])
```

---

## Part B — Extend `bikes` table

The existing `bikes` table in `convex/schema.ts` only has `userId`, `name`, `bikeType`, `currentGeometry`, `currentSetup`, `createdAt`, `updatedAt`.

Add the following **optional** fields to the `bikes` defineTable call (inside the object argument, not as index calls):

```ts
discipline: v.optional(v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mtb"),
  v.literal("tt")
)),
bikeWeightKg: v.optional(v.number()),   // 5–15 kg typical
photoUrl: v.optional(v.string()),
fitProfileId: v.optional(v.id("profiles")),  // link to a body profile
brand: v.optional(v.string()),
model: v.optional(v.string()),
```

These fields are all optional so existing bikes remain valid without migration.

---

## Part C — Pressure Engine at `src/lib/pressure-engine.ts`

Create a pure TypeScript module. No imports from Convex or Next.js — only TypeScript. This file is used both client-side (public calculator, real-time) and server-side (Convex actions for validation).

### Types to export

```ts
export type Discipline = "road" | "gravel" | "mtb" | "tt";

export type Surface =
  | "smooth_asphalt"
  | "average_asphalt"
  | "rough_asphalt"
  | "hardpack_gravel"
  | "loose_gravel"
  | "trail";

export type TubeType = "inner_tube" | "latex_tube" | "tubeless";

export type CasingType = "race_light" | "allround" | "reinforced";

export type RimType = "hooked" | "hookless";

export type RidingGoal = "speed" | "balance" | "comfort";

export type WarningKey =
  | "max_rim_pressure_exceeded"
  | "hookless_limit_exceeded"
  | "pressure_too_low_for_setup"
  | "front_rear_pressure_mismatch"
  | "inner_tube_pinch_flat_risk"
  | "road_tire_width_unusual"
  | "gravel_tire_width_unusual"
  | "mtb_tire_width_unusual"
  | "hookless_max_pressure_unknown";

export interface BasicPressureInput {
  // Required
  discipline: Discipline;
  bodyWeightKg: number;           // 35–160
  widthFrontMm: number;
  widthRearMm: number;
  tubeType: TubeType;
  surface: Surface;
  // Optional
  bikeWeightKg?: number;
  ridingGoal?: RidingGoal;
}

export interface AdvancedPressureInput extends BasicPressureInput {
  casingType?: CasingType;
  rimType?: RimType;
  internalRimWidthFrontMm?: number;
  internalRimWidthRearMm?: number;
  maxPressureBar?: number;        // from tire sidewall
  isWet?: boolean;
  extraLuggageKg?: number;
  routeDistanceKm?: number;
  routeElevationM?: number;
  offRoadPercent?: number;        // 0–100
  currentFrontBar?: number;
  currentRearBar?: number;
}

export interface PressureOutput {
  frontBar: number;               // rounded to 1 decimal
  rearBar: number;
  frontPsi: number;               // rounded to 0 decimals
  rearPsi: number;
  warnings: WarningKey[];
  // Only set in advanced mode
  comfortScore?: number;          // 0–100
  gripScore?: number;
  efficiencyScore?: number;
  explanation: string;            // 1–2 sentence plain-language summary (EN)
}
```

### Calculation logic

Implement two exported functions:

```ts
export function calculateBasicPressure(input: BasicPressureInput): PressureOutput
export function calculateAdvancedPressure(input: AdvancedPressureInput): PressureOutput
```

#### Base pressure algorithm

The base recommended rear pressure (in bar) is calculated as:

```
totalSystemMassKg = bodyWeightKg + (bikeWeightKg ?? 8)
rearLoadKg = totalSystemMassKg * 0.60   // 60% on rear
frontLoadKg = totalSystemMassKg * 0.40  // 40% on front

// Starting point from tire width (empirical, road baseline)
rearBaseBar = (rearLoadKg / widthRearMm) * 0.9
frontBaseBar = (frontLoadKg / widthFrontMm) * 0.9
```

#### Discipline multipliers

Apply to both front and rear base pressure:

| Discipline | Multiplier |
|------------|-----------|
| road       | 1.00      |
| gravel     | 0.72      |
| mtb        | 0.50      |
| tt         | 1.05      |

#### Surface adjustments (additive, bar)

| Surface           | Adjustment |
|-------------------|-----------|
| smooth_asphalt    | +0.2      |
| average_asphalt   | 0.0       |
| rough_asphalt     | -0.2      |
| hardpack_gravel   | -0.3      |
| loose_gravel      | -0.5      |
| trail             | -0.7      |

#### Tube type adjustments (additive, bar)

| Tube type   | Front | Rear |
|-------------|-------|------|
| tubeless    | -0.2  | -0.3 |
| latex_tube  | -0.1  | -0.1 |
| inner_tube  |  0.0  |  0.0 |

#### Riding goal adjustments (additive, bar)

| Goal    | Adjustment |
|---------|-----------|
| speed   | +0.2      |
| balance | 0.0       |
| comfort | -0.2      |

#### Advanced-only adjustments

- **Wet conditions**: subtract 0.2 bar from both
- **Casing type**:
  - `race_light`: +0.1
  - `allround`: 0
  - `reinforced`: -0.1
- **Extra luggage**: add `extraLuggageKg * 0.005` bar to rear (e.g. 10 kg luggage → +0.05 bar)
- **High elevation / long distance** (route context): if `routeElevationM > 1500` or `routeDistanceKm > 150`, subtract 0.1 bar comfort buffer
- **Rim width correction**: if `internalRimWidthFrontMm` is provided, apply `(internalRimWidthFrontMm - 19) * 0.01` bar correction (positive for wider rims above 19 mm reference). Same for rear.

#### Absolute floor and ceiling

After all adjustments, clamp values:

| Discipline | Min bar | Max bar |
|------------|---------|---------|
| road       | 4.0     | 9.0     |
| gravel     | 1.5     | 5.0     |
| mtb        | 0.8     | 3.5     |
| tt         | 5.0     | 9.5     |

#### Rear >= front rule

After clamping, if `rearBar < frontBar`, set `rearBar = frontBar`.

#### PSI conversion

`psi = bar * 14.5038`, rounded to integer.

### Scores (advanced mode only)

Compute scores 0–100 based on the ratio of recommended pressure to the extremes of the allowed range for the discipline:

- **comfortScore**: higher when pressure is lower in the range. `comfortScore = Math.round((1 - (rearBar - minBar) / (maxBar - minBar)) * 100)`
- **gripScore**: same formula as comfort score (lower pressure = more grip for non-road)
- **efficiencyScore**: inverse — higher pressure = more efficient. `efficiencyScore = Math.round(((rearBar - minBar) / (maxBar - minBar)) * 100)`

Clamp all scores to 0–100.

### Warnings

Generate warnings by checking these conditions:

| Condition | Warning key |
|-----------|------------|
| `maxPressureBar` provided and recommended > `maxPressureBar` | `max_rim_pressure_exceeded` |
| `rimType === "hookless"` and recommended > 3.5 bar and no `maxPressureBar` | `hookless_max_pressure_unknown` |
| `rimType === "hookless"` and `maxPressureBar` provided and recommended > `maxPressureBar` | `hookless_limit_exceeded` |
| recommended < 1.5 bar and `tubeType === "inner_tube"` | `inner_tube_pinch_flat_risk` |
| `rearBar > frontBar * 1.4` | `front_rear_pressure_mismatch` |
| `discipline === "road"` and (`widthFrontMm < 20` or `widthFrontMm > 40`) | `road_tire_width_unusual` |
| `discipline === "gravel"` and (`widthFrontMm < 30` or `widthFrontMm > 65`) | `gravel_tire_width_unusual` |
| `discipline === "mtb"` and `widthFrontMm < 45` | `mtb_tire_width_unusual` |

### Explanation text

Generate a simple English explanation string. Examples:

- Basic: `"Recommended pressure for a {widthFrontMm}mm {tubeType} setup on {surface}."`
- Advanced: `"Based on your {totalSystemMassKg} kg total load and {surface} surface, {widthRearMm}mm tubeless tyres work best around {rearBar} bar rear / {frontBar} bar front."`

Keep the explanation under 150 characters.

### Validation helper

Export a validation function (used by both client and server):

```ts
export interface ValidationError {
  field: string;
  message: string;
}

export function validatePressureInput(
  input: Partial<BasicPressureInput>
): ValidationError[]
```

Rules:
- `bodyWeightKg`: required, 35–160
- `widthFrontMm`: required, 18–80
- `widthRearMm`: required, 18–80
- `bikeWeightKg`: if provided, 3–20
- `ridingGoal`: if provided, must be one of `speed | balance | comfort`
- Discipline-specific width warnings (not errors, just included as warnings in the output):
  - road: warn if width < 20 or > 40
  - gravel: warn if width < 30 or > 65
  - mtb: warn if width < 45
- Pressure range: if `currentFrontBar` or `currentRearBar` provided (AdvancedInput), must be 0.8–9.0

### Unit test hint

The function should be pure and deterministic. A 75 kg rider, road bike, 28 mm tubeless, average asphalt, balance goal should produce roughly front 5.2 bar / rear 5.6 bar.

---

## Files to create/modify

- Modify: `convex/schema.ts`
- Create: `src/lib/pressure-engine.ts`

Do not create any UI files in this prompt.
