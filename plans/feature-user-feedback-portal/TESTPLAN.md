# User Feedback Portal — Test Plan

## Test Strategy

Cover the feature at four levels:

1. Backend contract tests for schema-dependent queries and mutations
2. Component tests for dialog, tab, and message rendering behavior
3. Integration tests for `/feedback` and dashboard layout wiring
4. Manual verification for mobile, accessibility, and localization

---

## Automated Coverage

### A. Backend query/mutation tests

Targets:

- `getMyFeedback`
- `getFeatureBoard`
- `getPublicFeedbackDetail`
- `getPublicReleases`
- `upvoteFeedbackItem`
- `dismissMessage`
- `acknowledgeMessage`

Cases:

- returns only current user submissions
- excludes internal comments from public detail
- feature board excludes `released`, `closed`, and `declined`
- feature board returns `hasUpvoted` correctly for current user
- upvote mutation creates a vote on first click
- upvote mutation removes the vote on second click
- upvote counter remains correct after toggle
- release query excludes internal and non-public statuses
- dismiss/acknowledge mutations are idempotent

### B. Component tests

Targets:

- `FeedbackDialog`
- `FeedbackFloatingButton`
- feedback tab switcher
- vote button
- dashboard banner/card/modal components

Cases:

- floating button opens dialog
- dialog skips type selection when `defaultType` is provided
- field validation blocks invalid submit
- success state renders after successful submission
- dialog resets state after close/reopen
- vote button reflects voted/unvoted styling
- dismissible messages invoke the correct callback
- non-dismissible messages hide dismiss controls

### C. Integration tests

Targets:

- dashboard layout
- dashboard home
- `/feedback`

Cases:

- floating feedback trigger is present on dashboard pages
- `/feedback` is reachable via sidebar/mobile navigation
- My Submissions / Feature Requests / Changelog tabs render expected data states
- dashboard home renders message cards only there
- message modal appears once and disappears after acknowledgement

---

## Manual Test Matrix

### Submission flow

- Open feedback dialog from dashboard home, bike detail, fit results, and settings
- Submit one bug, one feature request, and one support question
- Verify page path and contextual bike/session metadata are captured when relevant

### Voting

- Vote on an open feature request
- Reload page and verify vote persists
- Vote again to remove it
- Reload page and verify removal persists

### Changelog

- Verify only `rolling_out` and `live` releases are visible
- Verify internal releases are hidden
- Verify shipped feature-request items display under releases

### Dashboard messages

- Banner dismiss persists across reload
- Sticky/safety banners are not dismissible
- Dashboard cards appear on dashboard home and not on unrelated dashboard pages
- Modal acknowledgement prevents repeat display

### Accessibility

- Keyboard open/close for feedback dialog
- Keyboard tab switching on `/feedback`
- Focus management when modal/sheet opens and closes
- Screen-reader labels for vote, dismiss, and feedback trigger controls

### Localization

- Verify all new strings in English
- Verify all new strings in Dutch
- Verify locale-aware links route correctly to localized dashboard paths

### Appearance

- Verify new UI in light mode
- Verify new UI in dark mode
- Verify `system` theme follows OS appearance
- Verify no hard-coded light-only colors were introduced in new components

---

## Exit Criteria

- `npm run typecheck` passes
- relevant automated tests added for backend and UI behavior
- manual checks completed for localization, accessibility, and theme behavior
- no critical auth, visibility, or message-receipt regressions remain
