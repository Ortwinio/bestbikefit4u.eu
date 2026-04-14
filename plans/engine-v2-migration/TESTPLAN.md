# Engine V2 Migration — Test Plan

## Purpose

Verify that the Engine v2 migration can be introduced incrementally without breaking the current fit flow, corrupting historical data, or exposing uncalibrated recommendations by default.

This test plan is aligned to the current repo structure on 2026-03-18.

## Scope

Areas in scope:

- Convex schema and migrations related to `profiles`, `bikes`, `fitSessions`, recommendations, bike profiles, validation capture, and feedback
- seed-engine extraction from `convex/lib/fitAlgorithm/`
- recommendation generation in `convex/recommendations/`
- fit-session creation and retrieval in `convex/sessions/`
- dashboard bike and fit flows under `src/app/(dashboard)/`
- shadow-mode comparison and persistence

## Exit Criteria

- `npm run typecheck` passes
- `npm run lint` passes
- relevant unit and contract tests pass
- additive schema changes do not break existing session, bike, or recommendation reads
- shadow-mode comparison can run without user-visible regressions
- manual dashboard flows still work for an existing user with legacy data

## Test Levels

### 1. Static Validation

Run after each backend or UI phase:

```bash
npm run typecheck
```

Run before phase sign-off:

```bash
npm run lint
npm test
```

Checks:

- generated Convex types stay in sync with schema changes
- new optional fields do not break current call sites
- legacy query consumers still compile after recommendation-shape expansion

### 2. Schema Compatibility Checks

Verify:

- existing `profiles`, `bikes`, `fitSessions`, and `recommendations` documents remain readable after additive schema changes
- new bike-profile or recommendation-envelope fields are optional where legacy rows do not have them
- indexes exist for new bike-profile and session lookup paths
- legacy queries still return data for old sessions without requiring backfill completion

### 3. Seed Engine Parity Checks

Create focused tests around the extracted seed engine.

Verify:

- current v1 seed outputs remain unchanged for representative road, gravel, mountain, and city cases
- input mapping still passes through the expected body and bike fields
- known invariants in existing fit algorithm tests still hold
- extraction does not alter clamping, rounding, or lookup behavior

Suggested files to extend:

- `convex/lib/fitAlgorithm/__tests__/`
- `convex/recommendations/__tests__/generate.mapping.integration.test.ts`
- `convex/recommendations/__tests__/generate.contract.test.ts`

### 4. Recommendation Envelope Compatibility Checks

Verify:

- recommendations can expose both legacy fields and the new v2 envelope during transition
- range, confidence, feasibility, rationale, and change-order fields serialize and query correctly
- current results consumers do not crash when some v2 fields are missing
- legacy results still render when only the old payload exists

### 5. Session and Bike Profile Flow Checks

Verify:

- a user can create a fit session from an existing bike
- a user can create or select a bike profile where the phase introduces it
- sessions resolve the correct bike/profile relationship
- auth checks still prevent access to another user’s bikes, sessions, and recommendations

Suggested files to extend:

- `convex/sessions/__tests__/create.contract.test.ts`
- `convex/sessions/__tests__/queries.contract.test.ts`
- any new bike-profile contract tests

### 6. Shadow Mode Checks

Verify:

- v2 shadow generation can run without changing the user-visible recommendation source
- comparison records store v1 output, v2 output, and deltas for the same session
- expected tolerance bands are enforced or at least reported
- shadow failures are visible and do not block the normal fit flow

Minimum comparison fields:

- saddle height
- saddle setback
- handlebar drop
- handlebar reach
- stem length or stem recommendation
- crank length
- handlebar width

### 7. Migration / Backfill Checks

If a migration script or internal mutation is introduced, verify:

- legacy sessions can be mapped to the new bike/profile model without data loss
- imported or generated default profiles are stable and idempotent
- rerunning the migration does not duplicate profiles or recommendation snapshots
- legacy recommendation snapshots remain marked clearly as legacy

### 8. Dynamic Validation Beta Checks

Only for the beta phase.

Verify:

- validation capture is feature-flagged
- invalid or low-quality capture does not crash recommendation generation
- correction rules are small, explainable, and reversible
- disabling the feature flag restores the normal flow cleanly

### 9. Feedback Loop Beta Checks

Only for the beta phase.

Verify:

- feedback is attached to the correct bike profile and fit session
- refinement suggestions are not auto-applied
- adjustment sizes stay within defined safety limits
- feedback from unimplemented changes does not drive learning

### 10. Manual Dashboard Checks

Run in `npm run dev` for a user with existing data and, if available, one user using new bike-profile data.

Verify:

1. Existing bike list still loads.
2. Existing fit start page still allows session creation.
3. Existing questionnaire-to-results flow still completes.
4. Existing results page still renders a legacy recommendation.
5. A migrated or new bike with profiles can be selected correctly.
6. A v2-shaped recommendation renders ranges and confidence without layout breakage.
7. Legacy history remains visible where expected.

## Rollout Sign-Off Checklist

- [x] Static checks pass
- [x] Contract and parity tests pass
- [ ] Schema compatibility verified on legacy-shaped data
- [ ] Shadow mode records and reports deltas correctly
- [ ] Manual dashboard fit flow verified
- [x] Rollback path documented before default cutover
