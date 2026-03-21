# Step 04: Feature Surface Migration

## Objective

Apply the cleaned shared surface and token system across the main feature clusters still called out in the audit.

## Scope

- questionnaire/results
- pressure
- bikes
- profile/measurements
- highest-traffic public marketing surfaces if still token-inconsistent

## Requirements

- prioritize consistency with the migrated shared primitives
- remove remaining hardcoded palette usage in touched components where practical
- keep existing product behavior and calculation logic unchanged

## Deliverables

- migrated feature surfaces
- short output note grouped by feature cluster

## Verification

- targeted `eslint`
- targeted `vitest` where changed components have tests
- `npx tsc --noEmit --pretty false`
- `npm run build:vercel`
