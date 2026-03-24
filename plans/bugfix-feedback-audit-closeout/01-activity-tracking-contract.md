# Step 01 — Activity Tracking Contract

## Goal

Define a small, durable event vocabulary for the feedback activity trail.

## Tasks

1. Audit the current feedback activity tracking implementation.
2. Define a bounded action vocabulary for high-signal events only.
3. Map those events to representative app flows:
   - fit results
   - bikes
   - calculators
   - pricing/upgrade
   - settings/profile
4. Define how those events become:
   - `activityTrail`
   - `activitySummary`
5. Define what not to track.

## Deliverable

- a written contract artifact for the feedback activity event model

## Done When

- the team knows exactly which actions are worth capturing
- the event model is small enough to remain maintainable
