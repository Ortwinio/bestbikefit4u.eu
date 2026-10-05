# F1 shared model/backend contract — 5 October

C owns shared/reliability/*, shared plausibility integration, Convex reliability + narrow schema/generated API integration, reliability lifecycle/mail renderer, PDF report ranges. B owns pages/components/dictionaries; A owns cross-calculator client storage/merge/prefill and leave notices. Existing engine advice values remain unchanged; ranges wrap real outputs, never substitute board fixture numbers.

## Models (pure, no persistence)

Existing shared/reliability/saddleHeight.ts exports stay compatible (Q1 contract). New modules:
- `shared/reliability/calculators.ts`: `getReliabilityRange(input)` for continuous/discrete uncertainty; metric keys `saddleHeight`, `saddleSetback`, `handlebarDrop`, `reach`, `frameSize`, `crankLength`, `saddleWidth`, `speed`, `climbTime`, `ftpWkg`, `cadence`, `hydration`. Existing calculator/engine owns centre value. Input `{metric,value,level?:"public"|"account"|"paid",...evidence}`; return discriminated continuous/size result with value, bounds, halfWidth, fixed scale, source/basis/next-step keys (localized by UI), or null if evidence/value insufficient. Precise types to follow in this file before consumers integrate. Written §9 widths beat differing board estimates. Never narrow solely because a user pays/logs in; evidence must support it. No public flexibility/core inputs. No invented tyre-pressure/cleat uncertainty (not in owner table).
- `shared/reliability/accountSaddle.ts`: `calculateAccountSaddleHeight` from mean inseam measurements, provenance, bike/goal/flex/core/climb, with numeric breakdown and repeat count/tolerance; model retains 787mm worked example. Repeated measurements >5mm apart do not gain repeat precision.
- `shared/reliability/kneeAngle.ts`: `calculateKneeAngle` from measured angle,current saddleheight,inseam/provenance. 25–35 inclusive =>sigmaM4mm; outsidewindow normalmodeluncertainty, desired shift~2mm/degree toward30, nextstep clamped±5mm. Numeric plan/basis/verdict keys; no fabricated photo assessment.

Shared checkInseamPlausibility is authoritative for validation.ts, publicCalculatorLogic.ts and profileAutosave.ts. C will touch only validation/provenance sections of existing profile writes, coordinating A. Invalid input rejected; check warning confirmation clears open flag, large override remains unresolved. Provenance sigma follows rules1–5. Account model/measurement metadata preserves observed mean/spread.

## Backend contract

New `api.reliability.queries.getSaddleState({bikeId?})`: owned profile + inseam measurement history, account model and latest owned knee/adjustment record. `api.reliability.mutations.saveInseamMeasurement({valueCm,method?,confirmed?,override?})`: authenticated, shared validation, append measured history and update existing profile provenance. `api.reliability.mutations.saveKneeAngle({angleDegrees,currentSaddleHeightMm,bikeId?})`: authenticated + existing paid-access gating (enforcement off signed-in allowed); server computes plan using owned profile, stores measurement/plan and schedules seven-day evaluation idempotently. Precise return validators/types may be refined in followup before integration.

`api.reliability.queries.getDashboardReliability({sessionId?})`: owned real existing A–D advice values with ranges, basis keys and one largest-gain next-step. No recreated recommendations or client-owned user IDs. Scheduling uses existing lifecycle/preferences and an NL/EN renderer, tests mock all send/scheduler calls. No actual sends/prod writes.

## UI contracts / reports

B may build size-bar UI from Maatbalk; C provides pure discrete positions/eligibleindices via model (no competing UI edits). RangeBar accepts explicit min/max for general scale value±1.25*widest halfwidth; existing public saddle ±60 stays backward compatible.
PDF F1 adds ranges and accuracy text to existing reportV2 payload/rendering; preserves recommendations and six-page content/order. Safety clamp remains internal, not drawn. No invented data/provenance when absent; hide unsupported range or use explicitly declared fallback uncertainty.

C publishes detailed exported types and final API signatures here as modules land. No commits/deploy/env/prod/mail; A owns combined final gates.
