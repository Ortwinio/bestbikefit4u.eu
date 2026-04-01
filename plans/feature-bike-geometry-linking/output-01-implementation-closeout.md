# Bike Geometry Linking Closeout

## Outcome

Implemented the rider-side bike geometry linking sprint.

Delivered:

- rider-safe geometry brand/model/year/size queries
- bike create flow with geometry-library linking and custom fallback
- bike edit flow with geometry-library linking and custom fallback
- persistence of `geometryRecordId` on create and update
- separate linked-geometry card on the bike detail page
- focused analytics events for geometry-link visibility and selection

## Key Files

- `convex/geometry/queries.ts`
- `convex/bikes/mutations.ts`
- `convex/bikes/queries.ts`
- `src/components/bikes/BikeForm.tsx`
- `src/components/bikes/BikeGeometryLibraryFields.tsx`
- `src/components/bikes/bikeFormGeometry.ts`
- `src/components/features/bikes/CreateBikeForm.tsx`
- `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx`
- `src/app/(dashboard)/bikes/[bikeId]/page.tsx`
- `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx`

## Validation

- `npx convex codegen`
- `npx vitest run src/components/bikes/bikeFormGeometry.test.ts convex/geometry/__tests__/queries.contract.test.ts convex/bikes/__tests__/queries.contract.test.ts`
- `npm run build:vercel`

All passed.

## Remaining Limits

- custom fallback values remain rider-local and do not enrich the shared geometry library
- this sprint does not migrate existing inconsistent rider bike brand/model values
- passport and marketplace imports were not expanded to auto-link geometry records in this sprint
