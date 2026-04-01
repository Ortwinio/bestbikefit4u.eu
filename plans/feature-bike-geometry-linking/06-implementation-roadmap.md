# Bike Geometry Linking Implementation Roadmap

## Objective

Execute the bike geometry linking sprint with parallel subagents and a final audit pass.

## Parallelization Strategy

Subagent ownership is split to minimize overlap:

- Subagent A: backend contract and rider-safe geometry queries
- Subagent B: bike form standard selection flow
- Subagent C: custom fallback behavior and form-state safety
- Subagent D: bike detail geometry card, analytics integration, and validation closeout
- Subagent E: independent audit

## Execution Order

1. Run Subagent A first or in parallel with initial UI exploration.
2. Run Subagent B after A begins, because it depends on the query contract.
3. Run Subagent C in parallel with B if write scope stays inside the fallback parts of the bike form flow.
4. Run Subagent D after A and B have landed or are close to done.
5. Run Subagent E only after implementation is complete.

## Shared Rules

- do not remove current freeform bike save behavior
- do not create new standard geometry brands/models from rider flows
- do not imply exactness or scientific certainty in copy
- treat `geometryRecordId` as the canonical geometry link
- keep rider-entered custom brand/model local to the bike record

## Required Final Outputs

- code changes merged into the main workspace
- focused test coverage for form-state and persistence rules
- build verification
- audit closeout against sprint acceptance criteria
