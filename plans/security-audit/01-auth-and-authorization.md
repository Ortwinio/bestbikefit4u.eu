# Prompt 01 — Auth and Authorisation Audit

## Context

Read `plans/security-audit/README.md` first.

## What to review

### 1. Middleware route protection (`src/proxy.ts`)

Read `src/proxy.ts` in full.

Check:
- Which path prefixes are protected by `convexAuth.isAuthenticated()`
- The `/admin` block: it checks `isAuthenticated` but does NOT verify `adminRole`. The admin layout must enforce the role. Verify that `src/app/(dashboard)/admin/layout.tsx` (or equivalent) calls a Convex query to confirm the user has a valid `adminRole` before rendering.
- Any path that should be protected but is missing from the matcher or the auth check block
- The `x-bbf-redirect-fetch` header used internally by the redirect cache fetch — verify the `/api/guide-redirects` route does or does not enforce this header, and decide if that matters

### 2. Admin role enforcement chain

Trace the full chain for an admin page request:
1. `src/proxy.ts` — checks `isAuthenticated`
2. Admin layout component — must check role via Convex query
3. Convex query/mutation — must call `requireAdminRole()` or `requireAnyRole()`

Read:
- `convex/admin/authz.ts` — `requireAdminRole`, `requireAnyRole`, `requireAdminUserId`
- Any admin layout file under `src/app/(dashboard)/` or `src/app/admin/`
- A sample admin mutation (e.g. `convex/admin/mutations.ts`)

Identify any gap in the chain (e.g. layout skips role check, or mutation relies on layout instead of enforcing at DB level).

### 3. Convex auth helpers coverage

Read `convex/lib/authz.ts`. Check that all `requireX` helpers throw unconditionally when ownership fails — verify the pattern:
```ts
if (!record || record.userId !== userId) {
  throw new Error("...");
}
```
Note any helper that returns `null` instead of throwing (silent failure = IDOR risk).

### 4. Dev login backdoor

Read any file referencing `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN` or `LOCALHOST_DEV_LOGIN_SECRET`.

Check:
- Is the dev login gated strictly to `NODE_ENV === 'development'` or a specific env flag?
- Could it be activated in a staging/preview deployment if env vars are set?
- Is the secret (`bbf4u-local-dev-login`) ever checked in source, or only via env?

### 5. Session and cookie security

Read `src/proxy.ts` — locale cookie is set with `secure: process.env.NODE_ENV === 'production'`. Check:
- Auth session cookies set by `@convex-dev/auth` — are they httpOnly, Secure, SameSite?
- Any cookie set without `httpOnly` that carries sensitive data

## Output

Write findings to `plans/security-audit/findings/01-auth-authorization.md`.

Use this structure per finding:
```
### [SEVERITY] Finding title
**Location**: file:line
**Issue**: What is wrong or at risk
**Reproduction**: How to trigger (if applicable)
**Recommendation**: Specific fix
```

Severity: Critical | High | Medium | Low | Info
