# Bike Geometry Linking Sprint Plan

## Goal

Help riders connect a bike to existing geometry data by selecting:

- brand
- model
- year, when the library contains multiple year variants
- frame size

The rider should be able to save a bike even when no library match exists, but when a match does exist the flow should standardize the bike identity and link the correct geometry record.

## Sprint Scope

In scope for this sprint:

- rider create/edit bike flow for standard geometry linking
- standardized brand/model/year/size selection from the existing geometry library
- custom fallback for missing brand or model
- persistence of `geometryRecordId` on the bike
- a separate linked-geometry card on the bike detail page
- validation, analytics, and focused tests

Out of scope for this sprint:

- rider creation of new standard brands or models
- rider-side raw geometry entry overhaul
- library curation or bulk cleanup of existing brand/model naming
- auto-matching by AI or scraped third-party data
- retroactive migration of existing inconsistent rider `brand` / `model` values

## Current Constraints

- the geometry library already exists:
  - `geometry_brands`
  - `geometry_models`
  - `geometry_records`
- bikes already support `geometryRecordId`
- the rider bike form is still primarily freeform
- the admin side already supports geometry linking and imports

## Delivery Strategy

This should ship in one sprint by staying additive:

1. keep current freeform bike creation working
2. add a preferred standard selection path
3. keep custom fallback local to the rider bike record
4. avoid introducing new governance or catalog-maintenance workflows

## Implementation Tickets

1. [01-ticket-geometry-contract-and-query-shape.md](./01-ticket-geometry-contract-and-query-shape.md)
2. [02-ticket-bike-form-standard-selection.md](./02-ticket-bike-form-standard-selection.md)
3. [03-ticket-bike-form-custom-fallback.md](./03-ticket-bike-form-custom-fallback.md)
4. [04-ticket-bike-detail-geometry-card.md](./04-ticket-bike-detail-geometry-card.md)
5. [05-ticket-validation-analytics-and-rollout.md](./05-ticket-validation-analytics-and-rollout.md)

## Claim-Risk And Scientific-Risk Review

### Claim-risk language to avoid

Do not use copy that implies:

- the geometry link is always exact
- the geometry library is complete
- the selected model is guaranteed to match every build variant
- geometry data alone guarantees a correct fit

Avoid phrases like:

- "exact frame match"
- "guaranteed correct geometry"
- "perfect fit from geometry"
- "we know your bike exactly"

### Safer product language

Prefer:

- "link the closest matching geometry record from our library"
- "select the brand, model, year, and size that match your bike"
- "if your bike is not listed, save it with your own brand and model"
- "linked geometry helps us show the bike’s reference frame data more clearly"

### Scientific-risk language to avoid

Do not imply:

- geometry data alone determines fit recommendations
- stack/reach or frame dimensions alone predict comfort or performance outcomes
- year/model matching is a scientific validation step

Use practical language instead:

- geometry is reference data
- rider profile, setup, and bike geometry each contribute context
- the geometry card shows the selected reference record, not a fit verdict

## User-Facing Copy Rewrites

These strings should guide implementation:

- Geometry section title:
  - `Link bike geometry`
- Geometry section description:
  - `Choose your bike from the geometry library when it is available. If it is not listed, you can still save your bike with your own brand and model.`
- Brand helper:
  - `Start with a standard brand to connect this bike to stored geometry data.`
- Model helper:
  - `Select the model that matches your bike. Only models for the selected brand are shown.`
- Year helper:
  - `Select the year only when multiple model-year variants exist in the library.`
- Size helper:
  - `Choose from the sizes available for the selected model.`
- Custom brand fallback:
  - `My brand is not listed`
- Custom model fallback:
  - `My model is not listed`
- Custom fallback explanation:
  - `Custom brand and model values are saved only on your bike. They do not change the shared geometry library.`
- Linked geometry card title:
  - `Linked geometry record`
- Linked geometry card description:
  - `This bike is linked to a reference geometry record from the library.`
- Unlinked geometry card title:
  - `No linked geometry record`
- Unlinked geometry card description:
  - `This bike is saved without a geometry-library match. You can still edit the bike and link geometry later.`

## Sprint Success Criteria

- riders can link a bike to a standard geometry record without admin help
- riders can still save a bike when the library has no match
- saved linked bikes persist `geometryRecordId`
- the bike detail page clearly separates linked geometry data from setup data
- no new public claims overstate the precision or scientific meaning of the geometry link

## Status

- implemented
- validated with focused tests, Convex codegen, and `npm run build:vercel`
- closeout: [output-01-implementation-closeout.md](./output-01-implementation-closeout.md)
