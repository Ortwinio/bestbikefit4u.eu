# 02 — Gear Math Engine

## Objective

Define the pure deterministic drivetrain engine used by both public and dashboard calculators.

## Inputs

- drivetrain type
- chainring teeth array
- cassette teeth array
- wheel circumference in mm
- cadence rpm
- optional crank length for gain ratio

## Core formulas

### Gear ratio

`gear_ratio = chainring_teeth / rear_cog_teeth`

### Development

`development_m = gear_ratio × wheel_circumference_m`

### Speed at cadence

`speed_kmh = development_m × cadence_rpm × 60 / 1000`

### Cadence at speed

`cadence_rpm = (speed_kmh × 1000 / 60) / development_m`

### Gear inches

`gear_inches = wheel_diameter_inches × gear_ratio`

### Gain ratio

Optional dashboard metric:

`gain_ratio = wheel_radius_mm / crank_length_mm × gear_ratio`

## Required engine outputs

- all front/rear gear combinations
- easiest gear combination
- hardest gear combination
- ratio, development, gear inches for each gear
- speed-at-cadence for each gear
- cadence-at-speed helper function
- optional gain ratio if crank length present

## Validation rules

Hard validation:

- impossible tooth counts
- cassette max smaller than min
- empty drivetrain arrays
- wheel circumference outside plausible range
- cadence outside realistic range

## Deliverable

Engineering-ready contract for `src/lib/gearing-engine/math.ts` and its types/tests.

## Completion Checklist

- [ ] Formulas are exact and implementation-ready
- [ ] Output contract covers easiest/hardest gear and full table
- [ ] Validation rules are explicit
