# Feature Plan: Guided Bike Geometry Linking Picklist

## Goal

Improve the **Link bike geometry** experience on both the **Add new bike** page and the **Edit bike** page so riders can connect their bike to the standard geometry library through a clear guided flow:

1. Select **brand**
2. Select **model**
3. Select **year**
4. Select **size**

The success criterion is simple:

**More riders should successfully connect a specific bike to an exact standard bike geometry record, with less confusion and less manual fallback.**

---

## Product Outcome

The bike-geometry flow should feel like a guided identity selector, not a semi-manual lookup tool.

When a rider adds or edits a bike, the UX should help them answer one question at a time:

- Which brand is it?
- Which model is it?
- Which production year or year range matches?
- Which frame size is correct?

This should reduce bad matches, reduce abandonment, and increase the percentage of bikes that end up linked to a valid `geometryRecordId`.

---

## Current-State Audit

### What exists now

The current rider flow already has the right underlying data model and most of the right queries:

- `bikes.geometryRecordId` is already the canonical link
- `convex/geometry/queries.ts` already exposes rider-safe selectors:
  - `listBrandsForRider`
  - `listModelsForRiderBrand`
  - `listSizeRecordsForRiderModel`
  - `getGeometryRecordPreview`
- `BikeForm.tsx` and `CreateBikeForm.tsx` already embed `BikeGeometryLibraryFields`
- `bikeFormGeometry.ts` already contains the state transitions needed to keep standard selection and custom fallback mutually exclusive

### What is wrong in the current UX

The current selector is still too implementation-shaped:

- it mixes guided selection with free filtering behavior
- it exposes too much choice too early
- it relies on chip grids rather than a clear progressive picklist
- model and year logic is understandable to us, but not necessarily obvious to riders
- custom fallback is present in the same surface as standard linking, which weakens the main success path
- the user is not clearly told what step they are in and what is still required

### Main product risk

The current UX makes it too easy for a rider to:

- hesitate because the next step is not obvious
- pick the wrong model family or year variant
- abandon linking and save only free-text brand/model

That directly weakens the usefulness of the geometry library.

---

## Desired UX

### Primary flow

On both add-bike and edit-bike pages, the geometry section should become a guided 4-step picklist:

1. **Brand picklist**
   - searchable select / combobox
   - only brands with usable geometry records shown by default
   - selected brand shown as confirmed before moving on

2. **Model picklist**
   - enabled only after brand selection
   - filtered to that brand
   - model names grouped or labeled clearly when multiple variants exist

3. **Year picklist**
   - shown only when the selected model family has multiple year variants
   - hidden and auto-resolved when there is only one year variant
   - label should be rider-facing: `2023`, `2021-2023`, `2020+`, `Until 2019`

4. **Size picklist**
   - enabled only after the exact model variant is known
   - uses clear size labels from the geometry records
   - selection immediately resolves the exact `geometryRecordId`

### Inline feedback

After size selection, show a compact confirmation block:

- Brand
- Model
- Year
- Size
- Geometry preview:
  - stack
  - reach
  - seat tube angle
  - head tube angle

This block should appear **before save**, so the rider knows they selected a real geometry record.

### Secondary path

Custom fallback remains supported, but it should be visually secondary:

- collapsed behind a single disclosure:
  - `My bike is not in the list`
- only then show free-text brand/model fallback
- choosing fallback must clear any standard geometry link state

The product should clearly prefer standard linking without trapping riders when the library is incomplete.

---

## Scope

### In scope

- Add-bike flow
- Edit-bike flow
- Guided picklist UX for brand → model → year → size
- Inline geometry preview before save
- Stronger standard-path default
- Safer and more secondary custom fallback
- Copy and microcopy that explicitly explains the benefit of linking to standard geometry
- Instrumentation for completion and abandonment

### Out of scope

- Admin geometry-library CRUD redesign
- Geometry-library data import strategy
- New geometry matching heuristics based on fuzzy bike names
- Public-site bike geometry flows
- Bike-detail-page redesign beyond whatever minimal copy updates are needed to stay consistent

---

## Technical Approach

### Core principle

Keep the **data model and canonical link** unchanged:

- `geometryRecordId` remains the source of truth
- existing state transitions from `bikeFormGeometry.ts` should be reused where possible

### UI principle

Move from a chip-driven selector to a more obviously guided picklist interface:

- searchable dropdown / combobox for brand
- searchable dropdown / combobox for model
- dropdown for year when needed
- dropdown or segmented size picker depending on record count

The UI should guide the rider through one decision at a time.

### Query strategy

