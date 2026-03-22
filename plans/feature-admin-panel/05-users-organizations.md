# Step 05 — Users & Organizations Management

## Goal

Build the user management and organization management modules: paginated/searchable list views, a full user detail page with tabs, plan changes, suspension, direct messaging, and organization overview.

---

## Pre-requisites

- Steps 01–03 complete
- `listUsers`, `getUserDetail` queries exist in `convex/admin/queries.ts`
- `changeUserTier`, `suspendUser`, `restoreUser` mutations exist in `convex/admin/mutations.ts`

---

## 1. User list page

`src/app/(admin)/users/page.tsx`

### Filters (top of page, inline)

- Search input: filters by name or email (debounced, 300ms)
- Plan filter: All / Free / Pro / Premium (tab or segmented control)
- Admin role filter: All / Admin only / No admin role
- Suspended filter: All / Suspended only

### Table columns

| Column | Value |
|---|---|
| Name | displayName or email local-part |
| Email | user email |
| Plan | Badge (Free / Pro / Premium, color-coded) |
| Strava | ✓ or — |
| Bikes | count |
| Fit runs | count |
| Joined | relative date |
| Admin role | Badge if set, otherwise — |
| Actions | "View" → user detail |

### Pagination

Use Convex `usePaginatedQuery` with a "Load more" button. Default page size: 50.

### Empty state

"No users match your filters." with a clear-filters link.

---

## 2. User detail page

`src/app/(admin)/users/[userId]/page.tsx`

Tabs:
1. **Overview** — key info, quick actions
2. **Rider Profile** — body measurements, flexibility, injury flags
3. **Bikes** — list of user's bikes with links
4. **Fit History** — list of fit sessions with links to trace
5. **Integrations** — Strava connection status, sync history
6. **License** — current plan, trial status, plan change history
7. **Feedback** — feedback items submitted by this user
8. **Messages** — dashboard messages received, read receipts
9. **Audit Trail** — audit log entries for this user as target

### Tab 1 — Overview

Left column:
- Avatar, name, email, account type badge
- Joined date, last login date
- Strava connected badge
- Quick stats: bikes count, fit runs count, open feedback count

Right column — Quick actions panel:

**Change plan** (billing_admin, ops_admin, super_admin)
- Dropdown: Free / Pro / Premium
- Required text field: Reason
- Button: Apply change
- On submit: calls `changeUserTier` mutation, shows success toast

**Send dashboard message** (support_admin, ops_admin, super_admin)
- Title input
- Body textarea
- Type selector (inbox_card / banner / support_reply)
- Button: Send
- On submit: calls `createDashboardMessage` with target `{ targetType: "user", targetValue: userId }`

**Suspend / Restore** (support_admin, ops_admin, super_admin)
- If not suspended: "Suspend account" button → opens confirmation dialog with reason field
- If suspended: show suspension reason + date, "Restore access" button
- On submit: calls `suspendUser` or `restoreUser`

**Admin role** (super_admin only)
- Current role badge
- Dropdown to change role or remove admin access
- Reason field
- On submit: calls `setAdminRole`

**Impersonate** (support_admin, super_admin)
- Button: "View as this user"
- Opens confirmation dialog with required reason field
- On confirm: calls `startImpersonation` action, opens a new tab

### Tab 6 — License

Show:
- Current plan and when it was assigned
- A table of plan change history (from audit log: `action = "user.tier_change"`, `targetId = userId`)
- Trial expiry date if applicable (store trial fields in schema if needed — add `trialEndsAt: v.optional(v.number())` to users)

### Tab 9 — Audit Trail

Use `listAuditLogs` query filtered to `targetType = "user"`, `targetId = userId`.

Show a timeline of all admin actions taken on this user, with admin name, action label, reason, and timestamp.

---

## 3. Organizations list page

`src/app/(admin)/organizations/page.tsx`

Simple table:
- Name, type badge (bike_shop / enterprise / fitter_studio / brand)
- Owner email
- Seats used / max seats
- Suspension status
- "View" link

Filter: type, suspension status.

---

## 4. Organization detail page

`src/app/(admin)/organizations/[orgId]/page.tsx`

Tabs:
1. **Overview** — name, type, owner, plan, seat counts, suspend/restore action
2. **Members** — table of `organization_members` with user name, role, joined date, remove action
3. **Billing** — subscription info (for v1: read-only display)
4. **Audit Trail** — audit log entries for this org

### Overview quick actions

- Edit name and type (ops_admin, super_admin)
- Change max seats (billing_admin, super_admin)
- Suspend / restore org (ops_admin, super_admin)

All actions write audit log entries.

---

## 5. Add member flow

On the organization Members tab:
- "Add member" button → opens a dialog
- Admin enters user email
- System looks up user, previews name
- Admin selects role (owner / staff / fitter / viewer)
- On confirm: inserts `organization_members` row

---

## Convex additions needed

Extend queries:

```ts
// Paginated user list (from step 03 — verify it handles all filter combinations)
export const listUsers = query({ ... });

// Organization list
export const listOrganizations = query({ args: { paginationOpts }, ... });

// Organization detail
export const getOrganizationDetail = query({ args: { orgId }, ... });

// Org members
export const listOrgMembers = query({ args: { orgId }, ... });
```

Extend mutations:

```ts
export const createOrganization = mutation({ ... });
export const updateOrganization = mutation({ ... });
export const suspendOrganization = mutation({ ... });
export const addOrgMember = mutation({ ... });
export const removeOrgMember = mutation({ ... });
```

---

## Acceptance criteria

- [ ] User list shows real data, is searchable and filterable
- [ ] Pagination loads more users without full page reload
- [ ] User detail shows all 9 tabs with live data
- [ ] Plan change is role-gated, writes audit log, shows in tab 6 history
- [ ] Suspension works and is reflected in the list (badge) and detail
- [ ] Direct message to a single user creates a `dashboard_messages` record with `targetType = "user"`
- [ ] Admin role change is super_admin only
- [ ] Organization list and detail work
- [ ] All mutations write audit log entries
- [ ] `npm run typecheck` passes
