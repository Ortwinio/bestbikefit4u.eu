# Step 02 — Admin Data Access Layer

## Goal

Create a single consistent live-data pattern for admin pages instead of each route owning ad hoc fixture imports.

## Tasks

1. Define route-facing loader helpers for admin pages:
   - server-side query entry points where appropriate
   - client mutation/action hooks only for interactive write panels
2. Normalize the admin backend contracts in `convex/admin/**` so each domain has:
   - list query
   - detail query
   - write mutations/actions
   - clear role expectations
3. Add typed adapter functions between Convex return shapes and route/view props where the UI should not consume raw documents directly.
4. Remove direct route imports of fixture modules once the corresponding live contract exists.
5. Keep the contract layer small and explicit. No hidden “fake until real” fallbacks.

## Required Output

- a documented admin data-access pattern in the plan README or an output file
- typed helpers under the relevant `src/components/admin/**` slices

## Done When

- Admin routes no longer need to import local fixture arrays to render their primary state.
- Every remaining fixture is temporary by explicit exception, not by default.
