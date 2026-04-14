# Feature Plan: Bike Geometry Linking UX/UI Redesign

## Goal

Redesign the bike geometry linking experience so that:
1. Connecting a bike to the geometry database takes 3 clear steps instead of 4+ cascading fields with confusing toggle modes
2. The bike detail page shows all geometry data in **one unified card** — not two separate overlapping cards
3. The key geometry numbers (stack, reach, seat tube angle) are prominently visible on the bike screen with a clear link to the library source

---

## Audit Findings

### Problem 1 — Selector UX is a 4-step cascade with two conflicting modes

`BikeGeometryLibraryFields.tsx` (570 lines) implements:
1. Brand text input + floating chip suggestions
2. Model text input + floating chip suggestions (disabled until brand chosen)
3. Year dropdown (shown only if model has multiple year variants)
4. Size dropdown (shown only after year/model resolved)

On top of this, two toggle buttons ("Use custom brand" / "Use custom model") switch to free-text mode. These buttons can be in partially active states (e.g., standard brand + custom model), which is confusing.

The component also has 5 `useEffect` auto-matching heuristics that silently update selections when the user's text exactly matches a library entry. This causes surprising behavior when editing.

**Pain points:**
- Users must go through 4 sequential steps before seeing any geometry data
- The "custom fallback" buttons are unintuitive — riders don't know why two separate buttons exist
- No preview of stack/reach/angles during selection — you only see the numbers after saving
- Model query fires only after brand is selected, creating a visible loading delay

### Problem 2 — Bike detail page has two redundant geometry sections

The bike detail page renders:
1. `GeometryLinkCard` — linked library record data (brand, model, year, size, **stack, reach**, angles, plus admin metadata: version, source, status, source URL)
2. A separate "geometry" card — bike type, riding style, goal, brand, model, weight, **stack, reach**, frame size

Stack and reach appear in both cards. When a library record is linked, the data is shown twice from two different sources. Riders shouldn't need to mentally reconcile these.

### Problem 3 — `GeometryLinkCard` shows admin metadata

The current linked card shows: version, source (manufacturer/admin_import), status (draft/active/superseded). These are database administration fields. Riders don't need them and they add visual noise that buries the useful information (stack, reach).

---

## Solution Design

### Selector: 3-phase flow

Replace the cascading text inputs with a phased selector that shows clear progress.

```
Phase 1: Choose brand
  [Search brands...]
  [ Trek ] [ Specialized ] [ Giant ] [ Canyon ] ...
  Selected: ✓ Trek   [Clear]

Phase 2: Choose model
  [Filter models...]
  [ Émonda SL ] [ Madone ] [ Domane ] ...
  Selected: ✓ Émonda SL   [Year: 2023 ▾]  ← year inline, only if multiple

Phase 3: Choose frame size
  [ 47 ] [ 50 ] [ 52 ] [ 54 ] [▶56◀] [ 58 ] [ 60 ] [ 62 ]
                                  ↑ selected, highlighted

Geometry preview (appears immediately when size selected):
  Stack 563 mm  ·  Reach 387 mm  ·  STA 73.5°  ·  HTA 70.5°

──────────────────────────────────────────
  My bike isn't in the list?   [Expand ▾]
  └── Brand: [___________]  Model: [___________]
```

Key changes:
- Brand shown as a filterable chip grid, not a text input with autocomplete
- Model shown as a chip grid, not a text input — cleaner and more tablet-friendly
- Year appears inline below the model chip (only when `yearSelectionRequired`)
- Size shown as a pill button group — immediate visual, no dropdown
- Geometry preview appears instantly when a size is selected, before the user saves
- Custom fallback is one single disclosure link at the bottom, not two separate toggle buttons

### Bike detail: Unified Bike Identity Card

Replace the two separate cards with one **Bike Identity & Geometry** card:

**When geometry record is linked:**
```
┌─────────────────────────────────────────────────────────┐
│ Trek Émonda SL  ·  2023  ·  56 cm        [Edit link]   │
│                                                          │
│ Stack     Reach     Seat tube    Head tube               │
│ 563 mm    387 mm    73.5°        70.5°                  │
│                                                          │
│ Road  ·  Performance  ·  8.2 kg                         │
└─────────────────────────────────────────────────────────┘
```

