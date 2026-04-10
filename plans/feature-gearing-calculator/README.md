# Feature Plan: Gearing Calculator

## Goal

Build a two-version gearing calculator that expands BestBikeFit4U from fit guidance into drivetrain setup and route-readiness.

The feature must answer four rider questions:

1. What is my easiest and hardest gear?
2. What speed do I get at a given cadence?
3. Is my lowest gear suitable for the climb I want to ride?
4. What gearing change would make this route more manageable?

This ships as:

- a light public marketing calculator for fast drivetrain understanding and climb-readiness screening
- a more precise dashboard calculator that connects drivetrain math to rider capability, climb demand, and event goals
- bike data model support so gearing is stored for every new bike and progressively collected for existing bikes
- a gearing card on bike detail pages so the feature is visible where riders already manage setup

## Background

The market already validates the category:

- BikeCalc exposes chainring, cassette, wheel size, speed, cadence, and gain-ratio math.
- gear-calculator.com proves riders actively compare setups visually across complete drivetrains.
- cycling-calculator.com groups gearing and climb-performance tools in the same product family.

BestBikeFit4U can differentiate in two ways:

1. Public site: make gearing understandable and actionable fast.
2. Dashboard: connect gearing to the rider, the event, and the actual climb demand.

That makes this strategically useful beyond SEO:

- route readiness before mountain trips and sportives
- drivetrain upgrade decisions before events or purchases
- better bike-record quality across the garage

## Scope

### Phase 1 — MVP (this plan)

**Public marketing calculator** (`/calculators/gearing`)
- 1x and 2x drivetrain inputs
- chainrings, cassette, wheel circumference, cadence, target gradient
- optional bike type and climb-length band
- outputs: easiest/hardest gear, speed in easiest/hardest gear, simple climb-readiness verdict, upgrade direction
- clear CTA into account/dashboard
- full EN/NL support
- SEO-ready landing page with FAQ, related links, JSON-LD

**Dashboard gearing calculator** (`/dashboard/gearing`)
- drivetrain math plus rider capability and event suitability
- rider inputs: weight, FTP, cadence preference, cadence range, experience, training volume
- route inputs: average/max gradient, climb length, elevation gain, surface, event type, Alpine flag
- outputs: exact drivetrain math, required climb power, preferred-cadence feasibility, climb suitability, event readiness, drivetrain change suggestions
- scenario comparison for current setup vs one alternative setup in MVP

**Bike data model and capture**
- gearing fields added to bike records and bike forms
- existing bikes show missing-gearing prompts
- gear card added on bike detail pages
- progressive backfill path for existing bike garage data

**Shared engines**
- Layer 1: pure gear-math engine
- Layer 2: climb-suitability engine
- admin-configurable assumptions and thresholds
- unit tested

**Persistence**
- session storage for public and dashboard calculations
- optional scenario rows
- future-ready structure for admin tuning and event templates

### Phase 2 — not in this plan

- richer multi-scenario comparisons
- route importer and event templates
- groupset-compatibility assistant by derailleur and freehub constraints
- visual cassette/chainring comparison charts
- deeper integration with bike passport and event/course data

### Phase 3 — not in this plan

- smart trainer preparation workflows
- auto-import from external route files
- direct integration with fit profile and pacing recommendations
- altitude-specific modeling refinements

## Core Product Model

### Layer 1 — Gear Math Engine

Deterministic drivetrain math only:

- gear ratio
- development
- speed at cadence
- cadence at speed
- gear inches
- optional gain ratio
- easiest / hardest gear summaries

### Layer 2 — Climb Suitability Engine

BestBikeFit4U value-add:

- rider preferred cadence
- rider mass and bike mass
- FTP or sustainable climbing power
- climb gradient and duration
- bike type and ride intent
- event-readiness classification
- upgrade suggestions and setup warnings

## Implementation Strategy

Build bottom-up:

1. Define product and scoring contracts.
2. Implement pure gear-math engine.
3. Implement climb-suitability engine and recommendation rules.
4. Extend schema and bike data capture for new and existing bikes.
5. Build public calculator.
6. Build dashboard calculator.
7. Add bike detail gearing card and progressive collection UX.
8. Wire SEO, navigation, admin tuning, validation, and QA.

