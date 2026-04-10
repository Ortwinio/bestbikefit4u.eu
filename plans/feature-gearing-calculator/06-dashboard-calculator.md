# 06 — Dashboard Calculator

## Objective

Define the premium dashboard gearing calculator that connects drivetrain math to rider capability and target event demands.

## Route

- `/dashboard/gearing`

## Purpose

- rider personalization
- event preparation
- upgrade and purchase support
- route-readiness decisions

## MVP boundary

In MVP, the dashboard calculator should solve one practical decision well:

- can this rider ride this climb or event on their current setup at a sustainable cadence?

MVP includes:

- one current setup
- one comparison scenario
- one target climb/event profile at a time
- deterministic drivetrain outputs
- modeled climb-demand and sustainability outputs

MVP does not include:

- route import
- multi-climb course decomposition
- automatic groupset compatibility resolution
- more than one comparison scenario
- adaptive pacing strategy

## Dashboard inputs

### A. Drivetrain

- selected bike
- drivetrain type
- chainrings
- cassette
- wheel circumference
- crank length optional
- groupset optional
- derailleur max cog optional

### B. Rider

- rider weight
- bike weight
- FTP
- preferred cadence
- comfortable cadence range
- experience level
- weekly training volume

### C. Route / event

- event type
- average gradient
- max gradient
- climb length
- elevation gain
- surface
- Alpine flag

### D. Preference

- prefer spinning
- can grind lower cadence
- want bailout gearing
- want racing gearing
- want mixed-terrain one-bike setup

## Output contract

### Exact outputs

- easiest gear ratio
- highest gear ratio
- climbing speed at preferred cadence
- development in easiest and hardest gear
- cadence at target speed when explicitly requested

### Modeled outputs

- required power on target climb
- sustainable power estimate
- cadence feasibility
- gear range score
- climb suitability score
- event readiness score
- recommendation text
- warnings

### Confidence and assumptions contract

The dashboard must not present modeled outputs as exact measurements.

- Exact outputs are derived only from drivetrain and cadence math.
- Modeled outputs must include visible assumption framing when they depend on FTP, duration multipliers, bike-type physics assumptions, or missing route data.
- If rider or route inputs are incomplete, the result should downgrade gracefully to reduced-confidence guidance rather than silently filling strong conclusions.

Recommended confidence states:

- `high`: rider mass, bike mass, FTP, cadence, climb gradient, and climb length present
- `medium`: one non-critical rider or route field is missing and defaults are used
- `low`: major rider-capability data is missing, so only directional recommendation text is allowed

## Scenario support

MVP:

- current setup
- one comparison scenario

Examples:

- larger cassette
- smaller inner ring
- alternative compact crank

Scenario comparison should report:

- delta in easiest gear ratio
- delta in climbing speed at preferred cadence
- delta in required power on target climb
- change in suitability label
- any new warning introduced by the alternative setup

## Dashboard recommendation examples

- current gearing is well matched
- current setup is race-biased
- current low gear is too hard for Alpine climbs
- larger cassette materially improves cadence and fatigue margin

## Result behavior rules

### Preferred cadence flow

1. Calculate easiest-gear speed at preferred cadence.
2. Calculate required climbing power at that speed and gradient.
3. Estimate sustainable power from FTP and climb-duration rules.
4. Compare required power with sustainable power.
5. If mismatch exists, determine whether the rider must:
   - lower cadence
   - accept lower sustainable speed
   - change gearing

### Copy and UX rules

- Always separate “your drivetrain does X” from “for you, this is likely Y”.
- If the rider has no FTP, the dashboard may still compute drivetrain math and show reduced-confidence suitability language, but must not imply individualized power precision.
- If the bike is only partially complete, the selected-bike prefill should highlight missing fields before producing final readiness labels.
- Warnings are advisory in MVP unless the data is hard-invalid.

### Supported dashboard labels

- comfort-oriented climbing setup
- balanced sportive setup
- performance climbing setup
- race gearing
- undergeared on the flat but mountain-ready
- overgeared for Alpine use
- needs bailout gearing

## Deliverable

Implementation-ready prompt for dashboard route, form sections, result cards, history, and scenario comparison.

## Completion Checklist

- [ ] Rider-aware and route-aware logic is defined
- [ ] Output balances exact math with decisions
- [ ] Scenario comparison is included in MVP scope
- [ ] Exact outputs and modeled outputs are explicitly separated
- [ ] Confidence and assumption behavior is defined
