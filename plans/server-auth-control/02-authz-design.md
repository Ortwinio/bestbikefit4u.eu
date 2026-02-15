# Prompt 02: Design Authorization Model

## Objective

Define enforceable server-side authorization policy.

## Inputs

- `plans/server-auth-control/output-01-auth-inventory.md`
- `convex/schema.ts`
- Server query/mutation handlers

## Tasks

1. Define roles and permissions matrix.
2. Map permissions to endpoints/functions.
3. Define deny-by-default policy.
4. Specify where checks live (middleware and handler-level).

## Deliverable

Create `plans/server-auth-control/output-02-authz-design.md` with:

- Role matrix
- Enforcement points
- Migration impact notes

## Completion checklist

- [ ] Role matrix defined
- [ ] Enforcement points mapped
- [ ] Next step set to `03-implementation.md`

