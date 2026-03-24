# Prompt 01 — Collapsible Admin section in DashboardSidebar

## Context

The dashboard sidebar lives at `src/components/layout/DashboardSidebar.tsx`. It already queries the current Convex user and conditionally shows admin navigation for `super_admin` users via a plain list of `<Link>` elements. We are replacing that with a styled, collapsible section.

The admin navigation items and groups are defined in:
`src/components/admin/layout/admin-navigation.ts`

## Task

Modify `DashboardSidebar.tsx` to replace the existing plain admin link block with a collapsible Admin section.

### Requirements

1. **Toggle button** — render a nav-item-styled row with:
   - `ShieldCheck` or `CircuitBoard` icon (use `CircuitBoard` — already used in AdminShell branding)
   - Label: use `messages.layout.sections.admin` (already exists in i18n)
   - A `ChevronDown` / `ChevronUp` icon on the right that rotates when open
   - Same `rounded-lg px-3 py-2 text-sm font-medium` base styling as other nav items
   - Active state (highlighted) when the current path starts with `/admin`
   - Click toggles `isAdminOpen` state (`useState(false)`)

2. **Sub-items** — when `isAdminOpen` is true, render all items from `adminNavigationGroups` (imported from `admin-navigation.ts`):
   - Group labels rendered as a small `px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]` heading
   - Each item: same active/inactive link classes as the main `navigation` items
   - Active detection: `internalPathname === item.href || internalPathname.startsWith(item.href + "/")`
   - Indent sub-items slightly: add `pl-4` to the link, or wrap in a `pl-2` container

3. **Visibility** — the entire admin section (toggle + sub-items) only renders when `isSuperAdmin` is true (already derived from `user?.adminRole === "super_admin"`)

4. **Position** — place the admin section below the main `navigation` links and above the `websiteNavigation` section (inside the `flex-1 overflow-y-auto` area)

5. **Remove** the old `{isSuperAdmin && (...)}` admin link block that currently exists in the sidebar

### i18n note

No new i18n keys are needed. The `messages.layout.sections.admin` key already exists in both `en.ts` and `nl.ts`.

### Imports to add

```ts
import { CircuitBoard, ChevronDown } from "lucide-react";
import { adminNavigationGroups, isAdminNavigationActive } from "@/components/admin/layout/admin-navigation";
```

Note: `isAdminNavigationActive` from `admin-navigation.ts` works on the full pathname (e.g. `/admin/users`) — use it directly since admin routes don't use locale prefixes.

### State to add

```ts
const [isAdminOpen, setIsAdminOpen] = useState(false);
```

Also auto-open the section when the current path is under `/admin`:
```ts
// Initialize open if currently on an admin route
const [isAdminOpen, setIsAdminOpen] = useState(() =>
  internalPathname.startsWith("/admin")
);
```
