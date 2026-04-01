# Ticket 01: Geometry Contract And Query Shape

## Title

Rider geometry-link contract and query support

## User Story

As a rider, I want the bike form to load standardized geometry options so I can link my bike to a known geometry record instead of entering everything manually.

## Business Value

- improves bike identity consistency
- reduces admin manual linking work
- creates a stronger foundation for future fit and bike-reference features

## Dependencies

- existing `geometry_brands`, `geometry_models`, and `geometry_records`
- existing bike `geometryRecordId` support

## Scope

- add or extend rider-safe queries for:
  - list geometry brands
  - list models for a selected brand
  - list available size records for a selected model
  - expose year-range information where needed
- freeze the canonical persistence rule:
  - `geometryRecordId` is the linked source of truth

## Acceptance Criteria

- rider-facing queries return only the data needed for brand/model/year/size selection
- the form can determine when year selection is required vs unnecessary
- the query contract does not require raw internal ids to be shown in the UI

## Edge Cases

- brand exists but has no models
- model exists but has no active or usable size records
- multiple records share the same model name across different year ranges
- missing year ranges in older imported records

## Analytics Events

- `bike_geometry_brand_options_loaded`
- `bike_geometry_model_options_loaded`
- `bike_geometry_size_options_loaded`

## Human Audit Checks

- inspect a few brands with multiple models and years
- verify size options belong only to the selected model
- verify the contract does not expose admin-only metadata in rider UI
