# Step 07 — UI State Hardening And Prototyper Conformance

## Goal

Make the admin UI shippable as a product surface instead of a static demo shell.

## Tasks

1. Standardize imports so admin pages use the shared `@/components/ui` surface instead of deep one-off imports where possible.
2. Audit `src/components/admin/layout/AdminUi.tsx` and decide which helpers should stay as compatibility wrappers and which should move into the shared UI layer.
3. Add consistent loading, empty, and error states across all admin routes.
4. Add confirmation UX for destructive/admin-sensitive flows:
   - suspend / restore
   - role changes
   - feature flag changes
   - publish / rollout actions
   - geometry approvals / rejections
   - GDPR export / anonymization
5. Review table/list semantics for accessible composition and avoid invalid table/link structures.
6. Record any missing shared primitive additions required to keep the admin surface fully Prototyper-style.

## Done When

- The admin surface is visually and behaviorally consistent.
- Prototyper shared-layer usage is deliberate rather than incidental.
