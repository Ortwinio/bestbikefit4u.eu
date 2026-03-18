# Prompt 04 — Dashboard Bikes Extension (Cards + Detail Page)

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), Convex backend, Tailwind CSS, TypeScript.

**Prerequisites** (must be done before this prompt):
- Prompt 01: `src/lib/pressure-engine.ts` exists
- Prompt 02: Convex mutations/queries for `wheelsets`, `tireSetups`, `pressureCalculations` exist; `bikes` table has `discipline`, `bikeWeightKg`, `photoUrl` fields

**Relevant existing files:**
- `src/app/(dashboard)/bikes/page.tsx` — bike list page
- `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx` — bike edit page
- `convex/bikes/queries.ts` — exports `list`, `get`
- `convex/pressureCalculations/queries.ts` — exports `getLatestForBike`
- `convex/wheelsets/queries.ts` — exports `listForBike`
- `convex/tireSetups/queries.ts` — exports `listForWheelset`

All dashboard pages are inside the `(dashboard)` route group which applies `DashboardLayout` with sidebar. Dashboard components use `"use client"` at the top and call `useQuery(api.bikes.queries.list)` etc. via Convex React hooks.

The `api` object is the Convex-generated API at `convex/_generated/api`.

Do not break existing bike-fit functionality (fit sessions, recommendations). Only add new sections and extend existing components.

---

## Part A — Extend bike cards on `/dashboard/bikes`

The bike list page is at `src/app/(dashboard)/bikes/page.tsx`. It likely renders a list of bike cards. Extend each bike card to show pressure summary information.

### Pressure data to show per card

For each bike, load the latest pressure calculation using:

```ts
const latestCalc = useQuery(api.pressureCalculations.queries.getLatestForBike, {
  bikeId: bike._id,
});
```

Add to each bike card:

**Middle section** (new):
```
Voor  X.X bar
Achter  X.X bar
```
- If `latestCalc` exists: show `latestCalc.recommendedFrontBar` and `latestCalc.recommendedRearBar`
- If no calculation: show "Nog geen druk berekend"

**Status label** (new, below pressure):
- Compute status by comparing `latestCalc.currentFrontBar` (if set) to `latestCalc.recommendedFrontBar`:
  - If no `currentFrontBar`: label = "Geen meting" (gray)
  - If `currentFrontBar` within ±0.2 of `recommendedFrontBar`: label = "In lijn" (green)
  - If `currentFrontBar` between +0.2 and +0.5 above recommended: label = "Iets te hoog" (amber/orange)
  - If `currentFrontBar` > +0.5 above recommended: label = "Te hoog" (red)
  - If `currentFrontBar` < recommended − 0.3: label = "Te laag" (red)

**Quick action button** (new):
- Button "Nieuwe druk berekenen" → links to `/dashboard/pressure-calculator?bikeId={bike._id}`

Keep all existing buttons ("Bekijk", "Aanpassen") intact.

### Helper component

Create `src/components/features/pressure/PressureStatusBadge.tsx`:

```tsx
interface PressureStatusBadgeProps {
  currentBar?: number;
  recommendedBar: number;
}
```

Returns a colored `<span>` badge with the status label text. Export the status computation logic as a standalone pure function `computePressureStatus(currentBar: number | undefined, recommendedBar: number): PressureStatus` so it can be tested and reused.

```ts
type PressureStatus = "optimal" | "slightly_high" | "too_high" | "too_low" | "no_measurement";
```

Color mapping (Tailwind classes):
| Status | Background | Text |
|---|---|---|
| optimal | `bg-green-100` | `text-green-800` |
| slightly_high | `bg-amber-100` | `text-amber-800` |
| too_high | `bg-red-100` | `text-red-800` |
| too_low | `bg-red-100` | `text-red-800` |
| no_measurement | `bg-gray-100` | `text-gray-600` |

Dutch labels:
| Status | Label |
|---|---|
| optimal | "In lijn" |
| slightly_high | "Iets te hoog" |
| too_high | "Te hoog" |
| too_low | "Te laag" |
| no_measurement | "Geen meting" |

