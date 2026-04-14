# Output 03 — Remove Pain From Riding Style

## What Landed

- `src/components/profile/RidingStyleCard.tsx` no longer owns pain fields
- `RiderProfileData` now contains only riding-style fields:
  - `experienceLevel`
  - `weeklyHours`
  - `typicalRideLength`
  - `positionPriority`
- riding-style save handling on the profile page no longer edits pain data directly

## Compatibility

Pain and discomfort data now lives in the Comfort card without being duplicated in Riding Style.
