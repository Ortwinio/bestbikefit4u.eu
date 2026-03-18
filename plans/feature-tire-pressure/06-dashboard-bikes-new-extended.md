# Prompt 06 — Extend `/dashboard/bikes/new` with Wheelset Step

## Context

Project: BestBikeFit4U — Next.js 16 (App Router, `src/` dir), Convex backend, Tailwind CSS, TypeScript.

**Prerequisites** (must be done before this prompt):
- Prompt 02: Convex mutations for `bikes`, `wheelsets`, `tireSetups` exist

**Existing file to modify**: `src/app/(dashboard)/bikes/new/page.tsx`

This page currently creates a new bike with basic fields: `name`, `bikeType`. After this prompt it will also accept `discipline`, `bikeWeightKg`, `photoUrl`, `brand`, `model` and offer an optional second step to add a wheelset + tire setup.

**Convex mutations used**:
- `api.bikes.mutations.create` — now accepts `discipline`, `bikeWeightKg`, `photoUrl`, `brand`, `model`
- `api.wheelsets.mutations.create`
- `api.tireSetups.mutations.create`

---

## Part A — Update the new bike form (step 1)

The existing form in `src/app/(dashboard)/bikes/new/page.tsx` (or a child Client Component) captures `name` and `bikeType`. Extend it to also capture:

| Field | Input type | Notes |
|---|---|---|
| `name` | text input | Required |
| `discipline` | segmented control | "Racefiets" (road) / "Gravelbike" (gravel) / "MTB" (mtb) / "Tri/TT" (tt). Maps to `discipline` field. |
| `bikeType` | hidden / derived | Keep existing `bikeType` field for backward compat. Derive from `discipline`: road → "road", gravel → "gravel", mtb → "mountain", tt → "tt_triathlon". If no match, default to "road". |
| `brand` | text input | Optional, placeholder "bijv. Trek, Canyon, Giant" |
| `model` | text input | Optional, placeholder "bijv. Emonda SL 6" |
| `bikeWeightKg` | number input | Optional, 3–20, placeholder "ca. 8" |
| `photoUrl` | text input | Optional, placeholder "https://..." (URL, no upload for now) |

Remove or hide the old `bikeType` dropdown/select if it was visible — discipline now drives it.

Form state management: use `useState` in a Client Component. Keep it as a single form (no multi-step for step 1).

---

## Part B — Add optional step 2: Wielset & banden

After saving the bike in step 1, show the user a choice:

```
Fiets opgeslagen!

[ Voeg wielset toe ]    [ Sla over → ga naar mijn fietsen ]
```

If the user clicks "Voeg wielset toe", show an inline step 2 form.

**Step 2 form fields**:

### Wielset

| Field | Type | Notes |
|---|---|---|
| `name` | text input | Required, e.g. "Zipp 303 S" |
| `rimType` | radio | "Hooked" / "Hookless" |
| `internalRimWidthFrontMm` | number input | Optional, 17–35 |
| `internalRimWidthRearMm` | number input | Optional, mirrors front by default |

### Banden (tire setup, nested under the wheelset)

| Field | Type | Notes |
|---|---|---|
| `name` | text input | Required, e.g. "GP5000 TL 32mm" |
| `brand` | text input | Optional |
| `model` | text input | Optional |
| `widthFrontMm` | number input | Required, 18–80 |
| `widthRearMm` | number input | Required, mirrors front by default |
| `tubeType` | segmented | "Binnenband" / "Latex" / "Tubeless" |
| `casingType` | radio (optional) | "Race/Licht" / "Allround" / "Versterkt" |
| `maxPressureBar` | number input | Optional, 3.5–10 bar |

**Save logic for step 2**:

```ts
const createWheelset = useMutation(api.wheelsets.mutations.create);
const createTireSetup = useMutation(api.tireSetups.mutations.create);

// On step 2 submit:
const wheelsetId = await createWheelset({
  bikeId: newBikeId,
  name: wheelsetName,
  rimType,
  internalRimWidthFrontMm,
  internalRimWidthRearMm,
  isActive: true,
});
await createTireSetup({
  wheelsetId,
  name: tireName,
  brand: tireBrand,
  model: tireModel,
  widthFrontMm,
  widthRearMm,
  tubeType,
  casingType,
  maxPressureBar,
  isActive: true,
});
```

---

## Part C — Post-creation CTA

After step 2 (or after skipping step 2), show:

```
Klaar! Je fiets is opgeslagen.

[ Bereken bandenspanning ]    [ Naar mijn fietsen ]
```

- "Bereken bandenspanning" → links to `/dashboard/pressure-calculator?bikeId={newBikeId}`
- "Naar mijn fietsen" → links to `/dashboard/bikes`

---

## Part D — Page/component structure

Option 1 (recommended): Convert `src/app/(dashboard)/bikes/new/page.tsx` into a Client Component that manages multi-step state internally (no URL changes, just `useState<"bike" | "wheelset" | "done">()`).

Option 2: Keep the page as a Server Component and have a single large `CreateBikeForm` Client Component that handles all steps.

Either way, the file to modify is:

```
src/app/(dashboard)/bikes/new/page.tsx
```

If you extract the form logic, you may create:

```
src/components/features/bikes/CreateBikeForm.tsx
```

---

## Validation

- Step 1: `name` required; `discipline` required; `bikeWeightKg` 3–20 if provided
- Step 2: `wheelsetName` required; tire `widthFrontMm` and `widthRearMm` 18–80; `maxPressureBar` 3.5–10 if provided

Show inline validation errors below each field.

---

## Files to create/modify

```
src/app/(dashboard)/bikes/new/page.tsx         (modified)
src/components/features/bikes/CreateBikeForm.tsx   (optional new, if logic is extracted)
```

Do not modify the Convex schema. Do not create new Convex functions.
