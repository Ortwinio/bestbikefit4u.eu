# Step 02: Implementation Runtime-Safe Auth

## Objective

Implement the selected fix so Convex auth bundles cleanly without Node runtime errors.

## Inputs

- `plans/bugfix-convex-auth-runtime/output-01-runtime-audit-and-design.md`
- `convex/auth.ts`
- Any additional Convex files identified in step 01

## Tasks

1. Remove Node-only imports from non-Node Convex runtime files.
2. Implement a runtime-safe verification token generator that preserves:
   - 6-character token length.
   - Existing allowed alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).
3. Keep rate limiting and email validation behavior unchanged unless step 01 found defects.
4. If needed, isolate unavoidable Node-only logic in dedicated files with `"use node"` and wire safely.
5. Ensure code remains type-safe and readable.

## Deliverable

- Code changes in `convex/auth.ts` (and related files if required)
- `plans/bugfix-convex-auth-runtime/output-02-implementation-runtime-safe-auth.md`

## Completion Checklist

- [ ] Convex bundle no longer fails on Node builtin imports.
- [ ] Token generation behavior matches previous product expectations.
- [ ] No unrelated auth behavior changes were introduced.
- [ ] Type checks/tests affected by the change pass locally.
