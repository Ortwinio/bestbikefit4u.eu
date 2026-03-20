# Bike / Fit Session Attribute Consolidation

## Goal

Stop asking for bike-level attributes inside every new bike fit session when those attributes really belong to the bike itself.

The target model is:

- `bikeType` is a property of a bike
- `ridingStyle` is a property of a bike
- `primaryGoal` is a property of a bike

Fit sessions should reference a bike and snapshot its relevant attributes at session creation time, rather than treating those values as user input on every new session.

## Why This Change

Current repo state shows duplicated ownership:

- `bikes.bikeType` already exists in [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- `fitSessions.bikeType`, `fitSessions.ridingStyle`, and `fitSessions.primaryGoal` also exist in [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- the new-fit page still asks for:
  - "What type of bike?"
  - "How do you typically ride?"
  - "What's your primary goal?"
  in [`src/app/(dashboard)/fit/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/page.tsx)

This creates three problems:

1. The user has to keep re-entering stable bike information
2. The app can drift, where the same bike has one value on the bike record and another on the fit session
3. The ownership model is unclear, which makes reporting, recommendations, and later editing harder

## Data Ownership Decision

The plan should standardize ownership as follows:

- **Bike owns**
  - `bikeType`
  - `ridingStyle`
  - `primaryGoal`
- **Fit session snapshots**
  - `bikeTypeSnapshot`
  - `ridingStyleSnapshot`
  - `primaryGoalSnapshot`
  - or keep the current session fields temporarily as snapshots during migration

Important: a fit session should still preserve the historical context that was used at the time of the fit. If the user later changes a bike from `comfort` to `performance`, old fit sessions must not silently mutate.

## Scope

### In Scope

1. Move `ridingStyle` and `primaryGoal` into the bike model
2. Treat `bikeType` as bike-owned everywhere in the fit-start UX
3. Keep fit-session values only as immutable snapshots used for history/reporting/recommendation reproducibility
4. Update bike create/edit UX so those three values can be managed on the bike
5. Update new-fit UX to select a bike first and derive session defaults from that bike
6. Add a migration path for existing bikes and sessions

### Out of Scope

- Rewriting recommendation history to recompute old sessions from the new bike values
- Multi-purpose bikes with multiple independent ride profiles in this same change
- Eliminating session snapshots entirely

## Proposed End State

### Bikes

Add / keep these fields on `bikes`:

- `bikeType`
- `ridingStyle`
- `primaryGoal`

### Fit Sessions

Sessions should still persist the chosen values used at creation time, but now explicitly as a snapshot/frozen copy.

Recommended transition:

- Phase 1:
  - keep `fitSessions.bikeType`, `fitSessions.ridingStyle`, `fitSessions.primaryGoal`
  - redefine them as session snapshots
  - stop treating them as primary user-entered attributes in the UI
- Phase 2:
  - optionally rename them to `bikeTypeSnapshot`, `ridingStyleSnapshot`, `primaryGoalSnapshot`
  - only after all consumers are migrated

This avoids a risky all-at-once schema and query rewrite.

## Rollout Strategy

1. Extend bike schema + bike forms
2. Backfill existing bikes where possible
3. Change fit-session creation to derive values from the bike
4. Simplify the new-fit UI to bike-first selection
5. Migrate downstream consumers to the bike-owned model plus session snapshots
6. Remove transitional fallbacks only after production data is backfilled

## Acceptance Criteria

- [x] Bike create/edit flows manage `bikeType`, `ridingStyle`, and `primaryGoal`
- [x] Starting a new fit session for an existing bike does not ask the user to re-enter those values
- [x] Session creation still stores an immutable copy of the bike attributes used at creation time
- [x] Existing sessions still render correctly in reports, results, and recommendation flows
- [x] Existing bikes without the new fields have a safe fallback/migration path
- [x] There is a documented production migration and rollout sequence

## Implementation Status

Implemented on March 20, 2026.

Completed:

1. Added `ridingStyle` and `primaryGoal` to `bikes` in [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
2. Extended bike create/update mutations in [`convex/bikes/mutations.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/mutations.ts)
3. Updated bike create/edit UX in [`src/components/features/bikes/CreateBikeForm.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/CreateBikeForm.tsx) and [`src/components/bikes/BikeForm.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeForm.tsx)
4. Updated bike detail/edit views to display and edit the bike-owned attributes
5. Changed fit-session creation in [`convex/sessions/mutations.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/sessions/mutations.ts) so sessions snapshot values from the selected bike
6. Simplified the new-fit flow in [`src/app/(dashboard)/fit/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/page.tsx) so saved bikes provide the authoritative defaults
7. Kept session-level fields in place as immutable snapshots for reports, results, and recommendations

## Rollout Notes

Production rollout sequence:

1. Deploy the frontend and Convex schema/mutations together
2. Run `npx convex dev --once` locally for codegen and deploy Convex to production before the new frontend is exposed
3. Existing bikes without `ridingStyle` or `primaryGoal` remain readable, but users must complete those fields on the bike before starting a new fit session from that bike
4. Existing fit sessions remain valid because reporting and recommendation consumers still read the session snapshot fields
5. A later cleanup pass can backfill old bikes and remove the temporary no-bike/manual fallback from the fit-start page

## Steps

1. [`01-data-model-and-ownership.md`](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-session-bike-attribute-consolidation/01-data-model-and-ownership.md)
2. [`02-bike-schema-and-forms.md`](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-session-bike-attribute-consolidation/02-bike-schema-and-forms.md)
3. [`03-fit-session-creation-flow.md`](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-session-bike-attribute-consolidation/03-fit-session-creation-flow.md)
4. [`04-downstream-consumers-and-reporting.md`](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-session-bike-attribute-consolidation/04-downstream-consumers-and-reporting.md)
5. [`05-migration-and-rollout.md`](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-session-bike-attribute-consolidation/05-migration-and-rollout.md)
