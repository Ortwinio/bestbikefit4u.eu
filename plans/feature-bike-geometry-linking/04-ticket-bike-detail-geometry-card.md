# Ticket 04: Bike Detail Geometry Card

## Title

Separate linked geometry card on bike detail page

## User Story

As a rider, I want to see the linked geometry record on my bike page so I can clearly understand which reference geometry is attached to this bike.

## Business Value

- makes linked geometry visible and trustworthy
- reduces confusion between reference geometry and rider setup
- supports support/admin conversations with clearer evidence

## Dependencies

- Ticket 02 or 03 persistence behavior
- existing bike detail page

## Scope

- extend the bike detail query to include linked geometry record detail
- add a dedicated geometry card separate from:
  - setup
  - notes
  - wheelsets
  - fit history
- show an explicit unlinked state

## Acceptance Criteria

- linked bikes show a dedicated geometry card
- the card shows:
  - brand
  - model
  - size
  - version
  - source
  - key measurements like stack and reach
- unlinked bikes show a dedicated unlinked state card
- the card does not imply that linked geometry is a fit recommendation by itself

## Edge Cases

- linked record is draft rather than active
- linked record exists but some measurements are missing
- bike has old freeform geometry data but no `geometryRecordId`
- geometry record was superseded after the bike was linked

## Analytics Events

- `bike_geometry_card_viewed`
- `bike_geometry_unlinked_state_viewed`

## Human Audit Checks

- compare linked and unlinked bikes side by side
- verify the geometry card is visually separate from setup fields
- verify the wording reads as reference data, not a fit verdict
