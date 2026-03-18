# Output 04-05 — Seed Engine Boundary and Recommendation Envelope

## Purpose

Complete the extraction boundary around Engine v1 and start storing the richer v2 recommendation envelope without breaking current consumers.

## What Landed

- the seed-engine module now produces:
  - `fitInputs`
  - `fitOutputs`
  - `calculatedFit`
  - `comparisonSnapshot`
  - `recommendationItems`
  - `confidenceScore`
  - `algorithmVersion`
- recommendation persistence now stores:
  - `comparisonSnapshot`
  - `recommendationItems`

## Compatibility Outcome

- current dashboard and PDF consumers still use the legacy recommendation shape
- the v2 envelope is additive and stored for later UI rollout
- no query contract was changed for current pages

## Envelope Scope In This Phase

The stored recommendation items currently cover:

- saddle height
- saddle setback
- bar drop
- saddle-to-bar reach
- crank length
- handlebar width

Each item includes the fields needed for the later v2 results UI:

- `parameter`
- `target`
- optional range
- optional confidence
- optional method
- optional why
- optional feasibility
- optional risk flags
- optional change order

## Why This Is The Right Stopping Point

The data contract for v2 is now being produced and persisted, but the current results page remains stable. That keeps rollout risk low while preparing the next phase for UI exposure.
