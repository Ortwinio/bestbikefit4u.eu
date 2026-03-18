# Prompt 05 — Dashboard Pressure Calculator Wizard

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), Convex backend, Tailwind CSS, TypeScript.

**Prerequisites** (must be done before this prompt):
- Prompt 01: `src/lib/pressure-engine.ts` exists with `calculateAdvancedPressure`, `calculateBasicPressure`, `validatePressureInput`
- Prompt 02: Convex mutations exist for `wheelsets`, `tireSetups`, `pressureProfiles`, `pressureCalculations`, `bikes`

**Authentication**: This page is inside the `(dashboard)` route group. The layout already handles auth redirects. All Convex calls use `useQuery` / `useMutation` from `convex/react`.

**Relevant Convex API paths** (via `api` from `convex/_generated/api`):
- `api.bikes.queries.list`
- `api.bikes.mutations.create`
- `api.wheelsets.queries.listForBike`
- `api.wheelsets.mutations.create`
- `api.tireSetups.queries.listForWheelset`
- `api.tireSetups.mutations.create`
- `api.pressureCalculations.mutations.save`
- `api.pressureProfiles.mutations.save`

---

## Part A — Page file

Create: `src/app/(dashboard)/pressure-calculator/page.tsx`

This is the route for `/dashboard/pressure-calculator`.

It renders the `PressureWizard` client component.

```tsx
import { PressureWizard } from "@/components/features/pressure/PressureWizard";

export default function PressureCalculatorPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Bandenspanning berekenen
      </h1>
      <PressureWizard />
    </div>
  );
}
```

The page also accepts a `searchParams` prop. If `bikeId` is present in search params, pass it to `PressureWizard` as `initialBikeId` to pre-select the bike.

```tsx
export default async function PressureCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ bikeId?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Bandenspanning berekenen
      </h1>
      <PressureWizard initialBikeId={params.bikeId} />
    </div>
  );
}
```

---

## Part B — `PressureWizard` component

Create: `src/components/features/pressure/PressureWizard.tsx`

This is a `"use client"` component.

### Props

```ts
interface PressureWizardProps {
  initialBikeId?: string;
}
```

### Wizard steps

The wizard has 5 steps. Manage current step with `useState<1 | 2 | 3 | 4 | 5>(1)`.

Show a step indicator at the top showing the current step (e.g., "Stap 2 van 5"). Use a simple progress bar or numbered circles.

```tsx
const STEPS = [
  { number: 1, label: "Fiets" },
  { number: 2, label: "Wielset & banden" },
  { number: 3, label: "Gewicht & doel" },
  { number: 4, label: "Route" },
  { number: 5, label: "Resultaat" },
];
```

### State shared across all steps

```ts
// Step 1
const [selectedBikeId, setSelectedBikeId] = useState<Id<"bikes"> | null>(
  initialBikeId as Id<"bikes"> | null ?? null
);

// Step 2
const [selectedWheelsetId, setSelectedWheelsetId] = useState<Id<"wheelsets"> | null>(null);
const [selectedTireSetupId, setSelectedTireSetupId] = useState<Id<"tireSetups"> | null>(null);
// Fallback if user doesn't have a saved setup: inline tire input
const [inlineTireInput, setInlineTireInput] = useState<{
  widthFrontMm: number;
  widthRearMm: number;
  tubeType: "inner_tube" | "latex_tube" | "tubeless";
  casingType?: "race_light" | "allround" | "reinforced";
  rimType?: "hooked" | "hookless";
  maxPressureBar?: number;
} | null>(null);

// Step 3
const [bodyWeightKg, setBodyWeightKg] = useState<number>(75);
const [bikeWeightKg, setBikeWeightKg] = useState<number | undefined>(undefined);
const [extraLuggageKg, setExtraLuggageKg] = useState<number>(0);
const [isWet, setIsWet] = useState<boolean>(false);
const [ridingGoal, setRidingGoal] = useState<"speed" | "balance" | "comfort">("balance");
const [currentFrontBar, setCurrentFrontBar] = useState<number | undefined>(undefined);
const [currentRearBar, setCurrentRearBar] = useState<number | undefined>(undefined);

// Step 4
const [surface, setSurface] = useState<Surface>("average_asphalt");
const [routeDistanceKm, setRouteDistanceKm] = useState<number | undefined>(undefined);
const [routeElevationM, setRouteElevationM] = useState<number | undefined>(undefined);
const [offRoadPercent, setOffRoadPercent] = useState<number>(0);

// Step 5
const [result, setResult] = useState<PressureOutput | null>(null);
const [savedCalcId, setSavedCalcId] = useState<Id<"pressureCalculations"> | null>(null);
```

