# Step 04: Fit Run Traceability

## Objective

Bring fit-run detail up to the plan requirement: input snapshot, engine version, output values, warnings, and confidence score.

## Tasks

1. Identify the source of truth for:
   - output values
   - warnings
   - confidence
   - related recommendations or derived results
2. Extend the admin trace query to return the missing payloads.
3. Update fit-run detail UI to render those payloads clearly.
4. Add empty-state handling for older runs that do not contain all fields.
5. Add tests covering:
   - full trace rendering
   - partial legacy data rendering

## Done When

- fit-run detail exposes the full planned trace model
