# Step 01 — Weight Field (Wizard + Profile Summary)

## Goal

Surface `weightKg` in two places:
1. **MeasurementWizard Step 1** — collected alongside height and inseam during onboarding and full edit
2. **Profile summary card** — shown inline on the main profile screen with a quick-edit that triggers the tire pressure recalculate dialog when the value changes

This step is a prerequisite for the recalculate flow described in `plans/feature-dashboard-ux-improvements/05-profile-weight-and-recalculate.md`.

## 1. Add Weight to Wizard Schema

File: `src/components/measurements/MeasurementWizard.tsx`

Add to `wizardSchema`:
```ts
weightKg: z.number().min(30).max(300).optional(),
```

Add to `defaultValues`:
```ts
weightKg: defaultValues?.weightKg,
```

Export type `WizardFormData` already includes all fields — it will pick this up automatically.

Update `validateCurrentStep` for step 1:
```ts
case 1:
  return await trigger(["heightCm", "inseamCm"]); // weightKg is optional — no trigger needed
```

## 2. Add Weight to Step 1 Body Measurements

File: `src/components/measurements/StepBodyMeasurements.tsx`

Add a `weightKg` `NumberInput` field below the height/inseam grid:

```tsx
<Controller
  name="weightKg"
  render={({ field }) => (
    <NumberInput
      label={messages.profile.measurements.weight}
      tooltip={messages.profile.measurements.weightTooltip}
      step={0.5}
      min={30}
      max={300}
      placeholder="70"
      value={...}
      onChange={field.onChange}
      onBlur={field.onBlur}
      unit="kg"
    />
  )}
/>
```

Add a brief helper below: "Used for tire pressure calculations. You can update this any time from your profile."

The field is optional — no validation error if left blank.

## 3. Show Weight on Profile Summary Card

File: `src/app/(dashboard)/profile/page.tsx`

In the `ProfileSummary` component, add a weight row to the Body Measurements `<dl>`:

```tsx
{profile.weightKg && (
  <div className="flex justify-between items-center">
    <dt className="text-gray-500">{messages.profile.measurements.weight}</dt>
    <dd className="font-medium">{profile.weightKg} kg</dd>
  </div>
)}
```

If `weightKg` is not set, show a subtle inline prompt:
```tsx
{!profile.weightKg && (
  <div className="text-sm text-gray-400 italic">
    {messages.profile.measurements.weightNotSet}
  </div>
)}
```

## 4. Inline Weight Edit on Summary Card

Add a separate small "Weight" section to the Body Measurements card (below the `<dl>`) or as its own compact card row with an edit icon.

Create a `<WeightEditor>` component (or inline within `ProfileSummary`):

```tsx
function WeightEditor({ currentWeightKg, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentWeightKg ?? "");

  const handleSave = () => {
    const parsed = parseFloat(String(value));
    if (isNaN(parsed)) return;
    onSave(parsed);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4" /> {/* small edit icon */}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <NumberInput value={value} onChange={setValue} min={30} max={300} step={0.5} unit="kg" />
      <Button size="sm" onClick={handleSave}>{messages.common.save}</Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{messages.common.cancel}</Button>
    </div>
  );
}
```

When `onSave` is called from `ProfilePage`:
1. Call `upsertProfile({ weightKg: newValue })` (the existing mutation — verify it accepts `weightKg`)
2. If the new value differs from the previous by ≥ 0.5 kg, show the recalculate dialog (Step 05 of the dashboard-ux-improvements plan)
3. Show a success toast on save without recalculation

## 5. Profile Convex Mutation

Verify `convex/profiles/mutations.ts` `upsert` mutation accepts `weightKg`. The Convex schema already has the field — just confirm the mutation arg and handler include it. If not, add `v.optional(v.number())` for `weightKg` and `weightUpdatedAt` (set to `Date.now()` automatically when `weightKg` is saved).

## Acceptance Criteria

- [ ] `wizardSchema` includes `weightKg` as optional
- [ ] Step 1 of the wizard shows the weight field below height/inseam
- [ ] Weight is optional — the form is still submittable without it
- [ ] Profile summary Body Measurements card shows `weightKg` when set
- [ ] A pencil edit icon next to the weight row opens an inline number input
- [ ] Saving a weight change calls `upsertProfile` and triggers the recalculate dialog if appropriate
- [ ] `profiles.upsert` Convex mutation writes `weightKg` and `weightUpdatedAt`
