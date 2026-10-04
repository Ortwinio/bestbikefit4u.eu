# P1 selected-bike refinement contract

`scoreBike(input, now, access?)`: optional `{enforced:boolean, fullReport:boolean}`.
Off/omitted preserves legacy score. On free normalizes existing base (excluding reach/drop,
seat/head angles and gears) to 80. Paid refinement weights from BikeProfile board:
barReach 5, barDrop 5, seatAngle 2, headAngle 2, gears 3, strava 3.
Canonical fields: currentSetup.handlebarReachMm, currentSetup.handlebarDropMm,
currentGeometry.seatTubeAngle, currentGeometry.headTubeAngle, gearing.chainrings + gearing.cassetteTeeth,
activitySummary. Strava presence requires its stored source strava_v1_1 and a positive rideCount.
Angles may retain geometry database provenance; do not invent measured evidence for them.

`bikeProfileSummary` gains optional access as sixth argument. Both detail and garage queries pass
selected-bike authoritative access. Expired refinements remain readable but do not increase free score.
Root will wire `assertPaidBikeWrite(ctx,bike,updates,evidence?)` into other bike writers;
profile updateFields is guarded centrally before evidence writes. Changed nonempty refinements or
same-value evidence confirmation throw PAID_BIKE_ACCESS_REQUIRED without selected-bike fullReport.
Unchanged ordinary payloads and explicit removal are allowed.

New mutation `bikes/profile:removeRefinement({bikeId,field,expectedCurrentValue})` supports the
six groups; use field `gearing` for both gear arrays and `activitySummary` for Strava summary.
Expected value is the current JSON value (not a string serialization). Removal checks ownership and
concurrency; supersedes matching rider-bike observations and deletes metadata. No deletion of Strava connection.
