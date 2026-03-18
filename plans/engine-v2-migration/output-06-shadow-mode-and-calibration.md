# Output 06 — Shadow Mode and Calibration Infrastructure

## Purpose

Add shadow-mode storage and comparison plumbing without changing the user-visible recommendation source.

## What Landed

- `recommendationShadowComparisons` table
- env-gated shadow mode via `ENGINE_V2_SHADOW_ENABLED`
- `runShadowComparison` internal action
- `storeShadowComparison` internal mutation
- owner-safe query:
  - `recommendations.queries.getShadowComparisonBySession`

## Current Behavior

- the main recommendation flow still stores the v1 recommendation shown to the user
- when `ENGINE_V2_SHADOW_ENABLED=true`, a shadow comparison run is scheduled after the v1 recommendation is stored
- the current shadow implementation reuses the extracted seed engine as the placeholder v2-shadow runner
- this means the plumbing is real even though delta values are currently expected to be zero unless the future v2 logic diverges

## Why This Is Useful Now

- comparison storage is in place before any UI cutover
- failures in shadow mode are isolated from the main fit result
- later v2 logic can replace the placeholder runner without redesigning the storage path
