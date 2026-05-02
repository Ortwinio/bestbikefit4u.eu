# Output 01 — Sprint 1: Top-Of-Funnel Cleanup

## Implemented

- Extracted the hero into `src/components/home/HeroBlock.tsx`.
- Added `src/components/home/ProofBar.tsx`.
- Removed inline campaign duplication from the hero render path.
- Kept the tertiary sign-in path in the hero.
- Switched logged-out header actions to a calculator-first order in:
  - `src/components/layout/HeaderAuthActions.tsx`
  - `src/components/layout/HeaderMobileMenu.tsx`

## Integrated In

- `src/app/(public)/page.tsx`

## Validation

- `npm run typecheck`
- `npx vitest run src/components/layout/HeaderAuthActions.test.tsx`
