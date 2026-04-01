# Ticket 02: Bike Form Standard Selection

## Title

Standard geometry selection flow in create/edit bike form

## User Story

As a rider, I want to choose my bike by brand, model, year, and size so the app can connect my bike to the right geometry record when it exists.

## Business Value

- raises the percentage of bikes with linked geometry
- improves downstream data quality for fit context
- reduces confusion caused by inconsistent rider-entered brand/model text

## Dependencies

- Ticket 01 query contract
- existing bike create/edit form

## Scope

- add a dedicated geometry-link section to the rider bike form
- allow:
  - standard brand selection
  - standard model selection
  - year selection only when needed
  - size selection from available geometry records
- keep geometry linking optional

## Acceptance Criteria

- the form shows standard brands first
- selecting a brand filters models to that brand only
- selecting a model filters sizes to that model only
- year is requested only when there are multiple meaningful model-year variants
- selecting a final geometry option prepares a single `geometryRecordId` for save

## Edge Cases

- brand has only one valid model-year combination
- a model has one size only
- switching brand resets model, year, and size
- switching model resets year and size
- selecting a different year resets size

## Analytics Events

- `bike_geometry_brand_selected`
- `bike_geometry_model_selected`
- `bike_geometry_year_selected`
- `bike_geometry_size_selected`

## Human Audit Checks

- choose a common brand and verify the model list feels sensible
- verify reset behavior after changing upstream choices
- verify the form remains understandable on mobile and desktop
