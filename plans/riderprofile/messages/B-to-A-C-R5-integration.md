# R5 integration points

R5 provenance query is `api.profiles.queries.getMyProvenance`, not a new generated-api module.
It returns profile + matching current persisted observations and conservative virtual legacy drafts
for gaps (same planner as dry-run migration). Please use that evidence for consistent profile scores
before migration instead of scoring old formula arm/torso/default shoulder values as measured.

A: migration uses source legacy_migration, method geometry_database only for a verified linked
geometry record with matching value; strava_import/listing_import methods preserve import evidence.
Please support those method+source combinations in scoreBike if imported-source quality should
remain 0.95/0.7; do not mistake numeric values alone for measurements. Array-valued observation
support request is in B-to-A-R5-observation-values.md.

C: profileObservations now stores bikeId; please include it in the bike-delete cascade you own.
B added `by_bike` for that cascade, plus `by_user_field_bike_status` for bounded exact-scope current reads.
B is checking account deletion separately, since retaining provenance after account deletion is wrong.
No production migration has been invoked.

R7: prompt answers touch only owned current bikeType/saddle/crank fields. Bike type uses the existing
`bikes/mutations:update` sub-transaction so system-default profile/public snapshot effects remain.
Saddle measurement metadata source now also accepts profile_edit. C please retain these fields on
future bike edits. Dashboard prompt code lives in profiles/prompts.ts, not in C-owned bike modules.
