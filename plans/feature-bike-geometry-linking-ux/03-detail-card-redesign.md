# Prompt 03 — Detail Card Redesign and Page Consolidation

## Context

Redesign `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx` and consolidate two redundant geometry sections in `src/app/(dashboard)/bikes/[bikeId]/page.tsx`.

Read these files before starting:
- `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx` — current implementation (199 lines)
- `src/app/(dashboard)/bikes/[bikeId]/page.tsx` — current page (especially lines 181–222 for `geometryItems`, lines 462–503 for the two geometry cards)

## Problems to solve

### Problem 1 — Admin metadata clutters the rider view

`buildGeometryCardItems` (line 111) returns 12 fields including `version`, `source`, `status`, and `sourceUrl`. These are database administration fields. Riders don't benefit from seeing them. They bury the useful data: stack, reach, seat tube angle, head tube angle.

### Problem 2 — Two overlapping geometry cards on the bike detail page

The bike detail page currently renders:
1. `GeometryLinkCard` — linked library data: brand, model, year, size, stack, reach, STA, HTA, plus admin fields
2. A separate `geometryItems` card (lines 483–503) — bike type, riding style, goal, brand, model, weight, stack, reach, frame size

Stack, reach, brand, and model appear in both cards when a library record is linked. The rider has to mentally reconcile which values to trust.

### Problem 3 — No action buttons

The current card has no way for riders to change or add a geometry link without navigating to edit. The unlinked state doesn't prompt action.

---

## Solution

### Redesign `GeometryLinkCard.tsx`

Replace the generic 12-field grid with a structured rider-facing card.

#### Component props (expanded)

```tsx
export function GeometryLinkCard({
  locale,
  state,
  linkedGeometry,
  bike,          // new: bike fields needed for footer section
  editHref,      // new: URL to bike edit page pre-scrolled to geometry
}: {
  locale: Locale;
  state: GeometryLinkState;
  linkedGeometry: LinkedGeometryDetail | null;
  bike: {
    bikeType: string;
    ridingStyle: string | null | undefined;
    primaryGoal: string | null | undefined;
    brand: string | null | undefined;
    model: string | null | undefined;
    bikeWeightKg: number | string | null | undefined;
    currentGeometry?: {
      stackMm?: number | null;
      reachMm?: number | null;
      frameSize?: string | null;
    } | null;
  };
  editHref: string;
})
```

#### Card layout — linked state

```
┌──────────────────────────────────────────────────────────┐
│ Trek Émonda SL  ·  2023  ·  56 cm           [Change ▸]  │
│ ─────────────────────────────────────────────────────── │
│ Stack    Reach    Seat tube    Head tube                  │
│ 563 mm   387 mm   73.5°        70.5°                    │
│                                                           │
│  [if superseded:]                                        │
│  ⚠ Newer geometry available  [Update to latest →]       │
│ ─────────────────────────────────────────────────────── │
│ Road · Performance · 8.2 kg                              │
└──────────────────────────────────────────────────────────┘
```

**Header row:**
- Left: `{brandName} {modelName} · {modelYearLabel} · {sizeLabel}` — if any field is null, omit it and its separator
- Right: `<Button variant="ghost" size="sm" render={<Link href={editHref} />}>Change</Button>`

**Geometry numbers row (4-column grid):**
- Stack: `{stack ?? "—"} mm`
- Reach: `{reach ?? "—"} mm`
- Seat tube: `{seatTubeAngle ?? "—"}°`
- Head tube: `{headTubeAngle ?? "—"}°`
- Each value is shown large and bold, label in small muted text above

**Superseded banner (shown only if `status === "superseded"`):**
- Amber/warning background stripe
- Text: "Newer geometry data is available" / "Nieuwere geometriedata beschikbaar"
- Link: "Update to latest →" → `editHref`

**Footer row:**
- Bike type · riding style · primary goal · weight (show "-" for null values)

**Remove entirely:**
- `version`, `source`, `status`, `sourceUrl` fields — do not show in rider view
- `buildGeometryCardItems` function — delete it
- `getGeometryCardCopy` fields for version, source, status, sourceUrl — remove those keys

#### Card layout — unlinked state

```
┌──────────────────────────────────────────────────────────┐
│ No geometry record linked           [Link geometry →]    │
│ ─────────────────────────────────────────────────────── │
│  [if currentGeometry has values:]                       │
│  Manual  Stack: — mm   Reach: — mm   Frame: 56 cm       │
│                                                           │
│  Linking to the geometry library enables more accurate  │
│  fit calculations.                                       │
│ ─────────────────────────────────────────────────────── │
│ Road · Performance · 8.2 kg                              │
└──────────────────────────────────────────────────────────┘
```

- Header shows unlinked title + "Link geometry →" button pointing to `editHref`
- If `bike.currentGeometry` has any non-null values: show them as a compact row labelled "Manual"
- Explanation sentence: same copy as current `unlinkedDescription` — keep it
- Footer row: same as linked state (bike type, riding style, goal, weight)

#### Card layout — missing_record state

Same as unlinked but subtitle says "The geometry record is no longer available" / "Het geometrie-record is niet meer beschikbaar". Action button: "Re-link geometry →" → `editHref`.

