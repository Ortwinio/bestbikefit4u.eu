# Step 01: Auth And Entry

## Objective

Resolve the remaining ambiguity around admin auth separation and confirm the rider-dashboard entry into admin behaves correctly.

## Tasks

1. Audit the current shared auth/session path used by both rider and admin routes.
2. Decide and document the target security model:
   - Option A: shared auth provider with strict admin server authorization
   - Option B: distinct admin session boundary on top of shared identity provider
3. Implement the chosen model consistently in:
   - `src/app/(admin)/(auth)/admin/login/page.tsx`
   - `src/components/admin/auth/AdminLoginForm.tsx`
   - `src/components/admin/auth/admin-session.ts`
   - any middleware/proxy/admin request helpers
4. Preserve the dashboard admin entry for `super_admin`.
5. Explicitly decide whether dashboard admin entry should remain `super_admin`-only or expand to all admin roles.
6. Add tests proving:
   - non-admin rider sessions cannot enter `/admin/*`
   - admin sessions reach `/admin/*`
   - dashboard entry visibility matches the chosen role policy

## Done When

- auth separation is documented and implemented consistently
- the `super_admin` dashboard entry is verified
- auth/entry tests cover both desktop/sidebar and mobile-menu behavior
