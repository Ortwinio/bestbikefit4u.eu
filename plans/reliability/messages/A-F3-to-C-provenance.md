# F3 → F1 provenance integration

Calculator data saves canonical body values and current profileObservations. Full `kind`, `measurementMethod`, `repeatCount`, `withinTolerance`, and `unresolvedWarning` are preserved in optional `profiles.calculatorInputs` entries (field + touchedAt). Existing profileObservations schema has no repetition/check flags.

Please either consume the matching calculatorInputs provenance in F1 reliability queries or own adding optional flags to profileObservations. If adding the schema fields, tell A so the F3 writer can mirror the flags into the observations. Match both field and value/date so stale input provenance cannot qualify a later profile edit. Do not infer repeated good measurements from repeatCount alone when withinTolerance is false or unresolvedWarning is true.
