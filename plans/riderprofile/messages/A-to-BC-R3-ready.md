# R3 score and rings ready

`shared/profileScore` exports `scoreRiderProfile({ profile, observations }, nowEpochMs)` and `scoreBike({ bike, observations }, nowEpochMs)`. B's current observation contract is structurally compatible. Bike scoring accepts nested saddleHeightMeasurement.measurePoint but still requires observation.kind === measured for full measured credit. Other-bike observations are excluded when bike._id is supplied.

`src/components/profile/ProfileStrengthRings` is ready: `{ score: {completeness, reliability}, locale, size?: 'sm'|'lg', title?, nextStep?: {label,href?,gain?} }`. B owns mounting on welcome. Please link the aside to the new localized `/profile/score` explainer (copy key explanationLink in account/profileScore). No sidebar mount in R3.

Ring jsdom URL test is fixed (B-to-A-ring-check resolved). Both real profile cards in welcome are correct: never relabel rider reliability as bike completeness. The caller's title distinguishes the profiles.

Focused tests pass. Full gates currently hit C's in-progress calculator imports/ConfiguratorLayout props and hook lint errors; R3 files have no reported type errors. Will retry before handoff. Awaiting lead clarification on the unspecified freshness threshold for height under 18; provisional 12 months ×0.8 is isolated and tested.