---

## Part B — Extend `/dashboard/bikes/[bikeId]` detail page

The detail page is at `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx` (or there may be a read-only view — check what exists). Add a **tire pressure section** below the existing bike fit content.

If only an edit page exists, add the pressure section to the edit page for now, clearly separated with a heading.

### Section: "Bandenspanning"

This section is a Client Component (needs Convex queries). Create it as:

`src/components/features/pressure/BikePressureSection.tsx`

Props:
```ts
interface BikePressureSectionProps {
  bikeId: Id<"bikes">;
}
```

Content:

**Active wheelset + tire setup block**

```ts
const wheelsets = useQuery(api.wheelsets.queries.listForBike, { bikeId });
const activeWheelset = wheelsets?.find((w) => w.isActive) ?? wheelsets?.[0];
const tireSetups = useQuery(
  api.tireSetups.queries.listForWheelset,
  activeWheelset ? { wheelsetId: activeWheelset._id } : "skip"
);
const activeTireSetup = tireSetups?.find((t) => t.isActive) ?? tireSetups?.[0];
```

Display:
- "Actief wielset: {activeWheelset.name}" (or "Geen wielset opgeslagen" if none)
- "Actieve bandenconfiguratie: {activeTireSetup.name}" (or "Geen bandenset")
- If active tire setup: "{activeTireSetup.widthFrontMm}mm voor / {activeTireSetup.widthRearMm}mm achter — {tubeTypeLabel}"

Where `tubeTypeLabel` maps:
- `inner_tube` → "Binnenband"
- `latex_tube` → "Latex binnenband"
- `tubeless` → "Tubeless"

**Recommended pressure block**

```ts
const latestCalc = useQuery(api.pressureCalculations.queries.getLatestForBike, { bikeId });
```

Display:
- Heading: "Aanbevolen druk"
- "Voor: {latestCalc.recommendedFrontBar} bar ({latestCalc.recommendedFrontPsi} PSI)"
- "Achter: {latestCalc.recommendedRearBar} bar ({latestCalc.recommendedRearPsi} PSI)"
- `<PressureStatusBadge>` for both front and rear (using currentFrontBar/currentRearBar from latestCalc)
- If `latestCalc.currentFrontBar`: "Huidige druk: {latestCalc.currentFrontBar} bar voor / {latestCalc.currentRearBar} bar achter"
- Date of last calculation: "Berekend op: {formatDate(latestCalc.createdAt)}" (use `new Date(latestCalc.createdAt).toLocaleDateString("nl-NL")`)
- If no calculation: "Nog geen druk berekend voor deze fiets."

**Pressure profiles block**

```ts
const profiles = useQuery(api.pressureProfiles.queries.listForBike, { bikeId });
```

If profiles exist, render a small table or list:
| Naam | Gebruik | Voor | Achter |
|---|---|---|---|
| Race setup | race | 5.8 bar | 6.2 bar |
| Nat weer | wet_weather | 5.0 bar | 5.4 bar |

**Actions**

Two buttons at the bottom of the section:
1. "Nieuwe druk berekenen" → `/dashboard/pressure-calculator?bikeId={bikeId}`
2. "Wielset beheren" → `/dashboard/bikes/{bikeId}/wheelsets` (this page is not created in this prompt; just link to it)

---

## Part C — Embed `BikePressureSection` in the detail/edit page

In `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx` (or the appropriate detail page), add:

```tsx
import { BikePressureSection } from "@/components/features/pressure/BikePressureSection";

// Inside the page component JSX, after existing fit content:
<BikePressureSection bikeId={params.bikeId} />
```

---

## File structure summary

New/modified files:
```
src/components/features/pressure/PressureStatusBadge.tsx   (new)
src/components/features/pressure/BikePressureSection.tsx   (new)
src/app/(dashboard)/bikes/page.tsx                          (modified — add pressure summary to cards)
src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx            (modified — embed BikePressureSection)
```

Do not create Convex functions in this prompt. Do not modify the schema.