### Navigating between steps

- "Volgende" button on each step validates that step's required fields and advances
- "Terug" button on steps 2–5 goes back one step
- On step 5, the result is computed (no submit button — computed as soon as step 5 is shown)

---

## Part C — Step components

Create one component per step. Each accepts relevant state and setters as props.

### `StepBikeSelect` — Step 1

Create: `src/components/features/pressure/wizard/StepBikeSelect.tsx`

```ts
interface StepBikeSelectProps {
  selectedBikeId: Id<"bikes"> | null;
  onSelectBike: (id: Id<"bikes">) => void;
  onNext: () => void;
}
```

Content:
1. Load bikes: `useQuery(api.bikes.queries.list)`
2. Show radio-button-style cards for each bike:
   - Show `bike.name`, `bike.discipline` (label: "road" → "Racefiets", "gravel" → "Gravelbike", "mtb" → "MTB", "tt" → "Tri/TT"), `bike.brand`, `bike.model`
   - Selected card has a blue ring
3. Option at the bottom: "Gebruik geen opgeslagen fiets" → inline discipline selector appears:
   - Three buttons: "Racefiets" / "Gravelbike" / "MTB"
   - When selected, advance with a synthetic bike context (no `bikeId`, but `discipline` is set)
4. "Volgende" button: enabled only if a bike is selected or an inline discipline is chosen

If no bikes: show "Je hebt nog geen fietsen opgeslagen." with a link to `/dashboard/bikes/new` and an option to continue without saving.

### `StepWheelsetTires` — Step 2

Create: `src/components/features/pressure/wizard/StepWheelsetTires.tsx`

```ts
interface StepWheelsetTiresProps {
  bikeId: Id<"bikes"> | null;
  selectedWheelsetId: Id<"wheelsets"> | null;
  selectedTireSetupId: Id<"tireSetups"> | null;
  inlineTireInput: InlineTireInput | null;
  onSelectWheelset: (id: Id<"wheelsets">) => void;
  onSelectTireSetup: (id: Id<"tireSetups">) => void;
  onSetInlineTireInput: (input: InlineTireInput) => void;
  onNext: () => void;
  onBack: () => void;
}
```

Content:
1. If `bikeId` is set: load wheelsets with `useQuery(api.wheelsets.queries.listForBike, { bikeId })`
   - Show wheelset cards for selection
   - If a wheelset is selected, load tire setups with `useQuery(api.tireSetups.queries.listForWheelset, { wheelsetId: selectedWheelsetId })`
   - Show tire setup cards for selection
2. "Handmatig invoeren" option — shows inline form:
   - Bandbreedte voor (number input, 18–80 mm)
   - Bandbreedte achter (number input, mirrors voor by default)
   - Velgtype (radio: "Hooked" / "Hookless")
   - Type band (segmented: "Binnenband" / "Latex" / "Tubeless")
   - Casing (optional radio: "Race/Licht" / "Allround" / "Versterkt")
   - Max druk (optional number input, bar)
3. "Volgende" requires either a saved tire setup selected or the inline form to have valid `widthFrontMm`, `widthRearMm`, `tubeType`

### `StepWeightGoal` — Step 3

Create: `src/components/features/pressure/wizard/StepWeightGoal.tsx`

```ts
interface StepWeightGoalProps {
  bodyWeightKg: number;
  bikeWeightKg: number | undefined;
  extraLuggageKg: number;
  isWet: boolean;
  ridingGoal: "speed" | "balance" | "comfort";
  currentFrontBar: number | undefined;
  currentRearBar: number | undefined;
  onUpdate: (updates: Partial<WeightGoalState>) => void;
  onNext: () => void;
  onBack: () => void;
}
```

Fields:
- **Lichaamsgewicht**: slider 35–160 kg (required)
- **Fietsgewicht**: number input (optional, placeholder "ca. 8 kg")
- **Extra bagage** (bidons, tassen, gear): number input 0–30 kg (optional)
- **Weer**: toggle "Droog" / "Nat"
- **Rijdoel**: segmented control "Snelheid" / "Balans" / "Comfort"
- **Huidige druk voor** (optional): number input, 0.5–9.0 bar, placeholder "bijv. 6.0"
- **Huidige druk achter** (optional): number input, 0.5–9.0 bar, placeholder "bijv. 6.5"

Validation: `bodyWeightKg` required (35–160). All others optional. "Volgende" is enabled when `bodyWeightKg` passes validation.

### `StepRoute` — Step 4

Create: `src/components/features/pressure/wizard/StepRoute.tsx`

