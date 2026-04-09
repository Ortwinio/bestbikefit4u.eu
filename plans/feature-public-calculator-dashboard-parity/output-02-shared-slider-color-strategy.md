# Shared Slider And Color Strategy

## Decision Summary

Do not create a second public-only slider system for fit-like calculator questions. The dashboard already defines the correct interaction model. The implementation should extract or wrap that logic into shared calculator primitives that both dashboard and public surfaces can consume.

## Component Strategy

### 1. Ordinal fit slider

Reference source:

- `src/components/profile/RidingStyleCard.tsx`

Recommendation:

- Extract `SliderQuestion` from `RidingStyleCard.tsx` into a shared location, for example a calculator-specific shared component folder.
- Keep the dashboard card shell separate from the slider itself.
- Rename or wrap it with a more generic purpose, for example a shared fit-question slider.

Why:

- The current implementation is already usable on the public site.
- The interaction semantics are exactly what the public fit calculators need.
- Rebuilding it separately would create avoidable drift.

### 2. Continuous numeric range slider

Reference source:

- `src/components/measurements/NumberSlider.tsx`

Recommendation:

- Move `NumberSlider` and `ReadOnlyNumberSlider` into a shared calculator primitive area, or create public-safe wrappers around them.
- Use them only where continuous drag interaction makes the input more intuitive than typed entry.

Best initial public use:

- not every measurement field
- only fields where dragging improves clarity and does not harm precision
- likely phase-two adoption for measurement ranges rather than immediate replacement of all numeric inputs

### 3. Public calculator field layer

Reference source:

- `src/components/public/PublicFormFields.tsx`

Recommendation:

- Keep `PublicNumberField` and `PublicSelectField` for generic numeric and categorical inputs.
- Add shared calculator slider primitives beside them rather than forcing all fields through select/input patterns.
- Public calculators should then choose from:
  - number field
  - select field
  - ordinal fit slider
  - numeric range slider

## Color Strategy

## Goal

Calculator controls on the marketing site should use the same state hierarchy as the dashboard:

- inactive track
- active fill
- active thumb
- selected-value badge
- endpoint labels
- focus state

### Token recommendation

Reference source:

- `src/app/globals.css`

Add calculator-oriented tokens that can be shared across dashboard and public contexts, for example:

- `--calculator-track`
- `--calculator-track-active`
- `--calculator-thumb`
- `--calculator-thumb-ring`
- `--calculator-value-badge`
- `--calculator-surface`
- `--calculator-surface-muted`
- `--calculator-border`

Default mapping:

- Public theme can initially map these to the existing primary/public palette.
- Dashboard can map them to its current slider treatments.

Why:

- The current code relies on local `bg-primary/15`, `bg-primary`, `ring-primary/30`, and `bg-primary/10` combinations.
- Those work, but they encode calculator semantics ad hoc inside components instead of at the token layer.

## Surface Strategy

Recommendation:

- Introduce a calculator-specific surface utility for public pages that sits visually closer to dashboard-card treatment than to generic marketing cards.
- Keep this limited to calculator forms and result modules, not the whole marketing site.

Likely utility additions in `src/app/globals.css`:

- `calculator-card-surface`
- `calculator-card-surface-muted`
- `calculator-result-surface`

## Migration Rules

1. Shared primitive extraction happens before page migration.
2. Any public calculator using slider-like fit questions must use the shared slider primitive.
3. Equivalent fit questions cannot be implemented as a slider in dashboard and a select in public unless there is a documented constraint.
4. Public calculators may keep number fields where typed precision is the better UX.

## Risks

### 1. Coupling risk

- `SliderQuestion` currently lives inside `RidingStyleCard.tsx`.
- Extraction is required so public pages do not import dashboard card concerns.

### 2. Over-migration risk

- Replacing every numeric input with a slider would reduce accuracy.
- Public parity should mean shared interaction logic where the question type matches, not slider-everything.

### 3. Theme drift risk

- If the color mapping stays hard-coded to `bg-primary/...` in one area and token-driven in another, drift will continue.

## Recommended Shared Ownership

- Shared calculator slider primitives: common/shared UI location
- Dashboard composition: dashboard/profile/measurement components
- Public composition: public calculator form components
- Calculator color tokens: `src/app/globals.css`
