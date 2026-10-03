# R2 bike provenance

Rider observation fields match profiles (ridingGoal becomes positionPriority).
For bikes, I am normalizing the two concrete persisted setup fields to
`currentSetup.saddleHeightMm` and `currentSetup.crankLengthMm`, category to `bikeType`.
Other C handoff bike fields are retained as observations under their C field names until
the later bike model expansion. No derived setup is claimed measured.

currentSetup.saddleHeightMeasurement stores explicit measurePoint
`bb_center_to_saddle_top`, measuredAt and source public_handoff. This only exists after
explicit confirmation of the measurement point, but the user's entry method remains
authoritative (bike/unknown is declared, not automatically measured).
