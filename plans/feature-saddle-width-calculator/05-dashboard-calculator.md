# Prompt 05 — Dashboard Saddle Selector

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), TypeScript, Convex backend.

You are implementing the dashboard saddle selector. Prompts 02, 03, and 04 must be complete before this one.

Dependencies:
- `src/lib/saddle-width-engine/` — calculation engine
- `convex/saddleWidth/mutations.ts` — `createDashboardSaddleWidthSession`
- `convex/saddleWidth/queries.ts` — `getLatestSaddleWidthSession`, `listSaddleWidthSessions`
- Study the dashboard pressure calculator at `src/app/(dashboard)/pressure-calculator/page.tsx` for layout patterns
- Study `convex/profiles/queries.ts` to understand how profile data is queried
- Dashboard component patterns from `src/components/ui/` (not `@/components/prototyper-ui/ui/` — the dashboard uses the internal UI library)

---

## Part A — Page file

Create `src/app/(dashboard)/saddle-selector/page.tsx`.

### Route

`/dashboard/saddle-selector`

### Auth guard

The dashboard layout (`src/app/(dashboard)/layout.tsx`) already handles authentication. No additional redirect needed, but the page's Convex queries use `requireUserId` which will enforce auth at the data layer.

### Page structure

```typescript
export default function SaddleSelectorPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <DashboardPageHeader
        title="Saddle Selector"
        subtitle="Find your saddle width and shape based on your anatomy and riding profile."
      />
      <SaddleSelectorForm />
    </div>
  );
}
```

Add EN/NL i18n for title and subtitle via `useDashboardMessages()` — see Part E.

---

## Part B — `SaddleSelectorForm.tsx` (client component)

Create `src/app/(dashboard)/saddle-selector/SaddleSelectorForm.tsx`.

This is a multi-section client component. Add `"use client"` at the top.

### Data pre-filling

At mount, query:
- `api.profiles.queries.getProfile` → pre-fill anatomy fields
- URL query param `?bikeId=` → query `api.bikes.queries.getBike` → pre-fill riding profile

```typescript
const profile = useQuery(api.profiles.queries.getProfile);
const searchParams = useSearchParams();
const bikeIdParam = searchParams.get("bikeId") as Id<"bikes"> | null;
const bike = useQuery(api.bikes.queries.getBike, bikeIdParam ? { bikeId: bikeIdParam } : "skip");
```

Pre-fill rules:
- `sitBoneWidthMm`: from `profile?.sitBoneWidthMm` → if present, mode = "measured"; otherwise mode = "estimated"
- `heightCm`: from `profile?.heightCm` (convert cm to cm — already cm)
- `weightKg`: from `profile?.weightKg`
- `hipCircumferenceCm`: from `profile?.hipCircumferenceCm`
- `flexibilityScore`: from `profile?.flexibilityScore` → map string enum to 1-5 (`very_limited`=1, `limited`=2, `average`=3, `good`=4, `excellent`=5)
- `coreStabilityScore`: from `profile?.coreStabilityScore`
- `ridingType`: from `bike?.type` → map to `SaddleRidingType` (road→endurance_road, gravel→gravel, mtb→mtb, city→commuter_leisure, tt_triathlon→tt_triathlon)
- `postureCategory`: derive from `bike?.primaryGoal` (aerodynamics/performance→aggressive, balanced→balanced, comfort→upright)

### Section A — Anatomy

Show when `profile` is loaded. Indicate pre-filled fields with a subtle label ("From your profile").

Fields:
- **Input mode toggle**: "I have a sit-bone measurement" / "Estimate from body data"
- When measured: `PublicNumberField` for sit-bone width (mm), range 60–200
- When estimated: `PublicNumberField` for height (cm), weight (kg), hip circumference (cm)
- Both modes: link "Update your profile measurements" → `/profile`

If `sitBoneWidthMm` is pre-filled, show:
```
Sit-bone width: 132 mm (from your profile) [Change]
```
User can tap [Change] to switch to manual entry.

### Section B — Riding Profile

