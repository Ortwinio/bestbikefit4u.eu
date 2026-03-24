# Output 01 — Contract Audit

**Date:** 2026-03-24
**Status:** Approved for implementation

## Current State

Existing reusable pieces:

- `src/components/feedback/FeedbackDialog.tsx`
- `src/components/feedback/FeedbackFloatingButton.tsx`
- `src/components/feedback/FeedbackHubPage.tsx`
- `src/components/feedback/FeedbackDetailDialog.tsx`
- `convex/feedback/mutations.ts`
- `convex/feedback/queries.ts`
- `src/components/admin/feedback/FeedbackViews.tsx`

Current gaps:

- feedback is still dashboard-centric instead of global
- current flow supports only `bug`, `feature_request`, `support_case`
- current flow requires authentication for submission
- there is no canonical `routeFamily`
- there is no stored `activitySummary`
- there is no stored `contextCompleteness`
- admin context rendering is not rich enough for the new plan

## Approved Type Taxonomy

- `bug`
- `feature_request`
- `support_case`
- `review`

## Anonymous Submission Contract

Anonymous users may submit:

- `bug`
- `support_case`
- `review`
- `feature_request`

Rules:

- `userId` remains optional
- anonymous contact fields are optional but supported
- admin UI must clearly distinguish anonymous from authenticated reports

## Canonical Derived Fields

### `routeFamily`

Enum:

- `marketing`
- `auth`
- `dashboard`
- `fit_results`
- `calculators`
- `profile`
- `bikes`
- `settings`
- `pricing`
- `other`

### `activitySummary`

Definition:

- short human-readable summary derived from recent interactions when enough signals exist
- empty/undefined when the system cannot derive a useful summary safely

### `contextCompleteness`

Enum:

- `low`
- `medium`
- `high`

Definition:

- computed from the amount of useful structured context attached to the item
- must not depend on manual admin judgment

Suggested baseline computation:

- `high`
  - URL/path present
  - route family present
  - non-empty description
  - at least one of: linked entity, activity trail, browser metadata, activity summary, user/contact context
- `medium`
  - URL/path present
  - non-empty description
  - at least one additional context signal
- `low`
  - otherwise

## Schema Decisions

`feedback_items` should be extended to support:

- `type = "review"`
- `pageUrl`
- `pathname`
- `queryString`
- `locale`
- `routeFamily`
- `activitySummary`
- `contextCompleteness`
- `activityTrailJson`
- `browserInfoJson`
- anonymous contact fields
  - `contactEmail`
  - `contactName`

Keep existing fields where still useful:

- `pagePath`
- `linkedSessionId`
- `linkedBikeId`
- `expectedResult`
- `actualResult`
- `category`

## Copy Decisions

Required welcome copy:

`Together we create the BestBikeFit experience. We ride longer, hurt less often, and perform better. Your feedback is food for champions.`

Required success copy:

`Thank you for your feedback.`

Tone:

- warm
- concise
- rider-centered
- practical
- no support-ticket phrasing

## Migration Decisions

- the right-side panel becomes the only canonical creation flow
- `/feedback` remains as the history/status hub
- old create behavior in the current feedback dialog must be refactored, not duplicated
- admin reply and release-linking workflows stay intact

## Worker Handoff Notes

- Worker A owns provider/trigger/shell mounting
- Worker B owns payload/schema/query/mutation contract
- Worker C owns rider-facing copy, form behavior, and `/feedback`
- Worker D owns admin inbox/detail enrichment
- integration must preserve unrelated in-progress admin route restructuring in the working tree
