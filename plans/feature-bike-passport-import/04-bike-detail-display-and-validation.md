# Step 04: Bike Detail Display And Validation

## Objective

Show the bike-passport ID on the bike page and complete validation for the new flow.

## Files To Inspect

- [src/app/(dashboard)/bikes/[bikeId]/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/[bikeId]/page.tsx)
- [src/components/bikes](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes)
- [src/i18n/messages/en.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/en.ts)
- [src/i18n/messages/nl.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/nl.ts)

## Tasks

1. Show the passport ID on the bike detail page in the identity area.
2. Add a copy-to-clipboard affordance if it fits the existing UI language.
3. Add concise explanatory copy about what sharing the passport allows.
4. Make sure imported bikes render exactly like normal bikes after creation.
5. Add tests for:
   - bike detail rendering with passport ID
   - import rules
   - any new formatting helpers
6. Run:
   - `npx convex codegen`
   - targeted tests
   - `npm run build:vercel`

## Final Acceptance

- a rider can see and copy the passport ID from a bike page
- a second rider can create an editable copy from that passport ID
- the imported bike behaves like any normal bike in the garage and detail page
- no unsupported private data crosses accounts
- build and test validation are clean

## Closeout

Document:

- chosen passport format
- copied vs non-copied fields
- whether photos are included in v1
- any required Convex migration or backfill steps
