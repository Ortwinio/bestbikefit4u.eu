# Admin Panel — Feature Plan

**Status:** Implemented with documented acceptance gaps
**Target:** v1 production release

Execution status:
- Protected `/admin/*` route tree is implemented.
- Convex admin queries, mutations, actions, and audit logging are in place.
- Shared admin UI is built on the existing Prototyper-style component layer.
- Validation currently passes with `vitest` and `npm run typecheck`.
- `npm run build:vercel` is currently blocked by a local Next build artifact error during page-data collection.

Remediation note:
- The follow-on remediation plan in `plans/refactor-admin-panel-acceptance-remediation/` has been executed.
- The admin surface is now largely live against Convex; remaining open items are documented backend/product gaps rather than fixture-backed UI gaps.
- Acceptance closeout is recorded in `plans/refactor-admin-panel-acceptance-remediation/output-08-acceptance-closeout.md`.

---

## Goal

Build a dedicated admin panel for BestBikeFit4U that serves as the operational control layer for fit quality, user management, product governance, data integrity, customer communications, and commercial operations.

The admin panel is separate from the rider-facing dashboard. It runs at `/admin/*`, has its own authentication flow, and is protected by a role-based permission system.

---

## Background

BestBikeFit4U needs an internal operations tool as the platform scales beyond a handful of users. The primary needs driving this are:

- **Fit traceability** — every fit result must be auditable from input to output
- **Data governance** — geometry records, engine versions, and measurement data need versioned management
- **Customer operations** — users, licenses, subscriptions, and B2B accounts need lifecycle management
- **Product feedback loop** — bugs, feature requests, and support cases should flow directly from the user dashboard into admin workflows and back as notifications
- **Commercial control** — the Free / Premium / Pro / Bike Shop / Enterprise license model requires structured entitlement management
- **Safety** — low-confidence fit inputs, injury flags, and edge-case outputs need surfacing and manual review capability

---

## Scope (v1)

### In scope

- Separate admin authentication (role-based, isolated from rider login)
- Dedicated admin route group `/admin/*` with its own layout
- Admin role and permission model
- Overview dashboard (KPIs, queues, health widgets)
- Users & organizations management
- Rider data and measurement review
- Bikes management
- Geometry library (brands, models, sizes, records)
- Fit runs viewer and quality review queue
- Fit engine version management
- License and subscription management
- Feedback inbox (bugs, feature requests, support cases)
- Releases management
- Dashboard messages (compose, target, schedule, track)
- Audit logs and system settings

### Out of scope for v1

- Strava derived-metric fit logic (Phase 2)
- Advanced feature flags UI
- Enterprise seat and SSO workflows
- Automated re-fit campaigns
- Cohort analytics and advanced export
- Webhook event monitoring UI
- External geometry API connectors

---

## Approach

### Tech stack alignment

The admin panel uses the same stack as the rider dashboard:

- **Next.js App Router** — route group `src/app/(admin)/`
- **Convex** — admin-specific queries, mutations, and actions in `convex/admin/`
- **Prototyper UI** — same component library and semantic token system already used in `src/components/ui`
- **TypeScript** — end-to-end, Convex codegen

### Plan Audit Findings

Audit result: the plan is directionally strong, but several parts needed tightening before implementation.

1. The original auth/routing plan leaned too heavily on middleware and a client-side role check in layout. That is not a sufficient security boundary for admin routes.
2. Multiple steps referenced UI primitives like `Badge` and `Skeleton` without confirming they exist in the current shared Prototyper surface.
3. Several backend prompts were still too schematic (`...`) to be execution-ready and needed clearer cross-cutting constraints.
4. The plan assumed an admin-specific visual palette, but the repo is now token-driven; the admin panel should use semantic tokens and Prototyper primitives rather than a new bespoke palette layer.
5. Testing expectations were under-specified. The original plan checked `typecheck`, but it did not define the integration, authorization, and UI-contract coverage needed for an admin surface.

### Cross-Cutting Implementation Rules

These rules apply to every step in this plan.

#### Security boundary

- Middleware may only do coarse unauthenticated redirects for `/admin/*`.
- Admin authorization must be enforced server-side in the admin layout/page boundary and in every Convex admin query, mutation, and action.
- No client-only role check counts as protection.
- Every sensitive mutation or action must write an audit log entry.

#### UI foundation

All admin UI must be based on the existing Prototyper-style shared layer in `src/components/ui` and copied primitives in `src/components/prototyper-ui/ui`.

