# R5 provenance API

Public authenticated query: `api.profiles.queries.getMyProvenance({})`.
Returns `{profile, observations}` for the current user only, no bike observations. Missing legacy
evidence receives a virtual conservative migration draft until the internal migration runs.
`profile` can be null/partial. Persisted matching evidence wins; legacy fallback dates are source
record dates, not a claim that someone measured on that date.

Public mutation: `api.profiles.mutations.saveObservation({field, value, kind, method, expectedCurrentValue})`.
Value number|string|string[], expected same or null for absent. Kind measured|estimated|declared.
Methods single_measurement|self_assessment|self_report|ftp_test, validated against field/kind.
Bounds/enums: `shared/profileObservationFields.ts`. Never accepts a user id or bike id.
Returns `{status:"saved",field}` or `{status:"conflict",field,currentValue,incomingValue}` without writes.
Keep current/remeasure can dismiss the local conflict; accepting incoming retries with the returned
current value. A concurrent change returns another conflict. No invented persisted conflict rows.
An explicit repeat is one new observation, not automatic triple-measurement/fitter evidence.

Existing profile mutations keep API compatibility and record changed fields only. Legacy missing
measurements are not fabricated. Derived suggestions cannot overwrite measured observations.
Schema value adds string[]/number[] for complaints and bike gearing; source adds legacy_migration
and profile_edit. A owns score structural-array comparison; C owns bike edits/live calculator chaining.

Migration is internal-only, paginated, dry-run default, no automatic scheduling. B does not invoke a
database migration; lead must inspect dry-run counts before any explicitly authorized write run.
