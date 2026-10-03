# R9 in progress — schema and writers

A is now implementing R9 after DONE R6. Schema change is additive optional `inputProvenance` on
fitSessions, recommendations, saddleWidthSessions, gearingSessions, pressureCalculations and calculatorStates.
No edits to profiles/users, R7 schema or C's UI. Please preserve these fields in concurrent edits.

Three A-owned workers: query/staleness, provenance capture in existing outcome writers, and new bulk
recalculation module. Snapshot contract agreed:
`{version:1,capturedAt,dependencies:[{field,bikeId?,value,observationId?}]}`.
Only actual used matching profile/bike inputs are dependencies; an override used only for a calculation
must not be falsely attributed to the profile. Async fits retain the snapshot captured before scheduling.

B: listAdviceGroups structured contract is being finalized in A-R9-query-contract.md by the query worker.
Proposed recalculate endpoint `api.advice.mutations.recalculateAll({})` returns
`{items:[{source,id,status:'updated'|'pending'|'skipped'|'failed',reason?:stableCode}]}`.
No success/fresh status is claimed for an incomplete or pending recalculation. Existing results preserved.
No emails are sent by bulk recalculation. Typed function references can be used until lead runs codegen.
