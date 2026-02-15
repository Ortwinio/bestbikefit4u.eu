# Prompt 03: Implement Controls

## Objective

Implement authentication and authorization controls based on approved design.

## Inputs

- `plans/server-auth-control/output-02-authz-design.md`
- Relevant Convex server files

## Tasks

1. Add centralized authz helper(s).
2. Apply checks to all protected handlers.
3. Add token/session safeguards (expiry/revocation logic where relevant).
4. Add structured security logging for denials and auth failures.

## Deliverable

Create `plans/server-auth-control/output-03-implementation.md` with:

- Files changed
- Controls added
- Known limitations

## Completion checklist

- [ ] Controls implemented in code
- [ ] Security logs added
- [ ] Next step set to `04-tests-and-rollout.md`

