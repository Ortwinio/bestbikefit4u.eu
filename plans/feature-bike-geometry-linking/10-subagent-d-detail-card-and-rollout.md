# Subagent D: Detail Card, Persistence Wiring, And Rollout Validation

## Role

Owner of bike persistence wiring, linked geometry display, and final validation glue.

## Ownership

Primary write scope:

- bike detail query and page
- bike create/edit persistence wiring if needed
- analytics integration
- tests related to linked/unlinked detail rendering

Avoid rewriting the full bike form UI owned by other subagents unless integration requires it.

## Mission

Persist the selected geometry link on the bike and display it on a dedicated card on the bike detail page.

## Requirements

1. Ensure linked saves persist `geometryRecordId`.
2. Ensure custom fallback clears `geometryRecordId`.
3. Extend bike detail data so linked geometry record info is available.
4. Render a dedicated linked geometry card separate from setup/history cards.
5. Render an explicit unlinked state.
6. Keep wording reference-oriented, not fit-verdict-oriented.

## Acceptance Criteria

- linked bikes show a separate geometry card
- the card shows:
  - brand
  - model
  - size
  - version
  - source
  - key geometry values like stack and reach
- unlinked bikes show a clear unlinked state
- linked geometry is visibly separate from freeform setup values

## Edge Cases To Cover

- linked record is draft
- linked record is missing some measurements
- legacy bike has freeform geometry but no linked record
- record history/version exists

## Analytics Events

- `bike_geometry_link_saved`
- `bike_geometry_unlinked_saved`
- `bike_geometry_link_edit_changed`
- `bike_geometry_card_viewed`
- `bike_geometry_unlinked_state_viewed`

## Validation

- add or extend tests for linked/unlinked detail rendering
- run build verification

## Output

- integrated persistence and detail card
- short closeout note with files changed and validation results
