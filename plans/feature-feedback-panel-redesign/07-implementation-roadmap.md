# Step 07 — Tight Implementation Roadmap

## Objective

Translate the feedback redesign plan into a delivery sequence that can be implemented and delegated with minimal ambiguity.

## Delivery Sequence

### Milestone 1 — Freeze The Contract

Scope:
- audit current feedback surfaces
- freeze copy, payload, anonymous handling, migration path

Must deliver:
- current-state audit output
- payload contract
- schema delta list
- copy contract

Cannot slip:
- taxonomy of feedback types
- app-wide availability rules
- anonymous-submission rules

### Milestone 2 — Land The Global Entry System

Scope:
- provider
- trigger
- panel shell
- page-aware defaults

Must deliver:
- one shared panel shell on all non-admin pages
- contextual open API
- no duplicate drawer/modal implementations

Cannot slip:
- `/admin/*` exclusion
- mobile-safe trigger placement
- Prototyper UI sheet usage

### Milestone 3 — Land Submission And Context

Scope:
- form logic
- validation
- backend persistence
- activity/context capture

Must deliver:
- `bug`, `feature_request`, `support_case`, `review`
- route metadata
- user/anonymous context
- activity trail and route family
- success state with next-step messaging

Cannot slip:
- privacy bounds
- payload validation
- lighter review flow

### Milestone 4 — Align User-Facing Follow-Up

Scope:
- `/feedback` update
- status lifecycle visibility
- reply/release visibility

Must deliver:
- panel-first `/feedback` CTA behavior
- clearer submission lifecycle
- preserved reply visibility

Cannot slip:
- owned-feedback visibility rules
- user-safe detail rendering

### Milestone 5 — Align Admin Operations

Scope:
- admin loaders
- detail UI
- triage cues

Must deliver:
- page context
- activity summary
- context completeness cue
- route-family cue

Cannot slip:
- current reply workflow compatibility
- release link compatibility

### Milestone 6 — Retire Legacy And Validate

Scope:
- remove old creation paths
- finalize i18n
- test and close out

Must deliver:
- one canonical creation flow
- targeted test evidence
- closeout document

Cannot slip:
- no conflicting legacy create UX
- no missing EN/NL strings

## Delegation Map

### Worker A — Frontend Entry And Panel

Owns:
- provider
- trigger
- panel shell
- contextual opening API

Write scope:
- app layouts/providers that mount the global trigger
- `src/components/feedback/FeedbackFloatingButton.tsx`
- `src/components/feedback/FeedbackDialog.tsx` or direct replacement shell file
- provider/open-state helpers created specifically for the shell

Protected surfaces:
- do not redesign `/feedback`
- do not change admin feedback UI
- do not alter backend payload shape except by coordination with Worker B

Required tests:
- trigger visibility on representative route set
- panel open/close behavior
- contextual default-type behavior

### Worker B — Submission Contract And Backend

Owns:
- form contract
- payload validation
- backend mutation/query changes
- context capture serialization

Write scope:
- `convex/feedback/*`
- feedback submission utilities
- schema-related adjustments if needed

Protected surfaces:
- do not redesign rider-facing panel shell
- do not redesign admin UI
- do not introduce attachments in this phase

Required tests:
- submission validation by type
- anonymous/authenticated payload persistence
- route family / activity summary / context completeness behavior

### Worker C — User Feedback Hub

Owns:
- `/feedback`
- status lifecycle rendering
- reply and release visibility alignment

Write scope:
- `src/app/(dashboard)/feedback/page.tsx`
- `src/components/feedback/FeedbackHubPage.tsx`
- related detail surfaces

Protected surfaces:
- do not change global trigger mounting
- do not change backend schema contract
- do not redesign admin workflow semantics

Required tests:
- `/feedback` lifecycle rendering
- owned feedback reply visibility
- panel CTA behavior from `/feedback`

### Worker D — Admin Feedback Integration

Owns:
- admin loaders
- inbox/detail UI
- quick-triage surfaces

Write scope:
- `src/components/admin/feedback/*`
- `src/app/(admin)/admin/feedback/*`
- relevant admin queries/loaders

Protected surfaces:
- do not redesign rider-facing flow
- do not change feedback submission taxonomy
- do not change reply/release semantics

Required tests:
- admin loader/query rendering states
- quick-triage cue rendering
- reply and release compatibility checks

### Integrator

Owns:
- cross-cutting copy consistency
- trigger mounting correctness across layouts
- cleanup of obsolete flows
- final validation

Required outputs:
- `output-01-contract-audit.md`
- final closeout scorecard mapping each acceptance criterion to evidence

## Acceptance Gate

The roadmap is complete only if all of the following are true:

1. A user can open the new panel from any non-admin page.
2. The panel uses Prototyper UI sheet behavior and approved tone.
3. The panel supports all four required feedback types.
4. The submission payload includes useful context, not just free text.
5. `/feedback` clearly shows what happened after submission.
6. Admin can triage with route, activity, and completeness context.
7. The old creation flow is retired.
8. Validation evidence exists.

## Verification Checklist

- `npm run typecheck`
- targeted `vitest` for:
  - feedback panel open/close behavior
  - form validation by type
  - context capture serialization
  - `/feedback` lifecycle rendering
  - admin context rendering
  - reply loop continuity
- focused route/layout coverage for trigger visibility on representative public and dashboard pages

## Final Success Definition

This work is successful if:

- the feedback entry experience feels intentional and premium
- users submit higher-quality feedback with less effort
- admins need fewer follow-up questions to understand what happened
- the application now has one clear feedback flow instead of several competing ones
