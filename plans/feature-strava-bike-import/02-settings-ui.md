# Step 02 — Settings UI

## Goal

Add a "Import bikes from Strava" section to the Settings page that lists the user's Strava bikes, shows which are already imported, and lets them import selected ones in one click.

---

## Pre-requisites

- Step 01 complete: `stravaGearSummaryJson` is stored on connect, `importBikesFromStrava` action exists, `getStravaGearSummary` query exists

---

## UI placement

Add the import UI inside the existing Strava integration card in `src/app/(dashboard)/settings/page.tsx`, below the athlete info row and above the Disconnect button.

Only render the import section when `strava.accessStatus === "active"` and `gearSummary` has at least one bike.

---

## Data needed

```ts
const gearSummary = useQuery(api.integrations.queries.getStravaGearSummary);
const userBikes = useQuery(api.bikes.queries.getByUser);
const importBikes = useAction(api.integrations.actions.importBikesFromStrava);
```

Build a Set of already-imported Strava gear IDs from `userBikes`:

```ts
const importedGearIds = useMemo(
  () => new Set(userBikes?.map((b) => b.stravaGearId).filter(Boolean)),
  [userBikes]
);
```

---

## Component layout

```
┌─ Strava card ──────────────────────────────────────────┐
│  [athlete avatar]  Athlete Name                        │
│                    Last synced: …                      │
│                                                        │
│  ── Your Strava bikes ─────────────────────────────── │
│  ☑  My Road Bike          ✓ Already added             │
│  ☑  Gravel Monster        [not yet added]             │
│  ☑  MTB Enduro            [not yet added]             │
│                                                        │
│  [Import selected bikes]  [Use Strava photo] [Disconnect]
└────────────────────────────────────────────────────────┘
```

Each bike row:
- Checkbox (disabled + checked if already imported, enabled otherwise)
- Bike name
- Brand + model in muted text if available (from detailed gear, populated post-import; show from `userBikes` match if already imported)
- "Already added" badge if `importedGearIds.has(gear.id)`, otherwise nothing

The import button:
- Label: "Import bikes" (or "Import 2 bikes" showing count of checked items)
- Disabled if no unchecked bikes are selected
- Uses `variant="outline"` (secondary action alongside the primary Connect button)
- Shows loading state while action runs

---

## State

```ts
const [selectedGearIds, setSelectedGearIds] = useState<Set<string>>(new Set());
const [isImporting, setIsImporting] = useState(false);
```

On mount (when `gearSummary` loads), pre-select all bikes that are NOT yet imported:

```ts
useEffect(() => {
  if (!gearSummary) return;
  const unimported = gearSummary
    .filter((g) => !importedGearIds.has(g.id))
    .map((g) => g.id);
  setSelectedGearIds(new Set(unimported));
}, [gearSummary, importedGearIds]);
```

---

## Import handler

```ts
const handleImportBikes = async () => {
  setIsImporting(true);
  try {
    const result = await importBikes({ gearIds: Array.from(selectedGearIds) });
    if (result.imported > 0) {
      toast.success({
        description: messages.settings.integrations.bikeImport.success(result.imported),
      });
      setSelectedGearIds(new Set()); // clear after import
    }
  } catch {
    toast.error({ description: messages.settings.integrations.callback.error });
  } finally {
    setIsImporting(false);
  }
};
```

---

## i18n strings

Add to `integrations` in `en.ts` and `nl.ts`:

```ts
bikeImport: {
  sectionTitle: "Your Strava bikes",
  alreadyAdded: "Already added",
  importButton: "Import bikes",
  importButtonCount: "Import {count} bike",
  importButtonCountPlural: "Import {count} bikes",
  success: "Imported {count} bike from Strava.",
  successPlural: "Imported {count} bikes from Strava.",
  noBikes: "No bikes found in your Strava account.",
},
```

Dutch (`nl.ts`):

```ts
bikeImport: {
  sectionTitle: "Jouw Strava-fietsen",
  alreadyAdded: "Al toegevoegd",
  importButton: "Fietsen importeren",
  importButtonCount: "{count} fiets importeren",
  importButtonCountPlural: "{count} fietsen importeren",
  success: "{count} fiets geïmporteerd vanuit Strava.",
  successPlural: "{count} fietsen geïmporteerd vanuit Strava.",
  noBikes: "Geen fietsen gevonden in je Strava-account.",
},
```

---

## Acceptance criteria

- [ ] Strava bikes list appears in Settings when connected and `gearSummary` has entries
- [ ] Already-imported bikes show "Already added" badge and disabled checkbox
- [ ] Unimported bikes are pre-selected by default
- [ ] Import button label reflects the number of selected bikes
- [ ] Successful import shows a toast with the count and refreshes `userBikes`
- [ ] Section is hidden if Strava is not connected
- [ ] `npm run typecheck` passes
