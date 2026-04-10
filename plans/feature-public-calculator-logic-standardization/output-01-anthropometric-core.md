# Shared Anthropometric Core

## Mission

Make every public fit-related calculator feel like one logic engine by standardizing a shared baseline rider model.

## Shared Public Baseline

### Canonical fields

- `heightCm`
- `inseamCm`
- `bikeCategory`
- `ridingGoal`
- `flexibility`
- `coreStability`

### Field intent

- `heightCm`: body-size anchor for fit and size estimation
- `inseamCm`: primary lower-body fit anchor and default confidence driver
- `bikeCategory`: discipline context that shifts safer vs more aggressive assumptions
- `ridingGoal`: performance-vs-comfort bias
- `flexibility`: posture sustainability modifier
- `coreStability`: posture sustainability and control modifier

## Calculator Mapping

### Bike fit

Visible by default:

- height
- inseam
- bike category
- riding goal
- flexibility
- core stability

Notes:

- This is the reference implementation for the shared baseline.

### Saddle height

Visible by default:

- inseam
- bike category
- riding goal
- flexibility
- core stability

Hidden but available:

- height

Notes:

- Height should be retained in the shared model even if the UI keeps it hidden by default.
- This supports future validation and confidence checks without making the tool heavier.

### Frame size

Visible by default:

- height
- inseam
- bike category

Optional refinement:

- riding goal

Hidden but available:

- flexibility
- core stability

Notes:

- Initial frame-size output can stay simpler than bike-fit output.
- Riding goal should bias “stable vs agile” sizing once implemented.

### Crank length

Visible by default:

- inseam
- bike category

Hidden but available:

- riding goal
- flexibility
- core stability
- height

Notes:

- The core model should still travel with the calculator even if only two inputs are shown.
- This enables warnings such as “recheck saddle height after changing crank length.”

### Tire pressure

The tire-pressure tool does not inherit the anthropometric baseline as its primary contract.

It should remain in the same product family, but use a parallel baseline:

- rider/system weight
- bike discipline
- tyre width
- surface
- tube/rim setup

Shared product-language overlap:

- confidence
- validation
- result structure
- driver explanation
- next best action

## Engineering Contract

Introduce a shared public baseline type, for example:

```ts
type PublicFitBaseline = {
  heightCm?: number;
  inseamCm?: number;
  bikeCategory?: "road" | "gravel" | "mtb" | "city";
  ridingGoal?: "comfort" | "balanced" | "performance" | "aero";
  flexibility?: 1 | 2 | 3 | 4 | 5;
  coreStability?: 1 | 2 | 3 | 4 | 5;
};
```

## Implementation Rules

1. All fit-related calculators must accept the shared baseline, even if some fields are hidden in the UI.
2. Calculator-specific logic may ignore unused baseline fields, but must not redefine them locally with new semantics.
3. Hidden fields may still influence:
   - validation
   - confidence
   - future progressive disclosure
4. Inseam fallback estimation may exist later, but never as the default logic path.

## Success Criteria

- There is one documented baseline model for all public fit-related calculators.
- Fit-related calculators no longer define incompatible local rider models.
- The baseline is rich enough for future explainability and validation work.
- Tire pressure remains part of the same product language without being forced into the wrong body-fit contract.

## User Acceptance Tests

1. A rider opening bike-fit, saddle-height, frame-size, and crank-length sees consistent rider concepts across all tools.
2. If a rider enters inseam on one fit tool, the same concept and unit are used everywhere else.
3. A product manager can point to one baseline schema and explain how every fit-related public calculator uses it.
4. Engineering can add a new fit calculator without inventing a new rider-input model.