Preferred component set for v1:

- layout/surfaces: `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Separator`
- actions: `Button`, `SegmentedControl`
- forms: `Input`, `Textarea`, `Select`, `NumberInput`, `Slider`, `RadioGroup`, `CheckboxGroup`, `FieldLabel`
- overlays: `AccessibleDialog`, `Tooltip`, `Popover` or `Dialog` only if copied first
- feedback: `Progress`, `Toast`

UI constraints:

- Use semantic tokens only; do not introduce raw slate/gray palettes just for admin.
- When a step says "badge", implement it as a small tokenized status pill or add a Prototyper-compatible primitive first. Do not pull in an unrelated badge library.
- When a step says "skeleton", implement a simple tokenized loading placeholder in the local shared layer unless a Prototyper primitive has been copied first.
- Do not introduce Radix-only patterns such as `asChild`; use Prototyper/Base UI composition patterns like `render=`.
- Prefer existing shared wrappers before creating admin-only one-off components.

#### Delivery quality

- Each step must ship backend + route/page + role gating + empty/loading/error states together.
- Every list view must define search/filter state, pagination strategy, and empty state.
- Every write flow must define required role, confirmation UX if destructive, and audit-log payload.
- Every page must define mobile fallback behavior even if admin is primarily desktop.

### Authentication model

Admin users authenticate via the same `@convex-dev/auth` system used by riders, but with a required `adminRole` field on their user record. A separate admin middleware guards all `/admin/*` routes and redirects to `/admin/login` if the user is not authenticated or does not have a valid admin role.

Admin login is at `/admin/login` — visually distinct from the rider login, simple email + magic-code flow.

**Admin roles (v1):**

| Role | Key capabilities |
|---|---|
| `super_admin` | Full access to everything |
| `ops_admin` | Users, releases, messages, feature flags |
| `support_admin` | User support, messages, impersonation |
| `fit_specialist` | Fit reviews, manual overrides, safety validation |
| `geometry_manager` | Geometry library, imports, approvals |
| `billing_admin` | Licenses, subscriptions, billing events |
| `qa_manager` | Release definitions, rollout, rollback |
| `analyst` | Read-only: dashboards, lists, exports |

### Route structure

```
/admin                          → redirect to /admin/overview
/admin/login                    → admin login page
/admin/overview                 → command center dashboard
/admin/users                    → user list
/admin/users/[userId]           → user detail (tabs)
/admin/organizations            → organization list
/admin/organizations/[orgId]    → org detail (tabs)
/admin/rider-data               → measurement review queue
/admin/rider-data/[userId]      → rider measurement detail
/admin/bikes                    → bike list across all users
/admin/bikes/[bikeId]           → bike detail
/admin/geometry                 → brand/model library
/admin/geometry/brands          → brand list and management
/admin/geometry/[recordId]      → geometry size detail
/admin/fit-engine               → engine version list
/admin/fit-engine/[versionId]   → engine version detail + sandbox
/admin/fit-runs                 → fit run list + review queue
/admin/fit-runs/[runId]         → fit run trace detail
/admin/licenses                 → plan catalog
/admin/subscriptions            → subscription list
/admin/feedback                 → feedback inbox
/admin/feedback/[itemId]        → feedback detail
/admin/releases                 → release list
/admin/releases/[releaseId]     → release detail
/admin/messages                 → dashboard message list
/admin/messages/new             → compose message
/admin/messages/[messageId]     → message detail + performance
/admin/audit                    → audit log
/admin/settings                 → roles, permissions, system settings
```

### Convex backend structure

All admin backend code lives in `convex/admin/`:

```
convex/admin/
  queries.ts       — admin queries (role-gated using requireAdminRole)
  mutations.ts     — admin mutations
  actions.ts       — admin actions (impersonation, exports, API calls)
```

Admin authorization uses a `requireAdminRole(ctx, role?)` helper analogous to `requireUserId`. It checks the calling user's `adminRole` field.

### Navigation

The admin panel has a persistent left sidebar with:

```
Overview
Users
  ↳ Users
  ↳ Organizations
Rider Data
Bikes
Geometry Library
Fit Engine
Fit Runs
Integrations
Licenses & Billing
Feedback & Support
Releases
Dashboard Messages
Content & Reports
Analytics
Audit & Settings
```

Collapsible groups on desktop. Hamburger menu on mobile (though admin panels are primarily desktop tools).

## Testing & Validation

