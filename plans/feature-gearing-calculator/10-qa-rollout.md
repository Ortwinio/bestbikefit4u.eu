# 10 — QA, Migration, and Rollout

## Objective

Define the rollout sequence, migration checks, and verification required to ship the gearing calculator safely.

## Rollout sequence

1. Ship shared engine with unit tests.
2. Ship schema and bike-form support behind safe defaults.
3. Ship bike detail card and missing-gearing prompts.
4. Ship public calculator.
5. Ship dashboard calculator.
6. Ship navigation/SEO wiring.
7. Run browser and data QA.

## Migration checks

- existing bikes remain readable if gearing is absent
- bike create/edit remains stable without immediate full backfill
- admin/user pages do not break on partial gearing data
- dashboard prefill works with missing optional rider fields

## QA focus

- formula correctness
- 1x and 2x coverage
- realistic road/gravel/MTB scenarios
- overgeared mountain examples
- compatibility warnings
- mobile public UX
- dashboard bike-prefill flow

## Deliverable

Execution prompt for final QA, rollout proof, and acceptance closure.

## Completion Checklist

- [ ] Safe rollout order is defined
- [ ] Migration risk is covered
- [ ] QA emphasis matches product risk
