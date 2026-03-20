# Step 02 — Bike Schema And Forms

## Goal

Make `ridingStyle` and `primaryGoal` first-class bike attributes and ensure every bike can store the full fit-context trio:

- `bikeType`
- `ridingStyle`
- `primaryGoal`

## Schema Changes

Update the `bikes` table in [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts):

- add `ridingStyle`
- add `primaryGoal`

Recommended initial shape:

- `ridingStyle: v.optional(...)`
- `primaryGoal: v.optional(...)`

Make them optional for migration safety, then tighten later when all bikes are backfilled.

## Mutations To Update

- [`convex/bikes/mutations.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/mutations.ts)

Ensure both create and update accept:

- `bikeType`
- `ridingStyle`
- `primaryGoal`

## Frontend Forms To Update

- [`src/components/bikes/BikeForm.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeForm.tsx)
- [`src/components/features/bikes/CreateBikeForm.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/CreateBikeForm.tsx)

## UX Rules

- Bike create/edit should ask these once at bike level
- Copy should make it clear these attributes describe the bike’s typical fit use case
- If the product later needs multiple purposes per bike, that should be solved with bike profiles, not repeated fit-session questions

## Acceptance Criteria

- [ ] New bikes can save `bikeType`, `ridingStyle`, and `primaryGoal`
- [ ] Existing bikes can be edited to add missing values
- [ ] Bike forms use the same enums/options currently used by the fit-start page
