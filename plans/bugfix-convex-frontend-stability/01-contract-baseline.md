# Step 01: Contract Baseline

## Objective

Create a precise frontend-to-Convex contract inventory and identify where request/response behavior is currently unstable.

## Inputs

- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- `convex/profiles/*.ts`
- `convex/sessions/*.ts`
- `convex/questionnaire/*.ts`
- `convex/recommendations/*.ts`
- `convex/emails/actions.ts`
- `convex/schema.ts`

## Tasks

1. Build a matrix of each frontend Convex call:
   - Function reference.
   - Arguments sent by frontend.
   - Response shape expected by frontend.
   - Loading/error assumptions in UI.
2. Document current mismatches and risks:
   - Data passed but not persisted.
   - Redundant payloads.
   - Ambiguous fallback logic.
   - Missing user-facing error states.
3. Define a target contract for each flow:
   - Profile upsert.
   - Session create.
   - Questionnaire save/complete.
   - Recommendation generate/read.
   - Email report send.
4. Prioritize contract issues by user impact and fix complexity.

## Deliverable

- `plans/bugfix-convex-frontend-stability/output-01-contract-baseline.md`

## Completion Checklist

- [ ] Contract matrix is complete for all core flows.
- [ ] Current mismatches are tied to exact file paths.
- [ ] Target contract definitions are explicit and testable.
- [ ] Issue list is prioritized P0-P2 for execution.