## Plan Files

- [01-product-definition.md](01-product-definition.md) — full product, UX, copy, and scope definition
- [02-gear-math-engine.md](02-gear-math-engine.md) — deterministic drivetrain formulas and engine contract
- [03-climb-suitability-engine.md](03-climb-suitability-engine.md) — rider/event suitability logic and scoring
- [04-schema-and-bike-data.md](04-schema-and-bike-data.md) — schema, bike form capture, existing-bike backfill strategy
- [05-public-calculator.md](05-public-calculator.md) — public marketing calculator route, form, output, SEO structure
- [06-dashboard-calculator.md](06-dashboard-calculator.md) — premium dashboard calculator and scenario UX
- [07-bike-pages-and-gear-card.md](07-bike-pages-and-gear-card.md) — bike page card, completion prompts, and bike-level entry points
- [08-admin-config-validation.md](08-admin-config-validation.md) — config tables, tuning controls, hard/soft validation rules
- [09-navigation-seo-copy.md](09-navigation-seo-copy.md) — footer, homepage, dashboard nav, copy, i18n, related links
- [10-qa-rollout.md](10-qa-rollout.md) — testplan, browser QA, migration checks, rollout sequence
- [testplan.md](testplan.md) — consolidated acceptance and validation matrix

## Key Architectural Decisions

### Bike data must be first-class

The calculator should not live only as a route tool. Gearing belongs on the bike object because:

- every bike has a drivetrain
- event suitability depends on the actual bike setup
- riders need to compare bikes in the garage

Therefore the plan includes:

- storage for 1x/2x drivetrain structure on bikes
- capture on create/edit bike flows
- a visible bike detail gearing card
- prompts for existing bikes with incomplete gearing

### Public and dashboard versions must share one engine family

The public and dashboard calculators should not diverge numerically on the same drivetrain math.

- Public uses Layer 1 plus a lightweight climb-readiness ruleset.
- Dashboard uses Layer 1 plus full Layer 2.

### Suitability labels should stay rider-readable

Use labels riders understand:

- generous
- balanced
- sporty
- aggressive
- overgeared

and in the dashboard:

- comfort-oriented climbing setup
- balanced sportive setup
- performance climbing setup
- race gearing
- overgeared for Alpine use
- needs bailout gearing

### Admin-tunable assumptions are required

The physics model and score thresholds should not be permanently hardcoded. Configurable inputs include:

- default wheel circumferences by tire size
- CdA by bike type
- rolling resistance by surface
- duration-based sustainable power multipliers
- cadence comfort bands
- Alpine climb definitions
- recommendation-text rules

## Dependencies

- current bike forms and bike detail surfaces
- existing `bikes` schema and garage flows
- existing public-calculator route patterns and dashboard tool patterns
- existing rider profile fields for weight, experience, and training volume
- optional FTP and cadence-preference capture in rider profile or calculator-local form state

## Audit Findings

The plan direction is sound, but four delivery risks needed to be made explicit:

1. Bike-data completeness was underdefined.
   The plan said gearing should be first-class on bikes, but it did not yet define data-completeness states, normalization rules, or what the UI should do when gearing is partial rather than fully missing.
2. Dashboard outputs mixed exact and inferred values too loosely.
   Gear math is deterministic, while climb suitability depends on assumptions. The plan needed a clearer contract for confidence, assumptions, and rider-facing copy so the dashboard does not overclaim precision.
3. MVP boundaries were clear at feature level but soft at scenario and compatibility level.
   The plan needed stricter statements about what is in MVP, what is not, and which warnings are advisory versus enforced.
4. Acceptance criteria were feature-complete but not success-complete.
   The plan needed measurable product, engineering, and rollout success criteria, not just route and UI presence checks.

## Success Criteria

### Product success

