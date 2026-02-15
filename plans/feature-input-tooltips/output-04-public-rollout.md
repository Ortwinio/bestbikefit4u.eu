# Output 04: Public Forms And Calculators Rollout

## Date

2026-02-15

## Scope Delivered

Tooltip coverage was added for all public form/calculator fields in:

- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`

## Coverage Result

- Public controls in step-04 scope: **13**
- Tooltip-covered controls in step-04 scope: **13**
- Coverage status: **100%**

Breakdown:
- Contact form: 3/3
- Saddle-height calculator: 5/5
- Frame-size calculator: 3/3
- Crank-length calculator: 2/2

## Implementation Notes

1. Added localized contact-form tooltip copy (EN/NL) for:
   - Name
   - Email
   - Message
2. Replaced plain labels with `FieldLabel` in contact + all calculators.
3. Added calculator tooltip language including:
   - expected units
   - valid ranges
   - impact on final result
4. Improved mobile tooltip placement in `src/components/ui/Tooltip.tsx`:
   - left-aligned tooltip on smaller viewports
   - centered tooltip from `sm` and up
   - viewport-constrained max width to reduce clipping/collision

## Validation

- Typecheck: pass
- Lint: pass
- Tests: pass (`62/62`)
