# Calculator UI Audit

## Dashboard Reference Patterns

### 1. Ordinal slider questions

Reference files:

- `src/components/profile/RidingStyleCard.tsx`
- `src/components/measurements/StepComfort.tsx`
- `src/components/measurements/StepFlexibility.tsx`
- `src/components/measurements/StepCoreStability.tsx`

Observed pattern:

- `SliderQuestion` uses a horizontal snap-point slider with:
  - primary-tinted background track
  - primary filled track
  - large active thumb with `border-background` and `shadow-md`
  - smaller inactive dots with reduced opacity
  - live selected-value badge in `bg-primary/10`
  - low-friction click targets on both dots and labels
- The measurement steps treat slider input as the main interaction, not as a secondary control hidden behind a dropdown.
- The slider labels communicate progression left-to-right and reinforce fit meaning rather than generic option picking.

Commercial/UI implication:

- The dashboard makes ordinal fit inputs feel calibrated and purpose-built.
- The public calculators currently reduce similar fit choices to dropdowns, which feels less product-specific and less trustworthy.

### 2. Continuous number sliders

Reference file:

- `src/components/measurements/NumberSlider.tsx`

Observed pattern:

- `NumberSlider` uses:
  - a 12px inset track
  - primary tinted background track
  - solid primary fill
  - active thumb matching `SliderQuestion`
  - floating current-value badge
  - native range input over a custom visual track
- `ReadOnlyNumberSlider` preserves the same visual language in view mode.

Commercial/UI implication:

- The dashboard already has a clear visual language for measurement ranges.
- Public measurement inputs currently behave like plain form fields, so the product loses continuity exactly where fit estimation should feel guided.

### 3. Dashboard color/surface semantics

Reference files:

- `src/app/globals.css`
- `src/components/profile/RidingStyleCard.tsx`
- `src/components/measurements/NumberSlider.tsx`

Observed pattern:

- Dashboard calculator controls lean on:
  - `--primary` for active slider state
  - `bg-primary/15` for inactive track
  - `bg-primary/10` for selected-value badge
  - `border-background` and stronger shadow on the active thumb
- The tone is more decisive than the public calculator surfaces.
- The slider itself carries the state emphasis instead of relying only on surrounding cards.

## Public Calculator Audit

### 1. Bike fit calculator

Files:

- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.tsx`

Current input pattern:

- Height and inseam use `PublicNumberField`.
- Bike category, ambition, flexibility, and core all use `PublicSelectField`.

Parity gaps:

- `flexibility` and `core` are ordinal fit questions and map directly to dashboard slider semantics, but are currently dropdowns.
- `ambition` is also a progressive scale and would likely read better as a slider or segmented ordinal control than a select.
- The input surface feels like a polished form, not like a guided fit intake.

Priority:

- Highest-value first migration target because it is the most dashboard-adjacent public calculator.

### 2. Saddle height calculator

Files:

- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx`

Current input pattern:

- Inseam uses `PublicNumberField`.
- Category, ambition, flexibility, and core all use `PublicSelectField`.

Parity gaps:

- Same as bike fit: three of these fields behave like fit sliders in the dashboard, but not on the marketing site.
- The calculator currently explains nuance in copy while keeping interaction generic.

Priority:

- Second migration target after bike fit because the interaction model overlaps heavily.

### 3. Frame size calculator

Files:

- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.tsx`

Current input pattern:

- Height and inseam use `PublicNumberField`.
- Bike category uses `PublicSelectField`.

Parity gaps:

- Fewer slider opportunities here.
- The main mismatch is surface and color language, not missing ordinal sliders.

Priority:

- Medium. It should adopt the same calculator shell and numeric-range styling, but it is not the first place to introduce dashboard-style ordinal sliders.

### 4. Crank length calculator

Files:

- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.tsx`

Current input pattern:

- Inseam uses `PublicNumberField`.
- Category uses `PublicSelectField`.

Parity gaps:

- Similar to frame size: mostly shell/color consistency and possibly future numeric slider treatment for inseam.
- No immediate dashboard-equivalent ordinal slider need.

Priority:

- Medium-low. Good follow-on after shared tokens and core fit calculators are aligned.

### 5. Tire-pressure calculator

Files:

- `src/app/(public)/bandenspanning-calculator/page.tsx`
- `src/components/features/pressure/PressureCalculatorForm.tsx`
- `src/components/features/pressure/PressureCalculatorHero.tsx`
- `src/components/features/pressure/PressureCalculatorCta.tsx`

Current input pattern:

- This route has its own feature-specific surface stack rather than the public calculator primitives used by the fit calculators.

Parity gaps:

- Likely its own custom UI language.
- Needs token and shell review so it still feels part of the same calculator family, even if not every control should become a dashboard-style slider.

Priority:

- Later than bike fit and saddle height because it is a different interaction family.

## Shared Public Primitive Audit

Files:

- `src/components/public/PublicFormFields.tsx`
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/public/PublicPrimitives.tsx`
- `src/app/globals.css`

Observed pattern:

- `PublicNumberField` and `PublicSelectField` are solid generic form wrappers.
- They do not expose a dashboard-style slider primitive.
- Public cards use `public-card-surface-subtle` and related public tokens, which are intentionally softer than dashboard surfaces.

Parity gaps:

- There is no shared public calculator slider system.
- Public calculator cards and fields rely on broader marketing tokens rather than calculator-specific tokens aligned with the dashboard.
- Equivalent fit questions now use different interaction models depending on whether the user is in dashboard or on the public site.

## Color And Surface Drift

Reference files:

- `src/app/globals.css`
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/profile/RidingStyleCard.tsx`
- `src/components/measurements/NumberSlider.tsx`

Observed drift:

- Public calculator cards are visually softer and more marketing-oriented.
- Dashboard calculator controls carry stronger fit-state emphasis through primary track/fill/thumb treatment.
- Public result cards already use some strong primary surfaces, but the input side lacks equivalent decisiveness.
- Public calculator interaction color is currently concentrated in buttons and output cards, not in the controls themselves.

## Best First Migration Targets

1. `bike-fit`

- Strongest parity opportunity.
- Uses the same fit dimensions as dashboard flows.
- Contains the clearest slider candidates: flexibility, core, and likely ambition.

2. `saddle-height`

- Same ordinal fit-context questions as bike fit.
- Can reuse the same slider primitives almost directly once shared.

3. Shared calculator primitives

- Needed before page-level migration:
  - ordinal slider question
  - numeric slider field or slider-ready numeric field
  - calculator-specific color/surface tokens

4. `frame-size` and `crank-length`

- Adopt shell, spacing, and color consistency after the core shared primitives land.

5. `bandenspanning-calculator`

- Align family-level surfaces and tokens after the fit calculators converge.
