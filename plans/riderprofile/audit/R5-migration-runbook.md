# R5 migration handoff (not executed)

The internal functions are `profiles/migrateObservations:migrateProfiles` and
`profiles/migrateObservations:migrateBikes`. This task has run only in-memory contract tests.
Do not infer database completion from these tests or the existence of migration source.

After an explicitly authorized deployment/environment is selected by the lead:

1. Start each function with `{paginationOpts:{numItems:10,cursor:null},dryRun:true}`.
2. Follow each returned continueCursor until isDone, retaining aggregate counts only. Inspect
   invalidValues and preservedCurrent; unchanged pre-existing observations always take precedence.
3. Review conservative kind/method classification with the pure planner tests. Dry-run performs
   no writes. It does not lock data between invocations; counts can change with concurrent edits.
4. Only after explicit approval repeat the pages with dryRun:false. The functions do not schedule
   further pages, mutate profiles/bikes, log measurements, or upgrade existing observations.
5. Repeat the dry-run. Already imported scopes should report preservedCurrent rather than planned.

Neither B nor the sidecars invoked Convex against any deployment. Production remains lead-owned.
