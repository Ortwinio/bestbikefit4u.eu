# Engine V2 Migration — Repo-Aligned Plan

## Goal

Migrate BestBikeFit4U from the current single-session recommendation flow to an Engine v2 architecture that supports:

- one rider with multiple bikes
- multiple fit profiles per bike
- versioned recommendations with confidence ranges
- shadow-mode validation before user-facing cutover
- later expansion to dynamic validation and feedback learning

The migration must preserve existing fit generation, avoid breaking current dashboard flows, and keep historical recommendations readable.

## Source Material

- `plans/engine-upgrade/BestBikeFit4U_Bike_Fitting_Engine_v2.docx.md`
- `context/architecture-review.md`
- current engine code under `convex/lib/fitAlgorithm/` and `convex/recommendations/`

## Quality Check Findings

The existing Engine v2 document is strong as a product vision, but weak as an executable repository plan.

### What was good

- Clear north star for multi-bike and multi-profile support
- Good separation of seed logic, validation, overlays, and learning
- Sensible phased rollout concept
- Strong focus on explainability, safety, and confidence ranges

### Gaps that blocked execution

1. It is not structured as a plan folder.
   There was only one strategy document and no task sequence, progress tracking, or step-by-step prompts.

2. It is not grounded enough in the current repo.
   The document uses a generic `Rider` model, while the codebase currently centers on `users`, `profiles`, `bikes`, `fitSessions`, and `recommendations`.

3. Migration mechanics were underspecified.
   It did not define how legacy sessions, recommendations, and bike-linked data should be backfilled or how compatibility should be preserved during rollout.

4. Shadow-mode criteria were too vague.
   “Run v1 and v2 in parallel” is directionally right, but there were no concrete comparison outputs, tolerances, or sign-off gates.

5. Dynamic validation and learning were mixed into the same conceptual plan too early.
   For this codebase they should be later phases behind feature flags, after the persistent data model and compatibility layer are stable.

6. There were no repo-specific acceptance criteria.
   The document did not define which Convex tables, mutations, UI routes, or tests must exist before a phase is considered complete.

7. There was no test plan.
   A migration at this depth needs static checks, contract tests, migration verification, shadow-run comparison, and manual flow validation.

## Current Repo Baseline

The codebase already has the foundation needed for a staged migration:

- deterministic fit engine in `convex/lib/fitAlgorithm/`
- input mapping layer in `convex/recommendations/inputMapping.ts`
- session creation and recommendation generation flow in `convex/sessions/` and `convex/recommendations/`
- persistent `profiles` and `bikes` tables in `convex/schema.ts`
- dashboard bike management UI under `src/app/(dashboard)/bikes/`
- contract and mapping tests for recommendations and sessions

Current gaps relevant to this migration:

- recommendations are still centered on a single `fitSessions -> recommendations` flow
- no first-class bike profile entity exists
- no versioned recommendation object with confidence ranges and feasibility flags exists
- no shadow-mode storage or comparison tooling exists
- no dynamic validation or feedback entities exist

## Scope

### In scope

- extract the current deterministic engine into an explicit v1 seed-engine contract
- introduce Engine v2 persistence and compatibility fields incrementally
- add bike profiles and versioned fit sessions
- run v2 in shadow mode before changing default user-facing behavior
- expose confidence ranges and feasibility metadata in recommendation payloads
- preserve legacy recommendations and user history
- introduce dynamic validation and ride feedback only behind feature flags

### Out of scope

- rewriting the core fit math from scratch
- launching wearable integrations
- building an advanced geometry database in the first migration
- fully automated self-learning without explicit user acceptance
- deleting legacy recommendation data during the migration

## Migration Principles

1. Keep the current engine usable throughout.
2. Introduce schema before UX cutover.
3. Preserve backward compatibility at API boundaries where practical.
4. Prefer additive schema changes and explicit backfills.
5. Gate every risky phase behind observability and rollback paths.
6. Treat dynamic validation and learning as beta features, not day-one defaults.

## Execution Order

### Phase 1 — Baseline and Engine Contract

Document the exact v1 engine inputs, outputs, and invariants and create the shadow-run comparison shape. No user-facing behavior changes.

### Phase 2 — Schema Foundation and Compatibility

Add additive data structures for bike profiles, engine versions, recommendation envelopes, and migration markers while keeping current reads and writes intact.

### Phase 3 — Multi-Bike / Multi-Profile Domain Model

Introduce first-class bike-profile relationships and session versioning in Convex, then wire compatibility adapters so current flows still work.

### Phase 4 — Seed Engine Extraction

Refactor the existing recommendation generation path into an explicit seed-engine module used by both legacy generation and the future v2 pipeline.

### Phase 5 — V2 Recommendation Envelope

Add recommendation ranges, confidence, feasibility, rationale, and change-order metadata without removing legacy fields yet.

### Phase 6 — Shadow Mode and Calibration

Run v1 and v2 together in the background, persist comparison results, and define acceptable deltas before any default cutover.

### Phase 7 — UX Rollout

Expose bike profiles, current-vs-target comparisons, and recommendation confidence in the dashboard while preserving access to legacy recommendation history.

### Phase 8 — Dynamic Validation Beta

Add validation capture and correction rules behind a feature flag for internal or limited-beta use only.

### Phase 9 — Feedback Loop Beta

Add ride feedback capture and conservative next-step suggestions behind a separate feature flag with strict guardrails.

### Phase 10 — Default V2 Cutover

Make v2 the default recommendation path after shadow metrics, QA, and rollback criteria are met.

## Acceptance Criteria

- [x] A new `plans/engine-v2-migration/` folder contains an executable repo-aligned plan
- [x] Every phase has a discrete prompt file with scope and exit criteria
- [x] The migration plan maps to the current Convex and Next.js modules in this repo
- [x] Legacy recommendations and sessions are explicitly preserved in the migration strategy
- [x] Shadow-mode comparison and rollout gates are defined concretely
- [x] Feature-flag boundaries are defined for dynamic validation and learning
- [x] `plans/engine-v2-migration/TESTPLAN.md` exists and covers static, migration, shadow, and manual validation

## Prompt Index

- `01-baseline-and-engine-contract.md`
- `02-schema-foundation-and-compatibility.md`
- `03-multi-bike-profile-model.md`
- `04-seed-engine-extraction.md`
- `05-v2-recommendation-envelope.md`
- `06-shadow-mode-and-calibration.md`
- `07-ux-rollout.md`
- `08-dynamic-validation-beta.md`
- `09-feedback-loop-beta.md`
- `10-default-cutover.md`
- `TESTPLAN.md`

## Progress

- [x] 01 — Baseline and engine contract
- [x] 02 — Schema foundation and compatibility
- [x] 03 — Multi-bike / multi-profile model
- [x] 04 — Seed engine extraction
- [x] 05 — V2 recommendation envelope
- [x] 06 — Shadow mode and calibration
- [x] 07 — UX rollout
- [x] 08 — Dynamic validation beta
- [x] 09 — Feedback loop beta
- [x] 10 — Default v2 cutover
