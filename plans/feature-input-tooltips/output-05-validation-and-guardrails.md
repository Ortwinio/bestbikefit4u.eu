# Output 05: Validation And Guardrails

## Date

2026-02-15

## Implemented

1. Added targeted tooltip behavior tests:
   - `src/components/ui/Tooltip.test.tsx`
2. Added tooltip coverage guardrail script:
   - `scripts/check-tooltip-coverage.mjs`
3. Wired tooltip guardrail into lint workflow:
   - `package.json` (`lint:tooltips`, included in `lint`)

## Test Coverage Added

`src/components/ui/Tooltip.test.tsx` validates:

- Tooltip trigger is rendered with accessible label.
- Descriptive tooltip text is associated through `aria-describedby`.
- Input + tooltip integration keeps field `aria-describedby` linked to tooltip description.
- Keyboard-focus behavior is covered via tooltip interaction state logic (`focus` opens, `escape` closes).

## Guardrail Workflow

- Run manually:
  - `npm run lint:tooltips`
- Included in standard lint pipeline:
  - `npm run lint`

Guardrail behavior:

- Detects form-control files containing `Input`/`Select`/native controls.
- Fails if a form-control file is not tracked by the tooltip coverage allowlists.
- Enforces tooltip presence on tracked `Input`/`Select` controls.
- Enforces `FieldLabel`+`tooltip` coverage for tracked native `input/select/textarea`.

## Quality Gates

- `npm run typecheck` passed
- `npm run lint` passed
- `npm run test` passed (`65/65`)

## Follow-up

- When adding new form fields in new files, update `scripts/check-tooltip-coverage.mjs` tracked file sets to keep guardrail coverage explicit.
