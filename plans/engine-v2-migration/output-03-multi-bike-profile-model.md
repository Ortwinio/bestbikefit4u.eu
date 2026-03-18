# Output 03 — Multi-Bike / Multi-Profile Backend Model

## Purpose

Introduce the backend domain model for bike profiles without forcing a UI cutover.

## What Landed

- ownership helper for `bikeProfiles`
- `convex/bikeProfiles/queries.ts`
- `convex/bikeProfiles/mutations.ts`
- optional `bikeProfileId` support in session creation
- session metadata defaults for current v1 sessions:
  - `engineVersion = v1`
  - `sourceType = legacy_flow` or `bike_profile_flow`
- recommendation persistence now records:
  - `bikeProfileId` from the session when present
  - `engineVersion`
  - `sourceType = engine_v1`
  - `comparisonSnapshot`

## Compatibility Behavior

- current fit-session creation still works with no bike profile
- bike profiles are optional, not required
- if a bike profile is supplied, it must belong to the selected bike
- if a bike profile is supplied without a bikeId, the session derives the bike from the profile

## Default Profile Rules

- a bike can have a default profile
- `ensureDefaultForBike` creates `Base` if none exists
- creating a new default clears the previous default flag
- archiving the default profile is blocked for now

## Why This Is Enough For Phase 3

This creates the core data relationship and auth rules needed for later UI rollout while keeping the current flow intact.
