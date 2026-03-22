# Step 04 — Rider Data, Bikes, And Geometry

## Goal

Replace the current contract-shaped rider/bike/geometry surfaces with live moderation and governance workflows.

## Tasks

1. Remove dependence on `src/components/admin/contracts.ts` for rider-data and bikes routes.
2. Wire `/admin/rider-data` and `/admin/rider-data/[userId]` to live rider review queries and mutations.
3. Wire `/admin/bikes` and `/admin/bikes/[bikeId]` to live bike list/detail data and geometry-link actions.
4. Wire `/admin/geometry/**` to live brand/model/record queries and approval/import mutations.
5. Require change reason fields on geometry approval/rejection/versioning flows.
6. Add proper empty states for:
   - no flagged rider records
   - no unlinked bikes
   - no brands/models/records
   - import validation failures

## Done When

- Rider moderation and geometry governance are live and audited.
- Bikes and geometry are no longer read-only previews over fixture data.
