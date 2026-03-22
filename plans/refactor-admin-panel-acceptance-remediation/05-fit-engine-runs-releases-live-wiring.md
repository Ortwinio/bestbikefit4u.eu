# Step 05 — Fit Engine, Fit Runs, And Releases

## Goal

Make the operational core of the admin panel truly traceable and reviewable.

## Tasks

1. Replace `src/components/admin/fit/data.ts` and `src/components/admin/releases/data.ts` in route rendering.
2. Wire `/admin/fit-engine` and `/admin/fit-engine/[versionId]` to live engine version data.
3. Wire `/admin/fit-runs` and `/admin/fit-runs/[sessionId]` to live run list/detail data.
4. Ensure fit-run detail shows:
   - input snapshot
   - engine version
   - output values
   - warnings
   - confidence score
   - review notes / override context
5. Wire `/admin/releases` and `/admin/releases/[releaseId]` to live data and release status mutations.
6. Keep release linking to feedback and rollout state transitions audit-backed.

## Done When

- Fit traceability is real, not implied.
- Release records can be created, linked, and transitioned live.
