# Marktplaats Import Contract Foundation

## Final storage choice

Use a dedicated `bikeImports` table as the ingestion and traceability log.

Why:
- keeps parser snapshots and import lifecycle state out of `bikes`
- makes duplicate protection explicit per user and advert URL
- supports parse/save/image lifecycle tracking without polluting the durable rider bike model
- lets `bikes` stay the source of truth for the rider-owned asset after import

`bikes` still carries the small durable traceability fields that matter after creation:
- `source`
- `descriptionSource`
- `importSourceName`
- `importSourceUrl`
- `importCanonicalUrl`
- `importedAdvertTitle`
- `bikeImportId`

## Final preview payload fields

Canonical preview payload is returned by `buildBikeImportPreview(...)` and exposed via `convex/bikeImports/queries.ts`.

Shape:
- `importId`
- `sourceName`
- `sourceUrl`
- `canonicalUrl`
- `advertTitle`
- `status`
- `parsedAdvert`
  - `advertTitle`
  - `description`
  - `imageCandidates[]`
    - `url`
    - `normalizedUrl`
    - `sortOrder`
    - `selectedByDefault`
    - `caption`
    - `width`
    - `height`
  - `candidateBrand`
    - `value`
    - `confidence`
  - `candidateModel`
    - `value`
    - `confidence`
  - `candidateBikeType`
    - `value`
    - `confidence`
- `draftBike`
  - `name`
  - `brand`
  - `model`
  - `bikeType`
  - `description`
  - `selectedImageUrls`
  - `primaryImageUrl`
- `reviewFlags`
  - `name`
  - `brand`
  - `model`
  - `bikeType`
  - `description`
  - `images`
- `createdBikeId`
- `failureReason`

## Final save payload fields

Canonical save payload is `BikeImportSaveRequest`.

Shape:
- `importId`
- `name`
- `bikeType`
- `brand`
- `model`
- `description`
- `selectedImageUrls`
- `primaryImageUrl`

Rules:
- `name` and `bikeType` are required at save time
- `primaryImageUrl`, when provided, must be one of `selectedImageUrls`
- `selectedImageUrls` may be empty; that must not block bike creation

## Nullability rules

- Preview-facing string fields are normalized to `string | null`, never `undefined`
- `parsedAdvert` is `null` until a successful parse snapshot exists
- `draftBike` is `null` until a draft has been derived or edited
- `canonicalUrl`, `advertTitle`, `createdBikeId`, and `failureReason` are nullable in preview
- In the stored `draftBike`, `brand`, `model`, `bikeType`, `description`, and `primaryImageUrl` are optional
- High-confidence fields are prefilled into `draftBike`
- Medium/low confidence fields stay unset and are surfaced through `reviewFlags`

## Status model

Final status set:
- `pending_fetch`
- `parsed`
- `needs_review`
- `importing`
- `imported`
- `failed`

Meaning:
- `pending_fetch`: URL accepted, fetch/parse not finished
- `parsed`: parse succeeded and core fields are strong enough to prefill cleanly
- `needs_review`: parse succeeded but one or more key fields remain uncertain
- `importing`: save has started and persistence/photo work is in progress
- `imported`: a durable bike record exists and is linked by `createdBikeId`
- `failed`: parse or save failed and no usable bike was created from that attempt

## Known deferrals

- No parser selector strategy changes are defined here; parser internals remain separate
- No rider-facing preview UI is implemented here
- No remote image download implementation is completed here; only the contract and lifecycle hooks are in place
- No geometry extraction or geometry persistence fields were added
- Confidence rules are intentionally simple in foundation code:
  - only `high` confidence pre-fills brand/model/bike type
  - review UI can refine the presentation later without changing storage
