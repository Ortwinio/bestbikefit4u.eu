# 02 — Profile Photo Upload and Display

## Goal

Let users upload a profile photo and show it as a circular avatar in the sidebar and dashboard header. Provide a default avatar fallback when no photo is uploaded.

## Background

After prompt 01, `users.profile_image_url` exists in the schema. This prompt builds the UI. Convex file storage provides the upload URL; the client uploads directly to storage, then saves the returned storage-backed URL or storage ID via the user-preferences mutation from prompt 01.

The profile photo appears in two places:
1. `DashboardSidebar.tsx` — currently shows a blue circle with a User icon
2. The future dashboard overview card (prompt 07) — for now just wire the sidebar

## Steps

### 1. Build the image upload hook

Create `src/hooks/useImageUpload.ts` (or add to an existing hooks file):
- Accepts a `onComplete: (storageId: string) => void` callback
- Calls `generateUploadUrl` mutation to get a pre-signed URL
- POSTs the file to that URL with `Content-Type` from the file
- On success, parses the `storageId` from the response and calls `onComplete`
- Tracks `isUploading` and `error` state
- Validates: JPG, PNG, WEBP only; max 5 MB

### 2. Build `ProfilePhotoUpload` component

Create `src/components/profile/ProfilePhotoUpload.tsx`:
- Renders a circular avatar (48px in sidebar, configurable via size prop)
- If `profile_image_url` is set, shows the image
- If not, shows the existing User icon fallback (keep current sidebar visual)
- Clicking the avatar opens a file input (`<input type="file" accept="image/jpeg,image/png,image/webp">`)
- On file select: validates size (5 MB max), calls the upload hook, then calls the user-preferences mutation with the returned storage URL
- Shows a loading state (spinner overlay on avatar) while uploading
- Shows an error message below the avatar if upload fails
- Does NOT use a separate crop UI (out of scope); square crop happens server-side or is deferred

### 3. Update `DashboardSidebar.tsx`

Replace the current blue circle + User icon with `<ProfilePhotoUpload>` (size="sidebar"):
- When user hovers, show a subtle camera icon overlay to indicate it's clickable
- Keep the existing name/email text below unchanged
- The component handles its own upload state — sidebar does not need to manage it

### 4. Update `convex/users/queries.ts`

Ensure the `getCurrentUser` query (or equivalent used by the sidebar) returns `profile_image_url`. If it selects specific fields, add this field.

### 5. i18n

Add translation keys for:
- `profile.photo.upload` — "Upload photo"
- `profile.photo.uploading` — "Uploading..."
- `profile.photo.error` — "Upload failed. Please try again."
- `profile.photo.remove` — "Remove photo"

Add to both `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts`.

## Acceptance Criteria

- [ ] User can click the avatar in the sidebar to upload a photo
- [ ] Accepted formats: JPG, PNG, WEBP; files >5 MB are rejected with an error message
- [ ] Uploaded photo appears as a circular avatar in the sidebar
- [ ] Default User icon fallback shows when no photo is uploaded
- [ ] Loading spinner overlays avatar during upload
- [ ] `profile_image_url` is persisted in Convex `users` table
- [ ] `npm run typecheck` passes
