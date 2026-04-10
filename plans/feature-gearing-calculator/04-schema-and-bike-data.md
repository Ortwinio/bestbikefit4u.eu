# 04 — Schema and Bike Data

## Objective

Define how gearing becomes part of the bike record and how the app collects drivetrain data for both new and existing bikes.

## Requirements

### New bikes

Bike create/edit flows must capture:

- drivetrain type `1x` / `2x`
- chainring sizes
- cassette teeth or cassette preset
- wheel circumference or tire-size-derived default
- crank length optional
- groupset optional
- derailleur max cog optional

### Existing bikes

Need a progressive completion flow:

- bikes without gearing remain valid
- bike detail page shows “Add gearing” prompt
- garage and bike detail can surface incomplete-setup status
- no blocking migration that requires every existing bike to be edited before shipping

## Proposed data model

### On `bikes`

Add a nested gearing object rather than a flat field explosion:

- `gearing.drivetrainType`
- `gearing.chainrings`
- `gearing.cassette`
- `gearing.wheelCircumferenceMm`
- `gearing.crankLengthMm`
- `gearing.groupsetName`
- `gearing.derailleurMaxCog`
- `gearing.completeness`
- `gearing.source`
- `gearing.updatedAt`

This keeps drivetrain facts attached to the bike, not to a transient calculator session.

### Normalization rules

To avoid ambiguity between presets, free-form entry, and future compatibility logic, the stored bike shape should normalize around explicit facts:

- `drivetrainType`: enum `1x` or `2x`
- `chainrings`: ordered array of integers
  - `1x` requires exactly 1 chainring
  - `2x` requires exactly 2 chainrings, sorted large to small
- `cassette`:
  - `presetId` optional
  - `teeth` explicit integer array when known
  - `minCog` and `maxCog` may exist transiently in forms, but persistence should prefer `teeth` once saved
- `wheelCircumferenceMm`: stored explicit numeric value even when initially derived from tire-size defaults
- `source`: enum such as `user_entered`, `preset`, `derived`, `imported`

The core rule is that calculation surfaces should consume normalized drivetrain facts, not UI-only shorthand.

### Data-completeness states

The bike record should support progressive quality rather than a binary present/missing state:

- `missing`: no usable gearing facts
- `partial`: some drivetrain facts exist, but not enough for full calculation or bike-card summary
- `complete`: enough data for gear math and bike-card summaries
- `validated`: enough data plus internally consistent values that pass all hard validation

Minimum requirement for `complete`:

- valid drivetrain type
- valid chainring array
- valid cassette data
- usable wheel circumference

`validated` is not required to save the bike, but it is required before showing full readiness messaging as if the setup were authoritative.

## Session persistence

Add calculator-session storage for public/dashboard runs:

- `gearRatioSessions`
- `drivetrainInputs`
- `riderInputs`
- `climbInputs`
- `gearOutputs`
- `drivetrainScenarios`

MVP may simplify this into one or two tables if that better fits the existing Convex patterns, but the logical separation should remain.

Bike records and calculator sessions must stay separate:

- the bike stores durable drivetrain facts
- the session stores rider inputs, route inputs, outputs, and recommendations
- no modeled scores or recommendation text should be copied onto the bike record as source-of-truth data

## Bike form implications

- Bike form adds a new gearing section
- Existing bikes can edit gearing independently without redoing unrelated bike fields
- Provide sensible presets by bike type when possible

### Required vs optional fields by bike workflow

Required for saving a complete gearing setup:

- drivetrain type
- chainring count and tooth values
- cassette tooth values or chosen preset that resolves to tooth values
- wheel circumference value or confirmed default

Optional in MVP:

- crank length
- groupset name
- derailleur max cog

### Existing-bike collection strategy

The rollout should avoid a hard migration and use progressive collection:

1. Existing bikes load safely even if `gearing` is absent.
2. Bike detail surfaces show one of: `Add gearing`, `Complete gearing`, or the finished gearing card.
3. Edit-bike flows allow a lightweight gearing-only completion path.
4. Garage surfaces may highlight incomplete gearing, but must not block normal bike usage.
5. Dashboard prefill should use bike gearing only when the bike is at least `complete`; otherwise it should prefill what is known and flag missing fields.

### Bike-card display rules

The bike detail gearing card should follow strict display gates:

- `missing`: show CTA to add gearing, no summary metrics
- `partial`: show incomplete-state CTA, no climb-readiness labels
- `complete`: show gear summaries
- `validated`: allow full summary plus route-readiness entry point

This prevents partial data from being displayed as a fully trustworthy drivetrain profile.

### Backfill and migration acceptance rules

- No existing bike read path fails if `gearing` is undefined
- No existing bike edit path forces immediate gearing entry
- New bikes can be saved with or without optional advanced gearing fields
- Any derived wheel default is persisted explicitly after confirmation so later calculations are stable

## Deliverable

Schema-extension and bike-data collection prompt, including migration/backfill rules and UX for incomplete existing bikes.

## Completion Checklist

- [ ] New-bike capture path is clear
- [ ] Existing-bike backfill is progressive and safe
- [ ] Bike-level gearing facts are separated from session outputs
- [ ] Data-completeness states are defined and drive UI behavior
- [ ] Partial data cannot produce misleading bike-card summaries
