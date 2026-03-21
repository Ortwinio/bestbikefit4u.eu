# Step 02: Selection Controls Migration

## Objective

Replace the remaining ad hoc selection patterns with Prototyper-style semantics where feasible.

## Scope

- questionnaire choice components
- profile/measurement selection flows
- pressure wizard segmented/pill/card selection flows
- theme toggle and any remaining segmented-choice UI if still inconsistent after Step 01

## Preferred Primitives

- `segmented-control`
- `radio-group`
- `checkbox-group`
- `toggle-group` only where it is the better semantic fit

## Deliverables

- migrated or upgraded selection controls
- minimal compatibility adapters only where required
- updated tests or new focused tests around keyboard/ARIA behavior
- short output note listing migrated consumer surfaces

## Verification

- targeted `eslint`
- targeted `vitest`
- `npx tsc --noEmit --pretty false`
- smoke-check `npm run build:vercel`
