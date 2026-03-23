# Admin Panel Final Closeout Plan

**Status:** Implemented
**Target:** Close the remaining admin-panel acceptance and product gaps

## Goal

Bring the admin panel from "mostly implemented" to "acceptance-complete" by fixing the remaining backend, workflow, and UI-system gaps discovered in the March 23, 2026 audit.

## Why This Plan Exists

The current admin surface is substantial, but it is not fully aligned with the acceptance criteria in `plans/feature-admin-panel/README.md`.

The key unresolved issues are:

- admin auth is separated by route and role-gating, but still shares the rider auth/session stack
- direct user messages created from user detail are not published and therefore do not reach the dashboard
- admin feedback replies do not generate dashboard notifications
- release management is incomplete as an end-to-end admin workflow
- release lifecycle automation is incomplete
- fit-run trace detail does not expose output payloads and warnings
- geometry supports add/version, but not record editing
- popup-style messaging and translucent overlays conflict with the stricter panel UX requirement
- there are still a few hard-coded overlay/shadow values and a shared table-markup defect

## Scope

### In scope

- Admin auth boundary hardening
- Dashboard-to-admin entry validation
- Message delivery fixes
- Feedback reply notification loop
- Release creation/detail workflow completion
- Release automation completion
- Fit-run trace enrichment
- Geometry record editing
- Popup/overlay policy cleanup
- Hard-coded CSS cleanup in the admin surface
- Validation and acceptance closeout

### Out of scope

- Full billing-provider reconciliation
- True impersonation-session architecture beyond current token stub replacement unless required by auth hardening
- New analytics/reporting modules not already part of the admin plan

## Acceptance Targets

- `super_admin` retains a dashboard entry into the admin surface
- direct admin messages to a user are actually delivered in the rider dashboard
- admin feedback replies reach the user in an explicit dashboard-visible way
- release records can be created, linked, progressed, and notified from the admin UI
- moving a release to `live` updates linked feedback state and notification flows correctly
- fit-run detail shows inputs, engine version, outputs, warnings, and confidence
- geometry records support add, edit, and version flows with change reason
- admin panel does not depend on modal/popup message types or translucent admin overlays if the UX policy remains strict
- no admin-panel-specific hard-coded black overlay/shadow styling remains
- validation passes with typecheck, targeted tests, and focused page-flow coverage

## Execution Order

1. `01-auth-and-entry.md`
2. `02-messages-and-feedback-loop.md`
3. `03-release-management.md`
4. `04-fit-run-traceability.md`
5. `05-geometry-editing.md`
6. `06-ui-conformance-and-overlay-cleanup.md`
7. `07-validation-and-acceptance-closeout.md`

## Risks

- Clarifying whether "separate admin authentication" means separate session infrastructure or only separate route + authorization remains necessary before final signoff
- Clarifying whether "no popup screens" forbids all dialogs or only admin-facing modal workflows is necessary before removing every dialog pattern
- Fit output/warning data may require wiring from additional tables if `fitSessions` is not the source of truth

## Success Criteria

- Every remaining partial or incomplete acceptance item is either implemented or explicitly re-scoped with product signoff
- The admin panel no longer contains hidden "looks implemented but does not actually deliver" flows
- The repo contains a fresh acceptance closeout document backed by current verification evidence

## Closeout

Acceptance evidence is recorded in `output-acceptance-closeout.md`.
