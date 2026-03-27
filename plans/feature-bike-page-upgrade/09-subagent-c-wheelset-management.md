# Subagent Prompt C — Wheelset Management On The Bike Page

## Role

You own rider-facing wheelset management for the bike page.

## Mission

Expose first-class wheelset operations from the bike page so riders can manage more than the currently active wheelset.

## Read First

- `plans/feature-bike-page-upgrade/README.md`
- `plans/feature-bike-page-upgrade/04-wheelset-management-on-bike-page.md`
- `src/app/(dashboard)/bikes/[bikeId]/page.tsx`
- `src/components/features/bikes/CreateBikeForm.tsx`
- `convex/wheelsets/*`
- `convex/tireSetups/*`

## Ownership

You own:

- wheelset management UI components under `src/components/bikes/` or `src/components/features/pressure/`
- rider-facing wheelset actions on the bike page
- related tests for wheelset UX logic

You do **not** own:

- multi-photo schema
- LLM description generation
- geometry workflows

## Required Deliverables

1. Add rider-facing wheelset management on the bike page:
   - list all wheelsets
   - mark one active
   - add another wheelset
   - remove a wheelset safely
2. Make tire setup relationships understandable per wheelset.
3. Preserve the current pressure-calculator assumptions around active wheelset selection.
4. Keep the UI simple and readable.

## Constraints

- Reuse current wheelset and tire setup backend behavior where possible.
- Do not break pressure-calculation flows.
- Do not make geometry part of the wheelset UI.

## Non-goals

- do not redesign the full pressure wizard
- do not build photo or description features

## Acceptance Targets For This Prompt

- rider can clearly see all wheelsets for a bike
- rider can add an extra wheelset from the bike page
- rider can set one wheelset active
- rider can remove a wheelset without confusing state
- active tire setup visibility remains intact

## Validation

Report:

- exact rider actions supported
- delete/active-state guardrails
- dependencies on any backend additions
