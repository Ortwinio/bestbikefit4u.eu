# Subagent Prompt B — Global Trigger, Provider, And Panel Shell

## Role

You own the app-wide entry system and the right-side feedback panel shell.

## Mission

Implement one canonical feedback entry surface for all non-admin pages using Prototyper UI sheet behavior.

## Read First

- `plans/feature-feedback-panel-redesign/README.md`
- `plans/feature-feedback-panel-redesign/02-global-trigger-and-panel-shell.md`
- `plans/feature-feedback-panel-redesign/07-implementation-roadmap.md`
- existing files under `src/components/feedback/`
- non-admin app layouts/providers that determine global mounting

## Ownership

You own:

- provider/state wiring for the feedback panel
- global floating trigger placement
- shared panel shell
- contextual open API/default type handling

Likely files:

- app layouts/providers
- `src/components/feedback/FeedbackFloatingButton.tsx`
- `src/components/feedback/FeedbackDialog.tsx` or its direct replacement
- feedback shell/provider helpers

You do **not** own:

- backend payload persistence
- `/feedback` hub content
- admin feedback UI

## Required Deliverables

1. Mount a persistent feedback trigger on every non-admin page.
2. Exclude `/admin/*`.
3. Implement one shared feedback panel using Prototyper UI `DialogContent side="right"`.
4. Support contextual open metadata:
   - default type
   - linked session/bike context
   - entry-point metadata
5. Implement smart default type selection for known contexts, while allowing users to change type.
6. Apply the approved welcome copy and tone contract.
7. Ensure the shell is mobile-safe, accessible, and tokenized.

## Constraints

- Use existing shared UI primitives and Prototyper UI patterns.
- No bespoke drawer or modal implementation.
- No hard-coded CSS drift.
- Do not regress existing page layouts.

## Non-goals

- Do not redesign `/feedback` page internals.
- Do not change backend payload semantics.
- Do not add review/history lifecycle rendering here.

## Acceptance Targets For This Prompt

- one panel shell serves all entry points
- trigger is available on all non-admin pages
- the panel matches the approved tone and interaction model
- default-type behavior is useful but not restrictive

## Validation

Run targeted validation for:

- trigger visibility logic
- open/close state behavior
- contextual default-type behavior
- layout safety on representative page types
