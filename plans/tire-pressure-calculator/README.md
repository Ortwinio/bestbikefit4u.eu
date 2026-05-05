# Tire Pressure Calculator — Design & Implementation Plan

**Status**: Design complete, awaiting implementation  
**Created**: 2026-04-25  
**Scope**: Public calculator page + reusable dashboard component

---

## Goal

Replace the missing public tire pressure calculator with a productized cycling setup assistant. The engine (`src/lib/pressure-engine.ts`) already exists with full calculation logic. This work is purely UI and wiring.

## Background

- Engine: `src/lib/pressure-engine.ts` — `calculateBasicPressure`, `calculateAdvancedPressure`, `validatePressureInput`
- Types: `BasicPressureInput`, `AdvancedPressureInput`, `PressureOutput`, `WarningKey`
- Score fields on `PressureOutput`: `comfortScore`, `gripScore`, `efficiencyScore` (advanced path only)
- Existing component vocabulary: `PublicSurfaceCard`, `PublicInfoPanel`, `PublicNumberField`, `PublicSelectField`, `PublicScaleField`, `PublicMetricPanel`, `PublicCalculatorResultSummary`
- Pattern reference: `SaddleHeightCalculatorForm`, `GearingCalculatorForm`

## Scope

**In scope**
- Public calculator page at `/calculators/tire-pressure`
- All 7 UI states (empty, filled, result, advanced expanded, mobile, validation, dark mode)
- Progressive disclosure for advanced fields
- Unit toggle bar ↔ psi
- Fine-tune tips section (comfort / speed / grip cards)
- Safety notice
- Conversion CTA
- Reusable component structure for future dashboard use

**Out of scope**
- Convex persistence (gearing already saves sessions; tire pressure can follow same pattern later)
- SEO programmatic pages (separate prompt)
- Dashboard wiring (separate prompt)

---

## Screen Structure

### Page layout (desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ PublicHero                                                   │
│  title · subtitle · trust chips · discipline badges          │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────────┬──────────────────────────────┐
│ TirePressureForm (scroll)    │ PressureResultCard (sticky)  │
│  ┌──────────────────────┐   │  ┌──────────────────────┐    │
│  │ RiderInputGroup      │   │  │ Front / Rear numbers  │    │
│  │ BikeTireInputGroup   │   │  │ bar ↔ psi toggle      │    │
│  │ TireSetupInputGroup  │   │  │ Confidence badge      │    │
│  │ SurfaceInputGroup    │   │  │ Score bars            │    │
│  │ AdvancedAccordion    │   │  │ Warnings              │    │
│  └──────────────────────┘   │  └──────────────────────┘    │
│                              │                               │
└──────────────────────────────┴──────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ PressureAdjustmentTips  (comfort · speed · grip)            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ SafetyNotice                                                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ CalculatorConversionCTA                                      │
└─────────────────────────────────────────────────────────────┘
```

### Page layout (mobile)
Single column. ResultCard appears below form (not sticky). Adjustment tips collapse to accordion. Hero simplified (no chips).

---

## Component Hierarchy

```
TirePressureCalculatorPage          (page.tsx — server component)
  PublicHero                        (existing)
  TirePressureCalculator            (client boundary)
    TirePressureForm
      RiderInputGroup
      BikeTireInputGroup
      TireSetupInputGroup
      SurfaceInputGroup
      AdvancedOptionsAccordion
        (casingType, rimType, internalRimWidth, wet, extraLuggage, routeDistance/elevation)
    PressureResultCard
      PressureScoreBars
      PressureWarnings
    PressureAdjustmentTips
      PressureAdjustmentCard × 3 (comfort / speed / grip)
    SafetyNotice
    CalculatorConversionCTA
```

---

## Data Model

```typescript
// Form state (maps 1:1 to AdvancedPressureInput)
interface TirePressureFormState {
  // Rider
  bodyWeightKg: number | undefined;
  bikeWeightKg: number | undefined;
  ridingGoal: RidingGoal;              // default: "balance"
  extraLuggageKg: number | undefined;

  // Bike & tire
  discipline: Discipline;              // default: "road"
  widthFrontMm: number | undefined;
  widthRearMm: number | undefined;
  wheelSize: "700c" | "650b" | "26" | "29";  // display only, not in engine

