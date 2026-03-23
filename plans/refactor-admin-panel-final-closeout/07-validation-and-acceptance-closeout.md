# Step 07: Validation And Acceptance Closeout

## Objective

Produce fresh evidence that the admin functionality is complete and correctly implemented.

## Tasks

1. Run:
   - `npm run typecheck`
   - focused `vitest` for admin auth, messages, feedback, releases, geometry, and fit trace
   - any page-level integration tests needed for the high-risk flows
2. Verify acceptance criteria one by one against the current code, not earlier closeout notes.
3. Write a new acceptance closeout file with:
   - implemented / partial / missing per criterion
   - evidence links
   - any intentionally deferred items
4. If all criteria pass, update the relevant admin plan README status.

## Done When

- the repo has a current acceptance closeout backed by current verification evidence
