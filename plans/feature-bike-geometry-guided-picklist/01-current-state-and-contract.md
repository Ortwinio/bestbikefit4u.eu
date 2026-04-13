# 01 — Current State And Contract

## Task

Audit the existing rider-side geometry-linking flow and freeze the contract that the new picklist UX must preserve.

## Read first

- [README.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-bike-geometry-guided-picklist/README.md)
- [BikeGeometryLibraryFields.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeGeometryLibraryFields.tsx)
- [bikeFormGeometry.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/bikeFormGeometry.ts)
- [queries.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/geometry/queries.ts)
- [BikeForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeForm.tsx)
- [CreateBikeForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/CreateBikeForm.tsx)

## Deliver

1. Document the current end-to-end data flow:
   - what the add-bike page passes in
   - what the edit-bike page passes in
   - which queries feed each step
   - what save payload ultimately persists
2. Confirm which state helpers are already correct and should be preserved.
3. Identify any query-shape gaps that would make a guided picklist unnecessarily slow or complex.
4. Write a short contract note:
   - canonical geometry link remains `geometryRecordId`
   - custom fallback remains mutually exclusive with standard selection
   - edit flow must be fully prefilled

## Acceptance

- Contract is explicit enough that UI work does not need to reinterpret the backend
- No backend change is proposed unless it clearly improves UX latency or state simplicity
