# Step 01 — Admin Authentication, Routing & Layout

## Goal

Build the structural foundation of the admin panel: a separate `/admin/login` page, middleware that guards all `/admin/*` routes, an admin-specific sidebar layout, and the role enforcement helper used by all subsequent prompts.

---

## Pre-requisites

- Existing `@convex-dev/auth` setup is working (magic-code email auth)
- Convex schema includes the new `adminRole` field on the `users` table (see `02-schema.md`) — add that field first, or add it as part of this step
- Prototyper UI components are installed

---

## 1. Schema — add `adminRole` to `users`

In `convex/schema.ts`, add to the `users` table:

```ts
adminRole: v.optional(
  v.union(
    v.literal("super_admin"),
    v.literal("ops_admin"),
    v.literal("support_admin"),
    v.literal("fit_specialist"),
    v.literal("geometry_manager"),
    v.literal("billing_admin"),
    v.literal("qa_manager"),
    v.literal("analyst")
  )
),
suspendedAt: v.optional(v.number()),
suspendedReason: v.optional(v.string()),
```

---

## 2. Convex auth helper

Create `convex/admin/authz.ts`:

```ts
import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export type AdminRole =
  | "super_admin"
  | "ops_admin"
  | "support_admin"
  | "fit_specialist"
  | "geometry_manager"
  | "billing_admin"
  | "qa_manager"
  | "analyst";

// Role hierarchy: super_admin can do everything any other role can do.
// Individual roles are checked as needed — most admin pages accept any admin role.
const ROLE_ORDER: AdminRole[] = [
  "super_admin",
  "ops_admin",
  "support_admin",
  "fit_specialist",
  "geometry_manager",
  "billing_admin",
  "qa_manager",
  "analyst",
];

export function isValidAdminRole(role: string): role is AdminRole {
  return ROLE_ORDER.includes(role as AdminRole);
}

type DbCtx = QueryCtx | MutationCtx;

// Require any admin role. Throws if unauthenticated or not an admin.
export async function requireAdminUserId(ctx: DbCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user?.adminRole) throw new Error("Not authorized: admin role required");
  return userId;
}

// Require a specific admin role. super_admin always passes.
export async function requireAdminRole(
  ctx: DbCtx,
  requiredRole: AdminRole
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user?.adminRole) throw new Error("Not authorized: admin role required");
  if (
    user.adminRole !== "super_admin" &&
    user.adminRole !== requiredRole
  ) {
    throw new Error(`Not authorized: requires ${requiredRole}`);
  }
  return userId;
}

// Require any of the listed roles.
export async function requireAnyRole(
  ctx: DbCtx,
  roles: AdminRole[]
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user?.adminRole) throw new Error("Not authorized: admin role required");
  if (
    user.adminRole !== "super_admin" &&
    !roles.includes(user.adminRole)
  ) {
    throw new Error(`Not authorized: requires one of [${roles.join(", ")}]`);
  }
  return userId;
}
```

---

## 3. Convex query — current admin user

Create `convex/admin/queries.ts` with the identity query needed by the server-side admin layout and route boundaries:

```ts
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Returns the current admin user's role, or null if not an admin.
export const getCurrentAdminUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.adminRole) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      adminRole: user.adminRole,
    };
  },
});
```

---

## 4. Next.js middleware update

The existing `src/proxy.ts` handles locale routing and dashboard auth. Extend it to protect `/admin/*` routes.

Add to `src/proxy.ts`:

```ts
// Admin route protection
if (request.nextUrl.pathname.startsWith("/admin")) {
  // Allow /admin/login through without auth
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Middleware only handles coarse unauthenticated redirects.
  // Do not treat middleware as the admin authorization boundary.
  // The actual admin role check must happen server-side in the admin layout
  // and again in every Convex admin function.
  const isAuthenticated = ... // same pattern as the dashboard auth check
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}
```

Read `src/proxy.ts` first, then apply this logic consistently with the existing auth check pattern.

---

## 5. Admin login page

Create `src/app/(admin)/login/page.tsx`.

**Design**: Dark, professional. Use Prototyper UI `Card`, `Input`, `Button`. Show the BestBikeFit4U logo and a clear "Admin" label beneath it. No public-facing branding or marketing text.

**Behavior**: Identical to the rider magic-code login flow (`useAuthActions().signIn("resend", { email })`), but after successful sign-in, redirect to `/admin/overview` instead of `/dashboard`. If the authenticated user does not have `adminRole`, show an error: "This account does not have admin access." and sign out.

**File structure:**
```
src/app/(admin)/login/page.tsx       — login form
src/app/(admin)/layout.tsx           — shared admin layout (see §6)
```

The `(admin)` route group does not have a locale prefix — admin is English-only.

---

## 6. Admin layout

Create `src/app/(admin)/layout.tsx`.

This layout:
1. Wraps all `/admin/*` pages
2. Renders the sidebar and top bar
3. Performs a server-side check of `getCurrentAdminUser` and redirects to `/admin/login` if `null`
4. Optionally passes the resolved admin user/role to child pages via context, but Convex role checks remain authoritative

### Sidebar structure

```
[BestBikeFit4U — Admin]

  Overview

  ── Users & Accounts ──
  Users
  Organizations

  ── Rider Data ──
  Rider Profiles
  Bikes
  Geometry Library

  ── Fit Operations ──
  Fit Engine
  Fit Runs

  ── Commerce ──
  Licenses & Plans
  Subscriptions

  ── Product ──
  Feedback & Support
  Releases
  Dashboard Messages

  ── Analytics ──
  Analytics

  ── System ──
  Audit Log
  Settings

  ──────────────────────
  [Admin avatar + role]
  [Sign out]
```

### Top bar

Shows: current page breadcrumb | role badge | sign-out button

### Styling guidance

- Sidebar background: `var(--sidebar)` or a muted dark surface
- Use the existing Prototyper-style shared layer: `Button`, `Tooltip`, `Card`, and tokenized status pills if a role indicator is needed
- Sidebar nav items use an active state that matches the current route
- Collapse sidebar to icon-only on medium screens; full sidebar on large

---

## 7. Admin overview redirect

Create `src/app/(admin)/page.tsx`:

```ts
import { redirect } from "next/navigation";
export default function AdminRoot() {
  redirect("/admin/overview");
}
```

---

## 8. Overview page stub

Create `src/app/(admin)/overview/page.tsx` with a placeholder:

```tsx
export default function OverviewPage() {
  return (
    <div>
      <h1>Overview</h1>
      <p>Dashboard coming in step 04.</p>
    </div>
  );
}
```

This confirms routing and layout work before building real content.

---

## Acceptance criteria

- [ ] `/admin/login` loads independently with no rider session required
- [ ] Authenticated rider with no `adminRole` sees "no admin access" error on `/admin/login`, not the admin panel
- [ ] Unauthenticated request to `/admin/overview` redirects to `/admin/login`
- [ ] Admin user with valid `adminRole` sees the sidebar layout on all `/admin/*` pages
- [ ] Sidebar links navigate correctly
- [ ] Sign-out returns to `/admin/login`
- [ ] `npm run typecheck` passes
