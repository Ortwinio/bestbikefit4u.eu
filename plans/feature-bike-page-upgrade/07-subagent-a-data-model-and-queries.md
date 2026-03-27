# Subagent Prompt A — Data Model, Compatibility, And Query Foundation

## Role

You own the backend and contract foundation for the bike page upgrade.

## Mission

Add the minimum schema and query surface needed to support:

- multiple bike photos
- an editable bike description
- richer bike-page data assembly
- wheelset management from the bike page

Without adding or inferring geometry data.

## Read First

- `plans/feature-bike-page-upgrade/README.md`
- `plans/feature-bike-page-upgrade/01-current-state-audit.md`
- `plans/feature-bike-page-upgrade/03-multi-photo-data-model-and-ui.md`
- `plans/feature-bike-page-upgrade/04-wheelset-management-on-bike-page.md`
- `plans/feature-bike-page-upgrade/05-llm-description-contract.md`
- `convex/schema.ts`
- `convex/bikes/*`
- `convex/wheelsets/*`

## Ownership

You own:

- `convex/schema.ts`
- `convex/bikes/*`
- `convex/wheelsets/*`
- any new `convex/bikePhotos/*` module if needed
- backend tests for bike page contracts

You do **not** own:

- rider-facing page layout
- gallery visuals
- wheelset form UI
- LLM prompt UX

## Required Deliverables

1. Produce `plans/feature-bike-page-upgrade/output-01-contract-foundation.md` covering:
   - schema additions
   - compatibility plan from `photoUrl` to multi-photo support
   - query contract for the upgraded bike page
   - what remains intentionally out of scope
2. Add a safe description field for bikes if one does not already exist.
3. Add explicit multi-photo support.
4. Preserve existing bikes with only `photoUrl`.
5. Expose a bike-page query shape that can support:
   - primary photo
   - gallery photos
   - bike description
   - all wheelsets
   - active wheelset
   - tire setups summary where appropriate
6. Keep geometry handling unchanged.
7. Add targeted backend tests.

## Constraints

- Do not auto-fill geometry.
- Do not create a migration that breaks current bikes.
- Prefer a dedicated `bikePhotos` table over overloading `photoUrl`.
- Maintain type safety and readable contracts.

## Non-goals

- do not build page UI
- do not implement LLM calling
- do not redesign the create-bike form unless required for compatibility

## Acceptance Targets For This Prompt

- existing bikes still resolve without data loss
- backend supports multiple photos with one primary
- bike descriptions are persisted and queryable
- wheelset data remains compatible with current pressure flows
- no geometry-related fields are added, inferred, or modified

## Validation

Run targeted backend tests and report:

- schema changes
- compatibility behavior for legacy bikes
- exact query shape added or changed
- any migration or backfill assumptions
