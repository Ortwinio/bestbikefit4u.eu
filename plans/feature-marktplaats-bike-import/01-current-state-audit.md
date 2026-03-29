# Step 01 — Current-State Audit

## Objective

Map the existing bike creation, bike description, and bike photo flow so the Marktplaats import reuses current contracts instead of bypassing them.

## Inputs To Review

- [convex/schema.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- [convex/bikes/mutations.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/mutations.ts)
- [convex/bikePhotos/mutations.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikePhotos/mutations.ts)
- bike create/edit dashboard surfaces
- existing bike detail page and bike gallery flow
- Strava import patterns under `convex/integrations`

## Tasks

1. Document the current source-of-truth fields for a bike.
2. Document how multiple bike photos are created and marked primary.
3. Identify whether bike import traceability belongs on `bikes` or in a separate `bikeImports` table.
4. Decide where the new dashboard entry point belongs:
   - bike garage page
   - bike create page
   - dedicated import sheet or page
5. List current validation constraints that the importer must honor.

## Deliverable

Create `output-01-current-state-audit.md` with:

- current contract summary
- integration points
- recommended data-storage shape for import metadata
- open risks that affect parser or persistence design
