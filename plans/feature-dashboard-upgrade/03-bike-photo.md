# 03 — Bike Photo Upload and Display

## Goal

Let users add a photo to each bike and display it prominently in bike cards and the bike detail view. Bikes without a photo show a bicycle icon placeholder.

## Background

`bikes.photoUrl` already exists in the schema as an optional string. The upload infrastructure from prompt 01 is already in place. The bikes list page (`/bikes`) currently shows text-first cards plus a pressure summary. The bike detail page (`/bikes/[bikeId]`) does not exist yet — only an edit page exists. This prompt creates the read-only bike detail page and updates the list page without regressing the existing pressure summary block.

## Steps

### 1. Build `BikePhotoUpload` component

Create `src/components/bikes/BikePhotoUpload.tsx`:
- Accepts `bikeId`, `currentPhotoUrl?`, `onUploadComplete` callback
- Renders a 16:9 or square photo area (responsive, e.g., `aspect-video` container)
- If `photoUrl` exists: show the image, with a small edit button overlay (camera icon) on hover
- If no photo: show a centered bicycle icon with "Add photo" label
- On click/file select: validates size (5 MB max, JPG/PNG/WEBP), uploads via the upload hook from prompt 02, then calls `convex/bikes/mutations.ts` `update` mutation with the new `photoUrl`
- Shows upload progress/loading state
- Obeys account type: if `tier === "free"`, still allow one bike photo (per product spec)

### 2. Create bike detail page

Create `src/app/(dashboard)/bikes/[bikeId]/page.tsx`:
- Fetch bike by ID using an existing or new `convex/bikes/queries.ts` `getById` query
- Page sections:
  1. **Photo** — `BikePhotoUpload` at the top (full-width on mobile, 40% column on desktop)
  2. **Bike info** — name, type, brand, model, wheel size
  3. **Tire specs** — tire widths, tube type (pulled from associated `tireSetups` if available)
  4. **Pressure summary** — placeholder card "No pressure data yet" with a "Calculate pressure" link to `/pressure-calculator?bikeId=...` (the full pressure block comes in prompt 08)
  5. **Fit summary** — defer full fit linkage until a bike-to-recommendation query exists; for this prompt, show a placeholder or latest fit-session CTA instead of assuming `recommendations` can already be queried by bike
  6. **Edit button** — links to `/bikes/[bikeId]/edit`

### 3. Update bike cards on `/bikes` page

Update `src/app/(dashboard)/bikes/page.tsx` and any bike card component:
- Show the bike photo (if present) from `photoUrl` as the card header image
- Bicycle icon placeholder if no photo
- Card should be clickable and link to `/bikes/[bikeId]` (new detail page)
- Keep the existing Edit and Delete actions

### 4. i18n

Add translation keys:
- `bikes.photo.add` — "Add photo"
- `bikes.photo.edit` — "Change photo"
- `bikes.photo.uploading` — "Uploading..."
- `bikes.photo.error` — "Upload failed."
- `bikes.detail.pressurePlaceholder` — "No pressure data yet"
- `bikes.detail.calculatePressure` — "Calculate pressure"

Add to both `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts`.

## Acceptance Criteria

- [ ] Users can upload a photo for each bike from the bike detail page
- [ ] Bike photo appears in the bike card on the list page
- [ ] Bicycle icon placeholder shows when no photo is uploaded
- [ ] `/bikes/[bikeId]` page exists and shows bike info, photo, and placeholder pressure block
- [ ] Bike cards on `/bikes` link to the detail page
- [ ] `npm run typecheck` passes
