# 01 — Product Definition and UX Specification

## Objective

Define the complete product contract for the gearing calculator family: public marketing version, dashboard premium version, and bike-level integration.

## Product Goal

The gearing calculator should answer:

1. What is my easiest and hardest gear?
2. What speed do I get at a given cadence?
3. Is my lowest gear suitable for the climb I want to ride?
4. What gearing change would make this route more manageable?

## Market Positioning

Existing tools prove demand for:

- drivetrain math
- speed-at-cadence lookup
- climb gearing decisions
- setup comparison

BestBikeFit4U differentiates by making this:

- easy to understand publicly
- rider-aware in the dashboard
- attached to each bike in the garage

## Product Surfaces

### Public route

- Route: `/calculators/gearing`
- Purpose: acquisition, SEO, quick utility, dashboard upsell
- Tone: simple, practical, route-readiness guidance

### Dashboard route

- Route: `/dashboard/gearing`
- Purpose: premium rider/event decision support
- Tone: exact math plus rider-capability interpretation

### Bike detail entry

- Gearing card on bike detail page
- CTA into dashboard calculator with bike preselected
- Missing-gearing prompt when bike data is incomplete

## Public Calculator Definition

### Required inputs

- drivetrain type: `1x` or `2x`
- front chainring count(s)
- cassette definition
  - MVP: smallest and largest sprocket plus cassette preset or full steps
- wheel circumference or wheel-size preset
- cadence
- target climb gradient

### Strongly recommended inputs

- bike type: road / gravel / MTB / commuter
- climb length band:
  - short `< 3 km`
  - medium `3–8 km`
  - long `8–20 km`
  - Alpine `20 km+`

### Public outputs

- easiest gear ratio
- hardest gear ratio
- speed in easiest gear at chosen cadence
- speed in hardest gear at chosen cadence
- climb-readiness verdict:
  - suitable
  - challenging
  - likely overgeared
- upgrade direction:
  - larger cassette
  - smaller chainring
  - wider-range 1x
  - compact gearing recommended

### Public UX rule

Avoid pretending to know rider FTP if the rider has not given it. Public should classify drivetrain-route suitability, not rider physiology in detail.

## Dashboard Calculator Definition

### Drivetrain inputs

- bike type
- drivetrain type `1x` / `2x`
- chainring sizes
- cassette range or full cassette steps
- wheel circumference
- crank length optional
- groupset optional
- derailleur max sprocket limit optional

### Rider inputs

- rider weight
- bike weight
- FTP
- preferred climbing cadence
- comfortable cadence range
- experience level
- weekly training volume

### Route / event inputs

- event type
- average gradient
- maximum gradient
- climb length
- total elevation gain
- surface
- Alpine flag

### Ride intent / preference inputs

- mountain sportive
- Alpine holiday
- gran fondo
- local hilly ride
- fast club ride
- bikepacking
- race

and preference modifiers:

- I prefer spinning
- I can grind lower cadence
- I want bailout gearing
- I want racing gearing
- I want one bike for mixed terrain

### Dashboard outputs

- easiest gear ratio
- hardest gear ratio
- development range
- speed at preferred cadence in easiest gear
- required power on target climb
- sustainable climb power estimate
- cadence-feasibility verdict
- gear range score
- climb suitability score
- event readiness score
- recommendation text
- warnings and constraints

## Scenario Support

The dashboard must support comparison modes from day one, even if MVP ships only one alternative scenario:

- current vs larger cassette
- current vs smaller inner chainring
- current 2x vs target 1x
- cassette A vs cassette B

## User-Facing Recommendation Language

Use language like:

- comfort-oriented climbing setup
- balanced sportive setup
- performance climbing setup
- race gearing
- overgeared for Alpine use
- needs bailout gearing

Avoid jargon-only output without plain interpretation.

## Deliverable

This document is the product-definition artifact. Engineering prompts 02–10 should implement it in sequence.

## Completion Checklist

- [ ] Public and dashboard product goals are clearly separated
- [ ] Required and optional inputs are defined
- [ ] Output language is commercially usable
- [ ] Bike-level integration is explicitly part of the feature, not an afterthought
