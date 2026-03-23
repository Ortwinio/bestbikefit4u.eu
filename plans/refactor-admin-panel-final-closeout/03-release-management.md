# Step 03: Release Management

## Objective

Complete release management as a real admin workflow instead of a partially wired backend surface.

## Tasks

1. Add release creation from the admin UI.
2. Add release detail actions for linking/unlinking feedback items directly from the release surface.
3. Define and enforce valid release-status transitions.
4. Complete `notifyRelease` so it can notify affected users, not just create a general announcement.
5. When a release moves to `live`, update linked feedback items to `released`.
6. Decide whether release announcements should link users to rider-facing content rather than `/admin/releases/[id]`.
7. Add tests for:
   - create release
   - link feedback
   - go live transition
   - linked feedback auto-update
   - affected-user notification fan-out

## Done When

- releases can be created and managed from admin UI
- moving a release to `live` performs the expected linked updates and notifications
