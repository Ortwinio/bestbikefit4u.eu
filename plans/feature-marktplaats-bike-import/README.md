# Marktplaats Bike Import

## Goal

Allow a rider to paste a Marktplaats bike advert URL and create a new bike in the dashboard from that listing.

The import should:

- fetch the advert content from the supplied URL
- extract the seller photos
- extract brand and model when they can be determined confidently
- copy the advert text into the bike description
- create a bike draft in the rider dashboard for review and correction

## Status

Implemented on 2026-03-29.

Validation completed:

- `npx convex codegen`
- `npx vitest run convex/marktplaats/__tests__/parser.test.ts convex/bikeImports/__tests__/shared.contract.test.ts convex/bikeImports/__tests__/mutations.contract.test.ts src/components/features/bikes/marktplaatsImport.test.ts src/lib/marktplaats/normalize.test.ts src/lib/marktplaats/parser.test.ts`
- `npx vitest run convex/bikeImports/__tests__/actions.contract.test.ts convex/bikePhotos/__tests__/mutations.contract.test.ts`
- `npm run build:vercel`

## Scope

This plan covers:

- Marktplaats URL intake from the rider dashboard
- server-side advert fetch and parsing
- creation of a new bike from parsed advert data
- importing advert photos into the existing bike photo model
- storing advert text as the initial bike description
- rider review and correction before final save

This plan explicitly does **not** cover:

- adding geometry data automatically
- inferring or fabricating frame geometry from the advert
- importing wheelsets from the advert as structured data
- scraping unsupported marketplaces in the same release

## Why This Matters

Manual bike entry is still too much work when a rider already has a detailed advert URL with photos, title, and description. Marktplaats listings are often good enough to bootstrap the bike record, but not good enough to become the final source of truth without rider confirmation.

The product value is reduced friction, not perfect autonomous extraction.

## Current Constraints

- bikes already support brand, model, description, notes, photoUrl, and multiple `bikePhotos`
- bikes already support editable descriptions
- bike creation today assumes manual entry
- image handling today is storage-based and expects files to be imported into Convex storage
- the app already has a pattern for source-owned bike imports via Strava
- Marktplaats pages are external HTML and can change structure without notice

## Product Decisions

1. Marktplaats import creates a **bike draft**, not an unquestioned final bike record.
2. The advert description is copied into the bike description as imported content, but remains rider-editable.
3. Brand and model are only auto-filled when extraction confidence is high enough.
4. Photos should be imported into the existing bike photo system, with one primary photo selected automatically.
5. Geometry stays out of this feature entirely.
6. If the parser is uncertain, the rider must confirm or correct bike type, brand, and model before completing import.

## Proposed Outcome

After this work, a rider should be able to:

1. Paste a Marktplaats advert URL in the dashboard.
2. See a parsed import preview with:
   - advert title
   - candidate brand
   - candidate model
   - candidate bike type
   - selected photos
   - imported description
3. Confirm or correct the draft.
4. Save the bike into the existing dashboard bike garage.

## Data Contract Direction

The import should reuse the current `bikes` and `bikePhotos` models instead of creating a parallel bike-import storage shape.

Recommended additions:

- `bikes.source` should accept a marketplace-specific value, for example `marketplace_import`
- `bikes.importSourceUrl` to preserve the original advert URL
- `bikes.importSourceName` to record `marktplaats`
- `bikes.importedAdvertTitle` for debugging, traceability, and future admin support
- `bikes.descriptionSource` should distinguish imported advert text from rider-edited manual text

Preferred v1 direction:

- keep the user-facing bike record in `bikes`
- add a dedicated `bikeImports` table for import traceability, fetch status, parse payload snapshots, duplicate protection, and audit/debug visibility
- treat the `bikes` table as the durable rider asset, and `bikeImports` as the ingestion log

This is safer than overloading `bikes` with every import-specific concern.

## Import Pipeline

### Phase 1: URL intake

- rider pastes a Marktplaats URL
- frontend validates hostname and basic path shape
- backend remains the final validator

### Phase 2: Fetch and parse

- backend fetches the advert HTML
- parser extracts:
  - advert title
  - canonical URL
  - image URLs
  - full advert description
  - seller-facing labels that help infer brand/model
- parser also derives:
  - normalized candidate brand
  - normalized candidate model
  - candidate bike type
  - parsing confidence per field

Preferred extraction order:

1. canonical URL and structured data when available
2. HTML selectors for advert title, description, and image URLs
3. deterministic normalization for brand/model/title cleanup
4. optional later LLM assistance only for name cleanup and title splitting

### Phase 3: Import preview

- show a review screen before creating the bike
- rider can:
  - edit title / bike name
  - correct brand
  - correct model
  - confirm bike type
  - deselect images
  - trim or edit description

### Phase 4: Persist

- create the bike via existing bike mutation paths or a dedicated import mutation
- import selected remote images into storage
- create `bikePhotos`
- set the first selected or highest-quality image as primary

Preferred v1 persistence shape:

- a dedicated import action/mutation owns the full workflow
- bike creation happens only after preview confirmation
- `bikeImports` stores:
  - rider
  - source URL
  - canonical URL
  - raw advert title
  - parse snapshot
  - status
  - created bike id when successful
  - error state when failed

## Acceptance Criteria

