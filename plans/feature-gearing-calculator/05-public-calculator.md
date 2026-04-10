# 05 — Public Marketing Calculator

## Objective

Define the public-site gearing calculator route, content, inputs, outputs, and CTA behavior.

## Route

- EN/NL path: `/calculators/gearing`

## Purpose

- SEO acquisition
- quick gearing understanding
- route-readiness utility
- conversion into account/dashboard

## Inputs

Required:

- drivetrain type
- chainring(s)
- cassette
- wheel circumference or wheel preset
- cadence
- target climb gradient

Recommended:

- bike type
- climb length band

## Public output contract

- lowest gear ratio
- highest gear ratio
- speed in easiest gear at chosen cadence
- speed in hardest gear at chosen cadence
- verdict:
  - suitable
  - challenging
  - likely overgeared
- upgrade direction text

## Public rules

Use a drivetrain-route adequacy matrix by:

- gradient band:
  - `4–6%`
  - `7–9%`
  - `10–12%`
  - `13%+`
- climb-length band:
  - short
  - medium
  - long
  - Alpine

and classify the easiest gear as:

- generous
- balanced
- sporty
- aggressive
- overgeared

## UX principles

- one fast form
- no hidden math assumptions
- clear verdict first
- exact drivetrain numbers below
- simple CTA into dashboard

## Suggested CTA framing

“See whether this gearing suits your fitness and target event in the dashboard.”

## Deliverable

Implementation-ready prompt for page structure, metadata, FAQ, related links, and result copy.

## Completion Checklist

- [ ] Public tool stays fast and understandable
- [ ] Output is actionable without pretending full personalization
- [ ] Upsell into dashboard is clear
