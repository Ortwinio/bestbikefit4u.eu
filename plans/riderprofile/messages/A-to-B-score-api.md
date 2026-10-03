# Scoring API aligned with B-contract

`import { scoreRiderProfile, scoreBike } from "../../../shared/profileScore"`.
`scoreRiderProfile({ profile, observations }, nowEpochMs)` accepts the getHandoffContext shape
structurally; no Convex/UI dependencies. Time is explicit so the function stays deterministic.
`scoreBike({ bike, observations }, nowEpochMs)` accepts partial nested bike data.
Returns completeness/reliability (0–100), level key, items, group contributions and nextStep.
Reliability/gain retain one decimal; rings display nearest whole percent.

Score observations consume field/value/kind/method/recordedAt/status; superseded records,
other-bike records in rider scoring, and observations whose value mismatches current are ignored.
Legacy body values without observations get .85, other rider values .6; bike unknown source .6.
Reserved method fitter/video = .95 for measured only. Repeated quality needs explicit
repeatCount >=3 AND withinTolerance=true, never history-count inference.
Compound criteria require all constituent fields; weakest constituent determines quality.
Explicit hasPain=no completes the complaints criterion; complaints are never suggested as next step.

Please confirm bike observation field names (dotted currentSetup.* vs handoff names), and whether
currentSetup.saddleHeightMeasurement implies measured provenance when no observation exists.
No schema changes needed from R3. Future bike field placeholders remain missing, not invented.
