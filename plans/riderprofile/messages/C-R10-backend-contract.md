# C R10 bike profile backend contract

Existing `api.bikes.queries.getDetail({bikeId})` adds `profileScore`, `bikeObservations`, `adjustmentRoom`.
Existing `listSummariesByUser({})` adds these per bike too; no per-card frontend requests needed.
`profileScore` is shared scoreBike output (completeness/reliability/groups/items/nextStep).
`bikeObservations` contains matching current evidence with conservative legacy fallback; measured
setup evidence includes the fixed measurePoint. Tires used for scoring are the actual active setup.
`adjustmentRoom` = `{status:'unknown'|'exceeds', reason:'seatpost_extension_unknown'|'spacer_limit_exceeded',
 spacersMm?:number,maxSpacerStackMm?:number,maxSeatpostMm?:number}`. No safe-fit claim from incomplete geometry.
`maxSeatpostMm` means maximum safe exposed seatpost length, NOT maximum BB-to-saddle height.
Without current exposed extension we cannot compare a saddle-height target; show the unknown notice.

New `api.bikes.profile.updateFields({bikeId,changes})`:
`changes: [{field,value,expectedCurrentValue,kind,measuredAt?,measurePoint?}]`, max32, no duplicates.
Values number|string; expected same or null for absent. Kind measured|declared|estimated.
Full validation and all optimistic comparisons happen before writes. Returns `{status:'saved',fields}`
or `{status:'conflict',conflicts:[{field,currentValue,incomingValue}]}` without partial writes.
Measured setup/geometry values require the matching fixed measurePoint plus measuredAt (epoch ms, no future).
Declared/estimated entries may omit date (recorded now), never acquire measured evidence implicitly.

Fields and bounds:
- currentSetup.saddleHeightMm 400–1000; saddleSetbackMm -100–200; stemLengthMm 20–200;
  stemAngle -45–45; handlebarWidthMm 300–900; crankLengthMm 120–220;
  handlebarReachMm 200–1000; handlebarDropMm -200–300; spacersMm 0–100.
- currentGeometry.stackMm 200–900; reachMm 200–600; seatTubeAngle/headTubeAngle 50–90;
  frameSize string <=100.
- maxSeatpostMm 0–500; maxSpacerStackMm 0–100; saddleWidthMm 90–260;
  saddleModel, pedalModel, cleatSystem strings <=100.
- primaryGoal: comfort|balanced|performance|aerodynamics (existing bike update side effects retained).

Fixed measure points (UI can import BIKE_MEASURE_POINTS from shared/bikeProfileFields):
saddleHeightMm bb_center_to_saddle_top; saddleSetbackMm saddle_nose_behind_bb;
handlebarReachMm saddle_nose_to_bar_center; handlebarDropMm saddle_top_to_bar_top;
stemLengthMm steerer_center_to_bar_center; stemAngle stem_axis_degrees;
handlebarWidthMm bar_center_to_center; crankLengthMm bb_center_to_pedal_center;
spacersMm below_stem_stack; geometry stackMm bb_center_to_headtube_top_vertical;
reachMm bb_center_to_headtube_top_horizontal; seatTubeAngle seat_tube_axis_degrees;
headTubeAngle head_tube_axis_degrees. Top-level numeric manufacturer limits use component_marking.

Bike adds optional `fieldMeasurements: Record<canonicalField,{measuredAt,measurePoint?,source,kind}>`.
Existing BikeForm edit merges nested setup/geometry changes, preserves metadata for untouched values,
and records changed manually entered fields conservatively as declared while clearing stale measurement metadata.
New optional bike fields: setup reach/drop/spacers, maxSeatpostMm/maxSpacerStackMm, pedalModel/cleatSystem.
Geometry-record linking copies actual validated record stack/reach/angles/size and records geometry_database
provenance. A geometry ID alone never upgrades unrelated existing measurements to database evidence.
Deletion cascade removes bike-scoped profileObservations.
