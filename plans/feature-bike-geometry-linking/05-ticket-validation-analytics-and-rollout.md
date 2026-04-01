# Ticket 05: Validation, Analytics, And Rollout

## Title

Validation, telemetry, and ship checklist for geometry linking

## User Story

As a product team, we want the new geometry-link flow to be safe, measurable, and easy to verify before release.

## Business Value

- reduces bad saved states
- provides adoption visibility
- makes support and rollout safer

## Dependencies

- Tickets 01 through 04

## Scope

- add validation for impossible or stale linked states
- add tests for standard and custom flows
- add centralized analytics hooks
- prepare release checklist

## Acceptance Criteria

- validation prevents:
  - size selection without model
  - model selection without brand
  - stale `geometryRecordId` after switching to custom fallback
  - invalid model/size combinations
- tests cover:
  - standard linked save
  - custom brand save
  - custom model save
  - linked-to-custom edit
  - custom-to-linked edit
  - bike detail linked card render
  - bike detail unlinked card render
- analytics are centralized and typed

## Edge Cases

- linked bike edited after the underlying library changes
- year filter produces zero sizes
- rider abandons the form midway through a geometry selection
- legacy bikes with freeform geometry but no standard link

## Analytics Events

- `bike_geometry_link_saved`
- `bike_geometry_unlinked_saved`
- `bike_geometry_link_edit_changed`
- `bike_geometry_link_validation_error`

## Human Audit Checks

- verify a common bike can be linked end to end
- verify a missing-library bike can still be saved cleanly
- verify analytics fire only once per meaningful action
- verify no user-facing copy overclaims precision or scientific certainty
