# M2 — Google OAuth through the canonical site

M4 subsequently removes all Strava functionality, including the Strava-only callback and middleware
exception described below. M2's recorded checks are historical; Google OAuth remains in place.

## Scope and ownership

Worktree `/Users/ortwinverreck/Developer/bestbikefit4u-migratie`, branch `migratie/bikefitboost`, baseline
`4279f71`. Read the migration README and both inventories; the later owner decisions override their
earlier www proposals: `https://bikefitboost.com`, mail through `notifications.bikefitboost.com`, no
additional brand-name changes. Every Git invocation used the explicit migration-worktree `-C` path.
Existing `.gitignore`, plan inputs and other owners' work were preserved.

Parent implemented the forwarding helper, routes and real loopback HTTP contract. Two parallel workers
implemented installed-middleware regression tests/bypass and the Google/Strava audit, rollout guide and
Strava route tests. A owns origin/config changes and the final combined build/gates; C owns mail,
database migration and migration-check tooling. No competing Next build was started by B.

## Implementation

- Dedicated GET `/api/auth/signin/[...path]` and GET/POST `/api/auth/callback/[...path]` handlers forward
  to the configured Convex HTTP actions origin. No `next.config.ts` edits or broad auth catch-all.
- Preserve encoded/repeated query parameters, callback Cookie header, POST bytes/content type,
  upstream status/Location and every individual Set-Cookie (including comma-bearing Expires).
  Redirects are manual; the app server never follows Google or the final landing page.
- Dynamic/no-store responses, 15-second fetch timeout and request cancellation; remove hop-by-hop,
  spoofable host-forwarding, content-length and fetch-decoded content-encoding headers. Missing/invalid
  upstream returns generic503; transport errors generic502. No codes, tokens, cookies or errors logged.
- OAuth namespace bypass runs **before** the installed Convex middleware consumes HTML GET `code`.
  Exact `/api/strava/callback` has the same required bypass. CSP/deployment headers remain applied.
  `/api/auth` action POST, localhost-dev routing/session refresh, and localized app-code exchange retain
  their original behavior, including same-origin action protection.
- Strava route implementation is unchanged; 19 tests cover its HTTP-actions target, query preservation,
  manual redirects and error behavior. A owns Strava authorization origin normalization.
- `audit/M2-auth.md` records installed `@convex-dev/auth`0.0.95 source evidence, exact Google Console
  values, cookie semantics, remaining library limitations and manual release acceptance. The coordinated
  update to `docs/GOOGLE_SIGNIN_ROLLOUT.md` supersedes its incorrect old callback guidance.

## Validation

| Check | Result |
| --- | --- |
| `npx vitest run src/lib/auth src/proxy.oauth.contract.test.ts src/app/api/strava/callback/route.test.ts` | 4 files / 62 tests PASS |
| Proxy unit tests | 22 PASS |
| Installed Convex Auth middleware contracts | 20 PASS |
| Strava route tests | 19 PASS |
| Native HTTP fake-provider contract | 1 PASS |
| `npm run typecheck` | PASS |
| `npx tsc --noEmit -p convex/tsconfig.json` | PASS |
| Final `npm run lint` | PASS, including zero brand-guard findings |
| Scoped `git diff --check` | PASS |

The fake-provider test binds only an ephemeral `127.0.0.1` server, invokes the actual exported route
functions/native fetch, checks separate secure/partitioned state cookies, manually follows the local
fake provider, returns an app-code redirect, and rejects missing/invalid fake state. It establishes wire
forwarding, **not** real Google authentication, actual Next routing/browser cookie storage, production
credentials or session creation. Installed-middleware tests independently exercise the real package
source with network/context mocks. The manual real-browser protocol remains explicit in the auth audit.

Initial scoped lint caught `prefer-const` in the new HTTP test and typecheck caught global RequestInit's
nullable signal versus NextRequest's stricter type. Both were fixed and rerun. Initial full lint's five
other-owner brand-guard findings were reported to A; subsequent guard check passes. No checks or test
exclusions were weakened. No temporary source copies or node_modules trees were created under plans.

Logs: `/private/tmp/m2-focused-final.log`, `m2-typecheck-final.log`, `m2-convex-tsc.log`,
`m2-lint-final.log`. A owns the single full unit/contracts/build/local-crawl integration run after all
sources freeze; C owns email previews and the M3 checker. These are not claimed as B-run results.

## Release boundaries

Required owner-applied settings include Convex `CUSTOM_AUTH_SITE_URL=https://bikefitboost.com` (no
trailing slash), separately `SITE_URL=https://bikefitboost.com`, and the registered exact Google callback
`https://bikefitboost.com/api/auth/callback/google`. Keep the proxy upstream and JWT issuer on Convex.
Deploy handlers before switching the auth base. Coordinate the Vercel apex/www flip and provider
registrations; existing host-only sessions do not transfer and in-flight flows can require restart.

No commits, deployments, production reads/writes, provider logins, live mail, scheduling, real environment
changes or dependency changes were performed. Only synthetic process-local environment values were used
inside tests. Exact B-owned files: `files-M2.txt`. Full release approval remains with the lead/owner.