**When no geometry record is linked:**
```
┌─────────────────────────────────────────────────────────┐
│ Trek Émonda SL  ·  No geometry record      [Link now]   │
│                                                          │
│ Road  ·  Performance  ·  8.2 kg                         │
│                                                          │
│ Manual geometry: Stack — mm  ·  Reach — mm              │
│ (Linking to the geometry library gives more accurate    │
│  data and enables better fit calculations.)             │
└─────────────────────────────────────────────────────────┘
```

**"Edit link" / "Link now"** buttons open an inline panel — or navigate to the edit page pre-scrolled to the geometry section (simpler approach for MVP).

Key changes:
- Brand, model, year, size at the card header level — not buried in a grid
- Stack, reach, STA, HTA highlighted as the primary geometry output
- Admin metadata (version, source, status) removed from rider view
- Superseded records: show "Newer data available" badge with link to update, not just a text warning
- The old "bike specs" grid (type, style, goal, brand, model, weight) consolidates into the card footer

---

## Files Changed

| File | Change |
|------|--------|
| `convex/geometry/queries.ts` | Add `getGeometryRecordPreview` query (returns measurements for a specific record ID) |
| `src/components/bikes/BikeGeometryLibraryFields.tsx` | Rewrite: 3-phase chip selector, inline geometry preview, single custom fallback disclosure |
| `src/app/(dashboard)/bikes/[bikeId]/GeometryLinkCard.tsx` | Redesign: rider-friendly header, key numbers prominent, admin metadata removed, action buttons |
| `src/app/(dashboard)/bikes/[bikeId]/page.tsx` | Consolidate: remove separate "geometry items" card, integrate into redesigned `GeometryLinkCard` |

**Not changed:**
- `bikeFormGeometry.ts` — state machine is sound, only the UI layer changes
- `convex/bikes/mutations.ts` — data model is correct
- `BikeForm.tsx` — uses `BikeGeometryLibraryFields` as a black box, no change needed

---

## Acceptance Criteria

### Selector
- [x] Brand selection requires one click on a chip, not typing + selecting from autocomplete
- [x] Model chips appear immediately after brand is selected (no visible loading gap)
- [x] Year selector only appears if the model has multiple year options
- [x] Frame sizes displayed as pill buttons — clicking one immediately selects it
- [x] Geometry preview (stack, reach, STA, HTA) appears when a size is selected, before saving
- [x] "My bike isn't in the list" disclosure expands to show two plain text inputs for brand + model
- [x] All 5 auto-matching `useEffect` heuristics removed
- [x] State machine functions (`applyStandardBrandSelection` etc.) unchanged and still used
- [x] Edit flow: existing selection pre-fills correctly without `useEffect` auto-matching
- [ ] `npx tsc --noEmit` passes

### Bike detail card
- [x] One geometry card replaces the two overlapping cards
- [x] Brand, model, year, size shown at header level
- [x] Stack, reach, STA, HTA shown with mm/° units
- [x] Admin metadata (version, source, status, source URL) not shown in rider view
- [x] Superseded record: shows "Newer geometry available" badge, not just a text warning
- [x] Unlinked state: shows "Link to geometry library" action
- [x] Bike type, riding style, goal, weight still visible in the card
- [x] Manual geometry values (stack/reach from `currentGeometry`) shown when no library record linked

---

## Plan Files

- [01-convex-query-extension.md](01-convex-query-extension.md) — Add `getGeometryRecordPreview` query
- [02-selector-redesign.md](02-selector-redesign.md) — Rewrite `BikeGeometryLibraryFields`
- [03-detail-card-redesign.md](03-detail-card-redesign.md) — Redesign `GeometryLinkCard` and consolidate page

## Progress

- [x] 01 — Convex query extension
- [x] 02 — Selector redesign
- [x] 03 — Detail card redesign and page consolidation

## Validation

- `npx vitest run src/components/bikes/BikeGeometryLibraryFields.test.tsx 'src/app/(dashboard)/bikes/[bikeId]/geometry-link-card.test.tsx'` passes
- `npx tsc --noEmit` is currently blocked by unrelated existing questionnaire typing errors in `src/components/questionnaire/*`
