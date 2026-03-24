# Step 06 — Rollout, Cleanup, And Validation

## Goal

Ship the redesign without leaving conflicting legacy feedback flows behind.

## Tasks

1. Remove or retire legacy creation paths superseded by the new panel.
2. Verify all entry points now route through the shared provider/panel flow.
3. Complete English and Dutch copy updates.
4. Add validation coverage for:
   - global trigger visibility
   - panel open/close behavior
   - type-specific submission validation
   - context capture serialization
   - admin visibility of captured context
   - reply-loop continuity
5. Run:
   - `npm run typecheck`
   - targeted `vitest` suites for feedback, dashboard layout, and admin feedback
6. Produce a closeout document with:
   - implemented scope
   - deferred items
   - known tradeoffs
   - rollout risks

## Done When

- There is one canonical feedback submission flow.
- Legacy creation UX does not conflict with the new panel.
- The redesign is validated from user entry point through admin follow-up.
