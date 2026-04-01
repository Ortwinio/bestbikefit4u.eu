# BP-01 — Public Fit Data Contract and Preview Snapshot

## Objective

Add the minimum bike-side data contract for public fit preview, without introducing a second source of truth for bike geometry.

## User story

As a bike owner, I want to enable a public fit-preview code for one bike so a potential buyer can run a safe first compatibility check without accessing my account data.

## Business value

- unlocks second-hand-bike acquisition flow
- reuses the existing bike/passport/geometry work already in the product
- keeps public sharing separate from bike cloning

## Dependencies

- current `bikes` table in [convex/schema.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)
- existing bike geometry precedence:
  - `geometryRecordId`
  - `currentGeometry`

## Required data model

### Extend `bikes`

Add only these optional fields:

```ts
publicFitCode: v.optional(v.string()),
publicFitEnabled: v.optional(v.boolean()),
publicFitCodeCreatedAt: v.optional(v.number()),
publicFitSnapshot: v.optional(v.object({
  bikeType: v.string(),
  sizeLabel: v.optional(v.string()),
  stackMm: v.optional(v.number()),
  reachMm: v.optional(v.number()),
  geometryQuality: v.union(
    v.literal("full"),
    v.literal("partial"),
    v.literal("none"),
  ),
  source: v.union(
    v.literal("geometry_record"),
    v.literal("manual_geometry"),
    v.literal("none"),
  ),
  snapshotUpdatedAt: v.number(),
})),
```

Add:

```ts
.index("by_public_fit_code", ["publicFitCode"])
```

### Do not add in this sprint

- `fitAssessments`
- `securityEventLog`
- saddle min/max range fields
- any rider-derived fit target fields on `bikes`

## Snapshot derivation rules

Implement an internal mutation/helper that rebuilds `publicFitSnapshot` from live bike data with this order:

1. linked geometry via `geometryRecordId`
2. manual fallback via `currentGeometry`
3. empty snapshot with `geometryQuality: "none"`

Rules:

- `sizeLabel` prefers linked geometry size label, then `currentGeometry.frameSize`
- `stackMm` and `reachMm` come only from actual known geometry
- `source` reflects where the data came from
- no values are inferred from `currentSetup`

## Mutations / queries

### `assignPublicFitCode`

- requires ownership
- creates a new high-entropy code if missing
- enables preview
- does not rotate existing code on re-enable

### `revokePublicFitCode`

- requires ownership
- sets `publicFitEnabled = false`
- retains the code for later re-enable

### `getByPublicFitCode`

This query may return internal server-only data, but the plan must define two contracts:

1. internal server result
2. public API response

The server result may include `bikeId`.
The public API response must not.

## Acceptance criteria

- [ ] `publicFitCode` is distinct from `bikePassportId`
- [ ] `publicFitCode` survives disable/re-enable
- [ ] `publicFitSnapshot` never stores saddle-range or rider-derived fit targets
- [ ] snapshot source precedence is `geometryRecordId` → `currentGeometry` → `none`
- [ ] `getByPublicFitCode` returns `null` for disabled preview
- [ ] new code paths do not modify the clone/import passport flow

## Edge cases

- bike has linked geometry and manual geometry: linked geometry wins
- bike has only frame size but no stack/reach: `geometryQuality = "partial"`
- bike has no geometry at all: preview still works, but snapshot is limited
- bike photo missing: later UI ticket must handle fallback safely

## Analytics events

- `bike_public_fit_enabled`
- `bike_public_fit_disabled`
- `bike_public_fit_code_copied`

## Human audit checks

- enable preview on a bike with full geometry
- enable preview on a bike with only manual frame size
- enable preview on a bike with no geometry
- verify the stored snapshot contains only bike facts, not rider/setup assumptions

## Testing

- schema/contract tests for `assignPublicFitCode`
- query tests for `getByPublicFitCode`
- snapshot derivation tests for source precedence and `geometryQuality`

