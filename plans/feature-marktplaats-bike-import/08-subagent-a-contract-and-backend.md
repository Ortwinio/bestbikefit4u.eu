# 08 — Subagent A Prompt: Contract And Backend Foundation

## Mission

Own the backend contract and data-model foundation for Marktplaats bike import.

## Read First

- `plans/feature-marktplaats-bike-import/README.md`
- `plans/feature-marktplaats-bike-import/01-current-state-audit.md`
- `plans/feature-marktplaats-bike-import/02-import-contract-and-parser.md`
- `plans/feature-marktplaats-bike-import/04-persistence-and-photo-ingest.md`
- `convex/schema.ts`
- `convex/bikes/*`
- `convex/bikePhotos/*`
- relevant Strava import files under `convex/integrations/*`

## Ownership

You own:

- `convex/schema.ts`
- new `convex/marktplaats/*` or `convex/bikeImports/*` modules
- minimal changes in `convex/bikes/*` needed for compatibility
- backend tests for the import contract

You do **not** own:

- parser selector logic
- rider-facing preview UI
- photo-gallery presentation
- localization copy except where backend contract forces a minimal change

## Required Work

1. Decide the import traceability shape.
2. Prefer a dedicated `bikeImports` table unless there is a concrete reason not to.
3. Add any minimal `bikes` fields needed for durable source traceability.
4. Define the canonical parsed-advert contract consumed by preview and save.
5. Define the canonical save-request contract consumed by persistence.
6. Define status transitions for an import record, for example:
   - `pending_fetch`
   - `parsed`
   - `needs_review`
   - `imported`
   - `failed`
7. Preserve compatibility with current manual bike creation and bike detail queries.
8. Add targeted backend tests.

## Constraints

- do not add geometry import fields
- do not break existing bike creation
- do not put parser-specific brittle HTML details into shared bike modules
- keep the contract readable and type-safe

## Non-goals

- do not implement rider UI
- do not implement LLM normalization
- do not build the final HTML parser here unless needed only to define types

## Acceptance Criteria For This Prompt

- there is one stable backend contract for preview and save
- import traceability is explicit
- current bikes still work without migration breakage
- backend tests cover sparse and normal import records
- no geometry-related behavior is added

## Required Output

Create:

- `plans/feature-marktplaats-bike-import/output-01-contract-foundation.md`

That file must state:

- final storage choice
- final preview payload fields
- final save payload fields
- nullability rules
- status model
- known deferrals
