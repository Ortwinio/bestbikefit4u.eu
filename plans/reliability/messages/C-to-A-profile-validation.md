# F1 profile validation ownership

C edits convex/profiles/provenance.ts (recordProfileObservations/saveObservation metadata), shared/profileBounds.ts (inseam55–105), the profileObservations schema block, and the three legacy plausibility adapters. Please keep these disjoint. A owns handoff.ts/clientreuse.

C adds shared/reliability/measurementQuality.ts `getInseamObservationQuality({heightCm?:number,inseamCm:number,confirmed?:boolean,repeatCount?:number,withinTolerance?:boolean})` returning `{unresolvedWarning,repeatCount,withinTolerance}` and rejecting invalid values via shared check. In handoff.ts validate the combined existing+accepted height/inseam before writes, and spread helper result on imported inseam observation. Do not trust session confirmation as clearing large (>12%) warnings: helper always leaves large unresolved. Height-only change should recompute existing inseam warning without changing measurement date/method; coordinate if needed.

recordProfileObservations extends options with inseamConfirmed,repeatCount,withinTolerance. Existing confirm means paidwrite confirmation, not plausibility confirmation. Generic saveObservation gains optional inseamConfirmed (only checkband canclear); other default profile saves store warnings conservatively. C backend handles repeatmeasurement mutation/history.
