# Step 04 — Body Measurement Quick-Edit

## Goal

Allow the user to edit individual body measurements (height, inseam, and optional fields) inline from the profile summary — without launching the full 4-step wizard.

Each field should show its how-to-measure guidance contextually when entering edit mode.

## Current State

The Body Measurements card is a read-only `<dl>` list. The only way to change a value is "Edit Measurements" → full wizard → save. This is a lot of friction for a simple height correction.

## Design

### Per-Field Edit Pattern

For each measurement row in the `<dl>`, add:
- A small pencil icon button on the right side of the row
- Clicking it switches that row from read mode to an inline `NumberInput` + Save + Cancel

Only one field should be in edit mode at a time (clicking another field's pencil cancels the current edit without saving).

### Fields to Support

| Field | Unit | Min | Max | How-to Guide |
|---|---|---|---|---|
| Height | cm | 130 | 210 | Stand barefoot, book on head, measure floor to book |
| Inseam | cm | 55 | 105 | Stand against wall, book between legs like a saddle, measure floor to book |
| Torso length | cm | 45 | 75 | Sit upright, measure navel to top of sternum |
| Arm length | cm | 45 | 75 | Arms out, measure shoulder point to middle finger tip |
| Shoulder width | cm | 30 | 55 | Measure between outer shoulder points (acromion to acromion) |
| Femur length | cm | 35 | 60 | Measure top of thigh bone (hip crease) to knee centre |

Optional fields (torso, arm, shoulder, femur) only appear in edit mode if they already have a value, or via an "Add optional measurements" expand link.

### How-to Guide Display

When a field enters edit mode, show a small collapsible info panel below the input with the measurement instructions. Use the same blue info box pattern as `StepBodyMeasurements`:

```tsx
<div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
  <div className="flex items-start gap-2">
    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="font-medium text-blue-800">{messages.profile.measurements.howToMeasure}</p>
      <ul className="mt-1 list-disc list-inside text-blue-700">
        {/* field-specific steps */}
      </ul>
    </div>
  </div>
</div>
```

### Ratio Validation

Height and inseam share the `validateInseamRatio` check (from `src/lib/validations/profile.ts`). When both height and inseam are known (including after an inline edit), validate and show the same warning banner as the wizard.

### Save Behaviour

On save of any field:
- Call `upsertProfile({ [fieldName]: newValue })` with the full current profile merged with the changed field
- The mutation always requires `heightCm` and `inseamCm` (mandatory) — pull current values from the loaded `profileData` when saving an optional field
- Show success toast
- Return to read mode

### Component Structure

Consider a `<MeasurementField>` component that encapsulates the read/edit toggle:

```tsx
interface MeasurementFieldProps {
  label: string;
  value: number | undefined;
  unit: string;
  min: number;
  max: number;
  step?: number;
  howToSteps: string[];
  onSave: (value: number) => Promise<void>;
  isOptional?: boolean;
}
```

This avoids repeating the pattern across 6 fields.

## Optional Measurements "Add" Flow

For measurements not yet set (torso, arm, shoulder, femur), instead of showing an empty row, show a subtle "+Add" link below the measurement list:

```
+ Add optional measurements (torso, arm length, shoulder width, femur)
```

Clicking it opens a small inline form with all four optional fields at once, mirroring `StepAdvancedMeasurements`. This is simpler than per-field affordances for fields that don't exist yet.

## i18n Keys Needed (Step 05 will add them)

```
profile.measurements.howToMeasure
profile.measurements.heightSteps[0..2]
profile.measurements.inseamSteps[0..2]
profile.measurements.torsoSteps[0..2]
profile.measurements.armSteps[0..2]
profile.measurements.shoulderSteps[0..2]
profile.measurements.femurSteps[0..2]
profile.measurements.addOptional
profile.measurements.saveField
profile.measurements.ratioWarning
```

## Acceptance Criteria

- [ ] Each measurement in the Body Measurements card has a pencil edit icon
- [ ] Clicking the icon switches to inline edit mode with a `NumberInput`
- [ ] The how-to-measure guide for that field appears below the input
- [ ] Only one field can be in edit mode at a time
- [ ] Saving calls `upsertProfile` and returns to read mode with the new value displayed
- [ ] Cancel returns to read mode without changes
- [ ] Height/inseam ratio warning appears when applicable after inline edit
- [ ] Optional measurements with no value show a single "+Add optional measurements" link rather than empty rows
- [ ] All how-to steps are in i18n (English + Dutch)
