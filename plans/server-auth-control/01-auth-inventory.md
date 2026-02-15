# Prompt 01: Inventory Existing Auth

## Objective

Map current authentication/authorization behavior and identify gaps.

## Inputs

- `convex/auth.ts`
- `convex/http.ts`
- `src/components/auth/`
- Any route guards and server-side checks

## Tasks

1. List all auth entry points.
2. List how identity is established and persisted.
3. List protected resources and current access rules.
4. Identify missing controls (expiry, revocation, role checks, audit).

## Deliverable

Create `plans/server-auth-control/output-01-auth-inventory.md` with:

- Current state summary
- Gap list
- Recommended priority order

## Completion checklist

- [ ] Inventory file created
- [ ] Gaps prioritized
- [ ] Next step set to `02-authz-design.md`

