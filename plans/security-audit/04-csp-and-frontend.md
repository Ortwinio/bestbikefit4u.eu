# Prompt 04 — CSP, Frontend Security, and Config Audit

## Context

Read `plans/security-audit/README.md` first.
Read `next.config.ts` in full.

## 1. Content Security Policy

The current CSP is set in `next.config.ts`. Evaluate each directive:

```
default-src 'self'
connect-src 'self' https://*.convex.cloud wss://*.convex.cloud ... (prod)
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://*.cloudfront.net https://lh3.googleusercontent.com
font-src 'self'
frame-ancestors 'none'
```

Check each:

**`script-src 'unsafe-inline'`** — This is the most significant weakness. It allows inline `<script>` tags and event handlers, which means XSS via injected HTML bypasses the CSP entirely. Investigate:
- Does Next.js App Router require `'unsafe-inline'` for hydration scripts? (In Next 13+, nonces or `'unsafe-eval'` may be needed)
- Can `'unsafe-inline'` be replaced with a nonce-based approach or `'strict-dynamic'`?
- Is GTM loaded in a way that requires `'unsafe-inline'`?

**`style-src 'unsafe-inline'`** — Required by Tailwind CSS in development, but in production Tailwind generates static classes. Check if `'unsafe-inline'` is still needed in the production CSP.

**`connect-src` in dev mode** — `http://127.0.0.1:*` is very broad. Acceptable for dev, but verify the `isDev` flag is reliable.

**Missing directives to consider**:
- `object-src 'none'` — should be explicit to block plugins
- `base-uri 'self'` — prevents base tag injection
- `form-action 'self'` — restricts form submissions to same origin
- `upgrade-insecure-requests` — prod only

**`X-Frame-Options: DENY`** — Good. Also check `frame-ancestors 'none'` in CSP (it is set, good).

## 2. Environment variable exposure

Check for any `NEXT_PUBLIC_` prefixed variables that should NOT be exposed to the client bundle:

Read `src/app/api/health/config/route.ts` — it reads server-only env vars but only returns boolean presence. This is safer than returning values, but still exposes the deployment surface. Flag if this endpoint is public without auth.

Run a grep for any place where a secret/key value (not just `process.env.X`) is written into a `NEXT_PUBLIC_` variable or into a client component:
```
Grep for: NEXT_PUBLIC_.*SECRET|NEXT_PUBLIC_.*KEY|NEXT_PUBLIC_.*TOKEN
```

Also check `src/app/api/preview/route.ts` — `PREVIEW_SECRET` is compared against a URL query string parameter, which means:
- It may appear in server access logs
- It may appear in browser history
- It may be leaked in the `Referer` header if the preview URL is linked somewhere

## 3. Error message exposure

The Convex auth helpers throw plain strings:
- `"Not authenticated"`
- `"Not authorized: admin role required"`
- `"Session not found"`

Check: Are these error messages surfaced to end users via the frontend? Check how `useQuery`/`useMutation` error states are displayed in:
- `src/app/(dashboard)/` pages
- Any error boundary components

If raw Convex error messages are shown to users, they can leak internal structure.

## 4. Next.js draft mode security

Read `src/app/api/preview/route.ts` and `src/app/api/preview-exit/route.ts`.

Draft mode cookies set by Next.js are httpOnly and Secure. But check:
- Can any unauthenticated user call `/api/preview-exit` to clear draft mode? (Low severity but noted)
- The `preview` route requires `PREVIEW_SECRET` AND a Convex auth token — is this the right balance?

## 5. Deployment-specific headers

Read the `applyDeploymentHeaders` function in `src/proxy.ts`:
```ts
function shouldApplyNoIndexHeader(hostname: string): boolean {
  return hostname !== BRAND.host;
}
```

Check:
- What is `BRAND.host`? Read `src/config/brand.ts`
- Does this correctly prevent preview/staging deployments from being indexed?
- Is `X-Robots-Tag: noindex` sufficient, or should it also set `noindex` in the HTML `<meta>` tag for belt-and-suspenders?

## 6. Sentry configuration

Read the Sentry config in `next.config.ts`:
```ts
widenClientFileUpload: false,
sourcemaps: { disable: true },
```

Check:
- Source maps are disabled in the uploaded bundle — good
- Sentry is configured with `silent: true` — verify it still captures errors in production
- Check `sentry.client.config.ts` and `sentry.server.config.ts` if they exist — verify `dsn` is not hardcoded

## Output

Write findings to `plans/security-audit/findings/04-csp-and-frontend.md` using the severity format from prompt 01.
