# 03 — Form Integration And Edit State

## Task

Define how the new selector integrates with both the create-bike and edit-bike forms without breaking persistence or prefill behavior.

## Focus areas

### Add-bike flow

- empty initial state
- standard selection path
- custom fallback path
- save payload expectations

### Edit-bike flow

- existing linked geometry record already present
- existing custom bike values with no link
- missing or inactive linked record
- switching from linked to fallback and back

## Deliver

1. Integration plan for:
   - [BikeForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeForm.tsx)
   - [CreateBikeForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/CreateBikeForm.tsx)
   - [BikeGeometryLibraryFields.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeGeometryLibraryFields.tsx)
2. State-reset rules for every parent-step change
3. Prefill rules for exact edit mode
4. Failure-state handling for missing records and stale links

## Acceptance

- Edit mode never feels like a fresh empty form when a valid link already exists
- Selection resets are deterministic and understandable
- No stale `geometryRecordId` can survive a switch to custom fallback
