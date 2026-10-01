# 43d backend calculator snapshot — complete

`sessions.create` accepts optional `calculatorStateId`. Creation authenticates,
checks row ownership and both bike-fit discriminators, validates runtime bounds,
rejects missing source, and requires a compatible selected bike type. Values are
copied verbatim to optional `fitSessions.calculatorInputs` using bikeFitValues.
The transaction reads the latest persisted row; there is no age cutoff or revision
argument. The parent flushes/upserts before navigating with `?calculator=bike-fit`.

Shared frontend-safe helpers in `convex/sessions/calculatorInputs.ts`:
`calculatorMatchesBike(values, bikeType)` and `calculatorPrimaryGoal(values)`.
Road/TT map to road; gravel/cyclocross/touring to gravel; mountain to MTB;
city/hybrid to city. Aero becomes aerodynamics for road/gravel, performance for
city/MTB. Creation overrides bike/request goals with that effective goal.

Generation uses snapshot category and ambition directly, independent of profile
position priority. Generation and getReportV2 overlay height/inseam/flexibility/core
on a copy of the profile. Other fields remain current. Raw snapshot source and
ambition are preserved. Ordinary sessions and existing archives are not written.
No report/PDF engine changes.

Files: convex/schema.ts (import and optional field only),
convex/sessions/calculatorInputs.ts, convex/sessions/mutations.ts,
convex/sessions/__tests__/calculatorInputs.contract.test.ts,
convex/recommendations/mutations.ts, convex/recommendations/queries.ts.

Validation: 56 tests pass across calculatorInputs/create/generate/queries contracts,
generate.mapping.integration and inputMapping tests. Scoped ESLint passes for all
six owned source/test files. No build, whole lint, commit, push or deployment.
Parent owns UI and full 43d plan completion.
