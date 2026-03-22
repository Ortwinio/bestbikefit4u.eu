# User Feedback Portal — Feature Plan

**Status:** Planning
**Target:** v1

---

## Goal

Give users a first-class way to submit bugs and feature requests, track the status of their own submissions, upvote feature requests from other users, and see what's coming next and what's already been released.

---

## Background

The backend is already fully built:

- `feedback_items` table — types: `bug`, `feature_request`, `support_case`; full status lifecycle from `new` through `released`
- `feedback_comments` table — threaded replies with `isInternal` flag (admin-only comments are hidden from users)
- `releases` table — status lifecycle `draft` → `rolling_out` → `live`; `releaseNotes` field
- `release_items` — links releases to feedback items (feature requests that shipped in a release)
- `dashboard_messages` — admin-to-user messages; `getMyMessages` query exists
- `submitFeedback` mutation — public, already wired

What does **not** exist yet: any user-facing UI for any of the above.

---

## Scope

### In scope (v1)

- **Feedback button** — persistent, accessible from anywhere in the dashboard (floating button or sidebar link)
- **Submit form** — bug report and feature request forms; smart context capture (current page, linked fit session / bike)
- **My submissions** — list of the user's own feedback items with live status badges
- **Feature request board** — public list of open feature requests with upvote button; sorted by votes
- **Changelog** — public-facing list of `live` and `rolling_out` releases with release notes
- **Dashboard messages** — render admin messages (banners, inbox cards) in the dashboard layout
- **i18n** — all strings in English and Dutch

### Out of scope (v1)

