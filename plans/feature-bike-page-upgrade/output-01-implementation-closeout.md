# Bike Page Upgrade Closeout

## Implemented

- added explicit multi-photo support through `bikePhotos`
- kept legacy `bikes.photoUrl` compatibility for existing bikes
- added editable bike descriptions on `bikes`
- added a richer `bikes.queries.getDetail` contract for the bike page
- upgraded the bike detail page into:
  - identity summary
  - gallery
  - editable description
  - bike facts
  - wheelset manager
  - notes
  - fit history
  - pressure section
- added rider-facing wheelset add / activate / remove controls on the bike page
- added a user-triggered description generation action with:
  - OpenAI-backed generation when `OPENAI_API_KEY` exists
  - safe template fallback when it does not

## Acceptance Mapping

- existing bikes still render:
  - `getDetail` falls back to legacy `photoUrl` when there are no `bikePhotos`
- bike page supports multiple photos:
  - `convex/bikePhotos/*`
  - `BikePhotoGallery.tsx`
- one primary photo is supported:
  - `bikePhotos.isPrimary`
  - primary sync back to `bikes.photoUrl`
- riders can add, activate, and remove extra wheelsets:
  - `BikeWheelsetManager.tsx`
  - `convex/wheelsets/mutations.ts`
- active wheelset and tire setup remain visible:
  - bike identity card
  - wheelset manager summary
- generated description stays editable:
  - `BikeDescriptionEditor.tsx`
- no geometry data is generated:
  - generation helper explicitly blocks geometry/spec claims
- EN/NL support preserved:
  - message updates in `src/i18n/messages/en.ts`
  - message updates in `src/i18n/messages/nl.ts`

## Validation

- `npx convex codegen`
- `npx vitest run convex/bikes/__tests__/description.test.ts`
- `npm run build:vercel`

## Known Limits

- gallery captions are modeled in the backend but not yet exposed in the rider UI
- description generation is intentionally optional and falls back to a safe template when no OpenAI key is configured
