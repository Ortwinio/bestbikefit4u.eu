# Output 08 — Dynamic Validation Beta

## Purpose

Add feature-flagged beta infrastructure for validation capture without coupling it to the main fit flow.

## What Landed

- `validationCaptures` table
- `validationCaptures.mutations.createBeta`
- `validationCaptures.queries.listBySession`
- env gate: `ENGINE_V2_DYNAMIC_VALIDATION_ENABLED`

## Safety Properties

- submission is blocked unless the beta flag is enabled
- captures are bound to owned sessions only
- captures are stored separately from the primary recommendation
- low-quality or partial captures do not overwrite the main recommendation path
