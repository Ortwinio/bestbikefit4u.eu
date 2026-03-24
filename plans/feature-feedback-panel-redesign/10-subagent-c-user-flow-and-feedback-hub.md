# Subagent Prompt C — User Submission Flow And `/feedback` Hub

## Role

You own the rider-facing feedback form experience inside the panel and the `/feedback` follow-up surface.

## Mission

Make the new feedback flow feel friendly, useful, and coherent from submission through follow-up.

## Read First

- `plans/feature-feedback-panel-redesign/README.md`
- `plans/feature-feedback-panel-redesign/03-context-capture-and-submission-pipeline.md`
- `plans/feature-feedback-panel-redesign/04-feedback-hub-and-user-follow-up.md`
- `plans/feature-feedback-panel-redesign/07-implementation-roadmap.md`
- existing files under `src/components/feedback/`
- `src/app/(dashboard)/feedback/page.tsx`

## Ownership

You own:

- type-specific rider-facing form behavior
- prompts and microcopy in the feedback flow
- confirmation state and next-step messaging
- `/feedback` page alignment with the new panel-first model
- lifecycle/status clarity for user-facing feedback history

Likely files:

- rider-facing form body components under `src/components/feedback/`
- `src/components/feedback/feedback-copy.ts`
- `src/components/feedback/FeedbackHubPage.tsx`
- `src/components/feedback/FeedbackDetailDialog.tsx`
- `src/app/(dashboard)/feedback/page.tsx`

You do **not** own:

- backend schema/mutations
- app-wide provider mounting and shell-state architecture
- admin feedback detail UI

## Required Deliverables

1. Implement type-specific form behavior for:
   - `bug`
   - `feature_request`
   - `support_case`
   - `review`
2. Use guided prompts such as:
   - what were you trying to do
   - what happened instead
   - what would have made this better
3. Keep `review` lighter and more appreciative than issue-reporting flows.
4. Use the approved welcome and success copy.
5. After submit, clearly explain what happens next.
6. Update `/feedback` so it acts as the history/status hub, not a competing create flow.
7. Show a clearer lifecycle and preserve visibility of admin replies and linked releases.

## Constraints

- Rider-facing copy must stay warm, concise, and premium.
- Avoid corporate ticketing language.
- Do not increase field count unless it meaningfully improves quality.
- Respect the backend contract defined by the backend owner.

## Non-goals

- Do not change app-wide trigger placement logic.
- Do not change admin workflow semantics.
- Do not add attachments or public quote consent in this phase.

## Acceptance Targets For This Prompt

- users can submit richer feedback with less friction
- `/feedback` clearly shows status and follow-up
- the redesign feels like one system, not a shell plus an old page

## Validation

Run targeted validation for:

- type-specific form rendering/validation
- confirmation state messaging
- `/feedback` lifecycle visibility
- reply/release visibility in owned feedback surfaces
