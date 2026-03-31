# Step 01: Data Model And Passport Contract

## Objective

Add the bike-passport identifier to the bike model and define exactly what the passport represents.

## Files To Inspect

- [convex/schema.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- [convex/bikes/mutations.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/mutations.ts)
- [convex/bikes/queries.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/queries.ts)
- [src/app/(dashboard)/bikes/[bikeId]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/[bikeId]/page.tsx)

## Tasks

1. Add a `bikePassportId` field to the `bikes` table.
2. Add a unique lookup index for `bikePassportId`.
3. Define a stable human-shareable format, for example `BBF-AB12-CD34`.
4. Add backend helper logic to generate passport IDs safely.
5. Define a backfill strategy for existing bikes:
   - assign missing passport IDs lazily on read or mutation, or
   - add an explicit backfill migration path
6. Document which bike fields are shareable and which are not.

## Product Rules

- one bike has one passport ID
- passport IDs do not change when the bike is edited
- imported bikes receive a newly generated passport ID, not the source passport ID
- passport IDs are safe to share between users

## Acceptance For This Step

- the schema supports `bikePassportId`
- there is a unique lookup path by passport ID
- the passport format is explicit and testable
- there is a concrete strategy for existing bikes that do not yet have a passport ID
- the copy contract is written down before backend import logic starts

## Deliverable

Update the main plan with the chosen passport format and backfill direction before moving to Step 02.
