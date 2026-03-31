# Step 03: Dashboard Entry And Import UI

## Objective

Expose the bike-passport flow in the dashboard and make bike creation a clear three-path entry experience.

## Files To Inspect

- [src/app/(dashboard)/bikes/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/page.tsx)
- [src/app/(dashboard)/bikes/new/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/new/page.tsx)
- [src/app/(dashboard)/bikes/import/marktplaats/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/import/marktplaats/page.tsx)
- [src/components/features/bikes/CreateBikeForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/CreateBikeForm.tsx)
- [src/components/features/bikes/MarktplaatsBikeImportFlow.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx)

## Tasks

1. Turn the bike creation entry point into an explicit chooser with three options:
   - create manually
   - import from Marktplaats
   - use bike-passport ID
2. Add a rider-facing passport import page or flow, preferably at `/bikes/import/passport`.
3. Add a simple preview/confirmation screen before final import.
4. Make the source-bike copy semantics clear:
   - this creates your own editable copy
   - changes do not affect the original bike
5. Provide clear validation and error states for:
   - invalid passport format
   - passport not found
   - bike already belongs to you
6. Route successful imports to the new bike detail page.

## UX Requirements

- the passport flow should feel as first-class as Marktplaats import
- the create-bike entry should stay simple, not overloaded
- riders should understand what the passport ID is before they paste one
- success copy should confirm they now own an editable copy

## Acceptance For This Step

- the dashboard clearly offers all three creation options
- the passport import page works end to end with the backend contract
- the UI states are understandable without reading technical details
- the existing manual and Marktplaats flows still work unchanged
