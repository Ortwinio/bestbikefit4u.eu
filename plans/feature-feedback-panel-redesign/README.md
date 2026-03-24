# Feedback Panel Redesign And Admin Integration Plan

**Status:** Planning
**Target:** v2 feedback experience
**Owner:** Unassigned
**Last updated:** 2026-03-24

---

## Why This Plan Exists

The repo already contains:

- a user-facing feedback portal at `/feedback`
- a floating feedback trigger tied mainly to dashboard flows
- an admin feedback inbox and detail workflow
- dashboard-message delivery for admin replies

That foundation is useful, but it does not satisfy the new product requirement:

- the blue feedback button must be visible on every page
- clicking it must open a right-side panel, not the current fragmented flow
- the panel must use the existing Prototyper UI library and the same visual language as the page it appears on
- the new panel must replace the old submission flow while preserving the same feedback categories and data capture
- feedback must be fully integrated into the admin workflow and visible follow-up loop

This plan consolidates the strongest parts of:

- `plans/feature-user-feedback-portal/`
- `plans/feature-admin-panel/`
- `plans/refactor-admin-panel-final-closeout/`

and turns them into one execution-ready redesign.

---

## Product Goal

Create one canonical feedback system for BestBikeFit4U:

- a persistent feedback trigger on every non-admin page
- a right-side feedback panel built with Prototyper UI `Dialog` sheet mode
- structured feedback submission for:
  - `bug`
  - `feature_request`
  - `support_case`
  - `review`
- automatic capture of:
  - current URL
  - locale
  - authenticated user identity when available
  - route/page context
  - linked bike / fit session context when available
  - recent user action trail explaining what the user did
  - browser/device metadata where useful
- seamless admin triage, reply, release-linking, and user follow-up

The redesigned system should optimize for three outcomes:

- more feedback submitted from the right moment in the journey
- higher-quality reports with less user effort
- faster admin triage because context is structured and readable

---

## Implementation Roadmap

The implementation should run in six tight phases, each with a clear exit condition and bounded write scope.

### Phase 1 — Contract Freeze And Audit

Goal:
- freeze the payload, UX, copy, and migration contract before code churn starts

Primary outputs:
- audited current-state inventory
- approved submission payload shape
- approved anonymous/authenticated behavior
- approved copy contract
- migration map of old components to new ones

Main files/modules:
- `src/components/feedback/*`
- `src/app/(dashboard)/feedback/page.tsx`
- `convex/feedback/*`
- `src/components/admin/feedback/*`
- i18n feedback copy files

Exit condition:
- there is one unambiguous product and technical contract for implementation

### Phase 2 — Global Trigger And Shared Panel Shell

Goal:
- introduce the app-wide entry point and the new right-side panel shell

Primary outputs:
- global provider
- single floating trigger rendered on all non-admin pages
- Prototyper UI sheet-based feedback panel
- page-aware default type opening behavior

Main files/modules:
- app-level layouts/providers
- `src/components/feedback/FeedbackFloatingButton.tsx`
- `src/components/feedback/FeedbackDialog.tsx` or its replacement
- navigation/path helpers

Exit condition:
- every non-admin page can open the same panel shell

### Phase 3 — Submission Pipeline And Context Capture

Goal:
- make the new panel operational and richer than the old form

Primary outputs:
- final feedback form by type
- route and URL capture
- auth/anonymous context handling
- activity trail capture
- route-family classification
- activity summary
- confirmation state and next-step messaging

Main files/modules:
- `src/components/feedback/*`
- `convex/feedback/mutations.ts`
- schema or supporting utilities if needed

Exit condition:
- submissions from the new panel persist complete, validated, structured context

### Phase 4 — Feedback Hub And User Follow-Up

Goal:
- align `/feedback` and dashboard reply visibility with the new panel-first model

Primary outputs:
- `/feedback` updated as history/status hub
- panel CTA wired into `/feedback`
- clearer lifecycle display
- consistent visibility of admin replies and linked releases

Main files/modules:
- `src/app/(dashboard)/feedback/page.tsx`
- `src/components/feedback/FeedbackHubPage.tsx`
- feedback detail surfaces
- dashboard message surfaces as needed

Exit condition:
- users can submit anywhere and review progress in one consistent place

### Phase 5 — Admin Context And Triage Integration

Goal:
- ensure richer submissions actually improve admin operations