  // Tire setup
  tubeType: TubeType;                  // default: "inner_tube"
  casingType: CasingType | undefined;  // advanced
  rimType: RimType | undefined;        // advanced
  internalRimWidthFrontMm: number | undefined;  // advanced
  internalRimWidthRearMm: number | undefined;   // advanced
  maxPressureBar: number | undefined;  // advanced

  // Surface
  surface: Surface;                    // default: "average_asphalt"
  isWet: boolean;

  // Route (advanced)
  routeDistanceKm: number | undefined;
  routeElevationM: number | undefined;
  offRoadPercent: number | undefined;
}

// UI-only state
interface TirePressureUIState {
  unit: "bar" | "psi";
  advancedExpanded: boolean;
}
```

---

## Input Groups Design

### RiderInputGroup
| Field | Component | Default | Required |
|-------|-----------|---------|----------|
| Body weight (kg) | `PublicNumberField` min=35 max=160 | — | Yes |
| Bike weight (kg) | `PublicNumberField` min=3 max=20 | 8 (hidden default) | No |
| Riding style | `PublicScaleField` 3 options | "balance" | No |

Helper text: "Riding style adjusts pressure ±0.2 bar."

### BikeTireInputGroup
| Field | Component | Default | Required |
|-------|-----------|---------|----------|
| Bike type | `PublicSelectField` road/gravel/endurance/tt | "road" | Yes |
| Front tire width (mm) | `PublicNumberField` min=18 max=80 | — | Yes |
| Rear tire width (mm) | `PublicNumberField` min=18 max=80 | same as front | Yes |

Helper: Same front/rear toggle — "Same as front" checkbox.

### TireSetupInputGroup
| Field | Component | Default | Required |
|-------|-----------|---------|----------|
| Tube type | 3-option icon card selector | "inner_tube" | Yes |

Tube type options shown as 3 clickable cards:
- Inner tube (most common)
- Tubeless (−0.2/0.3 bar)
- Latex tube (−0.1 bar)

### SurfaceInputGroup
Surface shown as visual tile grid (5 tiles with icon + label):
- Smooth asphalt
- Average asphalt (default)
- Rough asphalt
- Gravel / hardpack
- Loose gravel

Wet conditions: standalone toggle below the grid.

### AdvancedOptionsAccordion
Hidden by default. Chevron trigger with "Advanced options" label.
| Field | Notes |
|-------|-------|
| Tire casing | race light / allround (default) / reinforced |
| Rim type | hooked (default) / hookless |
| Max tire pressure (bar) | if known from sidewall |
| Internal rim width front (mm) | defaults to 19mm |
| Internal rim width rear (mm) | defaults to 19mm |
| Extra luggage (kg) | adds to rear load |
| Route distance (km) | reduces pressure for 150km+ |
| Route elevation (m) | reduces pressure for 1500m+ |

---

## Result Card Design

### Empty state
Dashed border card with placeholder text:
> "Enter your weight and tire width to calculate a starting pressure."

### Result state
```
┌─────────────────────────────────────────────────────┐
│  [Starting point]  [High confidence]                │
│                                                     │
│  FRONT              REAR                           │
│  ┌──────────────┐  ┌──────────────┐               │
│  │  4.2 bar     │  │  4.6 bar     │               │
│  │  61 psi      │  │  67 psi      │               │
│  └──────────────┘  └──────────────┘               │
│                           [bar] [psi]  ← toggle    │
│                                                     │
│  Rear is higher: you carry ~60% of total load      │
│  on the rear wheel.                                 │
│                                                     │
│  ── Comfort ─────────────────── ████░░░ 68         │
│  ── Grip ────────────────────── ████░░░ 65         │
│  ── Efficiency ─────────────── ░░░█████ 72         │
│                                                     │
│  ⚠  Check tire sidewall max pressure               │
└─────────────────────────────────────────────────────┘
```

**Visual hierarchy rules:**
- Front/rear numbers: `text-4xl font-semibold`
- Secondary unit: `text-sm text-muted-foreground`
- Confidence badge: amber (low) / blue (medium) / green (high)
- Score bars: simple `div` progress bars, not a chart library
- Warnings: amber inline panel, one per warning

---

## Adjustment Tips

3 cards in a horizontal row (desktop) / vertical stack (mobile):

| Card | Label | Icon | Content |
|------|-------|------|---------|
| More comfort | "Softer ride" | Armchair | Try −0.2 bar rear, −0.1 bar front. Stop before pinch-flat risk. |
| More speed | "Rolling efficiency" | Zap | Try +0.2 bar. Higher pressure reduces rolling resistance on smooth roads. |
| More grip | "Wet/loose control" | Shield | Try −0.2 bar front. Lower front improves cornering feel. |

Each card shows a small delta badge: "−0.2 bar" or "+0.2 bar".

---

## Safety Notice

Compact amber-tinted info panel:
```
⚠  This is a starting recommendation.
   Always check the maximum pressure printed on your tire sidewall.
   For hookless rims: follow ETRTO 2020 limits (max 4.5 bar / 65 psi for most tires).
   Do not exceed rim manufacturer limits.
