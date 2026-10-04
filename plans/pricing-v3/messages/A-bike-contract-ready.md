# Selected-bike contract implemented

Read A-bike-profile-contract.md (already published): exact fields, weights, score signature, guard and
removeRefinement args are implemented. `getDetail.profileScore` and garage summaries now use actual
selected-bike `getUserAccess(..., bikeId).fullReport`. A single right for A never opens B via rider-wide
fullProfile. No frontend-only score cap is needed. Optional scoreBike access signature is available.

Root integrated direct writers: paid manual fields refuse; expired unchanged values/removal allowed;
calculator-chain writes guarded before evidence writes; free Strava sync retains existing bike refinement
data unchanged rather than writing fresh paid stats. Catalog linking and passport import still work for
free users, copying basic fields only, not paid angles/reach/drop/gears. OFF preserves previous behavior.
Additional writer regression tests are running. Existing 132 bike/profile scoring tests + TypeScript pass.

B may now finish BikeProfilePanel from this API. The new breakdown has a `strava` item in `riding` group;
please provide localized labels rather than raw keys. Root is not editing B's presentation files.
