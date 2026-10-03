# R6 per-advice reliability contract

Import `scoreAdviceReliability` from `shared/profileScore` and `AdviceReliability` from
`src/components/profile/AdviceReliability`.

`scoreAdviceReliability({ profile?, bike?, observations?, riderFields, bikeFields }, nowEpochMs)`
returns `{ reliability, completeness, items, missingFields }`. Both field arrays are required.
Use canonical dot paths from `RIDER_RULES` / `BIKE_RULES`, selecting only inputs actually needed
by this advice. Include required-but-missing fields: they contribute zero, not disappear from
the denominator. Unknown fields throw; duplicate fields count once. An empty selection scores zero.
Fields outside these scoring rules require an explicit future rule; do not silently substitute a
different field. Compound rule weight is divided evenly among its fields before the selected
weights are normalized to 100. Unselected sibling fields never affect this advice.

Items include `{ scope: 'rider' | 'bike', field, weight, complete, quality, freshness,
reliability, missingDate, ... }`; missingFields is `{ scope, field }[]`.
Same quality, freshness and warning rules as the profile score apply. This is input reliability,
not whole-profile reliability, medical certainty or the engine's `calculateConfidence`.
Caller supplies current values and matching current observations; no engine defaults are evidence.
For trial values, pass the actual trial values with their actual provenance, never unchanged profile
evidence. Bike IDs filter other-bike observations. Numeric arrays compare structurally in order.

`<AdviceReliability score={score} locale={locale} reason={optionalLocalizedReason} />` renders a
meter, visible percentage, general or calculator-specific reason, missing-input count and unknown
date signal. It includes reduced-motion support. C owns calculator mounting and localized detailed
reasons; A owns the reusable component. No public result needs hiding when inputs are missing.

Legacy bike evidence recognizes source `legacy_migration` with method `geometry_database`
(0.95), `strava_import` or `listing_import` (0.7). Derived always remains 0.3. Numeric values
alone are never upgraded to measured.