```

---

## Conversion CTA

Subtle card below safety notice:
```
📊 Save this setup in your BestBikeFit4U profile
   Track pressure settings for multiple bikes and compare over time.

   [Create free account]    [Compare bike pressures →]
```

---

## States to Design

| State | Description |
|-------|-------------|
| Empty/default | Form with defaults pre-filled where safe (discipline=road, surface=average_asphalt, tubeType=inner_tube, ridingGoal=balance). Result card shows placeholder. |
| Partial (weight only) | Result card shows validation message for missing tire width. |
| Filled | Full result visible. No errors. |
| Result with warnings | Result shown with 1–3 inline warning pills. |
| Advanced expanded | Accordion open, 8 extra fields visible. |
| Mobile | Single column, result card below form, tips in accordion. |
| Validation error | Field-level red border + error message inline. |
| Dark mode | All existing design tokens work; score bars use `bg-primary/30` fill. |

---

## UX Improvements Over a Basic Form

| Baseline form | This design |
|---------------|-------------|
| All fields in one list | Grouped cards with clear labels |
| No defaults | Safe defaults pre-set (reduces friction) |
| Single result number | Front + rear, scores, explanation |
| No warnings | Per-warning inline alerts |
| No fine-tuning guidance | 3 adjustment tip cards |
| No safety context | SafetyNotice always visible |
| No conversion path | CalculatorConversionCTA |
| No unit toggle | bar ↔ psi live toggle |
| Advanced fields always visible | Progressive disclosure accordion |
| No confidence signal | Confidence badge on result |

---

## Mobile-First Notes

- Single column layout
- SurfaceInputGroup: 2-column tile grid (not 5 in a row)
- TubeTypeSelector: full-width stacked cards
- ResultCard: appears after form, not sticky
- AdjustmentTips: accordion on mobile, cards on desktop
- Riding style: compact 3-option strip (not a full `PublicScaleField`)
- Touch targets: min 44px height for all interactive elements

---

## Public vs Dashboard Reuse

| Concern | Public site | Dashboard |
|---------|-------------|-----------|
| Engine | `calculateBasicPressure` or `calculateAdvancedPressure` | Same |
| Persistence | None (Phase 1) | Save to `pressureProfiles` table |
| Auth | None | `requireUserId()` |
| Unit default | User browser preference | Saved in user profile |
| Bike prefill | Not available | Prefill from selected bike's `tireSetup` |
| Component | `TirePressureCalculator` | `TirePressureCalculator` with `prefill` prop |
| Route | `/calculators/tire-pressure` | `/profile/bikes/[id]/pressure` |

The `TirePressureCalculator` component accepts an optional `prefill?: Partial<TirePressureFormState>` prop. When provided, fields are pre-populated. This makes dashboard reuse a prop-pass, not a rewrite.

---

## File Structure

```
src/app/(public)/calculators/tire-pressure/
  page.tsx                         ← server component, SEO metadata
  TirePressureCalculatorForm.tsx   ← client boundary, form + result

