# Step 05: Test Hardening

## Objective

Backfill the tests the audit said were missing so the migrated contracts stop regressing silently.

## Scope

- wrapper contract tests in `src/components/ui`
- dialog/progress/field/select/button/textarea/slider/number input semantics
- a small number of high-value consumer interaction tests if practical

## Requirements

- prefer focused, stable tests over broad snapshot coverage
- assert accessibility and composition contracts, not just rendered text
- add tests only for the migrated surface, not unrelated product logic

## Deliverables

- new or updated tests
- short output note describing coverage added and residual gaps

## Verification

- `npx vitest run ...` for the new/updated tests
- `npx tsc --noEmit --pretty false`
- `npm run build:vercel`
