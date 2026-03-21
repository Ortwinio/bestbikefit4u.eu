# Step 01: Shared Surface Cleanup

## Objective

Finish normalizing the shared UI wrapper layer in `src/components/ui` so it behaves like a coherent Prototyper UI surface instead of a compatibility layer.

## Scope

- review all remaining wrappers in `src/components/ui`
- remove obvious contract mismatches against upstream Prototyper or Base UI composition
- unify `Field` usage across form wrappers where still inconsistent
- reduce local styling ownership where the copied Prototyper components should own it

## Priority Targets

- `Selectable`
- `FieldLabel`
- any remaining `Input` / `Select` / `NumberInput` / `Textarea` inconsistencies
- any wrapper still forwarding the wrong ref type or synthetic contract

## Deliverables

- code changes in `src/components/ui`
- updated barrel exports if needed
- focused tests for changed wrapper contracts
- short output note summarizing what changed and which wrappers remain intentionally compatibility-oriented

## Verification

- targeted `eslint`
- targeted `vitest`
- `npx tsc --noEmit --pretty false`
- `npm run build:vercel`
