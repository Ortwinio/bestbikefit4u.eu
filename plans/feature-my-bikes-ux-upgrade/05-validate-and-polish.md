# 05 — Validate and Polish the My Bikes UX Upgrade

## Goal

Verify the redesigned page works functionally and visually, and remove any obsolete UX paths left behind by the refactor.

## Tasks

1. Run `npm run typecheck`.
2. Run relevant page/component tests if present.
3. Check the My Bikes page in mobile and desktop layouts.
4. Confirm:
   - bike fitting card renders correctly
   - advised tyre pressure card renders correctly
   - current setup card renders correctly
   - current tyre pressure/setup card renders correctly
   - edit and delete still work
   - no "Calculate pressure" button remains on this page
5. Remove or refactor obsolete helper components if they are no longer the right abstraction for the page.

## Acceptance Criteria

- [ ] Typecheck passes
- [ ] Relevant tests pass or are updated
- [ ] No obsolete pressure CTA remains on My Bikes page
- [ ] The redesigned bike cards read clearly on mobile and desktop
- [ ] Any dead helper paths are cleaned up or intentionally retained
