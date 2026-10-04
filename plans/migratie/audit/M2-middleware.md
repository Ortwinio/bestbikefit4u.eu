# M2 middleware handoff

M4 subsequently removes the Strava-only bypass and its positive tests. Google signin/callback bypass
and normal auth processing remain. Counts below are the historical M2 validation, not M4 results.

Implemented on `migratie/bikefitboost` in `/Users/ortwinverreck/Developer/bestbikefit4u-migratie`.

## Installed middleware findings

Inspected installed `@convex-dev/auth` version `0.0.95`:

- `src/nextjs/server/index.tsx:212-224` routes the exact `/api/auth` path (with optional trailing slash) to the action proxy before normal authentication processing.
- `src/nextjs/server/request.ts:30-44` validates CORS, refreshes tokens, then intercepts any nonempty `code` on a GET accepting `text/html` unless `shouldHandleCode` excludes it.
- `src/nextjs/server/request.ts:48-75` removes `code`, calls `auth:signIn`, redirects, and sets or clears auth cookies. A provider callback code would therefore be consumed before reaching the new route handler.
- Disabling only `shouldHandleCode` would still run session refresh and cookie mutation. A return inside our existing custom callback would be too late: that callback runs after these operations.

## Implementation

`proxy()` now returns `NextResponse.next()` before calling `convexAuthProxy` for pathname matches `^/api/auth/(signin|callback)(?:/|$)` and the exact `/api/strava/callback` route. The auth namespaces include roots and children while excluding similarly named sibling paths; the Strava exception excludes both similarly named siblings and child paths. The branch retains existing nonce request headers, response CSP, and preview-host noindex headers via the existing helpers.

The original URL/query, request method/body and cookies are preserved for the parent's route handlers. No auth cookies are refreshed, consumed, cleared or set in the bypass. Provider state/verifier validation remains the responsibility of the Convex HTTP action reached through the parent's handler; this branch does not establish an authenticated session. Exact `/api/auth` POSTs, `/api/auth/localhost-dev`, and all other paths continue through the installed middleware without changed options.

Follow-up audit identified the same interception on Strava's provider callback. The exact route now bypasses Convex middleware so the existing local Strava handler receives its provider code and cookies. That handler remains unchanged; no general API bypass was added.

No `src/proxy.test.ts` existed at inspection. Added a dedicated `src/proxy.oauth.contract.test.ts` to avoid shared test ownership.

## Verification

Command: `./node_modules/.bin/vitest run src/proxy.oauth.contract.test.ts`

Result: **20 tests passed**, covering:

- HTML OAuth callback/signin requests retain encoded code/state, cookies and original URL, with no redirect, cookie write, auth exchange, refresh or auth request-context access.
- Explicit GET with `Accept: text/html` on `/api/strava/callback` retains code/state and cookies without any Convex exchange; Strava similarly named sibling and child routes retain normal middleware processing.
- Exact namespace roots and trailing slashes bypass; similarly named siblings retain normal code processing.
- `/api/auth` and `/api/auth/` POST action arguments, response JSON and refresh-cookie handling are unchanged; cross-origin POST rejection remains active.
- localhost-dev POST body remains unread for the route handler; existing session refresh still executes there.
- `/en/login` and `/nl/login` still exchange Convex codes, remove only the code query parameter, redirect and set session cookies.
- CSP nonce propagation and canonical/preview deployment header behavior remain intact.

Tests execute the installed middleware source through `vi.importActual`, mocking only Next request context and Convex network calls (plus the `server-only` marker). Loading the package's built ESM directly initially failed in Node because its extensionless `next/server` import is not resolved outside the Next bundler; source loading through Vitest avoids that harness limitation without replacing middleware behavior. The existing Vite config-loader warning remains non-fatal.

Scoped `git diff --check` passed. No build, server, full gate, dependency installation, commit, deployment, environment change or external-service call was performed. Parent owns route forwarding integration and broader gates; these tests verify middleware pass-through, not the route handler's upstream fetch.

## Scoped file list

- `src/proxy.ts`
- `src/proxy.oauth.contract.test.ts`
- `plans/migratie/audit/M2-middleware.md`