src/components/calculators/tire-pressure/
  TirePressureCalculator.tsx       ← orchestration (form state + result)
  TirePressureForm.tsx             ← input groups composition
  RiderInputGroup.tsx
  BikeTireInputGroup.tsx
  TireSetupInputGroup.tsx          ← tube type card selector
  SurfaceInputGroup.tsx            ← tile grid + wet toggle
  AdvancedOptionsAccordion.tsx
  PressureResultCard.tsx
  PressureScoreBars.tsx
  PressureAdjustmentTips.tsx
  SafetyNotice.tsx
  CalculatorConversionCTA.tsx
  types.ts                         ← TirePressureFormState, TirePressureUIState
  tire-pressure-defaults.ts        ← DEFAULT_FORM_STATE constant
```

Engine stays at: `src/lib/pressure-engine.ts` (no changes needed).

---

## Tailwind Layout Approach

```tsx
// Desktop: 2-column split with sticky result
<section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
  <TirePressureForm ... />
  <div className="lg:sticky lg:top-6 lg:self-start">
    <PressureResultCard ... />
  </div>
</section>

// Adjustment tips: 3-column on desktop
<div className="mt-8 grid gap-4 md:grid-cols-3">
  <PressureAdjustmentCard ... />
</div>
```

---

## Validation Requirements

| Rule | Field | Severity |
|------|-------|----------|
| Required | bodyWeightKg | error |
| 35–160 kg | bodyWeightKg | error |
| Required | widthFrontMm, widthRearMm | error |
| 18–80 mm | widthFrontMm, widthRearMm | error |
| 3–20 kg | bikeWeightKg | error |
| 0.8–9.0 bar | currentFront/RearBar | error |
| Unusual width for discipline | widthFrontMm | warning (not blocking) |
| Hookless without max pressure | rimType | warning |

All validation via `validatePressureInput()` from the existing engine. Field-level mapping: engine `field` → form field name is 1:1.

---

## Accessibility Requirements

- All inputs: `<label>` associated via `htmlFor`
- Surface tiles: keyboard navigable, `role="radio"` / `role="radiogroup"`
- Tube type cards: same radio pattern
- Unit toggle: `role="group"`, two `<button>` elements with `aria-pressed`
- Score bars: `role="progressbar"` with `aria-valuenow` / `aria-valuemax`
- Warnings: `role="alert"` or `aria-live="polite"` on the warning container
- Advanced accordion: `aria-expanded`, `aria-controls`
- Sufficient contrast: all text meets AA minimum

---

## Acceptance Criteria

### Calculation
- [ ] Basic path produces valid front/rear bar and psi for any valid input combination
- [ ] Advanced path runs when any advanced field is provided
- [ ] Unit toggle switches all displayed values live
- [ ] Scores (comfort/grip/efficiency) only shown on advanced path

### Form UX
- [ ] Surface tile selection is keyboard-accessible
- [ ] Tube type card selection is keyboard-accessible
- [ ] "Same as front" shortcut populates rear width
- [ ] Advanced accordion opens/closes without layout shift
- [ ] Defaults pre-fill on mount without triggering validation errors

### Result
- [ ] Empty state shows when weight or tire width is missing
- [ ] Warning pills map correctly to all 8 `WarningKey` values
- [ ] Front pressure is always ≤ rear pressure (engine guarantee, not UI guard)
- [ ] Explanation text from engine renders in result card

### Safety & Trust
- [ ] SafetyNotice visible on all non-empty states
- [ ] Hookless warning renders when `hookless_max_pressure_unknown` is present

### Responsive
- [ ] Single column on mobile (< 1024px)
- [ ] Result card not sticky on mobile
- [ ] All touch targets ≥ 44px
- [ ] Adjustment tips stack vertically on mobile

### Reuse
- [ ] `prefill` prop populates form state without side effects
- [ ] Component renders in isolation without any Convex provider
- [ ] Engine logic remains in `src/lib/pressure-engine.ts` (no duplication)

---

## Prompt Files

- `01-implement-calculator.md` — implement the full component tree and page
- `02-add-convex-persistence.md` — save sessions to Convex (follow gearing pattern)
- `03-dashboard-integration.md` — wire into bike profile page with prefill

---

## Notes

- Do not move or modify `src/lib/pressure-engine.ts` — it is tested and stable
- The `PressureOutput.explanation` field from the engine is intentionally brief; the UI adds the "why front/rear differ" explanation separately
- Tube type `latex_tube` exists in the engine but is less common; label it "Latex tube (performance)" in the UI
- `offRoadPercent` exists in the engine type but is unused in calculation; omit from UI for now
