# Feedback Activity Contract

## Goal

Close the audit gap around a too-thin `activityTrail` without turning feedback into generic telemetry.

## Principles

- track only actions that materially help support and admin triage
- keep the vocabulary small and durable
- store entries in a human-readable format that the admin panel can already render
- prefer confirmed user outcomes over speculative intent

## Event Model

Each activity entry remains:

- `action`
- `pathname`
- `timestamp`
- optional `label`

The trail remains bounded to the latest `6` entries in session storage.

## Allowed Actions

Route context:

- `route_view`
- `open_feedback_panel`

High-signal in-page actions:

- `view_fit_results`
- `open_email_report`
- `send_email_report`
- `download_pdf_report`
- `switch_feedback_tab`
- `open_feedback_detail`
- `vote_feature_request`

## Representative Flow Coverage

### Fit results

- viewing the fit results page
- opening the email report dialog
- successfully sending the report by email
- successfully downloading the PDF report

### Feedback hub

- switching between `mine`, `board`, and `changelog`
- opening an existing feedback thread
- voting on a feature request

### Remaining route families

These continue to rely on `route_view` plus `open_feedback_panel`:

- marketing/public pages
- auth pages
- calculators
- pricing/upgrade
- profile/settings
- bikes

This is intentional. The follow-up goal is richer triage context, not full behavioral telemetry.

## Summary Rules

- if recent labeled actions exist, `activitySummary` prefers those labels
- if no labeled actions exist, summary falls back to route movement
- reviews keep a lighter tone than bugs/support cases

## Explicit Non-Goals

- no generic clickstream capture
- no form field keystroke tracking
- no background analytics expansion
- no screenshot/session replay
- no pixel-level cursor or scroll telemetry

## Implementation Evidence

- contract implementation: [feedback-activity.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/feedback-activity.ts)
- fit-results instrumentation: [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/[sessionId]/results/page.tsx)
- feedback-hub instrumentation: [FeedbackHubPage.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/FeedbackHubPage.tsx)
- bounded trail tests: [feedback-activity.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/feedback-activity.test.ts)
