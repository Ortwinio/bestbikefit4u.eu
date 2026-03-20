# Step 01 — Data Model And Ownership

## Goal

Define the canonical ownership of `bikeType`, `ridingStyle`, and `primaryGoal`, and lock down the snapshot strategy before any UI or migration work starts.

## Current State

- `bikes.bikeType` exists in [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- `fitSessions.bikeType`, `fitSessions.ridingStyle`, and `fitSessions.primaryGoal` exist in [`convex/schema.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- session creation in [`convex/sessions/mutations.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/sessions/mutations.ts) currently accepts those values directly

## Decision

Adopt this ownership model:

- `bikeType`: bike-owned
- `ridingStyle`: bike-owned
- `primaryGoal`: bike-owned
- fit session fields: historical snapshot only

## Implementation Rule

Until the repo is fully migrated, **do not remove the session fields yet**. Reinterpret them as snapshots first. This reduces migration risk for:

- reports
- recommendations
- analytics
- results pages
- PDF generation

## Deliverables

1. Update schema comments and code comments to reflect snapshot semantics
2. Identify every reader of session-level `bikeType`, `ridingStyle`, `primaryGoal`
3. Document the fallback order during transition:
   - prefer session snapshot for historical reads
   - fallback to bike values only where legacy sessions are incomplete

## Acceptance Criteria

- [ ] There is one clear owner for each attribute
- [ ] Snapshot semantics are explicit in the code plan
- [ ] Downstream readers are enumerated before schema cleanup begins
