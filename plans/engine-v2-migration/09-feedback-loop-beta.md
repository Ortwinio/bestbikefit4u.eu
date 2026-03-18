# 09 — Feedback Loop Beta

## Objective

Add structured post-ride feedback and conservative next-step suggestions without enabling uncontrolled auto-learning.

## In Scope

- post-ride feedback schema
- profile/session linkage for feedback
- one-step refinement suggestions with strict max adjustment sizes
- acceptance tracking so the system knows whether the rider actually implemented the change

## Safety Rules

- no silent auto-application of fit changes
- only suggest small changes for high-sensitivity parameters
- feedback from unconfirmed setups must not drive learning
- user-facing suggestions must include rationale and rollback context

## Expected Repo Touchpoints

- new Convex feedback entities
- recommendation refinement logic
- dashboard ride-feedback UI

## Exit Criteria

- feedback is stored against the correct bike profile and session
- refinement suggestions are conservative and auditable
- beta feature can be disabled cleanly