Fields:
- Bike (select from user's bikes, pre-selects from `?bikeId=` param or first bike)
- Riding type (same options as public calculator)
- Position style (same as public calculator)
- Indoor / outdoor / mixed toggle
- Typical ride duration (Short <1h / Medium 1-2h / Long 2-4h / Ultra 4h+)

### Section C — Current Saddle (collapsible, optional)

Label: "Tell us about your current saddle (optional — improves accuracy)"

Fields:
- Current saddle width in mm (number field)
- How does it feel? (too narrow / just right / too wide / unsure)
- Saddle shape (flat / waved / hammock / short-nose / don't know)
- Cutout (yes / no / don't know)
- Current tilt (nose down / neutral / nose up / don't know)

Default: collapsed. User must expand to fill.

### Section D — Symptoms (collapsible, optional)

Label: "Any current symptoms? (optional — helps refine the recommendation)"

Checkbox list:
- Sit-bone pain
- Perineal or soft tissue numbness
- Inner thigh / hamstring chafing
- Sliding forward on the saddle
- Feeling unstable side-to-side
- Increased lower-back pressure
- Increased hand pressure
- One-sided hot spot or asymmetry

### Calculate button

A primary `Button` labeled "Calculate saddle recommendation" / "Bereken zadelaanbeveling".

Unlike the public calculator, the dashboard version does NOT use a reactive `useMemo`. It calculates on explicit button press to give the user control over when the result updates. This is more appropriate for a multi-section form with optional fields.

```typescript
const [result, setResult] = useState<SaddleCalculationResult | null>(null);
const [isCalculating, setIsCalculating] = useState(false);

function handleCalculate() {
  setIsCalculating(true);
  const widthInput = buildSaddleWidthInput(); // collect all form state
  const widthResult = calculateSaddleWidth(widthInput);
  const suitability = classifySaddleSuitability(widthInput, widthResult);
  setResult({ width: widthResult, suitability });
  setIsCalculating(false);
}
```

After calculating, scroll to result section.

---

## Part C — Result Display

Show result in a structured card layout below the form. Use dashboard card components (`Card`, `CardHeader`, `CardContent` from `src/components/ui/Card.tsx` or equivalent dashboard pattern).

### Width recommendation card

```
┌─────────────────────────────────────────────────────┐
│ Saddle Width                                         │
│                                                      │
│  Target: ~152 mm                                    │
│  Range: 149–158 mm (M class)                        │
│  Confidence: ████████░░ High (88/100)               │
│                                                      │
│  [if current saddle width known:]                   │
│  Your current saddle (143 mm): Likely too narrow.   │
│  Width match score: 52/100                          │
└─────────────────────────────────────────────────────┘
```

### Saddle type card

```
┌─────────────────────────────────────────────────────┐
│ Recommended saddle type                              │
│                                                      │
│  Endurance / All-road                               │
│  ✓ Traditional nose                                 │
│  ✓ Moderate wave profile                            │
│  ✓ Central pressure relief recommended              │
│  ✓ Medium padding                                   │
└─────────────────────────────────────────────────────┘
```

### Explanation card

Render the explanation paragraph using `explanationKey` and `explanationParams` from the width result. Map to the copy templates defined in `01-product-definition.md` Section 10.

### Fit interaction warnings card

Show only if `suitability.fitInteractionWarnings.length > 0`.

```
┌─────────────────────────────────────────────────────┐
│ Fit interaction notes                                │
│                                                      │
│  ⚠ [warning message]                               │
│  ℹ [info message]                                  │
└─────────────────────────────────────────────────────┘
```

Use `PublicInfoPanel` with appropriate `tone` prop (`"warning"` or `"primary"` for info).

### Save button

After result is shown:

```
<Button onClick={handleSave} disabled={isSaving}>
  Save recommendation
</Button>
```

`handleSave` calls `useMutation(api.saddleWidth.mutations.createDashboardSaddleWidthSession)` with all form state and result values.

On success: show a brief "Saved" confirmation and optionally navigate to the session detail or refresh the history list.

---

## Part D — History Section

Below the form and result, show previous sessions if they exist.

```typescript
const sessions = useQuery(api.saddleWidth.queries.listSaddleWidthSessions, { limit: 5 });
```

Show a simple list:
```
Previous saddle recommendations

  Apr 2 2026 — 149–158 mm · Endurance/All-road · Confidence: High
  Mar 15 2026 — 143–153 mm · Gravel/MTB support · Confidence: Medium
```

Each row shows date, width range, saddle family, and confidence level. No expansion needed for MVP.

---

## Part E — i18n additions

Add to `src/i18n/messages/en.ts` under `nav`:
```typescript
saddleSelector: "Saddle Selector",
```

Add to `src/i18n/messages/nl.ts` under `nav`:
```typescript
saddleSelector: "Zadelkiezer",
```

Add dashboard page strings to the messages files under a new `saddleSelector` namespace. Minimum strings:
- `title`, `subtitle`
- Section labels: `anatomy`, `ridingProfile`, `currentSaddle`, `symptoms`
- Button labels: `calculate`, `save`, `saved`
- Result labels: `targetWidth`, `widthRange`, `confidence`, `saddleFamily`, `fitInteractionNotes`, `previousRecommendations`

---

## Part F — Dashboard Sidebar

In `src/components/layout/DashboardSidebar.tsx`, add after the tire pressure nav item:

```typescript
import { ArrowUpDown } from "lucide-react";

// in navigation array, after tirePressure:
{ name: messages.nav.saddleSelector, href: "/dashboard/saddle-selector", icon: ArrowUpDown },
```

---

## Part G — Bike detail page link (optional but recommended)

If time allows, add a "Check saddle width →" link card on the bike detail page (`src/app/(dashboard)/bikes/[bikeId]/page.tsx`) that links to `/dashboard/saddle-selector?bikeId=[bikeId]`. This surfaces the saddle selector where users are already thinking about their bike.

---

## Part H — Validation

After completing this prompt:
1. `npx tsc --noEmit` must pass
2. `/dashboard/saddle-selector` requires authentication (redirect if not logged in)
3. Profile data pre-fills anatomy section on load
4. `?bikeId=` param pre-fills riding profile fields from the selected bike
5. Calculate button computes result and scrolls to result section
6. Save button persists to Convex and shows confirmation
7. History section shows previous sessions if any exist
8. Sidebar shows "Saddle Selector" / "Zadelkiezer" nav item
9. Page works on 375 px mobile viewport
