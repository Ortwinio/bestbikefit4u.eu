# F1 backend contract

All methods are under api.reliability.queries/mutations, require a signed-in owner, and never take a userId.

- getSaddleState({bikeId?}) -> {profile, observations, measurements: [{_id,valueCm,recordedAt,method}], bike, model: AccountSaddleHeightResult|null, latestKneeAngle: { _id,angleDegrees,currentSaddleHeightMm,stepMm,targetSaddleHeightMm,recordedAt,evaluationAt,...}|null, canUseKneeAngle:boolean}. Latest three actual measurements used; existing measured profile value is retained as first history entry on first new measurement. Missing data stays null; no fake defaults stored.
- saveInseamMeasurement({valueCm,method?:'single_measurement'|'fitter'|'video',confirmed?:boolean,override?:boolean,requestId:string}) -> {status:'saved',measurementId,meanInseamCm,repeatCount,withinTolerance,unresolvedWarning}. requestId unique per intentional measurement (crypto.randomUUID), reused on network retry. Hard invalid input rejects; 5–12% save remains unresolved until confirmed; >12% requires override and stays unresolved.
- saveKneeAngle({angleDegrees,currentSaddleHeightMm,bikeId?,requestId:string}) -> {_id,angleDegrees,inWindow,verdict,desiredAdjustmentMm,stepMm,targetSaddleHeightMm,evaluationAfterDays:7,range,evaluationAt}. requestId unique per intentional measurement, reused on retry. Server computes from owned profile; existing getAccess fullReport bike gating applies when paid enforcement on. Signed-in available when off. Seven-day mail scheduled once transactionally, service preferences rechecked at delivery. No uploaded-photo inference.
- getDashboardReliability({sessionId?}) -> null without owned recommendation; otherwise {sessionId,rows:[{letter:'A'|'B'|'C'|'D',metric,value,range}],largestGain:{metric,nextStepKey,halfWidth,reduction}|null}. Values are existing calculatedFit, unchanged. Uses recorded session provenance where available, otherwise conservative profile provenance. Range/basis/next-step keys use C-model-types contract.

UI routes used by evaluation email: /tools/knee-angle (locale added by shared emailActionUrl). Let C know if B chooses another route.

## Account controls persistence (added)
`api.reliability.mutations.saveSaddlePreferences({bikeId?,bikeType?,goal?,flexibilityScore?,coreScore?,climbing?,currentSaddleHeightMm?})` -> `{status:'saved'}`.
- bikeType road/gravel/mtb/city; goal comfort/balanced/performance/aero; scores integers1..5; climbing none/low/medium/high.
- Partial patch: send only touched fields. Existing profile/selectedbike values provide initial values; explicit preferences override. No defaults stored implicitly.
- Flex/core update existing rider profile with estimated/self_assessment provenance; other calculator preferences are owner+optionalbike scoped.
- getSaddleState additionally returns preferences {bikeType?,goal?,climbing?,currentSaddleHeightMm?,flexibilityScore?,coreScore?} and preferencesUpdatedAt. Account model includes persisted climbing correction.
- B actual route /tools/knee-angle is now used in evaluation emails.
