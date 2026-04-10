# Gearing Calculator Test Plan

## Goal

Define the acceptance, validation, and QA coverage required to ship the public and dashboard gearing calculators plus bike-level gearing capture.

## Acceptance matrix

### Engine

- E01: 34x32 easiest gear produces correct ratio and development
- E02: 50x11 hardest gear produces correct ratio and speed at cadence
- E03: 1x gravel setup computes full gear table correctly
- E04: cadence-at-speed inversion returns expected rpm
- E05: gain ratio appears only when crank length is present
- E06: impossible cassette or chainring input fails validation
- E07: public and dashboard Layer 1 math match for identical drivetrain inputs
- E08: modeled climb outputs are flagged as reduced confidence when major rider inputs are missing

### Public

- P01: `/calculators/gearing` loads without authentication in EN and NL
- P02: user can switch between 1x and 2x
- P03: easiest/hardest gear outputs update correctly
- P04: public verdict classifies suitable/challenging/overgeared
- P05: public recommendation suggests cassette or chainring direction
- P06: public CTA to dashboard/account is visible
- P07: public copy does not claim rider-personalized precision without rider inputs
- P08: long-climb band changes verdict language where applicable

### Dashboard

- D01: `/dashboard/gearing` requires auth
- D02: bike context prefill works from `bikeId`
- D03: stored bike gearing preloads into the form
- D04: rider and climb inputs affect suitability outputs
- D05: required power is shown for target climb
- D06: event readiness score is produced
- D07: one alternative scenario can be compared to current setup
- D08: session save/load works
- D09: exact drivetrain outputs are visually separated from modeled suitability outputs
- D10: missing FTP or missing climb-length inputs downgrade confidence instead of failing silently
- D11: scenario comparison reports deltas for gearing and climb suitability
- D12: advisory warnings render separately from hard validation errors

### Bike pages

- B01: bike detail shows gearing card when gearing exists
- B02: missing-gearing prompt shows when data is absent
- B03: edit/create bike flows can save gearing safely
- B04: partial gearing shows incomplete-state CTA and does not render misleading readiness labels
- B05: validated gearing state enables the full card summary and calculator entry point

### Schema and migration

- S01: existing bikes without `gearing` still load in garage and bike-detail views
- S02: editing an existing bike without gearing does not force immediate completion
- S03: new bikes can save a complete gearing object with normalized chainring and cassette fields
- S04: derived wheel-size defaults persist as explicit circumference values after confirmation
- S05: bike records do not store calculator recommendation text or modeled scores as source-of-truth facts

### Validation and warnings

- V01: `1x` input rejects multiple chainrings
- V02: `2x` input rejects a single chainring
- V03: cassette max smaller than cassette min fails hard validation
- V04: unrealistic cadence and wheel circumference values fail hard validation
- V05: derailleur max-cog mismatch shows advisory warning, not silent acceptance
- V06: road-oriented `1x` setups with wide cassette jumps can trigger a soft warning for event suitability

## Recommended automated coverage

- `src/lib/gearing-engine/*.test.ts`
- public page/form tests
- dashboard calculator tests
- bike-form and bike-detail card tests
- schema/query contract tests for gearing session persistence
- migration-safe read tests for bikes with absent or partial gearing
- validation tests for drivetrain completeness states and warning rules

## Browser/UAT scenarios

1. Road compact setup for medium climb
2. Road race gearing for Alpine climb marked overgeared
3. Gravel 1x setup marked mountain-ready
4. Existing bike with no gearing shows completion prompt
5. Bike detail CTA opens dashboard gearing calculator with bike preselected
6. Existing bike with partial gearing shows incomplete state and avoids final readiness messaging
7. Dashboard without FTP shows reduced-confidence recommendation, not a precise claim
8. Scenario comparison shows current setup vs larger cassette delta clearly

## Ship criteria

The feature is ready only when:

- formulas are verified
- public and dashboard routes work in EN/NL
- bike capture and bike card integration are complete
- no migration breakage appears for existing bikes
- recommendation text and warnings are credible and understandable
- partial-data states behave safely and transparently
- confidence and assumptions are visible wherever modeled outputs are shown