- Threaded user replies on feedback items (admin can reply; user sees it, but can't reply back)
- Email notifications when status changes
- Filtering / search on the feature board
- Voting on bugs (vote = `feature_request` only)
- Rich text / attachments in submissions

---

## Routes

```
/feedback                    → tabbed page: My Submissions | Feature Board | Changelog
/feedback/new                → submission form (type pre-selectable via ?type=bug|feature_request)
```

The Changelog and Feature Board tabs are public within the dashboard (any authenticated user).

---

## Backend additions needed

All tables exist. The following queries and mutations are missing:

| What | Where | Notes |
|---|---|---|
| `getMyFeedback` query | `convex/feedback/queries.ts` | User's own items, ordered by `createdAt` desc |
| `getFeatureBoard` query | `convex/feedback/queries.ts` | Public feature requests with `status ∈ {new, triaged, planned, in_progress}`, sorted by `upvoteCount` desc |
| `getPublicReleases` query | `convex/releases/queries.ts` | Releases with `status ∈ {rolling_out, live}`, ordered by `liveAt` desc; includes linked feedback items |
| `upvoteFeedbackItem` mutation | `convex/feedback/mutations.ts` | Increments `upvoteCount`; idempotent per user (needs `feedback_upvotes` join table or a user-vote field) |
| `getPublicFeedbackComments` query | `convex/feedback/queries.ts` | Non-internal comments on a feedback item; for "admin replied" thread |

### Upvote idempotency

Add a new table `feedback_upvotes`:
```ts
feedback_upvotes: defineTable({
  feedbackItemId: v.id("feedback_items"),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_item", ["feedbackItemId"])
  .index("by_user_item", ["userId", "feedbackItemId"])
```

The `upvoteFeedbackItem` mutation checks `by_user_item` before incrementing `upvoteCount`. A second call from the same user removes their vote (toggle).

---

## Data visible to users

### Feedback item status labels

| Internal status | User-facing label |
|---|---|
| `new` | Received |
| `triaged` | Under review |
| `needs_info` | We need more info |
| `planned` | Planned |
| `in_progress` | In progress |
| `in_qa` | Testing |
| `released` | Released |
| `closed` | Closed |
| `declined` | Not planned |

### Releases visible to users

Only `status = "rolling_out"` or `status = "live"` releases are shown. Releases of `type = "internal"` are hidden from users.

### Comments visible to users

Only `feedback_comments` with `isInternal = false` are shown. These represent admin replies or status update notes written for the reporter.

---

## Dashboard messages integration

The `getMyMessages` query already exists. It needs to be wired into the dashboard layout so messages appear:

- **`banner`** type → sticky bar at the top of the main content area
- **`inbox_card`** type → card in a notification area on the dashboard home page
- **`release_announcement`** type → highlighted card on the dashboard home page or the Changelog tab
- **`modal`** type → shown once on next login (dismissed on close, suppressed after)

Messages require a `markMessageRead` / `dismissMessage` mutation to record receipts.

---

## UI layout

### `/feedback` page — tabbed

```
┌── My Submissions ── Feature Requests ── Changelog ──┐
│                                                      │
│  [+ Submit feedback]                  (button, top right)
└──────────────────────────────────────────────────────┘
```

### My Submissions tab

```
┌─────────────────────────────────────────────────────┐
│  🐛 Dashboard crashes on Safari         [Received]  │
│  2 days ago · Bug                                   │
├─────────────────────────────────────────────────────┤
│  ✨ Import bikes from Strava           [Released ✓] │
│  3 weeks ago · Feature request                      │
│  Released in: v1.4 Strava Integration               │
└─────────────────────────────────────────────────────┘
```

Clicking an item opens a slide-over or detail page showing:
- Full description
- Current status + status history (if admin has left comments)
- Admin replies (non-internal comments only)

### Feature Requests tab

```
┌─────────────────────────────────────────────────────┐
│  ▲ 47   Import bikes from Strava          [Planned] │
│  ▲ 23   Dark mode for fit results      [In progress]│
│  ▲ 12   Export fit results to PDF        [Received] │
│  ▲  8   Zwift integration               [Received]  │
└─────────────────────────────────────────────────────┘
```

Upvote button: filled/highlighted if the user has already voted. Toggle on click.

### Changelog tab

```
┌─────────────────────────────────────────────────────┐
│  v1.4 — Strava Integration           [Live] Mar 2026│
│  Connect your Strava account to import bikes and    │
│  sync your riding profile...                        │
│  Ships: Import bikes from Strava  ✓                 │
│         Strava profile photo import  ✓              │
├─────────────────────────────────────────────────────┤
│  v1.3 — Geometry Library             [Live] Jan 2026│
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

### Feedback submission form

Step 1 — choose type:
- Bug report
- Feature request
- Support question

Step 2 — form fields (vary by type):

**Bug report:**
- Title (required)
- What happened? (required)
- What did you expect to happen?
- Page/feature affected (pre-filled from `window.location.pathname`)
- Link to fit session (optional — if on a fit results page, pre-fill)

**Feature request:**
- Title (required)
- Describe the feature (required)
- Why would this help your fitting? (optional)

**Support question:**
- Subject (required)
- Question (required)

Step 3 — confirmation screen with link to My Submissions.

### Floating feedback button

A fixed `?` or `💬` button in the bottom-right corner of every dashboard page. Opens the submission form modal without navigating away.

---

## Navigation

Add to the sidebar and mobile nav:

```
Feedback & changelog       (link to /feedback)
```

Place it between Settings and Sign out.

---

## Implementation prompts

| # | File | What it implements |
|---|---|---|
| 01 | `01-backend.md` | Schema addition (`feedback_upvotes`), all missing queries and mutations |
| 02 | `02-feedback-form.md` | Submission form component, floating feedback button, i18n |
| 03 | `03-feedback-page.md` | `/feedback` tabbed page: My Submissions, Feature Board, Changelog |
| 04 | `04-dashboard-messages.md` | Dashboard message rendering (banners, inbox cards, modals), dismiss/read mutations |

---

## Acceptance criteria

- [ ] User can submit a bug report from any dashboard page via the floating button
- [ ] User can submit a feature request from any dashboard page
- [ ] Submission pre-fills page path and links to a fit session when relevant
- [ ] My Submissions shows all the user's items with correct status labels
- [ ] Feature board shows all open feature requests sorted by upvote count
- [ ] Upvoting is idempotent — clicking twice removes the vote
- [ ] Changelog shows all `live` and `rolling_out` releases with release notes
- [ ] Released feature requests show which release they shipped in
- [ ] Admin replies (non-internal comments) are visible to the reporter
- [ ] Dashboard messages render in the layout (banners, inbox cards, modals)
- [ ] Sidebar and mobile nav include the Feedback link
- [ ] i18n strings complete in English and Dutch
- [ ] `npm run typecheck` passes
