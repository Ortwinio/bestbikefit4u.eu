# Plan: Admin Panel Integration into Dashboard

## Goal

Integrate the admin panel into the dashboard environment so that `super_admin` users can access all admin pages through the standard dashboard layout — using the same left sidebar, the same visual shell, and without a separate login step.

## Background

Currently the admin panel lives at `/admin/*` and has:
- A **separate iron-session auth cookie** (`admin-session.ts`) requiring a second login at `/admin/login`
- Its own full-page shell (`AdminShell`) with a dedicated left sidebar (`AdminNavBlock`) and top header bar
- 6 navigation groups and 17+ sub-items defined in `admin-navigation.ts`
- Admin role information already stored on the Convex `users` table (`user.adminRole`)

The dashboard sidebar (`DashboardSidebar.tsx`) already conditionally renders a plain-link admin section for `super_admin` users, but it renders directly in the dashboard shell — which is then discarded when navigating to `/admin/*` because the admin layout takes over.

The result is a disjointed experience: two separate sidebars, two sessions, two visual contexts.

## Scope

**In scope:**
- Collapsible Admin section in the dashboard sidebar (visible only for `super_admin`)
- Admin pages render within the dashboard layout (same left sidebar, no separate AdminShell)
- Auth consolidated to Convex user role (`adminRole === "super_admin"`) — no more separate iron-session login
- Admin sub-items styled consistently with existing dashboard nav items
- The sidebar admin section uses the same groups and items as `admin-navigation.ts`

**Out of scope:**
- Redesigning admin page content (the actual page bodies stay the same)
- Adding new admin features
- Changing admin roles other than `super_admin` (plan targets `super_admin` only for dashboard integration — other roles can be added later)
- Admin panel mobile drawer (handled by dashboard's own mobile approach)

## Approach

### Phase 1 — Collapsible Admin section in DashboardSidebar

Add an expandable/collapsible "Admin" section at the bottom of the nav (above the website links). It:
- Only renders when `user.adminRole === "super_admin"`
- Has a toggle button styled like a nav item (icon + label + chevron)
- On click, expands to show admin sub-items grouped by their existing groups from `admin-navigation.ts`
- Sub-item links use the same `rounded-lg px-3 py-2` active/inactive styling as other nav items
- State (open/closed) is stored in `useState` — no persistence needed
- Active detection: an admin sub-item is active when `internalPathname.startsWith(item.href)`

### Phase 2 — Admin pages under the dashboard layout

Move admin pages into the `(dashboard)` route group so they inherit the dashboard layout (sidebar + content area):

```
src/app/(dashboard)/admin/         ← new location
  layout.tsx                       ← role-gate only (Convex query), no AdminShell
  overview/page.tsx
  users/page.tsx
  ... (all current admin pages)
```

The per-page content components (`UserDetailClient`, etc.) stay untouched. Only the route structure and layout change.

The `(admin)` route group can be kept briefly for redirect compatibility, then removed.

### Phase 3 — Consolidate auth

Replace the separate iron-session admin auth gate with a Convex-based server component check:

```tsx
// src/app/(dashboard)/admin/layout.tsx
const user = await fetchQuery(api.users.queries.getCurrentUser);
if (user?.adminRole !== "super_admin") redirect("/dashboard");
```

This removes:
- `src/components/admin/auth/admin-session.ts`
- `src/components/admin/auth/admin-request.ts`
- `src/app/(admin)/(auth)/admin/login/page.tsx`
- `src/components/admin/auth/AdminLoginForm.tsx`
- `ADMIN_SESSION_SECRET` env var dependency

The admin roles system (`admin-auth-shared.ts`, `admin-route-access.ts`) can be kept for future multi-role support but the login gate is removed.

### Phase 4 — Remove standalone AdminShell

Once admin pages run inside the dashboard layout:
- Remove `AdminShell` and `AdminNavBlock` from `AdminShell.tsx`
- Remove `AdminUi.tsx` admin page header component references to the shell (keep shared primitives: `AdminTable`, `AdminMetricCard`, `AdminSectionCard`, etc.)
- Remove the `(admin)` route group entirely

## Acceptance Criteria

- [ ] `super_admin` users see a collapsed "Admin" section in the dashboard sidebar
- [ ] Clicking "Admin" toggles the section open/closed
- [ ] All admin sub-items are visible when expanded, grouped as in `admin-navigation.ts`
- [ ] Active admin page highlights the correct sub-item in the sidebar
- [ ] Non-admin users see no admin section in the sidebar
- [ ] Navigating to any `/admin/*` page shows the dashboard layout (no AdminShell)
- [ ] Non-admin users navigating directly to `/admin/*` are redirected to `/dashboard`
- [ ] No separate admin login page is shown — access flows entirely through the dashboard session
- [ ] Admin page content renders correctly (no visual regressions)
- [ ] TypeScript and lint checks pass

## Key Files

| File | Change |
|------|--------|
| `src/components/layout/DashboardSidebar.tsx` | Replace plain admin links with collapsible section |
| `src/components/admin/layout/admin-navigation.ts` | Reuse (no change needed) |
| `src/app/(dashboard)/admin/layout.tsx` | New: role-gate via Convex |
| `src/app/(dashboard)/admin/*/page.tsx` | Move from `(admin)` group |
| `src/app/(admin)/` | Remove after migration |
| `src/components/admin/auth/admin-session.ts` | Remove |
| `src/components/admin/auth/admin-request.ts` | Remove |
| `src/components/admin/auth/AdminLoginForm.tsx` | Remove |
| `src/components/admin/layout/AdminShell.tsx` | Remove shell; keep shared primitives |
