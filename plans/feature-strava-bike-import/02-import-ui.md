# Step 02 — Import UI (v1)

## Goal

Build the import review UI in Settings and the post-import wizard that collects the fit-critical data Strava cannot provide.

---

## Pre-requisites

- Step 01 complete: `getStravaGearSummary` query, `importBikesFromStrava` action
- `api.bikes.queries.getByUser` returns bikes with `stravaGearId` field

---

## 1. Settings page — Strava section update

Replace the current connected-state block in `src/app/(dashboard)/settings/page.tsx` with an expanded Strava card that shows:

```
[athlete avatar]  Athlete Name
                  Last synced: …

── Your Strava bikes ──────────────────────────
☑  My Road Bike        Specialized Tarmac SL7   3 255 km   [primary]
☑  Gravel Monster      Canyon Grizl              1 100 km
☑  Indoor Trainer      Wahoo Kickr               8 900 km   [Already added]

[Import 2 bikes]   [Use Strava photo]   [Disconnect]
```

Add these Convex hooks:

```ts
const gearSummary = useQuery(api.integrations.queries.getStravaGearSummary);
const userBikes = useQuery(api.bikes.queries.getByUser);
const importBikes = useAction(api.integrations.actions.importBikesFromStrava);
```

Compute already-imported set:

```ts
const importedGearIds = useMemo(
  () => new Set(userBikes?.map((b) => b.stravaGearId).filter(Boolean)),
  [userBikes]
);
```

---

## 2. Bike list state

```ts
const [selectedGearIds, setSelectedGearIds] = useState<Set<string>>(new Set());
const [isImporting, setIsImporting] = useState(false);
// Bikes returned by action as needing type confirmation
const [needsTypeConfirm, setNeedsTypeConfirm] = useState<string[]>([]);
```

Pre-select all unimported bikes when `gearSummary` loads:

```ts
useEffect(() => {
  if (!gearSummary) return;
  const unimported = gearSummary
    .filter((g) => !importedGearIds.has(g.id))
    .map((g) => g.id);
  setSelectedGearIds(new Set(unimported));
}, [gearSummary]); // intentionally run only once on load
```

---

## 3. Bike row component

Each row in the list shows:

| Element | Detail |
|---|---|
| Checkbox | Disabled + checked if already imported; enabled otherwise |
| Bike name | `gear.name` |
| Brand · Model | muted, from the already-imported `userBike` record if available |
| Distance | `(gear.distanceMeters / 1000).toFixed(0) + " km"` |
| Primary badge | Shown if `gear.primary` |
| "Already added" badge | Shown if `importedGearIds.has(gear.id)` |

Use the tokenized status pill style (small rounded span with `var(--muted-foreground)` / `var(--success)`) — no external badge library.

---

## 4. Import button

```tsx
<Button
  onClick={() => void handleImportBikes()}
  isLoading={isImporting}
  disabled={selectedGearIds.size === 0}
>
  {selectedGearIds.size === 1
    ? messages.settings.integrations.bikeImport.importButtonCount
    : messages.settings.integrations.bikeImport.importButtonCountPlural.replace(
        "{count}",
        String(selectedGearIds.size)
      )}
</Button>
```

---

## 5. Import handler

```ts
const handleImportBikes = async () => {
  setIsImporting(true);
  try {
    const result = await importBikes({ gearIds: Array.from(selectedGearIds) });

    if (result.imported > 0) {
      const msg = result.imported === 1
        ? messages.settings.integrations.bikeImport.success
        : messages.settings.integrations.bikeImport.successPlural;
      toast.success({ description: msg.replace("{count}", String(result.imported)) });
    }

    if (result.needsTypeConfirm.length > 0) {
      setNeedsTypeConfirm(result.needsTypeConfirm);
      // opens the type wizard (§6)
    }

    setSelectedGearIds(new Set());
  } catch {
    toast.error({ description: messages.settings.integrations.callback.error });
  } finally {
    setIsImporting(false);
  }
};
```

---

## 6. Post-import type wizard

When `needsTypeConfirm.length > 0`, show a simple `AccessibleDialog` for each affected bike in sequence.

For each bike ID in `needsTypeConfirm`:
- Look up the bike from `userBikes` (re-queried after import)
- Show bike name and a `RadioGroup` of all `bikeType` options
- On confirm, call `api.bikes.mutations.update` with `{ bikeType: selected, bikeTypeSource: "user" }`
- Advance to next bike or close when done

This wizard runs in the same settings page session — no separate route needed.

---

## 7. i18n strings

Add to `integrations` in `en.ts`:

```ts
bikeImport: {
  sectionTitle: "Your Strava bikes",
  alreadyAdded: "Already added",
  primary: "Primary",
  importButton: "Import bikes",
  importButtonCount: "Import 1 bike",
  importButtonCountPlural: "Import {count} bikes",
  success: "Imported 1 bike from Strava.",
  successPlural: "Imported {count} bikes from Strava.",
  noBikes: "No bikes found in your Strava account.",
  typeWizardTitle: "What type of bike is this?",
  typeWizardBody: "Strava couldn't tell us the bike type for "{name}". Select the correct type so your fit profile is accurate.",
  typeWizardConfirm: "Save",
},
```

Dutch (`nl.ts`):

```ts
bikeImport: {
  sectionTitle: "Jouw Strava-fietsen",
  alreadyAdded: "Al toegevoegd",
  primary: "Primair",
  importButton: "Fietsen importeren",
  importButtonCount: "1 fiets importeren",
  importButtonCountPlural: "{count} fietsen importeren",
  success: "1 fiets geïmporteerd vanuit Strava.",
  successPlural: "{count} fietsen geïmporteerd vanuit Strava.",
  noBikes: "Geen fietsen gevonden in je Strava-account.",
  typeWizardTitle: "Welk type fiets is dit?",
  typeWizardBody: "Strava kon het fietstype voor '{name}' niet bepalen. Selecteer het juiste type voor een nauwkeurig fitprofiel.",
  typeWizardConfirm: "Opslaan",
},
```

---

## Acceptance criteria

- [ ] Strava bike list appears in Settings when connected and `gearSummary` has entries
- [ ] Already-imported bikes show "Already added" and have disabled checkboxes
- [ ] Unimported bikes are pre-selected by default
- [ ] Import button label shows correct count of selected bikes
- [ ] Successful import shows a toast with the count
- [ ] Bikes with unknown frame type open the type wizard after import
- [ ] Type wizard saves `bikeType` with `bikeTypeSource = "user"`
- [ ] Section is hidden if Strava is not active
- [ ] `npm run typecheck` passes
