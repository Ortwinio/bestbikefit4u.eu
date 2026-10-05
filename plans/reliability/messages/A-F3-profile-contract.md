# F3 profile calculator data

API: `api.calculatorData.queries.get({})` returns `{ userId, entries }` for the authenticated rider, including existing canonical profile measurements. `api.calculatorData.mutations.save({ entries, expectedUserId, removedFields? })` returns `{ acceptedFields, retainedFields, removedFields }`. Authentication and expectedUserId are mandatory. Use makeFunctionReference until normal code generation runs; no deploy is needed.

Each entry: `field`, scalar `value`, `unit`, `calculator`, `method`, `touchedAt` (same vocabulary as HandoffEntry), plus optional `kind` (`measured|declared|estimated|derived`), `measurementMethod`, `repeatCount`, `withinTolerance`, `unresolvedWarning`. Legacy method `bike` maps to declared quality. Missing kind follows method. `method` stays measured/estimated/declared/bike for compatibility; richer provenance is carried in `measurementMethod`.

The server validates fields, units, ranges, dates and provenance. Canonical rider fields update the existing profile and observation history. Other calculator inputs live in optional `profiles.calculatorInputs`; existing bike records are not implicitly changed. Better quality wins; equal-quality newer data wins. Lower quality never overwrites a measured profile value. Existing handoff conflict UI remains the explicit import/offer path.

Removal deletes generic inputs only. Canonical rider fields require the existing explicit profile-edit flow and are returned in retainedFields instead. Provenance flags currently live in calculatorInputs; F1 can consume that data or extend the observation schema (not duplicated without coordination).

Validation: calculatorData/data.test.ts 12 tests pass; standalone Convex TypeScript passes (5 October). Existing account deletion removes this storage because it is part of the profile, not a separate table.