Testing is a first-class deliverable for this feature, not a final cleanup task.

The implementation must satisfy the dedicated validation step in `13-testing-validation.md`, covering:

- admin auth and route protection
- role-gated Convex queries, mutations, and actions
- audit log coverage for all sensitive writes
- admin list/detail page rendering, empty states, and destructive flows
- user-facing consequences of admin actions where applicable
- Prototyper UI conformance of the shared admin surface
- production build and type safety

Minimum verification for the completed feature:

- `npx tsc --noEmit --pretty false`
- focused `vitest` coverage for admin authz helpers, admin backend mutations, and shared admin UI contracts
- page-level integration tests for the highest-risk admin flows
- `npm run build:vercel`

---

## Acceptance criteria (v1)

- [ ] Admin login at `/admin/login` is completely separate from rider login; no rider session grants admin access
- [x] All admin routes redirect to `/admin/login` when unauthenticated or lacking admin role
- [x] Role-based access: pages and actions are gated by the appropriate admin role
- [x] Overview dashboard displays real KPIs from Convex (not mocked)
- [x] User list is searchable, filterable, and paginatable
- [x] User detail shows all tabs with live data
- [x] Admins can upgrade/downgrade a user's plan
- [x] Support admins can send a direct dashboard message to a specific user
- [x] Fit runs are traceable: input snapshot, engine version, output values, warnings, confidence score
- [ ] Geometry library supports add/edit/version records with change reason
- [x] Feedback items (bugs, feature requests) can be triaged, assigned, and linked to releases
- [x] Release records can be created, linked to feedback items, and marked live
- [x] Dashboard messages can be composed, targeted by segment, scheduled, and tracked
- [x] Every sensitive admin action creates an audit log entry
- [x] Admin UI uses the shared Prototyper-style component layer and semantic tokens
- [ ] The validation checklist in `13-testing-validation.md` is complete
- [x] `npm run typecheck` passes
- [ ] No CSP violations in production

---

## Schema additions summary

### New fields on existing tables

**`users` table**
- `adminRole: v.optional(v.union(v.literal("super_admin"), v.literal("ops_admin"), v.literal("support_admin"), v.literal("fit_specialist"), v.literal("geometry_manager"), v.literal("billing_admin"), v.literal("qa_manager"), v.literal("analyst")))`
- `suspendedAt: v.optional(v.number())`
- `suspendedReason: v.optional(v.string())`

### New tables

- `organizations` — B2B accounts (bike shops, enterprise)
- `organization_members` — user→org membership with role
- `admin_audit_logs` — immutable record of every admin action
- `geometry_brands` — brand catalog
- `geometry_models` — model catalog per brand
- `geometry_records` — per-size geometry with versioning
- `engine_versions` — fit engine versions
- `feedback_items` — bugs, feature requests, support cases
- `feedback_comments` — threaded replies
- `releases` — product/engine/geometry releases
- `release_items` — linked feedback items per release
- `dashboard_messages` — admin-composed user messages
- `message_targets` — audience targeting rules per message
- `message_receipts` — per-user view/click/ack tracking

Full schema definitions are in prompt `02-schema.md`.

---

## Implementation prompts

| # | File | What it implements |
|---|---|---|
| 01 | `01-admin-auth-routing-layout.md` | Admin login, middleware, role guard, sidebar layout |
| 02 | `02-schema.md` | All new Convex tables and fields |
| 03 | `03-admin-backend.md` | `requireAdminRole`, admin queries, mutations, audit logging |
| 04 | `04-overview-dashboard.md` | KPI widgets, queues, health panels |
| 05 | `05-users-organizations.md` | User list, user detail tabs, org management, impersonation, plan change |
| 06 | `06-rider-data-bikes-geometry.md` | Measurement review, bike detail, geometry library CRUD |
| 07 | `07-fit-engine-fit-runs.md` | Engine versions, fit run trace viewer, review queue |
| 08 | `08-licenses-billing.md` | Plan catalog, subscription list, entitlement management |
| 09 | `09-feedback-support.md` | Feedback inbox, bug board, feature request board, support cases |
| 10 | `10-releases.md` | Release CRUD, status workflow, linked items, rollout controls |
| 11 | `11-dashboard-messages.md` | Message composer, audience targeting, scheduling, delivery tracking |
| 12 | `12-audit-settings.md` | Audit log viewer, role management, system settings |
| 13 | `13-testing-validation.md` | Cross-cutting testing, authz validation, and Prototyper UI conformance |
