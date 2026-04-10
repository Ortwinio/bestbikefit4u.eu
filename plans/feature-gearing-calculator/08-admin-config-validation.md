# 08 — Admin Config and Validation

## Objective

Define admin-tunable parameters and validation rules for the gearing calculator.

## Admin-configurable parameters

- default wheel circumferences by wheel/tire size
- CdA assumptions by bike type
- rolling resistance assumptions by surface
- sustainable power multipliers by climb duration
- score thresholds
- cadence comfort bands
- Alpine climb definitions
- recommendation text rules

## Hard validation

- impossible tooth counts
- cassette max smaller than cassette min
- unrealistic cadence
- unrealistic wheel circumference
- impossible FTP/body-mass combinations
- gradient outside plausible range without override

## Soft validation

- mountain sportive selected with race-oriented low gear
- FTP too low for target climb at preferred cadence
- recommended cassette exceeds derailleur max-cog limit
- 1x setup creates undesirable jumps for road-event use

## Deliverable

Prompt covering config tables or config modules, validator design, warning taxonomy, and admin-tuning strategy.

## Completion Checklist

- [ ] Hard vs soft validation is clearly separated
- [ ] Tuning parameters are adjustable over time
- [ ] Compatibility warnings are part of the premium value layer
