# 07 — Bike Pages and Gearing Card

## Objective

Define how gearing appears on bike pages and how riders are nudged to complete missing drivetrain data.

## Bike detail card

Show:

- drivetrain summary
- easiest gear
- hardest gear
- cassette / chainring summary
- CTA: “Check climb suitability”
- CTA target: dashboard gearing calculator with `bikeId` preselected

## Missing-data state

If bike gearing is incomplete:

- show missing-gearing card instead of pretending completeness
- explain what is missing
- CTA: “Add gearing”

## Garage / list-level follow-up

Optional but recommended:

- badge for bikes with complete gearing
- completion prompt for bikes without drivetrain data

## Edit flow requirements

- drivetrain fields must be editable without reworking unrelated bike fields
- presets should speed up common road/gravel/MTB setups

## Deliverable

UI prompt for bike detail card, missing-data states, and bike-form integration.

## Completion Checklist

- [ ] Bike detail entry point is clear
- [ ] Existing bikes without gearing are handled honestly
- [ ] Dashboard calculator can open prefilled from bike context
