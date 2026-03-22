# Step 03 — `/feedback` Hub Page, Detail View, and Navigation

## Goal

Build the authenticated feedback hub page and connect it into dashboard navigation.

---

## Route

Create:

- `src/app/(dashboard)/feedback/page.tsx`

No `/feedback/new` route in v1.

---

## Deliverables

### 1. Page shell

The page must provide:

- title + subtitle
- primary “Submit feedback” button
- tab switcher for:
  - My Submissions
  - Feature Requests
  - Changelog

### 2. My Submissions tab

Data source:

- `api.feedback.queries.getMyFeedback`

Required states:

- loading
- empty
- populated
- query failure fallback if the app has a standard pattern for it

Item requirements:

- user-facing type label
- user-facing status label
- created date
- linked release summary when applicable
- visible admin reply count when present

### 3. Detail view

Provide a consistent detail surface for a selected submission:

- side sheet on desktop or dialog on mobile is acceptable
- full description
- actual/expected result fields when present
- linked release metadata when present
- non-internal admin replies only

### 4. Feature Requests tab

Data source:

- `api.feedback.queries.getFeatureBoard`

Required states:

- loading
- empty
- populated

Interaction requirements:

- vote button with current count
- highlighted state when the user has voted
- optimistic toggle UI with rollback on mutation failure

### 5. Changelog tab

Data source:

- `api.releases.queries.getPublicReleases`

Required states:

- loading
- empty
- populated

Release card requirements:

- release name/version
- release status badge
- release notes
- shipped linked feature requests only

### 6. Navigation integration

Add `/feedback` to:

- dashboard sidebar
- mobile dashboard navigation
- protected-path routing helpers if required by the current i18n/navigation system

---

## Acceptance criteria

- [ ] `/feedback` is accessible from dashboard navigation
- [ ] Page contains a primary submit CTA and tab switcher
- [ ] My Submissions shows only the current user’s items
- [ ] Detail view shows only user-safe fields and non-internal comments
- [ ] Feature board supports optimistic vote toggling
- [ ] Changelog shows only public releases
- [ ] Empty/loading states exist for all three tabs
- [ ] i18n strings are complete in English and Dutch
- [ ] `npm run typecheck` passes