Primary outputs:
- enriched admin inbox/detail loaders
- quick-triage cues
- readable context sections
- preserved reply/release workflow compatibility

Main files/modules:
- `src/components/admin/feedback/*`
- `src/app/(admin)/admin/feedback/*`
- `convex/admin/queries.ts`

Exit condition:
- admin can triage from structured context without reading raw payload dumps

### Phase 6 — Legacy Cleanup, Validation, And Closeout

Goal:
- remove conflicting legacy flows and ship with evidence

Primary outputs:
- legacy flow cleanup
- i18n completion
- targeted tests
- closeout document

Main files/modules:
- legacy feedback entry points
- tests across feedback/admin/layout surfaces
- plan closeout output

Exit condition:
- one canonical feedback flow remains and verification evidence exists

---

## Canonical UX Decisions

### 1. One submission surface

The new right-side panel is the canonical submission entry point.

- It replaces the old submission dialog flow.
- It is opened by the global floating feedback button.
- It can also be opened from contextual inline links such as fit results or settings, but all entry points use the same panel state and component.

### 2. `/feedback` remains, but changes role

`/feedback` remains as the authenticated history/hub page, not as the primary creation flow.

- submission happens in the right-side panel
- `/feedback` becomes the place to review:
  - my submissions
  - admin replies
  - public feature requests / changelog if retained

### 3. App-wide availability

The feedback trigger should appear on every rider-facing and public page.

- include: marketing pages, calculators, auth pages, dashboard pages, fit result pages
- exclude: `/admin/*`

For pages where the user is not signed in:

- the panel is still available
- user context becomes `anonymous`
- optional contact field is shown so follow-up remains possible

This is the main intentional change from the older dashboard-only plan.

### 4. Panel, not popup taxonomy

Use Prototyper UI `DialogContent side="right"` as the implementation primitive.

- do not invent a custom drawer system
- do not create a second feedback modal implementation
- keep styling tokenized and aligned with the current design system

### 5. Replace, do not fork

The existing feedback dialog, floating button, route context helpers, and feedback page should be refactored into the new contract where practical instead of duplicated.

### 6. Friendly product voice

The panel should open with a clear, encouraging message that reinforces the product mission.

Required welcome copy:

> Together we create the BestBikeFit experience. We ride longer, hurt less often, and perform better. Your feedback is food for champions.

Required success copy:

> Thank you for your feedback.

### 7. Tone direction

The feedback experience should feel:

- encouraging, not corporate
- expert, but not clinical
- performance-minded, but still welcoming to beginners
- short, calm, and direct

Copy should avoid:

- generic SaaS phrases like `Your ticket has been created`
- defensive language
- overly technical wording in user-facing surfaces
- guilt-driven requests for feedback

Preferred voice characteristics:

- mission-led
- rider-centered
- confident
- appreciative
- practical

### 8. High-value UX priorities

The following improvements are no longer optional nice-to-haves. They should be treated as core product requirements for the redesign:

- smart page-aware default feedback type
- guided prompts that improve report quality
- lighter review flow
- explicit next-step messaging after submission
- better lifecycle visibility for users after submission
- admin quick-triage cues derived from captured context

---

## Design And Technical Principles

### Prototyper UI usage

- Use the existing `Dialog` component in sheet mode (`side="right"`) for the panel.
- Use existing shared primitives for form controls, tabs, buttons, cards, badges, and empty/loading states.
- No Radix imports.
- No bespoke overlay primitives.

### Styling rules

- No hard-coded visual blue values for the panel shell itself.
- The trigger may remain “blue” only if it is mapped to an existing semantic token or approved brand token.
- No page-specific custom CSS branches unless required for responsive placement.
- Keep overlay/backdrop behavior consistent with the current shared UI rules.

### Data rules

Structured feedback types:

- `bug`
- `feature_request`
- `support_case`
- `review`

Required captured context:

- page URL
- pathname + query
- locale
- authenticated user snapshot when available
- recent user activity trail
- linked bike/session identifiers when available
- browser metadata for bug/support diagnostics

Required quality-improving behavior:

- page-aware default type selection when the entry context is clear
- route-family classification for admin triage
- a concise user-activity summary in addition to the raw bounded event trail when feasible
- lighter data capture and fewer required fields for `review`

Canonical derived fields to define and use consistently:

