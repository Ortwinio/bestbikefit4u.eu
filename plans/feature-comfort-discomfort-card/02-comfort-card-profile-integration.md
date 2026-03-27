# Prompt 02 — ComfortCard + profile page integration

## Goal

Add the `ComfortCard` inline function to `profile/page.tsx`, wire up edit state, and place the card in the grid.

---

## Context

Read `plans/feature-comfort-discomfort-card/README.md` and `plans/feature-comfort-discomfort-card/01-visual-component-and-i18n.md` first.

The Flexibility and Core Stability cards in `src/app/(dashboard)/profile/page.tsx` are the reference pattern. The current grid layout is:

```
Col 1: Body Measurements (xl:row-span-2)
Row 1, cols 2–3: FlexibilityCard | CoreStabilityCard
Row 2, cols 2–3: RidingStyleCard | Status card
```

The Comfort card slots into row 1 alongside Flexibility and Core Stability, which means the grid needs a 4th column slot OR a new row. The simplest layout change:

- Keep the 3-column grid
- Row 1, cols 2–3: FlexibilityCard | CoreStabilityCard (unchanged)
- Row 2, cols 2: ComfortCard
- Row 2, col 3: (keep RidingStyleCard full-width in a new row below, or split col 2 between Comfort + Riding)

**Recommended layout**: Add Comfort as a 3rd card in row 1 by switching to a 4-column grid on xl:

```
xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]
Body Measurements (row-span-3) | Flexibility | Core Stability | Comfort
                                | Riding Style (col-span-3)
                                | Status card (col-span-3)
```

OR keep 3-column grid and place Comfort in row 2 alongside Riding Style:

```
3-column grid (current):
Body Measurements (row-span-3) | Flexibility    | Core Stability
                               | Comfort        | Riding Style
                               | Status card (col-span-2)
```

Use the second (simpler) option — it avoids changing the grid column count.

---

## Changes to `src/app/(dashboard)/profile/page.tsx`

### 1. Add imports

```ts
import { ComfortLevelBar, getComfortMeta } from "@/components/profile/ComfortLevelBar";
import { deriveComfortScore } from "@/lib/validations/profile";
```

Add `SmilePlus` (or `HeartPulse`) to the lucide-react imports for the card icon.

### 2. Add state

```ts
const [editingComfort, setEditingComfort] = useState(false);
```

### 3. Add save handler

```ts
const handleSaveComfort = async (hasPain: string, painAreas: string[], painSeverity: number | undefined) => {
  // reuse updateRiderProfile mutation — it already accepts hasPain, painAreas, painSeverity
  await updateRiderProfile({
    hasPain: hasPain as "yes" | "no",
    painAreas,
    painSeverity,
  });
  // trigger refresh dialog if fit sessions exist (follow the same pattern as handleSaveFlexibility)
};
```

### 4. Add `ComfortCard` function (inline, before `ProfileSummary`)

Model it exactly on `FlexibilityCard`:

```tsx
function ComfortCard({ hasPain, painSeverity, painAreas, locale, messages, editing, onStartEdit, onCancel, onSave }) {
  // derive score
  const score = deriveComfortScore(hasPain, painSeverity);
  const [draftHasPain, setDraftHasPain] = useState(hasPain ?? "no");
  const [draftPainAreas, setDraftPainAreas] = useState(painAreas ?? []);
  const [draftSeverity, setDraftSeverity] = useState(painSeverity ?? 1);

  // Reset on editing change
  useEffect(() => { ... }, [editing, hasPain, painSeverity, painAreas]);

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader ...>
        <HeartPulse icon /> Comfort
        <Button variant="primary-soft" ...> Edit </Button>
      </CardHeader>
      <CardContent>
        {!editing ? (
          <>
            <ComfortLevelBar score={score} />
            {/* pain area chips if hasPain=yes */}
            <p>{messages.profile.comfort.impactDescription}</p>
            <Link href="/profile/improve/comfort">
              {messages.profile.comfort.improveLink}
            </Link>
          </>
        ) : (
          <>
            <MeasurementInfoBox title/steps />
            {/* hasPain toggle (yes/no) */}
            {/* painAreas chips (if yes) */}
            {/* painSeverity radio/slider 1-5 (if yes) */}
            <Cancel / Save buttons />
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

**Edit state detail:**
- `hasPain` toggle: two-button toggle (No / Yes), same style as the ToggleQuestion in RidingStyleCard
- `painAreas` chips: shown only when `draftHasPain === "yes"`, same pill-chip style as RidingStyleCard
- `painSeverity` selector: shown only when `draftHasPain === "yes"` — use `RadioGroup` + `Selectable` cards (1=Mild, 2=Noticeable, 3=Significant, 4=Severe, 5=Unable to ride comfortably), matching the CoreStabilityCard pattern

### 5. Wire into `ProfileSummary` props

Add the new props: `editingComfort`, `onStartComfortEdit`, `onCancelComfortEdit`, `onSaveComfort`, and the profile fields `hasPain`, `painSeverity`, `painAreas`.

### 6. Update grid layout

Place `ComfortCard` between CoreStabilityCard and RidingStyleCard:

```tsx
{/* Row 1 */}
<FlexibilityCard ... />
<CoreStabilityCard ... />

{/* Row 2 */}
<ComfortCard ... />       {/* col 2 */}
<RidingStyleCard ... />   {/* col 3 */}

{/* Row 3 */}
<Status card (col-span-2) />
```

This keeps the 3-column grid and inserts Comfort naturally.

---

## Verification

- Comfort card appears at correct position in grid
- View state shows `ComfortLevelBar` + pain area chips + description
- Edit state shows toggle + chips + severity selector
- Save calls `updateRiderProfile` with new pain values
- No duplication of pain data between Comfort card and Riding Style card (do not remove from Riding Style yet — that is Prompt 03)
- No TypeScript errors
