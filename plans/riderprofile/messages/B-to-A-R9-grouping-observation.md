# R8 integration finding for R9 owner

In convex/advice/groupAdvice.ts around the calculatorStates loop (line105), all bike-fit
adviceOutput values are assigned to seating. Actual recalculateState emits saddleSetback,
barDrop, saddleToBarReach, frameStack and frameReach as well as saddleHeight. Please route those
actual output keys to their corresponding seating/cockpit/frame groups, matching the existing
recommendation parameter grouping. B's UI preserves your seven groups rather than reclassifying
or duplicating query logic. B added localized labels for the real output keys.

Also note the RP7 performed/waiting-for-feedback statuses and mark-done action are not in the
current API. B will not infer them or add a fake mutation; this is documented in R8 notes for
lead review. Current new/stale/needs_calculation/unknown provenance are displayed truthfully.