The current queries are close, but the plan should explicitly validate whether they support a smooth UX without visible lag or excessive refetching.

If needed, add a new rider-safe aggregate query to reduce step latency:

- `getGeometryPickerOptions`
  - returns brands
  - returns model families for a selected brand
  - returns year variants and size options in a normalized rider-facing shape

This is optional, not mandatory.

Use the simplest backend contract that produces a fast, stable UI.

### State strategy

The UI state must be explicit:

- `selectedBrandId`
- `selectedModelFamilyKey`
- `selectedModelId`
- `selectedGeometryRecordId`
- fallback mode on/off

The page should never silently auto-match hidden values from partial text input.

### Edit-flow requirement

The edit-bike page must open with the existing selection already resolved:

- brand preselected
- model preselected
- year preselected when applicable
- size preselected
- preview visible immediately

The rider should feel like they are editing an exact existing link, not rebuilding it from scratch.

---

## UX Requirements

### Copy

The section should explain the value of linking:

- standard geometry gives cleaner bike identity
- geometry preview is based on the shared library
- this improves bike reference quality for downstream fit logic

Suggested top-level helper copy:

- `Select your bike from the geometry library to connect it to a standard frame record.`
- `If your exact bike is not listed, you can still save a custom brand and model.`

### Step presentation

Each step should visually indicate:

- current step
- completed step
- locked future steps

This can be done with either:

- stacked fields with clear headings and disabled states
- or a small progress rail above the fields

### Error handling

The UX must clearly handle:

- no models for selected brand
- no sizes for selected model variant
- geometry record became unavailable
- user switching from standard selection to custom fallback

No silent reset should occur without a visible reason.

---

## Success Metrics

### Primary success metric

Increase the percentage of saved bikes that have a valid `geometryRecordId`.

### Secondary success metrics

- decrease fallback/manual brand+model saves when a valid standard record exists
- decrease edit-flow confusion and re-selection churn
- reduce abandoned geometry selection states before save
- reduce support/debug cases caused by stale or partial geometry-link state

---

## Acceptance Criteria

### UX

- [ ] Add-bike and edit-bike flows both use the same guided picklist pattern
- [ ] The user selects brand first, then model, then year if needed, then size
- [ ] Future steps stay disabled until the current step is valid
- [ ] The currently selected choice is always visible
- [ ] Geometry preview appears before save once size is selected
- [ ] Custom fallback is available but clearly secondary to the standard flow
- [ ] Switching to custom fallback clears the geometry-link selection safely
- [ ] Edit-bike opens with the existing link fully preselected and previewed

### Data safety

- [ ] Saving a standard selection persists the correct `geometryRecordId`
- [ ] Saving custom fallback does not persist a stale `geometryRecordId`
- [ ] Brand/model/year/size state cannot drift into an impossible combination
- [ ] Missing or inactive geometry records are handled explicitly

### Performance

- [ ] Brand selection does not feel blocked by unnecessary loading
- [ ] Model/year/size transitions do not create confusing visible flicker
- [ ] The selector remains usable on mobile and desktop

### Validation

- [ ] `npx tsc --noEmit` passes
- [ ] unit/integration tests cover add-bike and edit-bike prefill behavior
- [ ] tests cover switching between standard selection and custom fallback
- [ ] tests cover the exact brand → model → year → size progression

---

## Delivery Structure

- [01-current-state-and-contract.md](01-current-state-and-contract.md)
- [02-guided-selector-ux.md](02-guided-selector-ux.md)
- [03-form-integration-and-edit-state.md](03-form-integration-and-edit-state.md)
- [04-validation-copy-rollout.md](04-validation-copy-rollout.md)

## Progress

- [x] 01 — Current state and contract
- [x] 02 — Guided selector UX
- [x] 03 — Form integration and edit state
- [x] 04 — Validation, copy, and rollout

## Implementation Notes

- Implemented the guided brand → model → year → size selector in [BikeGeometryLibraryFields.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeGeometryLibraryFields.tsx).
- Added rider-safe edit-flow hydration query in [queries.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/geometry/queries.ts).
- Extended geometry state helpers in [bikeFormGeometry.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/bikeFormGeometry.ts).
- Added targeted coverage in [bikeFormGeometry.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/bikeFormGeometry.test.ts) and [BikeGeometryLibraryFields.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/bikes/BikeGeometryLibraryFields.test.tsx).
- Updated EN/NL UX copy in [en.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/en.ts) and [nl.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/messages/nl.ts).

Residual gap:

- manual browser QA on add-bike and edit-bike flows is still advisable before pushing to production.
