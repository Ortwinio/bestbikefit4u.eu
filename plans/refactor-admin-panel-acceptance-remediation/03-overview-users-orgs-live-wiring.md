# Step 03 — Overview, Users, And Organizations

## Goal

Satisfy the first business-critical acceptance criteria with real data and real writes.

## Tasks

1. Wire `/admin/overview` to `convex/admin/queries.getOverviewStats`.
2. Remove `src/components/admin/fit/data.ts` from the overview route.
3. Wire `/admin/users` to live search/filter/pagination using `listUsers`.
4. Wire `/admin/users/[userId]` to `getUserDetail`.
5. Replace placeholder user actions with live flows:
   - change tier
   - suspend / restore
   - set admin role
   - send direct dashboard message
   - impersonation start
6. Wire `/admin/organizations` and `/admin/organizations/[orgId]` to live list/detail data and member management.
7. Add destructive confirmations and audit-log success feedback for relevant writes.

## Done When

- Overview is no longer mock-driven.
- Users and organizations satisfy the acceptance criteria for live search/filter/detail/actions.
