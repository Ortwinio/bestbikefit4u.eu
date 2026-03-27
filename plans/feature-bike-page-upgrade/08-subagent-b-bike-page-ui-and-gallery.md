# Subagent Prompt B — Bike Page UI, Identity, And Photo Gallery

## Role

You own the rider-facing bike detail page UX and photo gallery presentation.

## Mission

Turn the bike detail page into a stronger bike “home” with:

- a better identity section
- an editable description surface
- a multi-photo gallery
- clearer modular page structure

Without touching geometry sourcing.

## Read First

- `plans/feature-bike-page-upgrade/README.md`
- `plans/feature-bike-page-upgrade/02-bike-page-information-architecture.md`
- `plans/feature-bike-page-upgrade/03-multi-photo-data-model-and-ui.md`
- `src/app/(dashboard)/bikes/[bikeId]/page.tsx`
- `src/components/bikes/BikePhotoUpload.tsx`
- any new bike photo/backend query contracts from Prompt A

## Ownership

You own:

- `src/app/(dashboard)/bikes/[bikeId]/page.tsx`
- new bike gallery UI components under `src/components/bikes/`
- rider-facing bike-page copy wiring

You do **not** own:

- backend schema
- wheelset mutations
- LLM invocation backend

## Required Deliverables

1. Refactor the bike page into clearer rider-facing sections:
   - bike identity
   - photo gallery
   - description
   - bike facts
   - wheelsets / tire setup summary
   - notes
   - fit / pressure context
2. Replace the single-photo experience with a gallery-compatible surface.
3. Preserve support for bikes with:
   - no photo
   - one legacy photo
   - multiple photos
4. Make the bike description visible and editable when present.
5. Keep EN/NL rider-facing copy support intact.

## Constraints

- Keep the existing design language.
- Do not invent geometry facts or add geometry autofill UX.
- Avoid unnecessary visual complexity.
- Preserve existing pressure and fit links.

## Non-goals

- do not build wheelset create/edit backend
- do not add LLM orchestration

## Acceptance Targets For This Prompt

- bike page gives a clearer summary at a glance
- gallery works for 0, 1, or many photos
- description is visible and clearly editable
- no geometry-generation UI is introduced
- bike detail remains readable on mobile and desktop

## Validation

Report:

- what changed in the page hierarchy
- empty-state behavior
- legacy single-photo behavior
- any UI assumptions still dependent on Prompt A or Prompt C
