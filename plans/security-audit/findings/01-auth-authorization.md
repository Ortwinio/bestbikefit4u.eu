# Findings: Auth and Authorisation Audit

## Summary

The admin auth chain (proxy → layout → Convex mutation) is correctly implemented for all existing admin routes. The `requireX` helpers in `convex/lib/authz.ts` all throw unconditionally on ownership failure. The dev-login findings identified in the audit have been remediated in code, and `/admin` middleware now performs its own admin-role check before rendering.

---

### [CRITICAL] F-01: `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET` exposed in client-side bundle

**Status**: Fixed

**Resolved in**: `src/app/api/auth/localhost-dev/route.ts`, `src/app/(auth)/login/page.tsx`

**Original location**: `src/app/(auth)/login/page.tsx:285`, `convex/auth.ts:176`

**Original issue**: The dev-login secret was read from `process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET` inside a client component, which exposed it in the browser bundle.

**Fix**: The login page now posts to a server-side route at `/api/auth/localhost-dev`, and that route reads `LOCALHOST_DEV_LOGIN_SECRET` server-side before issuing auth cookies. The client bundle no longer references `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET`.

**Verification**: `src/app/(auth)/login/page.tsx` now calls `fetch("/api/auth/localhost-dev", ...)`, and the new route in `src/app/api/auth/localhost-dev/route.ts` uses `process.env.LOCALHOST_DEV_LOGIN_SECRET` server-side.

---

### [HIGH] F-02: Dev-login hostname check is bypassed by client-supplied data

**Status**: Fixed

**Resolved in**: `convex/auth.ts`, `src/app/api/auth/localhost-dev/route.ts`

**Original location**: `convex/auth.ts:193-196`

**Original issue**: The Convex `localhost-dev` provider checked `credentials.hostname`, which was client-supplied and therefore spoofable.

**Fix**: The spoofable hostname check was removed from the Convex provider. Localhost gating now happens in the Next.js route by checking the actual request URL hostname before the sign-in action runs.

**Verification**: `convex/auth.ts` no longer reads `credentials.hostname`, and `src/app/api/auth/localhost-dev/route.ts` rejects non-localhost requests.

---

### [MEDIUM] F-03: Middleware does not verify `adminRole` for `/admin` paths

**Status**: Fixed

**Resolved in**: `src/proxy.ts`

**Location**: `src/proxy.ts:182-188`

**Issue**: For requests to `/admin/*`, the middleware only calls `convexAuth.isAuthenticated()`. Role enforcement is delegated to the layout (`src/app/(dashboard)/admin/layout.tsx`). This is a defence-in-depth gap: if a new admin page is added without being nested under that layout (e.g., as a standalone route), an authenticated non-admin user could access it with no role check.

**Reproduction**: Add a route at `src/app/(dashboard)/admin/secret-page/page.tsx` without importing `AdminLayout`. Any authenticated rider can access it.

**Fix**: The middleware now retrieves the auth token, queries the current user through Convex, and redirects authenticated non-admins away from `/admin` to `/dashboard`.

---

### [Info] `convex/lib/authz.ts` ownership helpers are correct

All `requireX` helpers (`requireSessionOwner`, `requireBikeOwner`, etc.) follow the pattern:

```ts
if (!record || record.userId !== userId) {
  throw new Error("...");
}
```

No helper returns `null` on ownership failure — all throw unconditionally. No silent IDOR risk.

---

### [Info] Admin auth chain is complete for existing routes

The full chain works correctly:

1. `src/proxy.ts` — checks `isAuthenticated()`
2. `src/app/(dashboard)/admin/layout.tsx` — calls `getCurrentAdminSession()` which does `fetchQuery(api.users.queries.getCurrentUser)` with a valid Convex token and validates `adminRole`
3. Convex mutations — call `requireAdminRole()` or `requireAnyRole()` which double-check `adminRole` at the DB layer

No gap in the chain for existing routes.

---

### [Info] Magic-code auth rate limiting is in place

`convex/authRateLimit.ts` limits email verification to 3 attempts per 15-minute window using a token-bucket per email address. `convex/auth.ts` calls this before sending any email. Blocks email spam via the magic-code flow.

---

### [Info] Dev-login secret is checked server-side in Convex action

Despite being exposed (F-01), the `LOCALHOST_DEV_LOGIN_SECRET` is compared inside the Convex action using `submittedSecret !== configuredSecret` — the Convex action reads the env var server-side to do the comparison. The exposure issue is that the secret value in the client bundle tells an attacker what to submit, not that it bypasses the check.
