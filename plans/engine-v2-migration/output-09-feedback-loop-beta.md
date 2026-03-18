# Output 09 — Feedback Loop Beta

## Purpose

Add feature-flagged ride feedback capture and conservative refinement suggestion logic without auto-applying changes.

## What Landed

- `rideFeedbackEntries` table
- `rideFeedback.submitBeta`
- `rideFeedback.queries.listBySession`
- `rideFeedback.queries.getLatestBySession`
- conservative suggestion helper in `convex/recommendations/refinement.ts`
- env gate: `ENGINE_V2_FEEDBACK_BETA_ENABLED`

## Safety Properties

- feedback is only accepted for owned sessions
- no suggestion is generated when the setup was not confirmed as implemented
- suggestions are capped to conservative step sizes:
  - saddle height: 2 mm
  - bar drop: 5 mm
  - saddle setback: 3 mm
- suggestions are stored as advice only and are not auto-applied
