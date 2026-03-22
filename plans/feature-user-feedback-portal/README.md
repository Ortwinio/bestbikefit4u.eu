# User Feedback Portal — Feature Plan

**Status:** Planning
**Target:** v1
**Owner:** Unassigned
**Last updated:** 2026-03-22

---

## Plan Assessment

### Strengths

- Clear product goal: feedback submission, self-service tracking, voting, changelog, and admin-to-user messaging
- Good scope boundary for v1
- Reasonable phased breakdown across backend, submission UX, feedback hub, and dashboard message delivery

### Quality gaps found

1. **Contract drift across files**
   - `README.md` refers to `markMessageRead` while `04-dashboard-messages.md` uses `dismissMessage` and `acknowledgeMessage`
   - `README.md` references `/feedback/new`, while step 02 is modal-first and step 03 uses `/feedback` with an inline dialog
   - Step 01 mentions `getPublicFeedbackComments`, but the implementation prompt uses `getPublicFeedbackDetail`

2. **Backend prompt is underspecified and partly unsafe**
   - Several example queries assume indexes/fields that may not exist, without a verification step
   - `getFeatureBoard` fetches all upvotes and filters them in memory instead of querying by user directly
   - Upvote toggling updates counters optimistically without calling out concurrency/consistency expectations
   - Message receipt mutations are only partially described and do not clearly define idempotency rules

3. **UI plan lacks explicit state and navigation decisions**
   - The plan mixes “floating modal everywhere” with “submit page route” without deciding which is canonical
   - Detail view behavior is vague: slide-over, sheet, dialog, or separate route are all mentioned interchangeably
   - There is no explicit empty/loading/error behavior matrix for the major tabs

4. **Acceptance criteria are too high-level**
   - They do not define auth boundaries, visibility rules, vote toggle behavior, message receipt persistence, or release filtering precisely
   - They do not include accessibility, mobile behavior, or regression guardrails

5. **No test plan**
   - There is no coverage map for schema, queries, mutations, component states, and route integration

---

## Goal

Give authenticated dashboard users a first-class way to:

- submit bug reports, feature requests, and support questions
- track their own submissions and visible admin replies
- upvote open feature requests
- read product changelog entries tied to shipped feedback items
- receive targeted admin messages in the dashboard shell

---

## Product Scope

### In scope (v1)

- Dashboard-only feedback entry points:
  - persistent floating feedback button
  - sidebar/mobile-nav link to `/feedback`
- Submission dialog supporting:
  - `bug`
  - `feature_request`
  - `support_case`
- Context capture:
  - current dashboard path
  - linked fit session when relevant
  - linked bike when relevant
  - browser metadata for bug reports
- `/feedback` hub page with three authenticated tabs:
  - My Submissions
  - Feature Requests
  - Changelog
- Feature-request voting with per-user toggle semantics
- Feedback detail view for the reporting user
- Dashboard message rendering:
  - banners
  - dashboard home cards
  - single modal-once experience
- Full English and Dutch i18n coverage

### Out of scope (v1)

- User replies back into feedback threads
- Email notifications
- File attachments
- Search/filtering beyond default sorting
- Public unauthenticated feedback board/changelog
- Moderation tooling changes beyond user-facing receipt/dismiss flows

---

## Canonical UX Decisions

- **Single canonical submission flow:** modal dialog launched from the floating button and from `/feedback`
- **No `/feedback/new` route in v1**
- **Canonical detail presentation:** inline detail sheet/dialog opened from My Submissions
- **Authenticated only:** all feedback, board, changelog, and message UI lives inside `(dashboard)`

---

## Existing Backend Assumptions To Verify In Step 01

Before implementation, verify the actual schema, indexes, and exported server functions for:

- `feedback_items`
- `feedback_comments`
- `releases`
- `release_items`
- `dashboard_messages`
- `message_receipts`
- `message_targets`
- existing feedback submission mutation
- existing current-user message query

If existing indexes do not support the planned access patterns, Step 01 must add the minimum required indexes before implementing queries.

---

## Required Backend Additions

### New table

`feedback_upvotes`

Purpose:
- enforce one vote per user per feature request
- support toggle behavior
- avoid storing denormalized voter IDs on the feedback item

### Required queries

- `feedback.queries.getMyFeedback`
  - authenticated user only
  - returns the user’s own items ordered by newest first
  - includes visible comment count and linked release summary when applicable

- `feedback.queries.getFeatureBoard`
  - authenticated user only
  - returns only open feature requests
  - includes `hasUpvoted` for the current user
  - sorted by `upvoteCount desc`, then `updatedAt desc`

- `feedback.queries.getPublicFeedbackDetail`
  - authenticated reporter only
  - returns one owned feedback item
  - includes only non-internal comments
  - includes linked release summary if present

