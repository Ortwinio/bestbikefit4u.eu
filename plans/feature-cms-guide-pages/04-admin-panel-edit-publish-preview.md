# Prompt 04 — Admin panel: edit form, publish/unpublish, preview, and redirect manager

## Context

Prompt 03 built the guide list and create form. This prompt adds the edit flow, publish/unpublish controls, preview, and the redirect management UI.

Read the plan README before starting. Complete Prompts 01, 02, and 03 first.

## Goal

1. Edit an existing guide (all fields, any status)
2. Admin can publish and unpublish
3. Editors and admins can preview draft content before publishing
4. Slug changes on published guides auto-create redirects
5. Admin can view and manage redirects

## What to implement

### 1. Edit guide form

**Route:** `/admin/guides/[id]/edit`

The edit form is identical to the create form (same three-tab layout, same fields) with these additions:

- All existing field values pre-filled from the DB record
- Status badge shown in page header (draft / in_review / published / unpublished)
- Publish button visible in form actions (admin only; hidden for editors)
- Unpublish button visible when status is `published` (admin only)
- "Submit for review" button visible when status is `draft` (editors and admins)
- "Request changes" button visible when status is `in_review` (admin only — reverts to draft)
- Auto-save on field blur is optional (v2); in v1 explicit "Save" is sufficient
- "Last saved" timestamp shown below save button

**Slug change behavior (edit form):**
- If guide status is `published` and slug is changed:
  - Show confirmation dialog: "This guide is published. Changing the slug will create a 301 redirect from `{oldPath}` to `{newPath}`. Confirm?"
  - On confirm: call `changeSlug` mutation (creates redirect + updates slug)
  - On cancel: revert slug field to original value
- If guide status is `draft` or `unpublished`: slug can be changed freely (no redirect created)
- Slug field is editable only by admins for published guides; editors see it as read-only when published

### 2. Publish and unpublish

**Publish:**
- Admin clicks "Publish" button
- System checks: H1 must be filled (hard block — show error if missing)
- System shows confirmation: "Publish this guide? It will be visible on the public site immediately."
- On confirm: calls `publishGuide` mutation
- On success: status badge updates to "Published", `publishedAt` shown in Settings tab

**Unpublish:**
- Admin clicks "Unpublish" button
- System shows confirmation: "Unpublish this guide? It will be removed from the public site."
- On confirm: calls `unpublishGuide` mutation
- On success: status badge updates to "Unpublished"

Both actions must show a toast notification on success and error.

### 3. Preview

**Preview API route:** `src/app/api/preview/route.ts`

- Accepts `?secret={token}&id={guideId}`
- Validates the secret token (use a `PREVIEW_SECRET` env variable)
- Enables Next.js draft mode (`draftMode().enable()`)
- Redirects to the guide's public URL
- The guide page template must check `draftMode().isEnabled` and, if true, call `getDraftGuide({ id })` instead of `getPublishedGuide({ slug })`

**Preview button in admin form:**
- "Preview" button in the form actions opens `/api/preview?secret={PREVIEW_SECRET}&id={guideId}` in a new tab
- Button is disabled for unsaved changes (shows tooltip: "Save first to preview")

**Exit preview API route:** `src/app/api/preview-exit/route.ts`
- Calls `draftMode().disable()`
- Redirects to the public guide URL
- A banner on the public page in preview mode should show: "Preview mode — this is a draft. [Exit preview]"

### 4. Redirect manager

**Route:** `/admin/guides/redirects`

**Layout:**
- Page header: "Redirects" + "Add redirect" button (admin only)
- Table: from path, to path, status code, created by, created at, reason, delete button
- "Add redirect" opens a form: from (text), to (text), status code (301/302 select), reason (optional text)
- Delete button: shows confirmation, then soft deletes

**Data:** uses `listRedirects` Convex query from Prompt 01

Auto-created redirects (from slug changes) appear in this list with reason: "Auto-created: slug changed from {oldSlug}"

## Validation

- Edit an existing guide and verify all fields update correctly
- Publish a guide and verify it appears on the public site
- Unpublish a guide and verify the public URL returns 404
- Change a published guide's slug and verify the old URL 301-redirects to the new URL
- Preview a draft guide (should show draft content, not the published version)
- Exit preview and verify the public page shows published content again
- Verify editors cannot publish (button not shown)
- Verify editors cannot change slug of a published guide
- Verify redirect manager shows all redirects and admin can delete one
- `npx tsc --noEmit` must pass
