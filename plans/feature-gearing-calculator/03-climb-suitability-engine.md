# 03 — Climb Suitability Engine

## Objective

Define the rider-aware climb-suitability layer that sits on top of deterministic gear math.

## Core question

Can this rider, at their preferred cadence, sustain the speed forced by this gearing on this climb?

## Inputs

- easiest-gear speed at preferred cadence
- rider mass
- bike mass
- FTP
- preferred cadence
- cadence comfort range
- average gradient
- max gradient optional
- climb length
- event type
- surface
- bike type
- ride preference labels

## Calculation flow

### Step 1

Calculate easiest-gear speed at preferred cadence.

### Step 2

Estimate required climb power at that speed and gradient.

MVP model:

- gravity + rolling as primary
- aero as minor correction when speed is low and gradient is steep

### Step 3

Estimate sustainable climbing power from FTP with climb-duration correction.

Configurable duration bands:

- `< 8 min`: `100–110% FTP`
- `8–20 min`: `95–100% FTP`
- `20–60 min`: `85–95% FTP`
- `60+ min`: `75–88% FTP`

### Step 4

Compare required power vs sustainable power:

- `power_gap = sustainable_power - required_power`

### Step 5

If preferred cadence is not feasible:

- solve for sustainable speed in current easiest gear
- infer cadence fallback range

## Scores

### A. Gear range score

Measures drivetrain breadth and usefulness for intended terrain.

Considers:

- easiest gear
- hardest gear
- cassette jumps
- bike type

### B. Climb suitability score

Measures how well the low gear matches rider and climb.

Considers:

- preferred cadence
- FTP
- rider+bike mass
- gradient
- climb length

### C. Event readiness score

Measures whole-setup fit for the target event.

Considers:

- route profile
- fatigue margin
- event type
- Alpine flag
- rider preference bias

## Output labels

- good match
- borderline
- too hard for target event
- race-oriented, not comfort-oriented
- needs bailout gear

## Deliverable

Engineering-ready contract for `src/lib/gearing-engine/suitability.ts`, score thresholds, and recommendation text hooks.

## Completion Checklist

- [ ] Power model is practical for MVP
- [ ] Duration-based sustainable power rules are configurable
- [ ] Scores and labels are distinct and comprehensible
