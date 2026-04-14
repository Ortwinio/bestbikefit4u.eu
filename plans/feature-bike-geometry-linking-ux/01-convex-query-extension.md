# Prompt 01 — Convex Query Extension

## Context

Add one query to `convex/geometry/queries.ts`: `getGeometryRecordPreview`. This returns the key geometry measurements for a specific record so the selector UI can show a preview before the user saves.

Read `convex/geometry/queries.ts` first.

## Add to `convex/geometry/queries.ts`

```typescript
export const getGeometryRecordPreview = query({
  args: { recordId: v.id("geometry_records") },
  handler: async (ctx, args) => {
    await requireUserId(ctx);
    const record = await ctx.db.get(args.recordId);
    if (!record || record.status !== "active") return null;
    return {
      recordId: record._id,
      sizeLabel: record.sizeLabel,
      stackMm: record.stack ?? null,
      reachMm: record.reach ?? null,
      seatTubeAngle: record.seatTubeAngle ?? null,
      headTubeAngle: record.headTubeAngle ?? null,
    };
  },
});
```

## Validation

`npx tsc --noEmit` must pass. Confirm `api.geometry.queries.getGeometryRecordPreview` is accessible.
