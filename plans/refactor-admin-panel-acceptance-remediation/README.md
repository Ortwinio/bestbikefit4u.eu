# Admin Panel Acceptance Remediation

**Status:** Planned
**Target:** close the gap between the current admin implementation and the v1 acceptance criteria in `plans/feature-admin-panel/README.md`

## Goal

Turn the current buildable admin panel into an acceptance-criteria-complete admin product:

- real Convex-backed admin data instead of local fixture modules
- route/auth/role boundaries that hold at page and mutation level
- destructive flows with confirmations and audit trails
- proper empty/loading/error states across every admin list/detail surface
- shared Prototyper-style UI usage across the full admin surface
- test coverage that proves the feature instead of only type/build success

## Current Gap Summary

The current state is structurally good but materially incomplete against acceptance criteria.

1. Admin auth and the protected `/admin/*` shell are implemented, but that is the only area consistently wired to live backend state.
2. Most admin domain pages are still fixture-driven. The primary local fixture sources are:
   - `src/components/admin/contracts.ts`
   - `src/components/admin/fit/data.ts`
   - `src/components/admin/releases/data.ts`
   - `src/components/admin/users/admin-users-data.ts`
   - `src/components/admin/organizations/admin-organizations-data.ts`
   - inline arrays in `BillingViews.tsx`, `FeedbackViews.tsx`, `MessageViews.tsx`, `SettingsViews.tsx`, and `AuditLogPage.tsx`
3. Many “write” flows are still UI-only placeholders or confirmation shells rather than live mutations with audit assertions.
4. Shared admin UI is mostly on the Prototyper-style layer, but there is still drift:
   - several admin pages import deep component paths like `@/components/ui/Button` instead of the shared `@/components/ui` surface
   - `src/components/admin/layout/AdminUi.tsx` is a custom helper layer that needs hardening for loading/empty/error/destructive states
5. Overview, users, organizations, rider data, bikes, geometry, fit engine, fit runs, releases, billing, feedback, messages, settings, and audit do not yet satisfy the “live data complete” acceptance criteria.

## Delivery Rules

- Keep the admin UI on the existing Prototyper-style shared layer in `src/components/ui` and copied primitives in `src/components/prototyper-ui/ui`.
- Do not add a parallel admin component system.
- Every list/detail conversion must ship with loading, empty, success, and error states in the same step.
- Every destructive or permissioned write must declare:
  - required admin role
  - confirmation UX
  - audit log payload
  - success/error feedback
- Prefer route-level server loaders plus client action panels over large client-only pages full of local state.

## Workstreams

1. [01-gap-map-and-data-contracts.md](./01-gap-map-and-data-contracts.md)
2. [02-admin-data-access-layer.md](./02-admin-data-access-layer.md)
3. [03-overview-users-orgs-live-wiring.md](./03-overview-users-orgs-live-wiring.md)
4. [04-rider-bikes-geometry-live-wiring.md](./04-rider-bikes-geometry-live-wiring.md)
5. [05-fit-engine-runs-releases-live-wiring.md](./05-fit-engine-runs-releases-live-wiring.md)
6. [06-billing-feedback-messages-settings-audit.md](./06-billing-feedback-messages-settings-audit.md)
7. [07-ui-state-hardening-and-prototyper-conformance.md](./07-ui-state-hardening-and-prototyper-conformance.md)
8. [08-validation-and-acceptance-closeout.md](./08-validation-and-acceptance-closeout.md)

## Acceptance Exit Conditions

- Overview dashboard reads real Convex stats instead of `fit/data.ts`
- Users and organizations list/detail surfaces read and write live data
- Rider data, bikes, geometry, fit engine, fit runs, and releases stop reading from local fixture modules
- Billing, feedback, messages, settings, and audit stop reading from inline arrays
- Support, billing, geometry, QA, and super-admin flows execute real mutations/actions with audit logs
- Admin pages use shared Prototyper-style primitives consistently and expose real loading/empty/error states
- Acceptance criteria in `plans/feature-admin-panel/README.md` are checked off honestly
- Validation passes:
  - `npx tsc --noEmit --pretty false`
  - focused `vitest` suites for authz/backend/admin UI flows
  - `npm run build:vercel`
