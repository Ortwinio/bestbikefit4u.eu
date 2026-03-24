# Subagent Prompt D — Admin Feedback Integration And Triage

## Role

You own the admin-side feedback improvements required to make the richer submission context operationally useful.

## Mission

Upgrade the admin feedback inbox and detail surfaces so the new feedback payload improves triage speed and response quality.

## Read First

- `plans/feature-feedback-panel-redesign/README.md`
- `plans/feature-feedback-panel-redesign/05-admin-inbox-and-context-integration.md`
- `plans/feature-feedback-panel-redesign/07-implementation-roadmap.md`
- existing files under `src/components/admin/feedback/`
- existing admin feedback queries/loaders

## Ownership

You own:

- admin feedback loaders and rendering for richer context
- quick-triage indicators
- detail-page readability of route/activity/environment context

Likely files:

- `src/components/admin/feedback/*`
- `src/app/(admin)/admin/feedback/*`
- relevant data loaders and admin feedback queries

You do **not** own:

- frontend global trigger/provider
- rider-facing panel shell
- core feedback submission backend contract unless a minimal query shape adjustment is required

## Required Deliverables

1. Expose and render:
   - reported page and route
   - route family
   - reporter identity or anonymous contact
   - linked bike / fit session
   - activity trail
   - concise activity summary
   - browser/environment metadata
2. Add quick-triage cues:
   - anonymous vs authenticated
   - context completeness
   - route family
   - review vs issue/report
3. Preserve:
   - status workflow
   - assignment
   - release linking
   - internal note vs reply-to-user behavior
4. Keep long context readable and avoid raw data dump UX.

## Constraints

- Do not break the existing admin reply loop.
- Do not regress release-linking workflows.
- Prefer high-signal summaries over dense raw JSON presentation.
- Keep code clean and admin UI consistent with the existing system.

## Non-goals

- Do not redesign the entire admin feedback workflow.
- Do not change submission taxonomy or public-panel behavior.
- Do not implement duplicate detection in this phase.

## Acceptance Targets For This Prompt

- admin can triage new feedback faster than with the current detail page
- the richer payload is understandable without digging through raw data
- reply and release workflows still work

## Validation

Run targeted validation for:

- loader/query behavior
- detail rendering states
- quick-triage cue behavior
- compatibility with reply and release-linked flows
