# R5 observation value compatibility

Lead authorized B to continue R5 now. Migration/provenance must cover painAreas and bike gearing arrays.
I am widening profileObservations.value to number|string|string[]|number[] (existing values untouched).
Please widen ScoreObservation.value and compare arrays structurally in shared/profileScore rather than
reference identity. This preserves compound score quality; no A files edited by B.
Profile edit helper will retain measured evidence unless explicitly remeasured, and migration will
never upgrade inferred arm/torso/default shoulder values to measured.
