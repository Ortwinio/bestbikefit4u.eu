# Prompt 03 — Remove Standalone Admin Shell and Consolidate Auth

## Context

After Prompts 01 and 02:
- Admin pages render inside the dashboard layout
- The collapsible admin sidebar section is in place
- The `(admin)` route group is now redundant

This prompt removes the standalone admin shell, the separate iron-session auth, and all associated code.

Read the plan README before starting: `plans/feature-admin-dashboard-integration/README.md`

## Task

### Step 1 — Delete the `(admin)` route group

Remove:
```
src/app/(admin)/
  (auth)/admin/login/page.tsx
  admin/layout.tsx
  admin/*/page.tsx   (all pages already moved in Prompt 02)
```

Verify that no page in `src/app/(admin)/` still needs to exist after moving everything.

### Step 2 — Remove the iron-session admin auth files

Delete these files (no longer needed):
- `src/components/admin/auth/admin-session.ts`
- `src/components/admin/auth/admin-request.ts`
- `src/components/admin/auth/AdminLoginForm.tsx`
- `src/components/admin/auth/admin-session.test.ts`

Keep:
- `src/components/admin/auth/admin-auth-shared.ts` — `AdminRole` types are still useful for future multi-role support
- `src/components/admin/auth/admin-route-access.ts` — can be kept as reference, or deleted if no longer used

### Step 3 — Remove AdminShell

Delete `src/components/admin/layout/AdminShell.tsx`.

Check for any remaining imports of `AdminShell` and remove them.

### Step 4 — Check `middleware.ts` / `proxy.ts`

Check `src/proxy.ts` and `src/middleware.ts` for any admin route handling or session reading. Remove admin-session cookie checks if present. The admin routes are now protected by the dashboard's Convex auth and the `(dashboard)/admin/layout.tsx` role check.

### Step 5 — Remove env var

Check `convex/env.ts` or `.env.local.example` for `ADMIN_SESSION_SECRET`. Remove references in:
- `src/components/admin/auth/admin-session.ts` (already deleted above)
- Any env validation files
- README / docs if mentioned

Document that `ADMIN_SESSION_SECRET` is no longer required.

### Step 6 — Update i18n messages

In `en.ts` and `nl.ts`, check if `messages.layout.admin.*` keys (used by the old plain admin links in the sidebar) are still referenced anywhere. If the sidebar now uses `adminNavigationGroups` from `admin-navigation.ts` directly (which has hardcoded English labels), remove the unused i18n admin keys. Alternatively, migrate `admin-navigation.ts` labels to use i18n — but that is out of scope for this plan; just remove dead keys.

### Step 7 — Run checks

```bash
npm run typecheck
npm run lint
npm run test:unit
```

Fix any errors from removed imports.

### Validation

After this prompt:
- `/admin/login` returns 404 (no longer exists)
- `super_admin` users access admin via dashboard sidebar only
- No `ADMIN_SESSION_SECRET` env var is needed
- TypeScript, lint, and unit tests all pass
