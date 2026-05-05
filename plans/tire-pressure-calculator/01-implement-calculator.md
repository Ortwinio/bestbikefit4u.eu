# Prompt 01 — Implement Tire Pressure Calculator

## Context

Read `plans/tire-pressure-calculator/README.md` before starting.

The pressure calculation engine already exists at `src/lib/pressure-engine.ts` and is tested. Do not modify it.

The public component vocabulary exists: `PublicSurfaceCard`, `PublicInfoPanel`, `PublicNumberField`, `PublicSelectField`, `PublicScaleField`, `PublicMetricPanel`, `PublicCalculatorResultSummary`. Study `SaddleHeightCalculatorForm.tsx` and `GearingCalculatorForm.tsx` for the exact usage pattern.

## Task

Implement the full tire pressure calculator UI following the design in the README.

## Deliverables

### 1. Types and defaults
`src/components/calculators/tire-pressure/types.ts`
- `TirePressureFormState` interface (see README data model)
- `TirePressureUIState` interface

`src/components/calculators/tire-pressure/tire-pressure-defaults.ts`
- `DEFAULT_FORM_STATE` constant with: discipline=road, surface=average_asphalt, tubeType=inner_tube, ridingGoal=balance

### 2. Input components

`RiderInputGroup.tsx`
- body weight number field (required, 35–160 kg)
- bike weight number field (optional, 3–20 kg, helper "Default: 8 kg if not set")
- riding style: 3-option PublicScaleField (comfort / balance / performance)

`BikeTireInputGroup.tsx`
- discipline: PublicSelectField (road / gravel / mtb / tt)
- front tire width: PublicNumberField (18–80 mm)
- rear tire width: PublicNumberField (18–80 mm) + "Same as front" button that copies the front value

`TireSetupInputGroup.tsx`
- tube type: 3 clickable cards (inner_tube / tubeless / latex_tube)
- each card: label + short description of pressure effect
- Keyboard navigable, role="radiogroup"

`SurfaceInputGroup.tsx`
- 5 surface tiles in a grid: smooth_asphalt / average_asphalt / rough_asphalt / hardpack_gravel / loose_gravel
- Each tile: label + pressure delta hint (e.g. "+0.2 bar", "base", "−0.2 bar")
- Wet toggle below: boolean toggle for isWet (−0.2 bar both)

`AdvancedOptionsAccordion.tsx`
- Hidden by default, chevron trigger
- Fields: casingType, rimType, maxPressureBar, internalRimWidthFrontMm, internalRimWidthRearMm, extraLuggageKg, routeDistanceKm, routeElevationM
- Show helper text per field as described in README

### 3. Orchestration

`TirePressureCalculator.tsx`
- Holds all form state with useState
- Calls `validatePressureInput` on each state change
- Calls `calculateAdvancedPressure` when any advanced field is set, else `calculateBasicPressure`
- Renders in 2-column grid on lg+: form left, result right (sticky)
- Accepts optional `prefill?: Partial<TirePressureFormState>` prop

`TirePressureForm.tsx`
- Composes all input groups in order: Rider → BikeTire → TireSetup → Surface → Advanced
- Each group wrapped in `PublicSurfaceCard`

### 4. Result components

`PressureResultCard.tsx`
- Empty state: dashed border placeholder
- Result state:
  - Confidence badge (amber/blue/green)
  - Front number (text-4xl font-semibold) + unit
  - Rear number (text-4xl font-semibold) + unit
  - Unit toggle button group (bar / psi)
  - Explanation text ("Rear is higher because you carry ~60% of total load on the rear wheel")
  - Score bars (only when result has comfortScore/gripScore/efficiencyScore)
  - Warning list (amber inline panels, one per WarningKey)

`PressureScoreBars.tsx`
- 3 rows: Comfort / Grip / Efficiency
- Each: label + progress bar + number
- Use role="progressbar"

`PressureWarnings.tsx`
- Maps WarningKey to human-readable copy
- Renders as amber inline notice, role="alert"

Warning copy map:
- max_rim_pressure_exceeded → "Recommended pressure exceeds your rim's max. Reduce to stay within limits."
- hookless_limit_exceeded → "Hookless rims have a strict pressure limit. Follow the ETRTO standard (max 4.5 bar for most tires)."
- pressure_too_low_for_setup → "Pressure may be too low for this setup. Risk of pinch flats."
- front_rear_pressure_mismatch → "Front and rear pressure differ by more than expected. Check your inputs."
- inner_tube_pinch_flat_risk → "This pressure is too low for inner tubes. Increase to reduce pinch flat risk."
- road_tire_width_unusual → "This tire width is unusual for road. Check you entered the correct width."
- gravel_tire_width_unusual → "This width is outside the typical gravel range. Verify your tire size."
- mtb_tire_width_unusual → "This width is narrow for MTB. Verify you entered mm, not inches."
- hookless_max_pressure_unknown → "Hookless rim detected but no max pressure set. Enter your rim's max to get a safety check."

### 5. Supporting sections

`PressureAdjustmentTips.tsx`
- 3 cards in `md:grid-cols-3` grid
- Card 1: More comfort — icon, "−0.2 bar rear / −0.1 bar front", explanation
- Card 2: More speed — icon, "+0.2 bar", explanation  
- Card 3: More grip — icon, "−0.2 bar front", explanation
- On mobile: vertical stack

`SafetyNotice.tsx`
- PublicInfoPanel tone="warning"
- Static copy (no props needed)
- Covers: sidewall limits, hookless rims, manufacturer limits

`CalculatorConversionCTA.tsx`
- Card with title "Save this setup in your BestBikeFit4U profile"
- Two links: primary (sign up / account), secondary (compare pressure settings)
- Use `PublicCtaBand` or a simple card

### 6. Page

`src/app/(public)/calculators/tire-pressure/page.tsx`
- Server component
- Export metadata with title, description, openGraph
- Render PublicHero + TirePressureCalculatorForm

`src/app/(public)/calculators/tire-pressure/TirePressureCalculatorForm.tsx`
- Client boundary (`"use client"`)
- Imports `TirePressureCalculator` from components/calculators/tire-pressure

## Constraints

- No new npm packages
- No inline styles
- Match existing calculator visual language exactly
- Keep all calculation logic in `src/lib/pressure-engine.ts` — no duplication
- Add `isNl?: boolean` prop to `TirePressureCalculator` for Dutch strings (follow saddle height pattern)
- Test file: `TirePressureCalculatorForm.test.tsx` with at minimum: renders without crash, shows result when valid inputs provided, shows warning for hookless without max pressure
