# Step 02: Backend Contract Fixes

## Objective

Eliminate backend-side contract inconsistencies so frontend intent is preserved and server behavior is deterministic.

## Inputs

- `convex/schema.ts`
- `convex/sessions/mutations.ts`
- `convex/recommendations/inputMapping.ts`
- `convex/recommendations/mutations.ts`
- `convex/emails/actions.ts`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`

## Tasks

1. Fix bike-type contract consistency:
   - Persist explicit `bikeType` in `fitSessions` or remove it from request contract.
   - Ensure recommendation mapping prioritizes explicit bike type over riding-style fallback.
   - Add migration/backfill handling for existing sessions where needed.
2. Fix email action contract:
   - Remove redundant `recommendation` payload from action args if server remains source of truth.
   - Update frontend call sites to match the simplified action signature.
3. Tighten mutation/query contracts:
   - Ensure handlers return predictable states for not-found, unauthorized, and invalid input conditions.
   - Standardize error messages used by frontend recovery UI.
4. Regenerate Convex types and verify no stale client references remain.

## Deliverable

- Backend/frontend contract-alignment code changes with passing typecheck.

## Completion Checklist

- [ ] Session bike selection is preserved and used by recommendation generation.
- [ ] Email action contract is minimal and non-redundant.
- [ ] Contract-breaking arg mismatches are removed.
- [ ] Typecheck passes with regenerated Convex API types.