- a valid Marktplaats advert URL can be submitted from the rider dashboard
- invalid or unsupported URLs are rejected with a clear error
- the backend never trusts raw client-parsed advert data
- the import preview always appears before the bike is created
- the rider can edit name, brand, model, bike type, and description before save
- the advert description is copied into the bike description field on first import
- at least one selected advert photo is imported when the listing exposes valid image URLs
- imported photos are stored through the existing bike photo flow and one photo becomes primary
- the resulting bike opens correctly on the existing bike detail page
- the feature never adds geometry automatically
- if brand/model confidence is low, the rider sees editable fallback fields instead of silent guesses
- duplicate import protection exists for the same rider and advert URL
- the rider-facing bike name is editable and does not have to equal the advert title
- the original advert URL and advert title remain traceable after import
- a failed image import does not prevent the bike from being created when core bike data is valid
- a parser or fetch failure never creates a partial bike record

## Success Criteria

### Product success

- riders can create a usable bike record from a Marktplaats advert in under one minute
- the imported bike usually needs only light correction, not full re-entry
- imported photos and advert text make the bike page immediately useful
- the preview gives the rider enough confidence to save without opening the raw advert again in most cases

### Operational success

- parser failures degrade into a clear reviewable error instead of partial silent corruption
- image import failures do not create broken bike records
- repeated import attempts for the same advert are idempotent or clearly deduplicated
- the import audit trail is sufficient to debug bad parses without inspecting production HTML manually

### Delivery success

- the implementation reuses the current bike and bike photo model
- the feature is covered by unit tests for parser behavior and integration tests for import persistence
- no existing manual bike creation or bike page behavior regresses
- subagent work can proceed with disjoint ownership and no high-conflict core file overlap

## Risks

- Marktplaats HTML structure may change and break selectors
- remote image URLs may be blocked, rate-limited, or expire quickly
- advert text may contain noisy, duplicated, or low-quality data
- brand/model extraction can be wrong if only the advert title is used

## Recommended Improvements Beyond v1

These are worth planning now even if they are not all in the first release:

1. Add a confidence model and show `High confidence` / `Needs review` badges in the preview.
2. Add duplicate detection against the rider’s existing bikes using brand + model + imported URL.
3. Preserve the original advert title separately from the rider-facing bike name.
4. Add optional LLM normalization only for:
   - cleaning the bike name
   - splitting brand and model from noisy advert titles
   - summarizing long advert text

The LLM should **not** be allowed to invent missing specs or geometry.

5. Add image quality ranking so blurry or duplicate advert photos are not selected by default.
6. Support a second stage where the rider can create an initial wheelset from the advert, but only as an optional review step after the bike itself has been created.

## v1 Product Contract

This feature is a guided import assistant, not autonomous bike creation.

Required v1 behavior:

1. The rider pastes one Marktplaats URL.
2. The system parses the advert on the server.
3. The rider reviews a draft with confidence cues.
4. The rider edits any uncertain fields.
5. The system creates exactly one bike.
6. The system imports zero or more photos safely.
7. The rider lands on the bike page with a usable draft bike.

Required v1 field behavior:

- `name`: always editable, seeded from advert title or normalized title
- `brand`: editable, only prefilled when parser confidence is acceptable
- `model`: editable, only prefilled when parser confidence is acceptable
- `bikeType`: editable, keyword-derived when possible, otherwise empty or conservative fallback
- `description`: seeded from advert text, editable before save
- `photos`: selected from advert images, rider can deselect before save

## Implementation Strategy

Use a four-stream implementation strategy with one final auditor:

1. contract and backend foundation
2. parser and normalization
3. rider dashboard preview and save flow
4. persistence, photo ingest, deduplication, and telemetry
5. independent audit and acceptance scoring

The immediate blocking work stays local to each stream. The prompts below intentionally avoid shared write hotspots where possible.

## Advice On Bike Information Quality

The best way to improve imported bike quality is not to scrape more fields blindly. It is to combine:

- deterministic extraction for raw advert facts
- normalization for brand/model naming
- a rider review step for uncertain fields

Recommended bike information improvements:

- use the advert title as the initial import source, but ask the rider for the final bike name
- keep the full advert description available as an editable starting point
- classify obvious bike type from title keywords like `tijdritfiets`, `racefiets`, `gravel`, `mtb`, but require confirmation when uncertain
- optionally suggest a nicer short bike name after import, for example `Ridley Dean TT`
- add an import note such as `Imported from Marktplaats on {date}` for traceability

## Workstreams

- import contract and schema
- Marktplaats fetcher and parser
- import preview UX
- bike and photo persistence
- duplicate protection and error handling
- validation and rollout

## Execution Steps

1. [01-current-state-audit.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/01-current-state-audit.md)
2. [02-import-contract-and-parser.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/02-import-contract-and-parser.md)
3. [03-dashboard-import-flow.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/03-dashboard-import-flow.md)
4. [04-persistence-and-photo-ingest.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/04-persistence-and-photo-ingest.md)
5. [05-deduplication-errors-and-safety.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/05-deduplication-errors-and-safety.md)
6. [06-validation-and-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/06-validation-and-closeout.md)

## Implementation Roadmap

1. [07-implementation-roadmap.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/07-implementation-roadmap.md)

## Subagent Execution Pack

1. [08-subagent-a-contract-and-backend.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/08-subagent-a-contract-and-backend.md)
2. [09-subagent-b-parser-and-normalization.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/09-subagent-b-parser-and-normalization.md)
3. [10-subagent-c-dashboard-preview-and-save-flow.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/10-subagent-c-dashboard-preview-and-save-flow.md)
4. [11-subagent-d-photo-ingest-dedup-and-observability.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/11-subagent-d-photo-ingest-dedup-and-observability.md)
5. [12-subagent-e-quality-audit.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/12-subagent-e-quality-audit.md)
