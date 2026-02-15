# Prompt 04: Test and Rollout

## Objective

Validate auth behavior and define safe deployment sequence.

## Inputs

- `plans/server-auth-control/output-03-implementation.md`
- Existing test setup

## Tasks

1. Add/update tests for:
   - authenticated access
   - unauthorized denial
   - role-restricted routes
   - expired/invalid session handling
2. Run test suite and record results.
3. Write rollout checklist for dev -> staging -> prod.
4. Define monitoring alerts for auth failures and permission denials.

## Deliverable

Create `plans/server-auth-control/output-04-tests-and-rollout.md` with:

- Test results summary
- Rollout checklist
- Post-deploy checks

## Completion checklist

- [ ] Tests added and executed
- [ ] Rollout checklist written
- [ ] Plan marked complete in `plans/server-auth-control/README.md`

