# Feedback Audit Closeout Plan

**Status:** Implemented
**Target:** Close the remaining non-blocking feedback audit gaps
**Owner:** Codex
**Last updated:** 2026-03-24

---

## Why This Plan Exists

The feedback redesign has been implemented, validated, and independently audited.

Current state:

- implementation is complete
- `npm run typecheck` passes
- targeted feedback/admin tests pass
- `npm run build:vercel` passes
- independent audit recommendation is `ship with known gaps`

The remaining gaps are non-blocking but real:

1. the recorded `activityTrail` is still too narrow and mostly reflects route history
2. accessibility and responsive non-obstruction evidence exists only indirectly, not explicitly

This follow-up plan closes those gaps in a bounded way without reopening the whole feedback redesign.

---

## Goal

Bring the feedback redesign from `ship with known gaps` to a stronger closeout state by:

- capturing more useful in-page user actions before feedback submission
- explicitly validating accessibility and trigger/panel layout behavior
- producing a final evidence-backed closeout

---

## Scope

### In scope

- richer feedback activity tracking
- targeted instrumentation of key user actions
- explicit accessibility validation for the feedback panel
- explicit non-obstruction validation for the floating trigger
- final audit-closeout evidence

### Out of scope

- full product analytics
- session replay
- screenshot uploads
- broader redesign of unrelated feedback or admin flows
- generalized telemetry infrastructure beyond what this feedback flow needs

---

## Audit Gaps To Close

### Gap 1 — Narrow activity trail

Current activity tracking only captures:

- `route_view`
- `open_feedback_panel`

That is useful, but weaker than the intended “what the user did” contract.

### Gap 2 — Indirect accessibility and layout evidence

The implementation uses good shared primitives, but the current validation does not explicitly prove:

- keyboard flow
- focus behavior
- close behavior
- accessible labels
- non-obstruction of important page actions on representative screens

---

## Desired End State

After this plan:

- the feedback payload includes a more meaningful recent action trail for key flows
- the admin feedback detail page shows more useful “what happened” context
- accessibility expectations are backed by explicit tests or verification artifacts
- floating trigger placement is backed by explicit evidence on representative routes
- the audit closeout can credibly move beyond the remaining “known gaps”

---

## Implementation Strategy

### Principle 1 — Track only high-signal actions

Do not instrument everything.

Track a small set of actions that materially improve support and triage, such as:

- opening fit results
- switching bike context
- starting a fit flow
- submitting or navigating key calculator steps
- opening pricing/upgrade surfaces
- entering settings/profile flows

### Principle 2 — Keep tracking bounded and understandable

- no raw event flood
- no opaque telemetry blob
- use a small event vocabulary
- keep the trail readable in admin

### Principle 3 — Prove UX quality explicitly

Do not rely on “shared component probably handles it.”

Add explicit validation for:

- trigger visibility rules
- keyboard open/close flow
- focus movement expectations
- non-obstruction checks on representative layouts

---

## Execution Order

1. `01-activity-tracking-contract.md`
2. `02-activity-instrumentation.md`
3. `03-accessibility-and-layout-validation.md`
4. `04-final-closeout.md`

---

## Acceptance Criteria

- [ ] The activity trail records more than route history for at least the key feedback-relevant flows.
- [ ] The activity trail remains bounded and human-readable.
- [ ] The admin detail view can show the richer trail without turning into raw telemetry noise.
- [ ] Explicit accessibility evidence exists for the feedback panel interaction flow.
- [ ] Explicit evidence exists that the floating trigger does not obstruct key actions on representative route types.
- [ ] A final closeout artifact maps these gaps to concrete proof.

---

## Success Criteria

- the independent audit’s remaining medium/low gaps are materially reduced or eliminated
- support/admin can infer what the user was doing more reliably than before
- UX quality claims are backed by evidence, not assumption
- no regression is introduced in the current feedback flow

---

## Risks

- over-instrumenting the product and turning the trail into noisy telemetry
- adding brittle tests that validate implementation details instead of behavior
- introducing layout assertions that are too tied to current pixel values

---

## Success Definition

This work is successful if the feedback redesign can be re-audited with no meaningful remaining closeout gaps beyond future nice-to-have product enhancements.

## Outputs

- [output-01-activity-contract.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-feedback-audit-closeout/output-01-activity-contract.md)
- [output-02-final-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-feedback-audit-closeout/output-02-final-closeout.md)