- `routeFamily`
  - one of: `marketing`, `auth`, `dashboard`, `fit_results`, `calculators`, `profile`, `bikes`, `settings`, `pricing`, `other`
- `activitySummary`
  - short human-readable summary derived from recent interactions when sufficient signals exist
- `contextCompleteness`
  - one of: `low`, `medium`, `high`
  - computed from presence of key context inputs, not by manual admin judgment

### Copy rules

- The opening message should appear near the top of the panel before or alongside type selection.
- The success message must lead the confirmation state.
- Supporting copy should explain value and next steps in plain language.
- Type labels should be human, not internal schema names.
- Empty states should invite action without sounding empty or robotic.
- Admin-facing wording can be more operational, but rider-facing wording must stay warm and clear.

### Admin integration rules

- every submitted item must appear in admin immediately
- admin replies remain thread comments first
- user-visible replies also create rider-visible dashboard notifications
- releases can be linked back to feedback items
- feedback detail should make captured context readable and actionable

---

## Current-State Reuse

The new plan should reuse or evolve these existing areas rather than recreate them:

- `src/components/feedback/FeedbackFloatingButton.tsx`
- `src/components/feedback/FeedbackDialog.tsx`
- `src/components/feedback/FeedbackHubPage.tsx`
- `src/components/feedback/FeedbackDetailDialog.tsx`
- `src/components/feedback/route-context.ts`
- `convex/feedback/queries.ts`
- `convex/feedback/mutations.ts`
- `src/components/admin/feedback/*`
- existing admin reply-to-user notification loop

---

## Scope

### In scope

- global feedback trigger across all non-admin pages
- new right-side feedback panel UX
- migration from old feedback dialog flow
- anonymous + authenticated submission handling
- user action/context capture
- smart defaults and guided prompts
- review-specific lightweight submission experience
- user lifecycle/status clarity after submission
- admin quick-triage summaries
- full i18n coverage
- feedback history/hub alignment with the new panel flow
- admin inbox/detail enhancements for richer captured context
- tests, rollout, and migration clean-up

### Out of scope

- file attachments in this iteration
- email notification campaigns beyond existing dashboard-message loop
- public community forum moderation
- admin panel redesign outside the feedback area

---

## Key Gaps To Solve Explicitly

1. The older portal plan was dashboard-only and authenticated-only.
2. The current system captures route context, but not a deliberate “what the user just did” action trail.
3. The current submission UX is centered on a dialog; the new requirement is a right-side panel on every page.
4. Anonymous/public-page feedback needs a defined contract.
5. The admin detail view needs richer diagnostic context presentation so captured data is actually useful.
6. The current copy is functional but too generic for a premium product experience.

---

## Proposed Architecture

### Frontend

- `FeedbackPanelProvider`
  - global open/close state
  - entry-point metadata
  - default type / linked context support
- `FeedbackPanelTrigger`
  - persistent floating action button
  - rendered once at the app-shell level
- `FeedbackPanel`
  - Prototyper UI `Dialog` with `DialogContent side="right"`
  - multi-step or progressive single-form flow
  - mission-led intro copy
  - friendly success state
  - smart default type behavior
  - guided prompts tuned per feedback type
- `FeedbackActivityTracker`
  - lightweight client event trail collector
  - stores a bounded list of recent interactions
- `FeedbackContextSummarizer`
  - derives a short human-readable summary such as:
    - `User opened fit results, switched bike, then reported an issue with the recommendation output.`
  - used to improve admin triage readability when enough signals exist

### Backend

- extend feedback submission contract to support:
  - anonymous contact fields
  - route metadata
  - user activity trail
  - derived route family
  - concise activity summary when available
  - richer browser/app metadata
- preserve existing feedback item and comment thread model
- keep dashboard notification loop for user-visible replies

### Admin

- enrich admin inbox/detail data loaders
- add readable context sections:
  - page/location
  - reported user
  - what the user did
  - browser/environment
  - linked bike / fit session
- add quick-triage metadata:
  - anonymous vs authenticated
  - route family
  - context completeness
  - likely duplicate signal in a later phase
- retain release linking and reply loop

---

## Work Packages

Each phase should be executable as a bounded work package for one main engineer or one worker agent.

### WP1 — Contract And Schema Readiness

- review current feedback UI/backend/admin implementation
- freeze payload and copy contract
- confirm schema/index changes
- write audit output

