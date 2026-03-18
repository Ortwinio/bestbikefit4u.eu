# 08 — Tire Pressure Block Inside Bike Detail

## Goal

Replace the placeholder pressure section in the bike detail page with a full pressure block showing recommended vs. current pressures, key inputs, and a recalculate button.

## Background

After prompt 03, `/bikes/[bikeId]` should have a placeholder pressure section. After prompt 04, weight flows into pressure calculations. This prompt should extend the existing pressure components already in the repo, not rebuild the pressure feature from scratch.

The pressure data lives in `pressureCalculations` (full calculation history with input snapshot) and `pressureProfiles` (saved profiles). The bike detail page should show the most recent calculation for this bike.

## Steps

### 1. Add `getLatestForBike` query

In `convex/pressureCalculations/queries.ts`, add (or confirm exists):
```ts
export const getLatestForBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    // verify bike ownership
    const bike = await ctx.db.get(args.bikeId);
    if (!bike || bike.userId !== userId) return null;
    return await ctx.db
      .query("pressureCalculations")
      .withIndex("by_bike", q => q.eq("bikeId", args.bikeId))
      .order("desc")
      .first();
  },
});
```

Check if this query or a similar one already exists before adding.

### 2. Extend the existing bike pressure detail component

The repo already has `src/components/features/pressure/BikePressureSection.tsx`. Prefer extending that component or renaming it deliberately; do not introduce a parallel component with overlapping responsibility unless there is a clear migration reason.

**When no calculation exists:**
- Empty state with a brief explanation: "Add tire pressure data to see recommendations"
- "Calculate pressure →" button linking to `/pressure-calculator?bikeId=[id]`

**When a calculation exists, show:**

*Recommended pressure row:*
- Front: `[value] bar / [value] psi`
- Rear: `[value] bar / [value] psi`

*Current pressure row (editable):*
- Two inline number inputs: front and rear current pressure
- User can enter what they currently have on the bike
- First check whether current pressure belongs on `bikes` or on `pressureCalculations`. The current repo already stores `currentFrontBar` and `currentRearBar` on calculations, so adding bike-level current-pressure fields should be a conscious product decision rather than the default
- Delta indicator: green if within ±0.1 bar of recommended, yellow if within ±0.3 bar, red otherwise

*Calculation inputs summary (collapsible):*
- Rider weight used
- Bike type
- Tire width front/rear
- Tube / tubeless
- Surface type
- Calculated date

*Actions:*
- "Recalculate" button → `/pressure-calculator?bikeId=[id]`

### 3. Add `current_pressure_front/rear` fields to schema

In `convex/schema.ts`, add to `bikes` table (if not already there):
```ts
current_pressure_front_bar: v.optional(v.number()),
current_pressure_rear_bar: v.optional(v.number()),
current_pressure_updated_at: v.optional(v.number()),
```

Add a `updateCurrentPressure` mutation in `convex/bikes/mutations.ts`:
```ts
export const updateCurrentPressure = mutation({
  args: {
    bikeId: v.id("bikes"),
    front_bar: v.number(),
    rear_bar: v.number(),
  },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    await ctx.db.patch(args.bikeId, {
      current_pressure_front_bar: args.front_bar,
      current_pressure_rear_bar: args.rear_bar,
      current_pressure_updated_at: Date.now(),
    });
  },
});
```

### 4. Wire into the bike detail page

In `src/app/(dashboard)/bikes/[bikeId]/page.tsx`, replace the placeholder pressure section with the chosen pressure detail component.

### 5. Pre-populate the pressure calculator from the bike context

In `src/app/(dashboard)/pressure-calculator/page.tsx`:
- Read the `bikeId` query param (`?bikeId=...`)
- If present, fetch that bike and pre-fill relevant fields: bike type, tire widths, tube type
- Pre-fill weight from the user's profile (`profiles.weightKg`) through `PressureWizard`, since the page wrapper currently only passes `initialBikeId`

This connects the two pages without requiring the user to re-enter data.

### 6. i18n

Add translation keys:
- `bikes.pressure.recommended` — "Recommended"
- `bikes.pressure.current` — "Current"
- `bikes.pressure.front` — "Front"
- `bikes.pressure.rear` — "Rear"
- `bikes.pressure.delta.ok` — "On target"
- `bikes.pressure.delta.close` — "Close to target"
- `bikes.pressure.delta.off` — "Off target"
- `bikes.pressure.inputs` — "Calculation inputs"
- `bikes.pressure.recalculate` — "Recalculate"
- `bikes.pressure.noData` — "No pressure data yet"
- `bikes.pressure.calculate` — "Calculate pressure"

Add to both locale files.

## Acceptance Criteria

- [ ] Bike detail page shows full pressure block with recommended and current pressures
- [ ] Delta indicator (green/yellow/red) compares current vs. recommended
- [ ] Calculation inputs are shown in a collapsible section
- [ ] "Recalculate" navigates to pressure calculator pre-filled with this bike's data
- [ ] Pressure calculator pre-fills bike data and weight when opened with `?bikeId=`
- [ ] Current pressure can be saved independently of a new calculation
- [ ] `npm run typecheck` passes