- `releases.queries.getPublicReleases`
  - authenticated user only
  - returns only `rolling_out` and `live` releases
  - excludes internal releases
  - includes linked shipped feedback items of type `feature_request`

### Required mutations

- `feedback.mutations.upvoteFeedbackItem`
  - feature requests only
  - toggles vote on/off
  - idempotent for repeated clicks
  - keeps `upvoteCount` consistent with `feedback_upvotes`

- `messages.mutations.dismissMessage`
  - records a dismiss/read-style receipt for dismissible banners/cards
  - idempotent

- `messages.mutations.acknowledgeMessage`
  - records one-time modal acknowledgement
  - idempotent

---

## User-Facing Data Rules

### Visible feedback statuses

| Internal status | User label | Visible in My Submissions | Visible on Feature Board |
|---|---|---:|---:|
| `new` | Received | Yes | Yes |
| `triaged` | Under review | Yes | Yes |
| `needs_info` | Needs info | Yes | Yes |
| `planned` | Planned | Yes | Yes |
| `in_progress` | In progress | Yes | Yes |
| `in_qa` | Testing | Yes | Yes |
| `released` | Released | Yes | No |
| `closed` | Closed | Yes | No |
| `declined` | Not planned | Yes | No |

### Visible comments

- Only `feedback_comments.isInternal = false`
- Only for the reporting user in v1

### Visible releases

- `status in {"rolling_out", "live"}`
- `type !== "internal"`

---

## Routes

```text
/feedback
  tab=mine         My submissions
  tab=board        Feature requests
  tab=changelog    Changelog
```

No standalone create route in v1.

---

## Implementation Sequence

| Step | File | Outcome |
|---|---|---|
| 01 | `01-backend.md` | Schema/index verification, vote table, user-facing queries, receipt mutations |
| 02 | `02-feedback-form.md` | Feedback dialog, validation, floating trigger, context capture, i18n |
| 03 | `03-feedback-page.md` | `/feedback` page, tabs, detail sheet, nav integration |
| 04 | `04-dashboard-messages.md` | Banner/card/modal delivery, dismiss/acknowledge behavior |

---

## Acceptance Criteria

### Submission flow

- [ ] An authenticated dashboard user can open the feedback dialog from any dashboard page via a persistent floating button.
- [ ] The dialog supports `bug`, `feature_request`, and `support_case`.
- [ ] Required fields are validated before submission.
- [ ] Bug reports capture current path and browser metadata.
- [ ] Session and bike context are pre-filled when available from the current page state.
- [ ] Successful submission transitions to a confirmation state without leaving the current page.
- [ ] Reopening the dialog starts from a clean state unless an explicit default type is passed.

### Feedback hub

- [ ] `/feedback` is reachable from the dashboard sidebar and mobile navigation.
- [ ] My Submissions shows only the authenticated user’s own feedback items.
- [ ] My Submissions maps internal statuses to the agreed user-facing labels.
- [ ] Selecting a submission reveals its full detail and only non-internal admin replies.
- [ ] Released submissions show linked release metadata when available.

### Feature board

- [ ] The Feature Requests tab shows only open feature requests.
- [ ] Items are sorted by `upvoteCount desc`, then `updatedAt desc`.
- [ ] The current user sees whether they have upvoted each item.
- [ ] Clicking vote once adds a vote; clicking again removes it.
- [ ] Vote state persists after reload.

### Changelog

- [ ] The Changelog tab shows only `rolling_out` and `live` releases.
- [ ] Internal releases are excluded.
- [ ] Each release renders release notes and linked shipped feature-request items.

### Dashboard messages

- [ ] Dismissible banners render across dashboard pages and persist dismissal.
- [ ] Sticky/safety banners render without dismiss controls.
- [ ] Dashboard home cards render in the home page only.
- [ ] A modal message is shown once until acknowledged.
- [ ] Dismissed or acknowledged messages do not reappear after reload.

### Cross-cutting quality

- [ ] All new UI strings are present in English and Dutch.
- [ ] New UI follows the existing Prototyper UI/tokenized styling approach.
- [ ] Keyboard and screen-reader access is preserved for dialog, tabs, buttons, and dismiss controls.
- [ ] `npm run typecheck` passes.
- [ ] Relevant unit/integration tests from `TESTPLAN.md` are implemented and passing.

---

## Delivery Risks

- Schema/index drift versus plan assumptions
- Receipt semantics may already exist under different names in `messages`
- Optimistic voting UI can drift if the mutation contract is not explicit
- Modal delivery can become noisy if message targeting and acknowledgement are not carefully scoped

---

## Test Plan

See [TESTPLAN.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-user-feedback-portal/TESTPLAN.md).