Depends on:
- none

### WP2 — App-Wide Trigger And Provider

- add global provider/state
- mount trigger on all non-admin pages
- exclude `/admin/*`
- support contextual open metadata

Depends on:
- WP1

### WP3 — Panel Shell And Tone Implementation

- build sheet UI
- apply approved opening/success copy
- implement smart defaults
- make the shell reusable from all entry points

Depends on:
- WP1, WP2

### WP4 — Submission Form And Context Capture

- implement type-specific form behavior
- implement anonymous/authenticated handling
- capture route metadata, activity trail, route family, summary
- persist backend payload

Depends on:
- WP1, WP3

### WP5 — Feedback Hub Alignment

- update `/feedback`
- replace legacy create CTA behavior
- show clearer lifecycle and replies

Depends on:
- WP4

### WP6 — Admin Feedback Enrichment

- expose new context in queries/loaders
- add triage cues and readable sections
- verify reply and release loop compatibility

Depends on:
- WP4

### WP7 — Cleanup And Validation

- remove obsolete creation paths
- finish i18n
- run tests and build validation
- produce closeout

Depends on:
- WP5, WP6

---

## Acceptance Criteria

The implementation is acceptable only when all criteria below are met.

### Global entry

- [ ] A persistent feedback trigger is visible on the representative non-admin route set:
  - homepage / marketing page
  - auth page
  - calculator page
  - dashboard home
  - profile/settings page
  - bike-related page
  - fit results or recommendation page
- [ ] The trigger placement is responsive and does not obscure key page actions on desktop or mobile.
- [ ] Clicking the trigger opens a right-side panel, not the old modal flow.
- [ ] Contextual page entry points reuse the same panel component and state model.

### Panel UX

- [ ] The panel uses Prototyper UI `Dialog` sheet behavior and shared primitives.
- [ ] The panel visually matches the current page system and does not introduce bespoke hard-coded CSS.
- [ ] The panel includes the required mission-led welcome message when users open it.
- [ ] The panel supports `bug`, `feature_request`, `support_case`, and `review`.
- [ ] The panel can preselect a sensible default feedback type when opened from a known context.
- [ ] The panel uses guided prompts that help users explain what they were trying to do and what happened instead.
- [ ] The `review` flow is lighter and more appreciative than the issue-reporting flows.
- [ ] Validation is inline and type-specific.
- [ ] Successful submission shows a confirmation state without forcing route navigation.
- [ ] The confirmation state includes the required message: `Thank you for your feedback.`
- [ ] Rider-facing copy follows the approved tone direction and avoids generic support-ticket phrasing.

### Data capture

- [ ] Every submission stores current URL and route metadata.
- [ ] Authenticated submissions store current user identity context.
- [ ] Unauthenticated submissions store anonymous context and optional contact details.
- [ ] The system captures a bounded “what the user did” event trail.
- [ ] The system stores `routeFamily` using the canonical enum defined by this plan.
- [ ] Where feasible, the system derives `activitySummary`.
- [ ] The system stores `contextCompleteness` using the canonical enum defined by this plan.
- [ ] Bike/session context is attached when available.
- [ ] Browser metadata is captured for `bug` and `support_case` flows where needed.

Minimum payload evidence required at closeout:

- authenticated `bug`
- authenticated `feature_request`
- authenticated `review`
- anonymous `support_case`

### User follow-up

- [ ] `/feedback` remains available as the authenticated history/status surface.
- [ ] Users can see their own feedback items and visible admin replies.
- [ ] Replies sent from admin remain visible via the rider dashboard message system and the owned feedback detail surface.
- [ ] After submission, users see a short explanation of what happens next.
- [ ] `/feedback` shows the lifecycle label set in user-facing language for applicable items:
  - received
  - under review
  - planned
  - in progress
  - shipped

### Admin integration

- [ ] New submissions appear in the admin inbox immediately.
- [ ] Admin detail shows page, user, action trail, environment, and linked entity context clearly.
- [ ] Admin inbox/detail shows quick-triage cues such as route family and context completeness.
- [ ] Admins can triage, assign, reply, and link releases using the existing admin workflow.
- [ ] Non-internal replies remain visible to the reporting user.

### Quality

