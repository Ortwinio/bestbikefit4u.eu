# Shared Anthropometric Core

## Decision

All public fit-related calculators should consume one shared rider-baseline contract before calculator-specific refinements are applied.

## Baseline Schema

### Required schema object

```ts
type PublicRiderBaseline = {
  heightCm?: number;
  inseamCm?: number;
  bikeCategory?: "road" | "gravel" | "mtb" | "city";
  ridingGoal?: "comfort" | "balanced" | "performance" | "aero";
  flexibility?: 1 | 2 | 3 | 4 | 5;
  coreStability?: 1 | 2 | 3 | 4 | 5;
  inseamSource?: "measured" | "estimated";
};
```

### Input semantics

- `heightCm`: full-body sizing driver and validation anchor
- `inseamCm`: primary lower-body fit driver
- `bikeCategory`: discipline context for geometry, saddle height bias, crank guidance, and pressure family logic
- `ridingGoal`: posture bias and aggressiveness modifier
- `flexibility`: fit sustainability modifier
- `coreStability`: fit sustainability modifier
- `inseamSource`: required for confidence logic

## Calculator Mapping

### Bike fit

Uses the full baseline.

- Primary drivers:
  - height
  - inseam
  - bike category
- Secondary modifiers:
  - riding goal
  - flexibility
  - core stability

### Saddle height

Inherits the baseline, but the default visible model stays simpler.

- Default required:
  - inseam
  - bike category
- Default optional refinements:
  - riding goal
  - flexibility
  - core stability
- Future optional:
  - crank length

### Frame size

Inherits the baseline even if only part of it is shown by default.

- Default required:
  - height
  - inseam
  - bike category
- Optional refinement:
  - riding goal for stability vs agility bias

### Crank length

Inherits the baseline but defaults to a narrower input view.

- Default required:
  - inseam
  - bike category
- Optional refinement:
  - riding goal
- Future optional:
  - hip-compression sensitivity or pedaling-style refinement

### Tire pressure

Does not use the anthropometric baseline as its main logic contract, but it should still align with the shared product language.

- Shared family concepts:
  - bike category discipline semantics
  - result confidence
  - primary vs secondary driver explanations
  - next-ride validation guidance
- Separate calculator-specific base:
  - rider/system weight
  - front/rear tire width
  - setup
  - surface
  - riding goal

## Visibility Rules

### Baseline visibility policy

- `bike-fit`: show the full baseline
- `saddle-height`: show only the minimal baseline first, then optional refinements
- `frame-size`: show height + inseam + category first, with riding-goal refinement optional
- `crank-length`: show inseam + category first, with deeper modifiers hidden initially

### Hidden but shared rule

Even when a field is hidden in the UI, the calculator should still consume the same shared baseline contract shape internally. Hidden fields remain `undefined`, not remapped into calculator-specific local models.

## Engineering Implications

- Create a shared public calculator baseline type in a neutral module, not in a page-local file.
- Create one normalization function to coerce string form values into the baseline contract.
- Create one baseline-preservation strategy so calculators can pass data between tools or prefill from query params/account context later.
- Avoid calculator-specific copies of `bikeCategory`, `ridingGoal`, `flexibility`, and `coreStability` enums.
- Do not allow each calculator to invent its own “goal” or “category” meanings.

## Success Criteria

- One baseline type is used across all fit-related public calculators.
- No fit-related calculator uses its own incompatible enum set for shared rider inputs.
- Hidden optional refinements do not break the shared logic model.
- The tire-pressure calculator stays separate in its core inputs, but aligns with the same product-language contract.

## User Acceptance Tests

1. A rider opens `bike-fit`, enters height, inseam, category, goal, flexibility, and core stability, and then opens `saddle-height`.
   Expected: overlapping fields can be prefilled or understood as the same product inputs rather than reinterpreted differently.
2. A rider opens `frame-size` and sees a lightweight input set first.
   Expected: the tool still clearly belongs to the same fit system and can optionally accept riding-goal refinement later.
3. A rider opens `crank-length`.
   Expected: inseam and category are treated as part of the same rider baseline used elsewhere, not as isolated tool-only inputs.
4. A rider moves between `bike-fit`, `saddle-height`, and `frame-size`.
   Expected: category names, goal names, and scale meanings stay consistent.
