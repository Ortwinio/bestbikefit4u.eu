# 07 — UX Rollout

## Objective

Expose Engine v2 concepts in the dashboard after the backend and shadow-mode groundwork is stable.

## In Scope

- profile-aware bike selection in the fit start flow
- bike profile management UI
- results presentation for ranges, confidence, rationale, and feasibility
- explicit current-vs-target deltas
- access to legacy recommendation history

## UX Constraints

- current users must still be able to start a fit with a minimal path
- new profile complexity should be progressive, not mandatory up front
- low-confidence results must render as ranges, not false precision
- if v2 data is missing, the UI must fall back safely to legacy behavior

## Expected Repo Touchpoints

- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/bikes/`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- any supporting UI components under `src/components/`

## Deliverables

- profile-aware fit entry flow
- bike profile management surfaces
- results UI updates for the v2 envelope

## Exit Criteria

- users can create and select a bike profile
- result pages show v2 metadata without regressing readability
- legacy recommendation views remain accessible where needed
