# Step 02: Backend Copy Flow

## Objective

Implement the backend import-by-passport flow that creates a rider-owned copy of another rider’s bike.

## Files To Inspect

- [convex/bikes/mutations.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/mutations.ts)
- [convex/bikes/queries.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/queries.ts)
- [convex/bikePhotos/mutations.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikePhotos/mutations.ts)
- [convex/bikeImports](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikeImports)
- [src/components/features/bikes/marktplaatsImport.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/marktplaatsImport.ts)

## Tasks

1. Add a backend query or action to preview a bike by passport ID.
2. Add a backend mutation or action to create a copied bike from that passport.
3. Reuse the current bike creation path where possible instead of duplicating validation.
4. Copy only the approved shareable fields.
5. Give the copied bike a fresh passport ID.
6. Decide whether safe bike photos should also be copied in v1 and implement consistently.
7. Block or clearly handle:
   - malformed passport IDs
   - unknown passport IDs
   - self-import from the same rider
   - partial photo-copy failures
8. Return enough metadata for the client to route to the new bike page after success.

## Contract Requirements

- source bike remains untouched
- new bike belongs only to the importing rider
- no rider history or private rider state is copied
- import does not require access to the source rider account

## Tests Required

- passport ID generation uniqueness/format
- successful copy of shareable bike fields
- self-import rejection
- unknown passport rejection
- fresh passport assignment on imported copy
- optional photo-copy behavior if included

## Acceptance For This Step

- backend import-by-passport is complete without client-side data cloning
- failure paths are explicit and non-destructive
- tests cover the core business rules