- [ ] English and Dutch strings are complete.
- [ ] Accessibility expectations are defined for keyboard, focus trap, and screen-reader labels.
- [ ] Tests cover route-level integration, submission contract, admin visibility, and regression on the old flow removal.
- [ ] `npm run typecheck` passes.

### Closeout Evidence

Closeout must include an explicit scorecard mapping each acceptance criterion to one or more of:

- test evidence
- route/layout verification
- payload/query evidence
- UI screenshot/manual verification note
- code reference

---

## Success Criteria

Success criteria are outcome-based, not just implementation-based.

### Product success

- users can discover feedback easily from the representative non-admin route set
- the submission flow uses one canonical panel instead of fragmented entry surfaces
- reviews, bugs, support, and feature ideas each have distinct user-facing form behavior
- users see explicit next-step guidance after submission

### Operational success

- admin detail exposes page, route family, context completeness, and activity context without requiring raw payload inspection for core triage
- route family, activity summary, and context completeness are visible immediately in admin surfaces
- support replies and release links continue to close the loop back to the user

### Delivery success

- the old fragmented creation flow is retired without breaking history or admin processing
- the new panel is the only canonical submission surface
- validation passes and the closeout document records implemented scope, tradeoffs, and deferred items

---

## Risks And Decisions To Confirm During Execution

- Whether anonymous users may submit all four feedback types, or only `bug`, `support_case`, and `review`
- Whether “what the user did” should be stored as a plain text summary, structured event list, or both
- Whether the trigger should be hidden on especially sensitive flows like payment checkout if those routes exist
- Whether public review submissions should stay in the same table as operational feedback or branch internally by subtype

---

## Additional Product Improvements Worth Including

These are strong enhancements because they make feedback more actionable without changing the core architecture.

### 1. Smart page-aware defaults

When the panel opens from a known context, preselect the most likely type:

- fit results page: `bug` or `support_case`
- pricing or upgrade surface: `support_case`
- roadmap or feature context: `feature_request`

This reduces friction without hiding the type selector completely.

### 2. “What were you trying to do?” helper

Add a short guided prompt near the description field:

- `What were you trying to do?`
- `What happened instead?`

This will improve report quality more than adding more fields.

### 3. Inline screenshot support as a later phase

Not in the first implementation, but worth planning for structurally. Bugs become much easier to triage with one image.

### 4. Severity only where it helps

Do not show severity for every feedback type.

- keep it for `bug`
- consider optional urgency for `support_case`
- do not burden `review` with operational fields

### 5. Follow-up expectation setting

After submission, clarify what happens next in one short sentence, for example:

- the team reviews it
- replies appear in the dashboard
- released fixes can be linked back to the item

### 6. Admin quick-triage cues

Add structured badges or summaries in admin for:

- anonymous vs authenticated
- high-context vs low-context submissions
- route family such as calculator, dashboard, profile, fit result

This helps support and product teams sort faster.

### 7. Duplicate detection hints

For feature requests and common bugs, surface likely duplicate suggestions in admin and optionally in the user flow later.

### 8. Review-specific handling

`review` should feel appreciative and lighter than a bug report.

Recommended differences:

- shorter form
- optional public quote consent in a future phase
- possible routing to marketing/content workflow instead of only support triage

### 9. Better close-loop visibility for users

Inside `/feedback`, show a clearer lifecycle:

- received
- under review
- planned
- shipped

This makes the system feel alive and increases trust.

### 10. Rate-limit and abuse protection for anonymous flows

If public-page submission is allowed, the implementation should include:

- basic rate limiting
- spam mitigation
- minimal honeypot or bot checks if needed

This is a product requirement disguised as an engineering detail.

---

## Recommended Prioritization

These additions should be prioritized in this order:

### Must include in the first implementation wave

- smart page-aware defaults
- guided prompts
- review-specific lighter flow
- follow-up expectation setting after submission
- clearer feedback lifecycle in `/feedback`
- admin quick-triage cues

### Strong second-wave candidates

- duplicate detection hints in admin
- anonymous-flow abuse hardening beyond baseline
- screenshot support

### Later-phase enhancements

- public quote consent for reviews
- richer product analytics on feedback themes
- semi-automated clustering of related issues

---

## Success Criteria

- The application has one clear, modern, reusable feedback entry pattern.
- The old fragmented flow is removed without losing historical data or admin capability.
- Admin receives better context than before, not just more submissions.
- Users can report issues from anywhere and later see that the loop was closed.
