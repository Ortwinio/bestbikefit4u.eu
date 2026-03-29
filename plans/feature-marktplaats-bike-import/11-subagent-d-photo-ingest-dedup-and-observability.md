# 11 — Subagent D Prompt: Photo Ingest, Dedup, And Observability

## Mission

Own the import persistence path after rider confirmation: bike creation, advert-image ingest, duplicate handling, and telemetry.

## Read First

- `plans/feature-marktplaats-bike-import/README.md`
- `plans/feature-marktplaats-bike-import/04-persistence-and-photo-ingest.md`
- `plans/feature-marktplaats-bike-import/05-deduplication-errors-and-safety.md`
- output from Subagent A and Subagent B once available
- `convex/bikePhotos/*`
- `convex/bikes/*`

## Ownership

You own:

- save/import orchestration
- remote image ingestion
- duplicate protection behavior
- telemetry and error taxonomy wiring
- persistence tests

You do **not** own:

- preview UI
- parser selector logic
- bike-page redesign

## Required Work

1. Build the confirmed-import save path.
2. Ensure a parser/fetch failure never creates a bike.
3. Ensure image import failures degrade safely:
   - bike may still be created without photos if core data is valid
   - failure must be visible and traceable
4. Reuse the existing bike photo model and primary-photo rules.
5. Add duplicate protection for same rider + same canonical advert URL.
6. Add telemetry for:
   - parse success/failure
   - save success/failure
   - image ingest success/failure
   - duplicate rejection or duplicate reuse
7. Add targeted tests for retries and partial image failure.

## Constraints

- do not bypass existing bike ownership rules
- do not create multiple bikes for the same import on repeated confirmation clicks
- keep the write path idempotent where practical

## Non-goals

- do not redesign gallery UI
- do not add wheelset import in this prompt

## Acceptance Criteria For This Prompt

- one confirmation creates at most one bike
- same-URL duplicate handling is deterministic
- image failures do not corrupt bike records
- resulting bikes remain compatible with the existing bike detail page

## Required Output

Create:

- `plans/feature-marktplaats-bike-import/output-04-persistence-closeout.md`

That file must state:

- final save-path behavior
- duplicate rule
- partial-failure behavior
- telemetry added
