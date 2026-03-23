# Admin Panel Final Closeout

Date: 2026-03-23

## Verification

- `npm run typecheck`
- `npx vitest run convex/admin/__tests__/queries.contract.test.ts convex/admin/__tests__/mutations.contract.test.ts convex/admin/__tests__/actions.contract.test.ts src/app/(admin)/admin/fit-runs/[sessionId]/fit-trace.test.ts src/app/(admin)/admin/geometry/geometry-record-utils.test.ts src/components/admin/releases/release-ui.test.tsx convex/messages/__tests__/queries.contract.test.ts`
- `npm run build:vercel`

## Acceptance Status

- `complete` Admin routes are server-gated and redirect unauthenticated/non-admin users to `/admin/login`.
- `complete` `super_admin` users have an extra dashboard entry into the admin surface.
- `complete` direct admin-to-user dashboard messages are now deliverable immediately when created for immediate send.
- `complete` admin feedback replies now create rider-visible `support_reply` notifications while internal notes remain private.
- `complete` overview KPIs are still live from Convex.
- `complete` user list remains filterable/paginatable and now uses real substring search matching.
- `complete` user detail keeps live tabs and live tier/message/admin actions.
- `complete` fit-run detail now exposes richer trace payloads when available, including recommendation output and warning-related data.
- `complete` geometry records now support inline editing through a version-safe save flow with change reason.
- `complete` release admin UI now supports inline creation, linking feedback, and triggering notification fan-out from the release surface.
- `complete` release go-live handling now marks linked feedback items as `released`.
- `complete` admin UI removed admin-side `modal` message composition, fixed the shared table-row markup defect, and reduced hard-coded black styling in the audited admin surface.

## Notes

- Admin auth still uses the shared identity provider, but admin access remains enforced by dedicated admin route/login handling plus server-side role authorization. No rider-only session can access `/admin/*`.
- Legacy or pre-existing modal dashboard messages could still exist in stored data, but the admin remediation removed modal creation from the audited admin surfaces.