- Riders can understand their easiest gear, hardest gear, and speed at cadence in under one result screen.
- The public calculator gives a clear climb-readiness verdict and one actionable next-step recommendation without requiring rider-profile data.
- The dashboard calculator can explain whether the current gearing suits the rider and target event, not just display drivetrain math.
- Bike detail pages expose gearing in a way that makes the calculator discoverable from the garage workflow.

### Engineering success

- The same Layer 1 drivetrain inputs produce the same core math in public, dashboard, and bike-card surfaces.
- Layer 2 suitability outputs clearly label which values are exact and which are model-based.
- Existing bikes remain valid after schema rollout, with no blocking migration requirement.
- Bike gearing data can be stored, edited, and reused without duplicating calculator-session data into the bike record.

### Rollout and data-quality success

- New-bike flows capture gearing in a structured way for all supported bike types.
- Existing bikes can move from missing to complete gearing progressively through prompts and edit flows.
- Partial or low-confidence inputs never produce misleading “ready” messaging on bike cards or calculator outputs.
- Admin tuning can adjust thresholds and assumptions without code changes.

## Acceptance Criteria

### Public calculator

- [ ] `/calculators/gearing` renders without login in EN and NL
- [ ] Supports 1x and 2x input paths
- [ ] Computes easiest and hardest gear correctly
- [ ] Computes speed at cadence correctly for easiest and hardest gears
- [ ] Returns a simple climb-readiness verdict based on drivetrain and route inputs
- [ ] Returns upgrade-direction guidance without pretending exact rider personalization
- [ ] Includes FAQ, related links, structured data, and dashboard CTA

### Dashboard calculator

- [ ] `/dashboard/gearing` requires authentication
- [ ] Reuses stored bike gearing when available
- [ ] Accepts rider, route, and event inputs
- [ ] Calculates required power on target climb from easiest-gear speed at preferred cadence
- [ ] Classifies cadence feasibility, climb suitability, and event readiness
- [ ] Supports current setup vs one alternative scenario in MVP
- [ ] Saves session results and can reload recent history
- [ ] Distinguishes exact drivetrain outputs from inferred suitability outputs in copy/UI
- [ ] Shows assumptions or reduced-confidence messaging when rider or route inputs are incomplete

### Bike data and bike pages

- [ ] New bikes can store gearing data during create/edit
- [ ] Existing bikes with missing gearing show a clear completion prompt
- [ ] Existing bikes with partial gearing show incomplete status rather than misleading summaries
- [ ] Bike detail pages show a gearing card with easiest/hardest gear and readiness entry point
- [ ] Bike-level route into dashboard calculator pre-fills the selected bike

### Engine and validation

- [ ] Layer 1 gear math is pure and unit tested
- [ ] Layer 2 climb suitability logic is pure and unit tested
- [ ] Validation cleanly separates hard-invalid data from soft advisory warnings
- [ ] Backfill and schema rollout do not break existing bike read/write paths

## Execution Gates

The plan should only move from one milestone to the next when these gates are met:

1. Engine gate
   Layer 1 contracts, formulas, and test vectors are finalized before public or dashboard UI work begins.
2. Data gate
   Bike-schema shape, completeness states, and migration-safe read behavior are finalized before bike-form implementation begins.
3. Public gate
   The public calculator must ship with stable verdict rules and copy before dashboard recommendation logic starts reusing those labels.
4. Dashboard gate
   Dashboard suitability must declare assumptions and confidence behavior before scenario comparison is implemented.
5. Rollout gate
   Bike card, prompts, validation, and QA must pass before the feature is treated as complete, even if both calculator pages already work.
- [ ] Hard validation rejects impossible drivetrain or route data
- [ ] Soft validation warns on setup mismatches and compatibility risks

## Progress

- [ ] 01 Product definition finalized
- [ ] 02 Gear math engine specified
- [ ] 03 Climb suitability engine specified
- [ ] 04 Schema and bike data plan finalized
- [ ] 05 Public calculator spec finalized
- [ ] 06 Dashboard calculator spec finalized
- [ ] 07 Bike page card and capture plan finalized
- [ ] 08 Admin config and validation plan finalized
- [ ] 09 Navigation, SEO, and copy plan finalized
- [ ] 10 QA and rollout plan finalized
