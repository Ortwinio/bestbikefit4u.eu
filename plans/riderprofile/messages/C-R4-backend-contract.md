# C R4 calculator-chain backend contract

`api.calculatorChain.queries.getContext({ bikeId? })` is owner-authenticated and reactive.
Returns `{ profile, observations, bikes, bikeObservations, recentCalculators }`.
Profile evidence uses B's current matching observations + conservative legacy fallback.
Bike evidence uses matching current observations + conservative legacy fallback, scoped by bikeId.
Recent calculators contain only `{ calculator, updatedAt, bikeId? }` from owned saved states,
plus existing pressure/gearing/saddle sessions when their schema supports timestamps.
No other user's data, auth secrets or arbitrary request user IDs are accepted.

`api.calculatorChain.mutations.applyChanges({ calculator, bikeId?, changes })`:
- calculator is a canonical public/account tool slug.
- each change: `{ field, value, expectedCurrentValue, kind, measurePoint? }`.
- field uses canonical profile key (e.g. inseamCm, ftpWatts, positionPriority) or canonical
  bike path (e.g. currentSetup.saddleHeightMm, gearing.chainrings, tires.widthFrontMm).
- value: number|string|string[]|number[]; expectedCurrentValue additionally accepts null for absent.
- kind: measured|estimated|declared|derived. Computed values must remain derived; they cannot
  replace a matching measured observation. UI must not send derived outputs as measurements.
- measured saddle height requires measurePoint `bb_center_to_saddle_top`.
- profile fields reuse shared/profileObservationFields; bike inputs reuse existing bike editor bounds.
- no default values are accepted implicitly: this mutation only writes explicitly supplied changes.
- validate all changes and compare all expected values before writing anything.
- return `{status:'conflict', conflicts:[{field,currentValue,incomingValue}]}` without writes,
  or `{status:'saved', fields:string[]}`. Retry explicitly with latest expected values after user choice.
- changed values only; same-value requests are no-ops, not new evidence or measurement timestamps.

Fit sessions gain optional typed `profileSnapshot` and `profileObservationSnapshot` fields captured at creation.
Only actual engine profile inputs are snapshotted; observations include matching evidence and original IDs
when persisted. Existing calculatorStateId cannot silently override live rider measurements: divergence
is rejected before creating a session and must be resolved by save-to-profile or explicit trial handling.
New recommendation generation uses the session snapshot. Legacy sessions lacking a snapshot use their
current owned profile and preserve a first-use snapshot, with no silent calculatorInputs measurement override.
Legacy calculatorInputs remain stored for historical compatibility; historical recommendations are unchanged.

A: profileObservationSnapshot entries carry optional observationId + original field/value/kind/method/
recordedAt/source for future staleness comparisons. No migration or production write is run here.

## Final implementation clarifications

- Optional `source: 'profile' | 'bike'` is supported and checked against the field scope.
- `getContext` additionally returns `activeWheelset`, `activeTireSetup` for the selected bike and
  `advice: [{calculator,updatedAt,bikeId?,stale}]`. This staleness is conservative timestamp comparison;
  A's R9 dependency-backed advice API is the authoritative exact staleness implementation.
- `tires.*` changes patch the actual owned active tire setup; no duplicate bike tire record is created.
  No active setup means reject, with zero writes. Active-or-newest fallback matches the bike detail page.
- `bikeType` and `primaryGoal` invoke the existing bike update subtransaction to retain its side effects.
- Session create accepts `calculatorTrial: true` only alongside a saved calculatorStateId. Changed trial
  measurements are snapshotted as estimated calculator_trial evidence without borrowed observation IDs.
  Normal mode still rejects divergence. No profile write occurs during either kind of session creation.
- Completed/archived legacy reports retain their old explicit calculator-input overlay for historical display.
  New generation freezes current measurements once and never silently imports legacy calculator measurements.
- New source files: calculatorChain/{fields,queries,mutations,wheels,chain.test}.ts;
  sessions/profileSnapshot.ts. Existing session contracts updated; generated API contains new modules.

## Optimistic identity guards

`applyChanges` accepts `tireSetupId?: Id<'tireSetups'>`; it is required whenever changes include
`tires.*` and must still equal the owned active setup. A changed active setup rejects before any write,
even if the two setups have equal widths. Callers pass getContext.activeTireSetup._id from their edit context.
Changed ftpWatts requires an explicit ftpMethod change entry (with expectedCurrentValue) in the same request.
This prevents inheriting a stale ramp/test protocol or silently overwriting a concurrently edited method.
A known entered FTP uses ftpMethod='known'; computed protocols stay explicit and retain derived provenance.
