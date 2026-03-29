# Output 04 — Persistence Closeout

## Final Save-Path Behavior

- The confirmed save path now runs through `convex/bikeImports/actions.ts` via `saveConfirmedImport`.
- Save starts only from an existing `bikeImports` row that already has `parsedAdvert` data.
- `beginSave` in `convex/bikeImports/mutations.ts` validates rider ownership, confirms the selected images exist in the parsed advert payload, and reserves the import row with status `importing`.
- The action creates the bike through the shared `createBikeWithProfiles` helper in `convex/bikes/mutations.ts`.
- Imported photos are attached through the shared `createBikePhotoRecord` helper in `convex/bikePhotos/mutations.ts`, so primary-photo and legacy-photo sync behavior stays aligned with the existing bike gallery model.

## Duplicate Rule

- Deterministic duplicate rule: same rider + normalized canonical advert URL wins.
- If canonical URL is unavailable, fallback is same rider + normalized source URL.
- When an already imported bike exists for that key, the save path returns the existing `bikeId` and does not create another bike.
- When the import row is already `importing`, repeated confirmation clicks return `already_processing` instead of starting a second create path.

## Partial-Failure Behavior

- Parser/preview data missing: save aborts before bike creation.
- Bike creation failure: import row is marked `failed`; no bike is created.
- Remote image failure: the bike stays created, failed images are skipped, and successful images still attach.
- Photo attach failure after storage upload: the uploaded storage blob is deleted and the image is counted as failed.
- Final result can therefore be:
  - full success with photos
  - partial success with a created bike and zero or more imported photos
  - hard failure before bike creation

## Telemetry Added

- `bikeImports` now stores:
  - `saveAttemptCount`
  - `lastSaveStartedAt`
  - `imageAttemptCount`
  - `imageImportedCount`
  - `imageFailedCount`
  - `duplicateBikeId`
  - `failureCode`
  - `telemetryJson`
- Telemetry events recorded:
  - `parse_succeeded`
  - `parse_failed`
  - `save_started`
  - `save_succeeded`
  - `save_failed`
  - `image_ingest_succeeded`
  - `image_ingest_failed`
  - `duplicate_reused`

## Notes

- Remote image ingest is HTTPS-only, rejects private/local hosts, and is restricted to Marktplaats host suffixes.
- Image ingest is capped at 8 selected images and 10 MB per image.
