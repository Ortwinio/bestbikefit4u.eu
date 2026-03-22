# Admin Panel Acceptance Remediation

**Status:** Implemented with remaining backend-limited gaps
**Target:** close the gap between the current admin implementation and the v1 acceptance criteria in `plans/feature-admin-panel/README.md`

## Goal

Turn the current buildable admin panel into an acceptance-criteria-complete admin product:

- real Convex-backed admin data instead of local fixture modules
- route/auth/role boundaries that hold at page and mutation level
- destructive flows with confirmations and audit trails
- proper empty/loading/error states across every admin list/detail surface
- shared Prototyper-style UI usage across the full admin surface
- test coverage that proves the feature instead of only type/build success

## Execution Summary

The remediation plan has now been executed through the full admin surface.

Completed work:
- auth/routing is server-protected and role-aware across `/admin/*`
- overview, users, organizations, rider data, bikes, geometry, fit engine, fit runs, releases, billing, feedback, messages, settings, and audit are wired to live Convex reads instead of local fixture arrays
- sensitive admin writes now run through live Convex mutations/actions with audit logging on the covered paths
- the admin surface remains on the shared Prototyper-style component layer and semantic tokens
- validation currently passes with:
  - `npx tsc --noEmit --pretty false`
  - focused `vitest` suites
  - `npm run build:vercel`

Remaining gaps are no longer “fixture-backed UI” gaps. They are backend/product-limit gaps:
- admin login is still a separate route over the shared auth provider, not a fully isolated auth stack
- geometry record editing/import is still partially limited by backend support
- impersonation is still synthetic rather than a full server-managed impersonation session
- release notification fan-out and GDPR execution are recorded/live at the admin-record level but not fully operational pipelines
- CSP/no-production-violation validation is still not evidenced in this remediation pass

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

## Outputs

- [output-01-gap-map.md](./output-01-gap-map.md)
- [output-02-admin-data-access-pattern.md](./output-02-admin-data-access-pattern.md)
- [output-08-acceptance-closeout.md](./output-08-acceptance-closeout.md)
