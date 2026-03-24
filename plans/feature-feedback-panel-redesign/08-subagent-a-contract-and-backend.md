# Subagent Prompt A — Contract, Schema, And Backend Pipeline

## Role

You own the feedback submission contract and backend pipeline for the redesigned feedback system.

## Mission

Turn the feedback redesign plan into a concrete backend contract that supports the new global panel flow, richer context capture, anonymous handling, and admin-ready data.

## Read First

- `plans/feature-feedback-panel-redesign/README.md`
- `plans/feature-feedback-panel-redesign/03-context-capture-and-submission-pipeline.md`
- `plans/feature-feedback-panel-redesign/07-implementation-roadmap.md`
- existing files under `convex/feedback/`
- relevant schema sections in `convex/schema.ts`

## Ownership

You own:

- `convex/feedback/*`
- feedback-related schema additions in `convex/schema.ts`
- backend-facing helpers for route family / context summary if they belong server-side
- backend tests for feedback submission/query contracts

You do **not** own:

- global trigger mounting
- feedback panel shell UI
- `/feedback` page UI
- admin feedback UI rendering

## Required Deliverables

0. Produce `plans/feature-feedback-panel-redesign/output-01-contract-audit.md` covering:
   - schema decisions
   - copy-contract implications for backend payloads
   - migration decisions
   - canonical definitions for `routeFamily`, `activitySummary`, and `contextCompleteness`
1. Freeze and implement the submission payload contract for:
   - `bug`
   - `feature_request`
   - `support_case`
   - `review`
2. Support:
   - authenticated user submissions
   - anonymous submissions with optional contact details
3. Persist:
   - full URL
   - pathname/query
   - locale
   - linked bike / fit session when present
   - route family
   - bounded activity trail
   - concise activity summary when derivable
   - browser/environment metadata where appropriate
4. Keep payloads privacy-safe and size-bounded.
5. Preserve compatibility with the admin feedback inbox and user follow-up queries.
6. Add targeted tests for the new contract.

## Constraints

- Reuse the current feedback model where practical.
- Do not break existing admin feedback flows.
- Do not add speculative fields with no UI or operational purpose.
- The code must stay readable and type-safe.

## Non-goals

- Do not add attachment support.
- Do not redesign rider-facing copy or shell layout.
- Do not redesign admin workflow semantics.

## Acceptance Targets For This Prompt

- backend supports the full new payload contract
- anonymous and authenticated submissions are both safe and valid
- context fields are queryable by downstream UI
- tests prove validation, persistence, and privacy bounds

## Validation

Run targeted tests for the files you change and report:

- what changed
- what was intentionally deferred
- what downstream UI assumptions your work now enables
- exact payload examples for:
  - authenticated bug
  - authenticated feature request
  - authenticated review
  - anonymous support case
