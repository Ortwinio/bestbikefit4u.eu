# Step 13 — Testing, Validation & Prototyper UI Conformance

## Goal

Validate the admin panel as a production feature, not just a collection of pages. This step hardens the security model, verifies the highest-risk flows, and confirms that the admin UI is implemented on the shared Prototyper-style component layer.

---

## Pre-requisites

- Steps 01–12 are implemented
- Admin routes, backend modules, and shared admin UI exist
- All admin mutations and actions already write audit logs

---

## 1. Security and authorization tests

These are the highest-priority tests. Admin features are not acceptable without them.

### 1.1 Auth helper tests

Add focused unit tests for `convex/admin/authz.ts`:

- `requireAdminUserId` rejects unauthenticated callers
- `requireAdminUserId` rejects authenticated non-admin users
- `requireAdminRole` allows `super_admin`
- `requireAdminRole` rejects wrong-role admins
- `requireAnyRole` accepts one of the listed roles and rejects the rest

### 1.2 Admin route boundary tests

Add route/layout tests for the admin boundary:

- unauthenticated access to `/admin/overview` redirects to `/admin/login`
- authenticated non-admin access does not render admin content
- authenticated admin access renders the admin shell
- `/admin/login` remains reachable without a rider locale prefix

These checks must validate the server-side admin layout logic, not only middleware behavior.

### 1.3 Sensitive mutation/action authz tests

Add tests for representative high-risk writes:

- `changeUserTier`
- `setAdminRole`
- `suspendUser` / `restoreUser`
- `publishDashboardMessage`
- release status transitions
- geometry approval
- impersonation start
- GDPR export / anonymization

Each test must verify both:

- unauthorized roles are rejected
- authorized roles succeed and write an audit log entry

---

## 2. Backend integration validation

Add integration-style tests around the core admin backend modules.

### 2.1 Query coverage

Cover at least one happy-path and one empty-state path for:

- `getOverviewStats`
- `listUsers`
- `getUserDetail`
- `listFeedbackItems`
- `listReleases`
- `listAuditLogs`
- `listFitRuns`

These tests should verify returned shape, filters, and pagination assumptions rather than only snapshotting raw JSON.

### 2.2 Audit log validation

Add a dedicated audit-log assertion helper and use it in write-flow tests.

At minimum, assert that every sensitive write records:

- `adminUserId`
- `action`
- `targetType`
- `targetId`
- `occurredAt`
- `reason` when the flow requires one

### 2.3 Message-targeting validation

For `dashboard_messages`, add tests proving that targeting rules are evaluated correctly for:

- all users
- specific user
- plan/tier
- organization
- locale
- Strava connected
- fit completed

Also verify that dismiss / acknowledge / viewed receipts behave idempotently.

---

## 3. UI contract and Prototyper conformance

The admin panel must use the shared Prototyper-style surface, not a parallel UI system.

### 3.1 Shared UI contract tests

Add or extend tests for any admin-specific shared UI helpers created during implementation:

- list toolbar filters
- status pill helper
- table row actions
- destructive confirmation dialogs
- message preview surfaces
- release status workflow controls

Each test should verify:

- semantic roles and labels
- token-driven classes or data-slot hooks
- correct loading/disabled states
- correct `render=` composition when links are button-shaped

### 3.2 Prototyper UI conformance checklist

Run a manual repo audit and record completion:

- shared admin pages import from `src/components/ui` or copied Prototyper primitives
- no Radix imports are introduced for admin UI
- no raw `asChild` composition is introduced
- no admin-only raw slate/gray palette system is added
- dialogs, forms, segmented controls, radio groups, checkboxes, and sliders use the shared Prototyper-style layer

If a missing primitive is needed during admin implementation, add it to the shared UI layer first; do not bypass the shared layer inside admin pages.

---

## 4. Page-level flow tests

Add focused UI/integration tests for the highest-value admin workflows.

Required flows:

1. Admin login and redirect to `/admin/overview`
2. User list search/filter/load-more behavior
3. User detail quick action: change plan
4. User detail quick action: suspend/restore with required reason
5. Feedback detail: internal note vs. user-visible reply
6. Release detail: guarded status transition
7. Dashboard message compose: draft vs. publish
8. Audit log page filters and expandable details

Each flow test must cover:

- loading state
- success state
- error state
- permission-denied state where relevant

---

## 5. Build and regression gates

The feature is only done when all of these pass:

- `npx tsc --noEmit --pretty false`
- focused `vitest` suites for admin authz, backend, and shared admin UI
- any existing relevant page or integration suites
- `npm run build:vercel`

If new admin routes introduce environment requirements, document them explicitly in the feature README before considering the feature ready.

---

## 6. Final sign-off checklist

- [ ] Admin auth and role boundaries are tested server-side
- [ ] Representative sensitive mutations/actions reject unauthorized roles
- [ ] Sensitive writes always generate audit logs
- [ ] Core list/detail queries are tested for empty and populated states
- [ ] Dashboard message targeting and receipts are validated
- [ ] Admin UI uses the shared Prototyper-style layer
- [ ] No new ad hoc admin-only design system was introduced
- [ ] `npx tsc --noEmit --pretty false` passes
- [ ] `npm run build:vercel` passes
