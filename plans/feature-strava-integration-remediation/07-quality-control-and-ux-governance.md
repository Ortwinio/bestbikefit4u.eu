# 07 — Quality Control And UX Governance

## Goal

Provide a dedicated quality-control role with explicit sign-off criteria for code quality, product quality, and Prototyper UI usage.

## Special Role

### Quality Control Lead

This role is responsible for rejecting incomplete implementation even when the code "works".

The Quality Control Lead must review:

- data contract consistency
- state naming and action naming
- idempotency and cleanup behavior
- test coverage quality
- UX quality of the Settings flow
- Prototyper UI usage consistency
- accessibility basics

## Required Review Areas

### Code quality

- verify no duplicate logic exists for the same Strava behavior unless justified
- verify helper naming is coherent and precise
- verify no dead query shape remains after sync contract updates
- verify failure handling does not collapse into generic errors

### UX quality

- verify the bike overview is easy to scan
- verify there is a clear primary action
- verify partial failures do not hide successful imports
- verify readiness states help the user understand what to do next

### Prototyper UI quality

- verify local shared UI wrappers are preferred over direct primitive imports where wrappers exist
- verify component composition matches established local UI patterns
- verify status states and selection controls feel consistent with the rest of the dashboard

### Accessibility basics

- verify keyboard access for selection and dialogs
- verify loading and error states are perceivable
- verify controls remain understandable without relying on color alone

## Quality-Control Acceptance Criteria

- [ ] Shared wrappers are used consistently for radio, selectable, button, dialog, and card patterns where available.
- [ ] The Strava settings surface has intentional empty, loading, success, and partial-error states.
- [ ] The overview and import flow are understandable without backend knowledge.
- [ ] The code introduces no known contract mismatch between sync writers and UI readers.
- [ ] Tests cover at least one happy path, one partial-failure path, and one recovery path.
- [ ] A reviewer can explain why each displayed metric exists and where it comes from.

## Quality-Control Success Criteria

- [ ] No major review findings remain open at merge time.
- [ ] The implementation feels native to the existing dashboard rather than like an isolated bolt-on.
- [ ] The Strava flow meets both engineering rigor and product clarity.
