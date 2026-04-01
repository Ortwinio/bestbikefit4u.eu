# Subagent A: Geometry Contract And Queries

## Role

Backend contract owner for rider-safe geometry selection.

## Ownership

Primary write scope:

- `convex/`
- generated bindings only if needed after query additions

You are not responsible for final bike detail UI or the full rider bike form rendering.

## Mission

Implement the rider-safe geometry query contract needed by the bike create/edit flow.

## Requirements

1. Add or extend public rider-safe queries for:
   - geometry brands
   - geometry models scoped to a brand
   - geometry size records scoped to a model
   - year metadata needed to decide when explicit year selection is required
2. Keep the payload small and rider-focused.
3. Do not expose admin-only notes or governance fields unless they are required.
4. Preserve the rule that `geometryRecordId` remains the canonical saved link.

## Acceptance Criteria

- rider queries exist and are callable from the bike form
- model options are correctly scoped to the selected brand
- size options are correctly scoped to the selected model
- the contract supports distinguishing:
  - one clear model-year path
  - multiple model-year variants
- no admin-only mutation path is introduced

## Edge Cases To Cover

- brand with zero models
- model with zero usable size records
- duplicated model names across years
- missing year metadata in imported records

## Tests

- add focused tests for query normalization or helper logic where appropriate
- do not add shallow snapshot noise

## Output

- implemented query contract
- short closeout note listing file changes and any assumptions
