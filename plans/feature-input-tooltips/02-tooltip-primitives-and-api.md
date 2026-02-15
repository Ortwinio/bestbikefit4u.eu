# Step 02: Tooltip Primitives And API

## Objective

Implement a reusable tooltip system and expose a consistent API on shared form controls.

## Inputs

- `plans/feature-input-tooltips/output-01-tooltip-inventory.md`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/index.ts`
- Existing design patterns in `src/components/ui/`

## Tasks

1. Add a shared tooltip primitive in UI layer (for example `src/components/ui/Tooltip.tsx`).
2. Implement accessible behavior:
   - trigger focus support
   - hover support
   - proper `aria-describedby`/labeling
   - keyboard escape/blur close behavior
3. Extend `Input` and `Select` APIs with optional tooltip props.
4. Define a pattern for native `textarea` and plain HTML form fields (wrapper or helper component).
5. Add minimal styling tokens/classes for consistent tooltip placement and readability.
6. Export new primitive(s) from `src/components/ui/index.ts`.
7. Record implementation details and usage guidance in `plans/feature-input-tooltips/output-02-tooltip-primitives.md`.
8. Update plan status in `plans/feature-input-tooltips/README.md`.

## Deliverable

- Reusable tooltip-capable input primitives ready for rollout.

## Completion Checklist

- [x] Shared tooltip primitive exists.
- [x] `Input` and `Select` support tooltip props without breaking existing usage.
- [x] Accessibility attributes are implemented.
- [x] Usage guidance documented in output file.
