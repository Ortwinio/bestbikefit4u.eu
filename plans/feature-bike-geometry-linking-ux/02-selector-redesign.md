# Prompt 02 — Selector Redesign

## Context

Rewrite `src/components/bikes/BikeGeometryLibraryFields.tsx` (currently 570 lines).

Read these files before starting:
- `src/components/bikes/BikeGeometryLibraryFields.tsx` — current implementation
- `src/components/bikes/bikeFormGeometry.ts` — state machine (keep all functions, only change UI)
- `convex/geometry/queries.ts` — available queries including new `getGeometryRecordPreview`
- `src/components/ui/` — available UI primitives (Button, Input, Select)

## Design

Replace the current text-input + chip-suggestion autocomplete pattern with a 3-phase chip selector.

### Phase 1: Brand

Show a filter input + a scrollable chip grid of brand names. No text autocomplete, no separate suggestion row. When the user clicks a brand chip, it becomes selected.

```
Filter: [_______________]
[ Trek ] [ Specialized ] [ Giant ] [ Canyon ] [ Cannondale ] ...
         ↑ selected = highlighted border + checkmark
```

- Load: `api.geometry.queries.listBrandsForRider`
- Filter: `matchesAutocompleteQuery(brand.name, filterQuery)` — keep existing helper
- Sort: starts-with first, then alphabetical — keep `compareAutocompleteMatches` helper
- Show only brands with `hasUsableModels === true`
- Selected state: `state.standardBrandId` set
- Chips show brand name only — remove the record count `(42)` label

### Phase 2: Model (shown after brand selected)

Show selected brand as a dismissible badge at top, then a filter input + model chip grid.

```
✓ Trek  [×]

Filter models: [_______________]
[ Émonda SL ] [ Madone SLR ] [ Domane AL ] ...
              ↑ selected

If yearSelectionRequired: show inline year row beneath selected model chip
  Year: [ 2021 ] [ 2022 ] [▶2023◀] [ 2024 ]
```

- Load: `api.geometry.queries.listModelsForRiderBrand` with `state.standardBrandId`
- Filter: same `matchesAutocompleteQuery` on `family.name`
- Only show families with `hasUsableSizes === true`
- If model family is selected AND `yearSelectionRequired === false`: auto-select first (only) year option
- If `yearSelectionRequired === true`: show year chips inline, require explicit selection
- Selected model state: `state.standardModelFamilyKey` set; selected year: `state.standardModelId` set

### Phase 3: Frame size (shown after model+year selected)

Show selected model as a dismissible badge, then frame sizes as pill buttons in a row.

```
✓ Trek Émonda SL · 2023  [×]

[ 47 ] [ 50 ] [ 52 ] [ 54 ] [▶56◀] [ 58 ] [ 60 ] [ 62 ]
                              ↑ selected = filled button

Geometry preview (appears when size selected):
┌────────────────────────────────────────────────────┐
│  Stack    Reach    Seat tube    Head tube           │
│  563 mm   387 mm   73.5°        70.5°              │
└────────────────────────────────────────────────────┘
```

- Load: `api.geometry.queries.listSizeRecordsForRiderModel` with `state.standardModelId`
- Size button: `applyGeometryRecordSelection(state, { geometryRecordId, sizeLabel })`
- Geometry preview: `api.geometry.queries.getGeometryRecordPreview` with `state.geometryRecordId` — show `stackMm`, `reachMm`, `seatTubeAngle`, `headTubeAngle`; show "—" for null values

### Custom fallback (always at bottom)

Replace the two toggle buttons with a single disclosure:

```
  My bike isn't in the list?  ▸

  When expanded:
  Brand: [________________________]
  Model: [________________________]
  (Leave model blank if you only know the brand)
```

- Use `<details>/<summary>` or a controlled expand state
- When expanded: show `Input` for `state.customBrand`, `Input` for `state.customModel`
- When custom brand is entered: call `enableCustomBrandFallback(state)` and set `customBrand`
- When custom brand is cleared: call `disableCustomBrandFallback(state)`
- The custom fallback section hides the standard selector phases (same as today)
- Keep the existing `state.customBrandEnabled` / `state.customModelEnabled` flags

### Remove

- All 5 `useEffect` auto-matching heuristics (lines 95-232) — DELETE them entirely
- The separate `brandSuggestions` / `modelSuggestions` useMemo + floating chip rows
- The two toggle `Button` components for custom brand/model
- The `brandQuery` / `modelQuery` local state (replaced by filterQuery per phase)

### State management

Keep all imports from `bikeFormGeometry.ts` unchanged. The state machine is correct — only the UI presentation changes.

Analytics calls: keep all `trackGeometrySelection` calls. Fire them on chip click, not on text change.

## Component structure

```tsx
"use client";

export function BikeGeometryLibraryFields({ state, onChange, messages }) {
  const setState = asStateSetter(onChange);
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [customOpen, setCustomOpen] = useState(state.customBrandEnabled || state.customModelEnabled);

  const brands = useQuery(api.geometry.queries.listBrandsForRider, {});
  const models = useQuery(
    api.geometry.queries.listModelsForRiderBrand,
    state.standardBrandId && !state.customBrandEnabled
      ? { brandId: state.standardBrandId as Id<"geometry_brands"> }
      : "skip"
  );
  const sizes = useQuery(
    api.geometry.queries.listSizeRecordsForRiderModel,
    state.standardModelId && !state.customBrandEnabled && !state.customModelEnabled
      ? { modelId: state.standardModelId as Id<"geometry_models"> }
      : "skip"
  );
  const geometryPreview = useQuery(
    api.geometry.queries.getGeometryRecordPreview,
    state.geometryRecordId && !state.customBrandEnabled && !state.customModelEnabled
      ? { recordId: state.geometryRecordId as Id<"geometry_records"> }
      : "skip"
  );

  // Derive filtered options
  const filteredBrands = useMemo(() => ...);
  const filteredModels = useMemo(() => ...);
  const selectedModelFamily = models?.find(f => f.modelKey === state.standardModelFamilyKey);

  if (customOpen || state.customBrandEnabled) {
    return <CustomFallbackSection ... />;
  }

  return (
    <div className="space-y-5 ...">
      {/* Section header */}
      <Phase1BrandSelector ... />
      {state.standardBrandId && <Phase2ModelSelector ... />}
      {state.standardModelId && <Phase3SizeSelector sizes={sizes} geometryPreview={geometryPreview} ... />}
      <CustomFallbackDisclosure onOpen={() => setCustomOpen(true)} />
    </div>
  );
}
```

Break into sub-components within the same file:
- `Phase1BrandSelector` — brand filter + chips
- `Phase2ModelSelector` — selected brand badge, model filter + chips, year chips
- `Phase3SizeSelector` — selected model badge, size pills, geometry preview card
- `CustomFallbackDisclosure` — the "not in list" expand section
- `GeometryPreviewCard` — inline stack/reach/STA/HTA display

## Validation

- `npx tsc --noEmit` must pass
- Brand chips render and filter correctly
- Clicking a brand chip selects it and shows model phase
- Clicking `[×]` on selected brand badge resets to phase 1
- Size pills render and geometry preview appears on size selection
- "My bike isn't in the list?" expands to show brand/model inputs
- Existing bike edit: pre-selected brand/model/size visible in correct phase without useEffect heuristics (use initial state from `state` props directly)
