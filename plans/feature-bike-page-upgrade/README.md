# Bike Page Upgrade

## Goal

Improve the rider bike detail experience in the dashboard without adding or inferring bike geometry data.

## Status

Implemented on 2026-03-27.

Validation completed:

- `npx convex codegen`
- `npx vitest run convex/bikes/__tests__/description.test.ts`
- `npm run build:vercel`

## Scope

This plan covers:

- richer bike detail page UX
- optional LLM-generated bike description
- support for multiple bike photos
- explicit wheelset management on the bike page

This plan explicitly does **not** cover:

- adding geometry data automatically
- asking an LLM to invent or fill frame geometry by frame size
- changing the geometry source of truth

## Why This Matters

The current bike page already shows useful data in [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/[bikeId]/page.tsx), but it is still thin as a bike “home”:

- only one photo is supported today
- only the active wheelset is surfaced clearly
- the page has no editorial bike summary or context
- the bike is not yet presented as a durable setup asset with its own story, usage, and configuration overview

## Current Constraints

- bikes currently store a single `photoUrl` in [schema.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- wheelsets already exist as first-class records in [schema.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts) and [wheelsets](/Users/ortwinverreck/Developer/bestbikefit4u/convex/wheelsets)
- the bike page already resolves wheelsets, tire setups, notes, fit history, and pressure state
- geometry is optional and should remain user-provided or catalog-backed, not LLM-generated

## Product Decisions

1. The bike page should become the canonical rider-facing bike detail hub.
2. LLM output may be used for descriptive copy only, never for geometry facts.
3. Geometry remains a manual or catalog-backed data source.
4. Multiple photos should be modeled explicitly, not hacked onto `photoUrl`.
5. Wheelsets should be manageable directly from the bike page.

## Proposed Outcome

After this work, a bike detail page should include:

- a stronger bike identity block
- a short editable bike description
- a multi-photo gallery with one primary image
- a wheelset manager with active-state control
- clearer separation between bike facts, rider notes, fit state, and tire-pressure setup

## Acceptance Criteria

- every existing bike can still render without migration breakage
- the bike page still works when a bike has no photos beyond the current primary image
- the bike page supports multiple photos with one marked primary
- riders can add, set active, and remove extra wheelsets from the bike page
- the active wheelset and tire setup remain visible
- any LLM-generated description is clearly editable and never presented as authoritative geometry data
- no geometry values are generated or auto-filled by the LLM
- the implementation preserves EN/NL support on rider-facing copy

## Success Criteria

- riders can understand the identity and setup of each bike at a glance
- the bike page becomes the obvious place to manage wheelsets and photos
- the description adds useful context without introducing factual risk
- no data-integrity regressions occur in existing bike, pressure, or fit flows

## Workstreams

- data model
- bike page UX
- wheelset management UX
- multi-photo support
- LLM description workflow
- validation and rollout

## Execution Steps

1. [01-current-state-audit.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/01-current-state-audit.md)
2. [02-bike-page-information-architecture.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/02-bike-page-information-architecture.md)
3. [03-multi-photo-data-model-and-ui.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/03-multi-photo-data-model-and-ui.md)
4. [04-wheelset-management-on-bike-page.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/04-wheelset-management-on-bike-page.md)
5. [05-llm-description-contract.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/05-llm-description-contract.md)
6. [06-validation-rollout-and-copy.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/06-validation-rollout-and-copy.md)

## Implementation Pack

Execution-ready delegation prompts:

1. [07-subagent-a-data-model-and-queries.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/07-subagent-a-data-model-and-queries.md)
2. [08-subagent-b-bike-page-ui-and-gallery.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/08-subagent-b-bike-page-ui-and-gallery.md)
3. [09-subagent-c-wheelset-management.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/09-subagent-c-wheelset-management.md)
4. [10-subagent-d-llm-description-flow.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/10-subagent-d-llm-description-flow.md)
5. [11-subagent-e-quality-audit.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/11-subagent-e-quality-audit.md)

## Closeout

Implementation notes and acceptance mapping:

- [output-01-implementation-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-page-upgrade/output-01-implementation-closeout.md)
