# 09 — Pressure Staleness and Recalculation Triggers

## Goal

Implement staleness detection so that when rider weight or bike tire specs change, existing pressure recommendations are marked stale and the user is prompted to recalculate.

## Business Rules (from product spec)

- **Rule 1**: If user weight changes, mark all pressure recommendations for their bikes as stale.
- **Rule 2**: If bike tire width or tire system (tubed/tubeless) changes, mark that bike's pressure recommendations as stale.
- **Rule 3**: Stale pressure shows a warning in the dashboard pressure card and bike detail pressure block.

## Background

After prompt 04, `profiles.weightUpdatedAt` is set when weight changes. After prompt 08, `pressureCalculations` is queried per bike. Staleness can be computed without a separate "stale" flag: a calculation is stale if `weightUpdatedAt > calc.createdAt` or if pressure-input specs changed after `calc.createdAt`.

This prompt adds explicit staleness computation and the UI warnings.

## Steps

### 1. Track the right source of pressure-input changes

Do not assume tire width and tube system live on `bikes`; in the current repo they primarily live on `tireSetups`. Prefer one of these approaches:
- compare against the active `tireSetups.updatedAt`
- or add an explicit timestamp on the entity that owns the pressure inputs

Only add a bike-level timestamp if you intentionally denormalize pressure-input changes there.

If needed, add to `convex/schema.ts`:
```ts
pressureInputsUpdatedAt: v.optional(v.number()),
```

Then update whichever mutation actually changes the active pressure inputs.

### 2. Add a `isPressureStale` helper function

Create `convex/lib/pressureStaleness.ts`:
```ts
export function isPressureStale(
  calc: PressureCalculation | null,
  profile: Profile | null,
  bike: Bike,
): boolean {
  if (!calc) return false; // no calc → not stale, just missing
  const calcAt = calc.createdAt ?? calc._creationTime;
  if (profile?.weightUpdatedAt && profile.weightUpdatedAt > calcAt) return true;
  if (bike.pressureInputsUpdatedAt && bike.pressureInputsUpdatedAt > calcAt) return true;
  return false;
}
```

Use this in both the dashboard pressure card and the bike detail pressure block.

### 3. Update `TirePressureCard` (dashboard, from prompt 07)

Import and use `isPressureStale`. When stale:
- Add a yellow pill/badge: "Recalculate recommended"
- Keep showing the existing (stale) values but visually muted
- "Recalculate" button is more prominent (primary style instead of ghost)

### 4. Update `BikePressureBlock` (bike detail, from prompt 08)

Same staleness check. When stale:
- Show a yellow banner at the top of the pressure block: "Your weight or tire setup has changed. Recalculate for an updated recommendation."
- Existing values remain visible but with a "Last calculated before your last change" note

### 5. Add a server-side staleness query

In `convex/pressureCalculations/queries.ts`, add:
```ts
export const isBikePressureStale = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    // fetch latest calc, profile, bike and run isPressureStale
    // returns: { isStale: boolean, lastCalcAt: number | null }
  },
});
```

Use this query from the dashboard and bike detail so the staleness logic runs server-side and is consistent.

### 6. i18n

Add translation keys:
- `pressure.stale.badge` — "Recalculate recommended"
- `pressure.stale.banner` — "Your weight or tire setup has changed."
- `pressure.stale.lastCalc` — "Last calculated before your last change"

Add to both locale files.

## Acceptance Criteria

- [ ] Changing `weightKg` in the profile causes the dashboard pressure card to show the stale badge on next visit
- [ ] Changing tire width or tire system on a bike causes that bike's pressure block to show the stale banner
- [ ] Stale values remain visible (muted) — they are not hidden
- [ ] The recalculate button becomes more prominent when pressure is stale
- [ ] `isBikePressureStale` query is available in the Convex API
- [ ] `npm run typecheck` passes