```ts
interface StepRouteProps {
  surface: Surface;
  routeDistanceKm: number | undefined;
  routeElevationM: number | undefined;
  offRoadPercent: number;
  onUpdate: (updates: Partial<RouteState>) => void;
  onNext: () => void;
  onBack: () => void;
}
```

Three route mode options (radio/tab):
1. **Handmatig** (default): show route fields below
2. **Zonder route**: skip to step 5 immediately; only `surface` is used
3. ~~Strava~~ (shown but disabled with label "Binnenkort beschikbaar")

**Handmatig fields**:
- **Ondergrond**: chip selector or dropdown
  - "Glad asfalt" / "Gemiddeld asfalt" / "Slecht asfalt" / "Hardpack gravel" / "Losse gravel" / "Trail"
- **Routeafstand** (optional): number input, km
- **Hoogtemeters** (optional): number input, m
- **% off-road** (optional): slider 0–100

"Zonder route" mode: only the surface chips are shown. "Volgende" always enabled in route step (route is optional context).

### `StepResult` — Step 5

Create: `src/components/features/pressure/wizard/StepResult.tsx`

```ts
interface StepResultProps {
  // All wizard inputs needed to compute the result
  bikeId: Id<"bikes"> | null;
  tireSetupId: Id<"tireSetups"> | null;
  inlineTireInput: InlineTireInput | null;
  bodyWeightKg: number;
  bikeWeightKg: number | undefined;
  extraLuggageKg: number;
  isWet: boolean;
  ridingGoal: "speed" | "balance" | "comfort";
  surface: Surface;
  routeDistanceKm: number | undefined;
  routeElevationM: number | undefined;
  offRoadPercent: number;
  currentFrontBar: number | undefined;
  currentRearBar: number | undefined;
  discipline: "road" | "gravel" | "mtb" | "tt";
  onBack: () => void;
}
```

This step:
1. Computes the result via `calculateAdvancedPressure` (from `src/lib/pressure-engine.ts`) using the available inputs on mount / when inputs change. If a saved `tireSetupId` is selected, merge its fields (widthFrontMm, widthRearMm, tubeType, etc.) into the input.
2. Displays `<PressureResultCard result={result} />` (from prompt 03)
3. **Comparison block** (if `currentFrontBar`/`currentRearBar` provided):
   - "Huidige druk: {currentFrontBar} / {currentRearBar} bar"
   - "Aanbevolen: {result.frontBar} / {result.rearBar} bar"
   - "Verschil: {(result.frontBar - currentFrontBar).toFixed(1)} / {(result.rearBar - currentRearBar).toFixed(1)} bar"
4. **Score display** (if advanced result):
   - Three progress-bar-like indicators: Comfort {comfortScore}/100, Grip {gripScore}/100, Efficiëntie {efficiencyScore}/100
5. **Save actions**:
   - "Sla berekening op" button → calls `useMutation(api.pressureCalculations.mutations.save)` with the full input snapshot and output; shows a success toast
   - "Sla op als preset" — shows a small form:
     - Name input (pre-filled with e.g. "Race setup")
     - Use case select: Race / Endurance / Nat weer / Gravel mixed / Comfort / Aangepast
     - "Opslaan als preset" button → calls `useMutation(api.pressureProfiles.mutations.save)`
   - "Nieuwe berekening" button → resets wizard to step 1
   - "Ga naar mijn fietsen" → links to `/dashboard/bikes`

---

## Part D — `PressureWizard` assembly

In `PressureWizard.tsx`, render the correct step component based on `currentStep`. Pass all shared state and setter functions as props to each step.

Handle discipline: derive it from the selected bike if available, otherwise from the inline selection in step 1.

```ts
const bikes = useQuery(api.bikes.queries.list);
const selectedBike = bikes?.find((b) => b._id === selectedBikeId);
const discipline = (selectedBike?.discipline ?? inlineDiscipline ?? "road") as Discipline;
```

---

## File structure summary

```
src/app/(dashboard)/pressure-calculator/page.tsx                        (new)
src/components/features/pressure/PressureWizard.tsx                     (new)
src/components/features/pressure/wizard/StepBikeSelect.tsx              (new)
src/components/features/pressure/wizard/StepWheelsetTires.tsx           (new)
src/components/features/pressure/wizard/StepWeightGoal.tsx              (new)
src/components/features/pressure/wizard/StepRoute.tsx                   (new)
src/components/features/pressure/wizard/StepResult.tsx                  (new)
```

`PressureResultCard` from prompt 03 is reused in `StepResult`.
Do not modify the Convex schema or existing auth files.
