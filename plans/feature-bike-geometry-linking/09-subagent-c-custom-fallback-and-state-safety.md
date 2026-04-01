# Subagent C: Custom Fallback And State Safety

## Role

Owner of the “brand/model not listed” fallback path and stale-state prevention.

## Ownership

Primary write scope:

- `src/components/bikes/`
- validation helpers and form normalization logic
- related i18n message files if needed

Do not modify backend geometry library governance.

## Mission

Make the rider fallback path safe, clear, and mutually exclusive with standard geometry linking.

## Requirements

1. Add fallback controls for:
   - custom brand
   - custom model
2. Ensure fallback use clears any stale geometry link.
3. Ensure returning from custom fallback to standard selection works cleanly.
4. Keep custom fallback values local to the bike record only.

## Acceptance Criteria

- rider can save a bike with custom brand/model when no library match exists
- custom fallback clears `geometryRecordId`
- custom fallback does not write anything into standard geometry tables
- stale linked states are prevented when switching flows

## Edge Cases To Cover

- rider switches from linked to custom brand
- rider switches from linked to custom model
- rider clears fallback and returns to standard flow
- rider partially selects a standard path, then falls back

## Analytics Events

- `bike_geometry_custom_brand_started`
- `bike_geometry_custom_model_started`
- `bike_geometry_link_cleared_for_custom_fallback`
- `bike_geometry_link_validation_error`

## Tests

- add focused tests for state transitions and saved payload normalization

## Output

- implemented fallback flow
- short closeout note with files changed and any remaining UX caveats
