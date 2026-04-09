# Public Calculator Dashboard Parity

## Goal

Bring the marketing-site calculators closer to the dashboard calculator experience so they feel like one product system instead of two parallel UIs. The highest-priority alignment points are slider behavior, slider presentation, and calculator color usage.

## Why This Matters

The dashboard already contains a clearer interactive language for fit-related inputs: slider questions, tighter card hierarchy, and more intentional state colors. The public calculators currently communicate the same type of fit logic through a lighter and less consistent UI. That creates an avoidable brand and trust gap.

## Scope

In scope:

- Public calculator pages in `src/app/(public)/calculators/**`
- Public tire-pressure calculator in `src/app/(public)/bandenspanning-calculator/**`
- Shared public calculator primitives in `src/components/public/**`
- Dashboard slider and calculator-reference components in:
  - `src/components/profile/RidingStyleCard.tsx`
  - `src/components/measurements/NumberSlider.tsx`
  - related dashboard measurement steps
- Shared color and surface tokens in `src/app/globals.css`

Out of scope:

- Dashboard feature redesign
- Calculator formula changes
- Pricing, auth, or general homepage funnel work unless a touched calculator CTA needs visual alignment
- Broad brand redesign outside calculator surfaces

## Desired Outcome

After this work:

- Public calculators use the same slider interaction patterns where the input type matches dashboard usage
- Public calculator cards, tracks, thumbs, labels, and result emphasis use the same visual logic as dashboard calculators
- Colors feel intentionally shared across dashboard and public environments
- The marketing calculators still remain conversion-aware, but no longer look like a different product family

## Approach

1. Audit dashboard calculator UI primitives and document the exact patterns worth reusing.
2. Audit public calculator surfaces and map each mismatch.
3. Decide which slider and color primitives should be shared directly, wrapped, or recreated in a public-safe way.
4. Migrate public calculators in a controlled sequence, starting with the strongest fit-oriented calculators.
5. Validate parity through UI review, tests, and browser checks.

## Key Reference Files

- `src/components/profile/RidingStyleCard.tsx`
- `src/components/measurements/NumberSlider.tsx`
- `src/components/measurements/StepComfort.tsx`
- `src/components/measurements/StepFlexibility.tsx`
- `src/components/measurements/StepCoreStability.tsx`
- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.tsx`
- `src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.tsx`
- `src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.tsx`
- `src/app/globals.css`

## Acceptance Criteria

- Public calculators use a documented slider pattern aligned with dashboard slider semantics.
- Slider colors, thumb styling, track styling, helper text, and labels match dashboard intent.
- Public calculator surfaces use a shared color contract instead of page-by-page drift.
- The migration does not introduce a second slider system for equivalent use cases.
- Mobile and desktop interaction remain usable for all touched calculators.
- Light, dark, and system theme behavior remains consistent.
- Public calculators still preserve their conversion-oriented CTA flow.
- Tests cover the shared slider behavior and at least one migrated public calculator path per calculator family.

## Deliverables

- Audit and parity map
- Shared slider/color implementation plan
- Calculator migration sequence
- Validation and browser QA checklist

## Status

- [x] Step 1: Audit dashboard and public calculator patterns
- [x] Step 2: Define shared slider and color strategy
- [x] Step 3: Plan public calculator migration sequence
- [x] Step 4: Define validation, test plan, and browser acceptance

## Execution Progress

- [x] Shared scale-slider primitive extracted for dashboard/public reuse
- [x] Public calculator surface utilities aligned closer to dashboard card/result treatment
- [x] Bike-fit calculator migrated to shared scale sliders
- [x] Saddle-height calculator migrated to shared scale sliders
- [x] Frame-size and crank-length surface review finalized
- [x] Tire-pressure calculator family alignment finalized
- [x] Browser QA and parity signoff completed
