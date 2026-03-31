# Bike Passport Import

## Goal

Add a unique bike-passport ID to each bike, show that passport on the bike detail page, and let riders create a new bike in three ways:

1. start from scratch
2. import from Marktplaats
3. import from an existing bike-passport ID

When a rider imports a bike by passport ID, the system should create a new bike owned by that rider. The new bike is a copy they can edit independently.

## Status

Implemented on 2026-03-31.

Validation completed:

- `npx convex codegen`
- `npx vitest run convex/bikes/__tests__/passport.contract.test.ts convex/bikes/__tests__/queries.contract.test.ts src/components/features/bikes/bikePassportImport.test.ts`
- `npm run build:vercel`

## Scope

This plan covers:

- adding one stable shareable passport ID to each bike
- showing that passport ID on the bike detail page
- extending the bike-creation entry flow to include passport import
- creating a backend copy flow that imports a bike by passport ID
- copying only the bike data that should be shareable
- keeping the imported bike fully editable by the importing rider

This plan explicitly does **not** cover:

- shared ownership of bikes between riders
- live synchronization between source and imported bikes
- copying fit history, pressure history, or other rider-specific history
- copying private notes or admin-only fields
- changing the existing Marktplaats import contract

## Why This Matters

Today a rider can create a bike manually or import one from Marktplaats. There is no lightweight way to reuse a high-quality bike setup that already exists inside BestBikeFit4U. A bike-passport ID turns an existing bike into a shareable template snapshot:

- easy to share between riders
- much less work than re-entering bike details
- safer than exposing direct ownership or live shared state
- compatible with the current bike page and edit flow

## Current Constraints

- bikes already have rich rider-owned data and multi-photo support
- Marktplaats import already uses a separate import flow and import traceability model
- bikes can already reference `bikeImportId`, so imports are a known concept in the data model
- bike detail pages already present a strong rider-facing bike identity surface
- some bike fields are safe to copy, while others are rider-specific and must stay private

## Product Decisions

1. Every bike gets exactly one stable passport ID.
2. The passport ID is safe to share publicly between riders.
3. A passport import creates a new bike record, not a linked clone.
4. The importer becomes the sole owner of the new bike.
5. The imported bike is editable immediately after creation.
6. Source-bike rider history and private data must never be copied.
7. The bike-passport flow should feel like a third bike import path alongside manual and Marktplaats creation.

## Passport Data Contract

Recommended v1 behavior:

- copy:
  - `name`
  - `brand`
  - `model`
  - `bikeType`
  - `description`
  - `photoUrl`
  - safe gallery photos
  - non-private bike setup values that already belong to the bike record
- do not copy:
  - `userId`
  - fit history
  - report history
  - tire pressure history
  - feedback or messages
  - rider-specific notes
  - admin metadata
  - any ownership linkage that would let edits flow back to the source bike

The source bike remains untouched. The imported bike gets its own new passport ID after creation.

## Proposed Outcome

After this work, a rider should be able to:

1. Open the bike garage create flow.
2. Choose:
   - start from scratch
   - import from Marktplaats
   - import with bike-passport ID
3. Enter a passport ID from another rider’s bike.
4. Preview or confirm the import.
5. Create a new bike in their own garage.
6. Edit that imported bike like any normal bike.

## UX Direction

The bike garage creation entry should become an explicit choice screen, not a hidden secondary path.

Recommended entry choices:

1. `Create bike manually`
2. `Import from Marktplaats`
3. `Use bike-passport ID`

Recommended bike detail page behavior:

- show the passport ID in the bike identity area
- allow quick copy-to-clipboard
- make it clear that sharing this ID lets another rider import a copy, not take ownership

## Acceptance Criteria

- every existing bike and every new bike has a unique passport ID
- the bike-passport ID is visible on the bike detail page
- the bike creation flow offers all three entry modes
- a rider can import a bike by passport ID from another rider
- the imported bike is created under the importing rider’s account
- the imported bike gets its own new passport ID
- the imported bike can be edited normally after creation
- source-bike ownership, history, and private rider data are not copied
- invalid, unknown, malformed, or self-owned passport IDs show clear errors
- the implementation does not break the existing manual or Marktplaats bike flows
- backend tests cover passport generation and import rules
- `npx convex codegen` and `npm run build:vercel` pass

## Success Criteria

### Product success

- riders can reuse a known bike setup in under one minute
- riders understand that passport import creates a personal copy, not a shared bike
- the bike detail page makes passport sharing understandable and trustworthy

### Operational success

- passport IDs are unique and deterministic in format
- import failures do not create partial bike records
- self-import and duplicate misuse paths are blocked or handled clearly

### Delivery success

- the work reuses the current bike and import architecture
- the code path stays production-safe and testable
- the UI changes remain additive and do not fragment the bike creation flow

## Risks

- copying too much could leak rider-private state
- copying too little could make the imported bike feel incomplete
- introducing another import path could clutter the bike garage UX
- existing bikes need a safe backfill path for passport IDs

## Recommended Architecture

Use the existing `bikes` model as the durable source of truth and add passport import as a new import origin.

Recommended additions:

- `bikes.bikePassportId`
- unique index for passport lookup
- a backend mutation or action to:
  - validate passport format
  - resolve the source bike
  - confirm it is not owned by the same rider
  - create a new copied bike
  - optionally copy safe bike photos

Preferred v1 direction:

- use a dedicated `/bikes/import/passport` route for the rider flow
- keep `/bikes/new` as the choice entry point
- keep copy logic centralized in backend code, not in the client
- do not copy bike photos in v1, because storage-backed photo reuse between riders is unsafe

## Execution Steps

1. [01-data-model-and-passport-contract.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-import/01-data-model-and-passport-contract.md)
2. [02-backend-copy-flow.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-import/02-backend-copy-flow.md)
3. [03-dashboard-entry-and-import-ui.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-import/03-dashboard-entry-and-import-ui.md)
4. [04-bike-detail-display-and-validation.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-passport-import/04-bike-detail-display-and-validation.md)
