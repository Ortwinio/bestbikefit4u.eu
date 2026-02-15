# Step 06 Output: CI Rollout and Observability

## Summary

Operationalized communication stability with:

1. Dedicated CI gates for contract, unit, and communication E2E tests
2. Structured client error logging conventions for Convex interactions
3. Pre-merge and post-deploy communication checklists
4. Incident triage and rollback documentation

## CI Rollout Changes

### Workflow updates

Updated `.github/workflows/ci.yml`:

1. Added `contracts` job (PR + push):
   - Runs `npm run test:contracts`
   - Acts as fail-fast communication gate
2. Updated `quality` job (depends on `contracts`):
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test:unit`
   - `npm run build -- --webpack`
   - plan README enforcement check
3. Added `e2e-communication` job:
   - Runs on push to `main`, `master`, `release/*`
   - Executes `npm run test:e2e:communication`

### NPM scripts

Updated `package.json`:

- `test:unit`
- `test:contracts`
- `test:e2e:communication`

## Observability Standardization

Updated `src/lib/telemetry.ts`:

- Added explicit fields:
  - `operationType` (`query` | `mutation` | `action` | `client`)
  - `subjectId`
- Standardized event format:
  - prefix: `[convex-communication-error]`
  - event tag: `convex_communication_error`

Updated call sites to pass operation metadata:

- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/components/questionnaire/QuestionnaireContainer.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`

## Operational Documentation

Added:

- `docs/COMMUNICATION_STABILITY_RUNBOOK.md`
  - CI gate model
  - structured logging standard
  - pre-merge checklist
  - post-deploy smoke checks
  - incident triage + rollback procedure

Updated:

- `docs/ENGINEERING_GOVERNANCE.md`
  - required checks now include contracts/unit split and communication E2E gate
- `docs/RELEASE_READINESS_CHECKLIST.md`
  - includes contracts/unit/e2e communication checks and incident readiness items
- `.github/pull_request_template.md`
  - explicit local checks for contracts, unit, and communication E2E

## Validation

Commands run and passing:

- `npm run lint`
- `npm run typecheck`
- `npm run test:contracts`
- `npm run test:unit`
- `npm run test:e2e:communication`

## Outcome

Step 06 acceptance checklist is satisfied:

- CI blocks merges on communication contract failures
- Communication errors have structured, searchable tags
- Smoke and pre-merge checks are documented
- Contract regression triage and rollback are documented
