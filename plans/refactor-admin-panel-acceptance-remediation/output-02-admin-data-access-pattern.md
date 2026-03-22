# Admin Data-Access Pattern

## Route Pattern

Use this pattern for admin pages moving off fixtures:

1. **Server route/page**
   - call one Convex admin detail/list query on the server where practical
   - enforce route access through the protected admin layout and route-role map
   - convert raw query results into a route-level view model before rendering

2. **View-model adapter**
   - live under the relevant admin slice, close to the page/client component
   - isolate Convex document shape from UI prop shape
   - normalize dates, derived counts, empty booleans, and display labels

3. **Client action panel**
   - own mutations/actions only
   - use explicit loading, success, and error states
   - surface destructive confirmations with required reason fields where applicable
   - never import fixture arrays as a fallback

4. **Shared feedback conventions**
   - empty state: explicit and domain-specific
   - loading state: tokenized skeleton/placeholder via the shared admin UI layer
   - error state: tokenized error card or inline error block
   - success state: toast or inline confirmation depending on action scope

## Query/Mutation Split

- **List routes** should prefer server-loaded first render plus client-side pagination/filter submission only when needed.
- **Detail routes** should load the full primary entity server-side and keep side-panel actions client-side.
- **Write flows** should stay in client components or dedicated action panels and invalidate/reload the route through navigation refresh or local optimistic state when safe.

## Prohibited Patterns

- no route-level imports of:
  - `src/components/admin/contracts.ts`
  - `src/components/admin/fit/data.ts`
  - `src/components/admin/releases/data.ts`
  - `src/components/admin/users/admin-users-data.ts`
  - `src/components/admin/organizations/admin-organizations-data.ts`
- no hidden “if live query missing, use fixtures” fallback
- no direct consumption of raw Convex docs in large UI trees when a thin adapter can isolate shape drift

## Slice Ownership

- auth/routing concerns remain in:
  - `src/app/(admin)/admin/layout.tsx`
  - `src/app/(admin)/(auth)/admin/login/page.tsx`
  - `src/components/admin/auth/**`
  - `src/proxy.ts`
- domain adapters and action panels belong inside the domain slice under `src/components/admin/<domain>/`
- shared UI helpers belong in `src/components/admin/shared/**` or the main shared UI layer if they are broadly reusable

## Immediate Application Order

1. Overview
2. Users
3. Organizations
4. Rider data
5. Bikes
6. Geometry
7. Fit engine / fit runs / releases
8. Billing / feedback / messages / audit / settings
