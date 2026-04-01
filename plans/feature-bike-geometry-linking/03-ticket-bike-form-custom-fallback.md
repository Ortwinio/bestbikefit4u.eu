# Ticket 03: Bike Form Custom Fallback

## Title

Custom brand/model fallback without library writes

## User Story

As a rider whose bike is not in the library, I want to enter my own brand and model so I can still save my bike without polluting the standard geometry list.

## Business Value

- preserves conversion for uncommon bikes
- avoids forcing bad matches into the geometry library
- keeps the standard list cleaner

## Dependencies

- Ticket 02 form structure

## Scope

- add fallback controls:
  - custom brand
  - custom model
- make fallback mutually exclusive with standard geometry linking
- preserve existing save behavior for unlinked bikes

## Acceptance Criteria

- rider can choose custom brand when no brand match exists
- rider can choose custom model when no model match exists
- custom fallback clears any selected `geometryRecordId`
- custom fallback does not create standard geometry brands or models
- bike still saves successfully

## Edge Cases

- rider selects a standard brand, then switches to custom
- rider selects a standard model, then switches to custom
- rider enters custom brand but standard model remains selected from earlier state
- rider clears fallback values and returns to standard flow

## Analytics Events

- `bike_geometry_custom_brand_started`
- `bike_geometry_custom_model_started`
- `bike_geometry_link_cleared_for_custom_fallback`

## Human Audit Checks

- verify no new geometry library rows appear after custom fallback saves
- verify the saved bike shows rider-entered brand/model exactly as expected
- verify the fallback explanation copy is clear and not alarming