---

### i18n copy changes

Keep `getGeometryCardCopy(locale)` but update keys:

**Keep:**
- `linkedTitle`, `unlinkedTitle`, `missingRecordDescription`, `unlinkedDescription`
- `fields.stack`, `fields.reach`, `fields.seatTubeAngle`, `fields.headTubeAngle`, `fields.frameSize`, `fields.year`
- `unavailable`

**Remove:**
- `fields.version`, `fields.source`, `fields.status`, `fields.sourceUrl`
- `sources.*`, `statuses.*` (only superseded note remains)
- `linkedDescription` — replace with nothing (header shows the data directly)

**Add:**
- `supersededBanner`: "Newer geometry data is available" / "Nieuwere geometriedata beschikbaar"
- `updateToLatest`: "Update to latest" / "Bijwerken naar nieuwste"
- `linkGeometry`: "Link geometry" / "Geometrie koppelen"
- `relinkGeometry`: "Re-link geometry" / "Geometrie opnieuw koppelen"
- `changeGeometry`: "Change" / "Wijzigen"
- `manualLabel`: "Manual" / "Handmatig"
- `noGeometryLinked`: "No geometry record linked" / "Geen geometrie-record gekoppeld"
- `geometryUnavailable`: "The geometry record is no longer available" / "Het geometrie-record is niet meer beschikbaar"
- `linkPrompt`: "Linking to the geometry library enables more accurate fit calculations." / "Koppeling met de geometriebibliotheek zorgt voor nauwkeurigere berekeningen."

---

### Page consolidation in `page.tsx`

**Remove:**
- The entire second `<Card>` block that renders `geometryItems` (lines 483–503)
- The `geometryItems` array definition (lines 181–218)
- The `savedGeometryDescription` variable (lines 219–222)

**Update `GeometryLinkCard` call** (currently lines 463–467) to pass the new `bike` and `editHref` props:

```tsx
<GeometryLinkCard
  locale={locale}
  state={geometryLinkState}
  linkedGeometry={linkedGeometry}
  bike={{
    bikeType: bike.bikeType,
    ridingStyle: bike.ridingStyle,
    primaryGoal: bike.primaryGoal,
    brand: bike.brand,
    model: bike.model,
    bikeWeightKg: bike.bikeWeightKg,
    currentGeometry: bike.currentGeometry,
  }}
  editHref={withLocalePrefix(`/bikes/${bike._id}/edit`, locale)}
/>
```

**Keep all other cards unchanged:** description editor, notes editor, wheelset manager, pressure section, fit history.

---

## Component structure

```tsx
export function GeometryLinkCard({ locale, state, linkedGeometry, bike, editHref }) {
  const copy = getGeometryCardCopy(locale);

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle>
          <GeometryIdentityHeading state={state} linkedGeometry={linkedGeometry} copy={copy} />
        </CardTitle>
        <GeometryActionButton state={state} editHref={editHref} copy={copy} />
      </CardHeader>
      <CardContent className="space-y-4">
        {state === "linked" && linkedGeometry ? (
          <>
            <GeometryNumbersGrid linkedGeometry={linkedGeometry} copy={copy} />
            {linkedGeometry.status === "superseded" && (
              <SupersededBanner editHref={editHref} copy={copy} />
            )}
          </>
        ) : (
          <UnlinkedContent bike={bike} copy={copy} />
        )}
        <BikeFooterRow bike={bike} messages={...} />  {/* type · style · goal · weight */}
      </CardContent>
    </Card>
  );
}
```

Break into sub-components within the same file:
- `GeometryIdentityHeading` — renders linked header text or unlinked/missing title
- `GeometryActionButton` — Change / Link geometry / Re-link geometry button
- `GeometryNumbersGrid` — 4-column stack/reach/STA/HTA display
- `SupersededBanner` — warning stripe with update link
- `UnlinkedContent` — manual geometry values + explanation
- `BikeFooterRow` — bike type, riding style, goal, weight in a horizontal muted row

Because `GeometryLinkCard` needs i18n messages for bike fields (type, riding style, goal labels), it must accept a `messages` prop from the page. Import the dashboard messages type from `@/i18n/useDashboardMessages`. Pass only the required subset:

```tsx
messages: {
  bikeForm: { fields: { type: { staticLabel: string } } };
  fit: { ridingStyles: Record<string, { label: string }>; goals: Record<string, { label: string }>; sections: { ridingStyle: string; primaryGoal: string } };
  bikeForm: { fields: { bikeWeightKg: { label: string } } };
}
```

Add `messages` to the props interface and pass it from `page.tsx`.

---

## Validation

- `npx tsc --noEmit` must pass
- Linked bike: header shows "Brand Model · Year · Size", numbers grid shows Stack / Reach / STA / HTA
- Admin fields (version, source, status, sourceUrl) not visible in rider view
- Superseded record: amber banner visible with "Update to latest" link pointing to edit page
- Unlinked bike: "No geometry record linked" + "Link geometry" button + manual geometry row if values exist
- Only one geometry card exists on the bike detail page (the second `geometryItems` card is removed)
- Bike type, riding style, goal, weight still visible in the card footer row
- No layout regression on the rest of the bike detail page
