# Step 01: Tooltip Inventory And Content Matrix

## Objective

Create a definitive inventory of all current input fields and define tooltip copy requirements before implementation.

## Inputs

- `plans/feature-input-tooltips/README.md`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/measurements/*.tsx`
- `src/components/bikes/BikeForm.tsx`
- `src/components/questionnaire/questions/*.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/calculators/*/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` (email input)

## Tasks

1. Inventory every `input`, `select`, and `textarea` field in active routes/components.
2. For each field, define:
   - tooltip title/short help text
   - unit/format guidance
   - validation hint (if needed)
3. Define severity tags for copy quality:
   - required clarification
   - helpful enhancement
4. Produce a coverage matrix with file path, field id/name, and tooltip content.
5. Save output to `plans/feature-input-tooltips/output-01-tooltip-inventory.md`.
6. Update plan status in `plans/feature-input-tooltips/README.md`.

## Deliverable

- Complete tooltip inventory and content matrix with zero unclassified fields.

## Completion Checklist

- [ ] All current form fields are listed once.
- [ ] Every field has tooltip copy draft.
- [ ] Units/formats are specified where relevant.
- [ ] Output file created and linked in README status.
