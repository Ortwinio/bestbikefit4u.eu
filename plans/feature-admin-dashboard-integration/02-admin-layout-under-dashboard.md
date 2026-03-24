# Prompt 02 — Move Admin Pages Under the Dashboard Layout

## Context

Admin pages currently live at `src/app/(admin)/admin/` with their own layout (`AdminShell`). The goal is to move them under `src/app/(dashboard)/admin/` so they inherit the dashboard layout (left sidebar + main content area) instead of the standalone admin shell.

Read the plan README before starting: `plans/feature-admin-dashboard-integration/README.md`

## Task

### Step 1 — Create the admin layout under dashboard

Create `src/app/(dashboard)/admin/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.users.queries.getCurrentUser, {}, { token });

  if (user?.adminRole !== "super_admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
```

This replaces the iron-session admin session gate with a Convex-based role check. The dashboard's own `ConvexAuthNextjsServerProvider` already ensures the user is authenticated before reaching this layout.

### Step 2 — Move admin page files

Move the content from `src/app/(admin)/admin/` to `src/app/(dashboard)/admin/`.

Do this for all admin pages:
- `overview/page.tsx`
- `users/page.tsx`, `users/[userId]/page.tsx`
- `bikes/page.tsx`
- `geometry/page.tsx`, `geometry/[recordId]/page.tsx`, `geometry/brands/[brandId]/models/[modelId]/page.tsx`
- `fit-engine/page.tsx`, `fit-engine/[versionId]/page.tsx`
- `fit-runs/page.tsx`, `fit-runs/[sessionId]/page.tsx`
- `feedback/page.tsx`, `feedback/feature-requests/page.tsx`
- `releases/page.tsx`, `releases/[releaseId]/page.tsx`, `releases/calendar/page.tsx`
- `licenses/page.tsx`
- `subscriptions/page.tsx`
- `messages/page.tsx`
- `audit/page.tsx`
- `settings/page.tsx`
- `organizations/page.tsx`
- `rider-data/page.tsx`

For each page file: copy the file content verbatim. The page components themselves do not need to change — they use `AdminPageHeader`, `AdminSectionCard`, etc. from `AdminUi.tsx`, which are pure presentational components that work in any layout context.

### Step 3 — Remove `AdminShell` wrapper

The current `(admin)/admin/layout.tsx` wraps children in `<AdminShell>`. The new layout does NOT — the dashboard sidebar already provides the navigation. The admin page content renders directly into the dashboard's `<main>` area.

No changes to individual page components are needed.

### Step 4 — Add redirect from old admin routes (temporary)

Update `src/app/(admin)/admin/layout.tsx` to redirect to the new paths:

```tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ADMIN_PATHNAME_HEADER } from "@/components/admin/auth/admin-request";

export default async function LegacyAdminLayout() {
  const pathname = (await headers()).get(ADMIN_PATHNAME_HEADER) ?? "/admin/overview";
  // Redirects preserve path: /admin/users → /admin/users (same path, new layout takes over)
  redirect(pathname);
}
```

Since both old and new routes share the same `/admin/*` path structure, the redirect is a no-op in practice — the Next.js route resolution will prefer `(dashboard)/admin/` once the files exist there. The `(admin)` group can be fully removed in Prompt 03.

### Step 5 — Update import paths in moved files

After moving, check each page file for imports that reference `../../../../` depth paths and adjust to `../../../../../` as needed. Specifically:
- `convex/_generated/api` imports
- `@/components/admin/*` imports (these use `@` alias, no change needed)

### Validation

After this prompt:
- Navigating to `/admin/overview` as a `super_admin` user should show the admin overview page content inside the dashboard layout (with dashboard sidebar on the left)
- Non-admin users navigating to `/admin/overview` should be redirected to `/dashboard`
- The admin sidebar section from Prompt 01 should highlight the correct active item
