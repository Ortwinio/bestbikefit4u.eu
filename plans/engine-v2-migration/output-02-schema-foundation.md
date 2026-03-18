# Output 02 — Schema Foundation and Compatibility

## Purpose

Introduce additive Engine v2 schema support without breaking existing reads and writes.

## Schema Additions Landed

### New table

- `bikeProfiles`

Fields:

- `userId`
- `bikeId`
- `name`
- `profileType`
- `isDefault`
- `status`
- `source`
- optional `legacySessionId`
- `createdAt`
- `updatedAt`
- optional `archivedAt`

Indexes:

- `by_user`
- `by_bike`
- `by_user_bike`
- `by_bike_default`

### Additive fields on `fitSessions`

- optional `bikeProfileId`
- optional `engineVersion`
- optional `sourceType`
- optional `migrationMetadata`

Additional indexes:

- `by_user_bike`
- `by_bike_profile`

### Additive fields on `recommendations`

- optional `bikeProfileId`
- optional `engineVersion`
- optional `sourceType`
- optional `migrationMetadata`
- optional `comparisonSnapshot`
- optional `recommendationItems`

Additional indexes:

- `by_bike_profile`
- `by_engine_version`

## Compatibility Rules

These changes are intentionally additive.

- Existing sessions remain valid without `bikeProfileId`.
- Existing recommendations remain valid without `engineVersion`, `comparisonSnapshot`, or `recommendationItems`.
- Existing user flows can continue to use `bikeId`, `bikeType`, and the current `fitSessions -> recommendations` lookup path.
- Legacy rows do not require immediate backfill to stay readable.

## Backfill Strategy Locked For Later Phases

When backfill is introduced:

1. Every bike with fit history should receive a default `bikeProfiles` row.
2. The default imported profile name should be `Base`.
3. Imported rows should use `source = legacy_migration`.
4. Sessions and recommendations created before Engine v2 should stay readable even if backfill has not run yet.
5. Migration must be idempotent.

## Why These Fields Exist Now

- `bikeProfileId` creates the future relation without forcing a UI cutover.
- `engineVersion` separates pipeline version from `algorithmVersion`.
- `sourceType` and `migrationMetadata` make legacy rows and backfilled rows auditable.
- `comparisonSnapshot` supports shadow-mode persistence later.
- `recommendationItems` reserves the richer v2 envelope while preserving the current payload.

## Phase 2 Exit Status

- [x] additive schema support exists for bike profiles and version markers
- [x] legacy compatibility is preserved by optional fields
- [x] migration and backfill assumptions are documented
