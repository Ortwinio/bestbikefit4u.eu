# Step 06: CI Rollout and Observability

## Objective

Operationalize communication stability with CI gates and basic observability so regressions are blocked and failures are diagnosable.

## Inputs

- `.github/workflows/`
- `package.json`
- New tests from Steps 04 and 05
- Frontend error handling from Step 03

## Tasks

1. Update CI workflow:
   - Run unit + integration contract tests on PR and push.
   - Run E2E tests on mainline and release branches.
   - Enforce fail-fast on contract test failures.
2. Add lightweight observability standards:
   - Structured logs for sessionId/userId-safe identifiers.
   - Clear error tagging for query, mutation, and action failures.
3. Define rollout checks:
   - Pre-merge checklist for communication stability.
   - Post-deploy smoke test checklist for core flows.
4. Document incident response:
   - How to triage frontend/Convex contract failures.
   - How to rollback contract-breaking changes safely.

## Deliverable

- CI and operational documentation updates that enforce stable communication behavior.

## Completion Checklist

- [ ] CI blocks merges on communication test failures.
- [ ] Communication errors have structured, searchable logs.
- [ ] Smoke tests exist for post-deploy verification.
- [ ] Rollback and triage guidance is documented.
