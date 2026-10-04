# M2 auth audit — Google proxy and separate Strava return path

**M4 supersedes the Strava portions of this historical audit.** The Strava callback, middleware
exception, runtime integration and release setup have been removed by later owner decision.
Do not configure a Strava callback from this document. Google settings remain applicable; current
rollout guidance is `docs/GOOGLE_SIGNIN_ROLLOUT.md`, cleanup boundaries `audit/M4-cleanup-runbook.md`.

2026-10-04. Worktree `/Users/ortwinverreck/Developer/bestbikefit4u-migratie`, branch `migratie/bikefitboost`, baseline `4279f71`. Source audit and mocked route tests only. Owner decision overrides the inventories' earlier www proposals: canonical `https://bikefitboost.com`, sender domain `notifications.bikefitboost.com`, no further brand changes.

This worker owns this audit, `src/app/api/strava/callback/route.test.ts`, `docs/GOOGLE_SIGNIN_ROLLOUT.md` (explicitly reassigned by the user), and `plans/migratie/messages/M2-worker-to-parent-auth-findings.md`. Parent owns Google signin/callback route handlers, proxy helper and middleware integration. A owns origin changes and environment examples. Shared README/aggregate manifest updates are left to parent to avoid concurrent edits.

## Exact Google Console values for the owner

Use the existing **Web application** OAuth client corresponding to deployed `GOOGLE_CLIENT_ID`; this audit did not inspect the Console or read secrets. Retain the current app name.

| Console field | Intended production value |
| --- | --- |
| Authorized JavaScript origins | `https://bikefitboost.com` (origin only, no path or trailing slash) |
| Authorized redirect URIs — add | `https://bikefitboost.com/api/auth/callback/google` |
| Branding → Authorized domains — add | `bikefitboost.com` (bare registrable domain) |
| Application home page | `https://bikefitboost.com/en` |
| Application privacy policy link | `https://bikefitboost.com/en/privacy` |
| Application terms of service link | `https://bikefitboost.com/en/terms` |

These explicit English URLs avoid locale negotiation; legal routes exist at `src/app/(public)/privacy/page.tsx:20` and `src/app/(public)/terms/page.tsx:20`. Their public availability after cutover remains a release check. No www, email-sender subdomain, Convex URL, wildcard, or callback path belongs in the new JavaScript-origin entry. The installed flow uses server-side authorization redirects, not the Google browser SDK; the JavaScript-origin entry does not replace or validate the callback registration.

Google requires the redirect URI to match exactly, including scheme, case and trailing slash: [official web-server OAuth documentation](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred). Google also requires accurate consent branding, verified domain ownership, a public homepage and a same-domain privacy policy: [official brand verification requirements](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification). These public documents were consulted on 2026-10-04; no Console changes or sign-ins were performed. Console verification status, review timing and the exact currently registered entries are unverified.

Add the new callback before changing runtime configuration. Temporarily retain the existing callback from the inventory, `https://elegant-panther-767.eu-west-1.convex.site/api/auth/callback/google`, if it is currently registered, for rollback/in-flight handling. Do not mistake that retained entry for the target callback. Preserve other legitimate entries until their use is reviewed. Development should use separate client/deployment configuration rather than sending localhost callbacks into production.

## Runtime settings and installed source evidence

Installed version: `node_modules/@convex-dev/auth/package.json:3` is **0.0.95**. The table below uses paths relative to `node_modules/@convex-dev/auth/`; application references elsewhere are repository-relative. These are installed-source findings, not assumptions from generic Convex documentation.

| Setting / behavior | Evidence and implication |
| --- | --- |
| Convex `CUSTOM_AUTH_SITE_URL=https://bikefitboost.com` | `src/server/implementation/signIn.ts:239` builds `/api/auth/signin/{provider}` using CUSTOM_AUTH_SITE_URL before CONVEX_SITE_URL, adding the verifier as `code` and optional `redirectTo`. `src/server/oauth/convexAuth.ts:12` builds `/api/auth/callback/{provider}` with the same precedence. It uses nullish fallback and raw concatenation: use no trailing slash and never an empty string. |
| Exact callback reused for Google exchange | `src/server/oauth/authorizationUrl.ts:37` uses callbackUrl for authorization; `src/server/oauth/callback.ts:121` uses it for token exchange. Changing CUSTOM_AUTH_SITE_URL during an in-flight flow can therefore invalidate that flow. |
| Convex `SITE_URL=https://bikefitboost.com` | `src/server/implementation/redirects.ts:21` appends relative paths/query strings to SITE_URL and accepts absolute destinations only with its base prefix plus an end, slash or question-mark boundary. `src/server/implementation/redirects.ts:56` strips one trailing slash. This setting controls the post-auth landing destination, independently of CUSTOM_AUTH_SITE_URL. A frontend origin helper does not override this library read. |
| Next `NEXT_PUBLIC_CONVEX_SITE_URL` | Keep the existing Convex HTTP actions origin from the inventory, `https://elegant-panther-767.eu-west-1.convex.site`, as the production proxy upstream. This is a target specification, not a live verification. Never change it to bikefitboost.com: that could proxy back into the app. |
| Convex transport and issuer | Keep `NEXT_PUBLIC_CONVEX_URL` on the existing Convex API deployment and built-in `CONVEX_SITE_URL` on Convex. Application `convex/auth.config.ts:4` uses CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_SITE_URL) as JWT issuer. `src/server/implementation/index.ts:202` advertises that Convex issuer/JWKS. CUSTOM_AUTH_SITE_URL does not migrate the issuer. |
| Next site origins | A's Vercel `SITE_URL` and `NEXT_PUBLIC_SITE_URL` target the apex; align with Convex SITE_URL and the deployed canonical helper. No environment values were inspected or changed by this worker. |
| Google provider/UI gates | Application `convex/auth.ts:160` and `convex/auth.ts:215` enable Google from GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET. `src/app/(auth)/login/page.tsx:295` gates the button with NEXT_PUBLIC_GOOGLE_AUTH_ENABLED; `src/app/(auth)/login/page.tsx:550` sends a locale-aware redirectTo. Keep credentials on the backend. |

### Cookie and redirect contract

1. The existing `/api/auth` action endpoint starts sign-in. `src/nextjs/server/proxy.ts:85` returns the generated redirect and sets the browser verifier cookie. The browser then GETs the new site signin handler. Do not redirect `/api/auth` itself to the generic OAuth proxy.
2. `src/server/implementation/index.ts:235` registers GET `/api/auth/signin/`; at line 247 it reads the sign-in verifier named `code`. At line 271 it appends individual `Set-Cookie` values and returns a 302 to Google. Preserve the query byte encoding, upstream status and Location, using manual fetch redirects so the server never follows Google or the eventual app landing page.
3. `src/server/cookies.ts:3` specifies OAuth cookies as HttpOnly, Secure, SameSite=None, Path=/, Partitioned, with **no Domain attribute**. `src/server/oauth/convexAuth.ts:32` names provider cookies `__Host-googleOAuthstate`, `__Host-googleOAuthpkce`, `__Host-googleOAuthnonce` when applicable; prefix selection depends on CONVEX_SITE_URL's localhost status, not CUSTOM_AUTH_SITE_URL. `src/server/oauth/checks.ts:10` sets a 15-minute expiry. `src/server/cookies.ts:12` adds optional `__Host-googleRedirectTo` with 15-minute Max-Age.
4. Forward callback `Cookie` headers to Convex and preserve every upstream `Set-Cookie` as a separate header. Do not comma-split cookie headers: Expires contains a comma. Do not rewrite their Domain, SameSite, Secure or Partitioned attributes. Browser storage/partition behavior on the apex must still be verified in actual browsers; unit mocks do not establish it.
5. `src/server/implementation/index.ts:284` handles provider callbacks, including form-urlencoded data at line 309; GET and POST are registered at lines 368 and 374. Preserve method, body and content type for supported POST callbacks. At line 350 success redirects to SITE_URL/redirectTo with a **Convex verification code**, distinct from Google's provider code. At line 361 provider failures redirect to the destination without a success code.
6. Library limitation: `src/server/oauth/checks.ts:36` creates cookie-clearing instructions and `src/server/cookies.ts:20` returns an updated redirect cookie, but `src/server/implementation/index.ts:322` does not capture/serialize returned OAuth cookies and line 350 emits only Location/Cache-Control. Do not claim that successful callback clears every temporary OAuth cookie; the proxy can only preserve what upstream emits.
7. Next auth JWT/refresh/verifier cookies are different: `src/nextjs/server/cookies.ts:71` names `__Host-__convexAuthJWT`, `__Host-__convexAuthRefreshToken`, `__Host-__convexAuthOAuthVerifier`; line 122 sets HttpOnly, SameSite=Lax, Path=/, Secure except localhost, no Domain. The default maxAge is null/session (`src/nextjs/server/index.tsx:202`). Existing old-domain and www cookies do not become apex cookies; plan for reauthentication.

### Middleware integration gate (parent-owned)

`src/nextjs/server/request.ts:35` treats any HTML GET with a `code` parameter as a Convex verification-code exchange by default. It strips the code and on failure clears auth cookies (line 69). `src/nextjs/server/index.tsx:223` invokes this before the application's custom middleware callback, so a late routing bypass alone is insufficient.

Parent has now excluded Google signin and callback namespaces **and exactly `/api/strava/callback`** before this exchange at `src/proxy.ts:274`. `/api/auth` POST remains on the existing action handler, `/api/auth/localhost-dev` remains distinct, and normal app landing pages still exchange the final Convex code. `src/proxy.oauth.contract.test.ts:47` covers provider-code/cookie preservation and bypass; line 123 covers retained code processing outside those paths. The worker's combined test run below verifies the current source snapshot with mocked runtime dependencies, not deployed Next behavior.

Parent handler sources reviewed: `src/app/api/auth/signin/[...path]/route.ts:1` exports dynamic GET and `src/app/api/auth/callback/[...path]/route.ts:1` exports dynamic GET/POST. `src/lib/auth/oauthProxy.ts:16` validates the configured upstream; line 38 scopes routes/methods; line 60 forwards query/method/body with manual redirects, no-store and a 15-second timeout; line 71 preserves separate Set-Cookie headers. Missing/invalid upstream yields generic 503, transport errors generic 502. Host/forwarded/hop-by-hop headers and stale transport encoding/length are stripped. These files remain parent-owned.

## Strava is a separate code path

- `convex/integrations/actions.ts:258` requires a signed-in user, generates state, stores a pending integration with 15-minute expiry at line 271, and builds authorization parameters at line 280. The intended callback is **`https://bikefitboost.com/api/strava/callback`**; A's current helper change uses `resolveSiteOrigin()` at line 267 and builds the callback at line 268. Owner's Strava app Authorization Callback Domain target is **`bikefitboost.com`**. Current provider settings were not inspected.
- `src/app/api/strava/callback/route.ts:1` prefers NEXT_PUBLIC_CONVEX_SITE_URL, removing one trailing slash; otherwise it derives `.convex.site` from NEXT_PUBLIC_CONVEX_URL and clears path/query/hash. Line 20 forwards the raw incoming query to **`{Convex HTTP origin}/strava/callback`** via GET with `redirect: "manual"`. Line 29 relays Location and redirect status; without Location it returns generic 502. It forwards no browser cookies, which this Strava backend state lookup does not require.
- `convex/http.ts:39` registers that backend endpoint. Lines 48/52 handle denial/missing parameters, line 57 looks up the integration by state, line 67 checks expiry, line 95 exchanges the code, line 129 stores the connection and clears state, and line 155 schedules import before redirecting to `/settings?strava=connected`. Final redirect uses SITE_ORIGIN at line 42. The direct-Convex registration comment at line 37 is stale relative to the action-generated callback.
- Existing limits, unchanged: route transport/configuration exceptions propagate; it trusts upstream Location and expects a redirect-compatible status; it does not forward upstream body or Set-Cookie. The backend audit is static, not a proof of atomic state consumption, replay resistance, token schema validation or successful import. No provider/API calls or database mutations were made.

### Focused verification completed

`./node_modules/.bin/vitest run src/app/api/strava/callback/route.test.ts` — **1 file, 19 tests passed** (2026-10-04). All fetches stubbed; synthetic deployment hosts and values only. Covers explicit upstream precedence/trailing slash, regional and nonregional cloud fallback with path/query/hash removal, encoded and duplicate OAuth query parameters, denial/missing/invalid/expired-state query forwarding and outcome relay, 301/302/303/307/308 preservation with manual redirects, missing Location → generic 502, missing/invalid configuration and network failures.

`./node_modules/.bin/eslint src/app/api/strava/callback/route.test.ts` — **passed**, no diagnostics. Vitest emitted the existing configLoader/native CommonJS/ESM advisory; tests passed. No build/server/new dependency. The mocked denial/state outcomes verify transport only; they do not execute Convex validation. Direct GET invocation, even with Accept text/html, bypasses Next middleware, which requires parent's separate coverage.

After the parent handlers and middleware bypass landed, ran `./node_modules/.bin/vitest run src/app/api/strava/callback/route.test.ts src/lib/auth/oauthProxy.test.ts src/proxy.oauth.contract.test.ts` — **3 files, 61 tests passed**, 2026-10-04 12:12 local. This includes the 19 worker tests and 42 parent proxy/middleware tests. `git -C /Users/ortwinverreck/Developer/bestbikefit4u-migratie diff --check -- docs/GOOGLE_SIGNIN_ROLLOUT.md` also passed. No additional runtime source edits were made by this worker.

## Manual end-to-end checklist — not executed

Run only later under owner-authorized release verification. Record sanitized status/path/cookie-attribute evidence; omit codes, cookies and tokens.

- [ ] On an isolated nonproduction deployment, use matching test OAuth client/config and exercise the real browser chain; a local HTTP mock alone cannot prove production Secure/Partitioned cookies or provider registration.
- [ ] Start signed out at apex `/en/login`; repeat `/nl/login` and the welcome/newsletter handoff. `/api/auth` POST returns an apex signin URL and sets the Next verifier cookie.
- [ ] The signin HTML GET retains `code`/`redirectTo` until Convex. It returns separate host-only OAuth Set-Cookie headers and a 302 to Google with exactly `https://bikefitboost.com/api/auth/callback/google` as redirect_uri.
- [ ] Complete Google approval: callback reaches the site handler with original provider code/state/cookies; no www/legacy redirect occurs mid-flow. Upstream redirects to the expected apex localized page with the final Convex code. Middleware exchanges that code, removes it, and establishes JWT/refresh cookies. Refresh, protected navigation and sign-out work.
- [ ] Repeat with Chrome, Safari and Firefox (including a fresh session); inspect temporary and session cookie attributes and persistence. Confirm no cross-domain cookie assumption or partition-related sign-in loop.
- [ ] Deny consent, remove OAuth cookies, use missing/invalid state, and expire a flow. Confirm no successful session and a usable retry. Check callback POST body forwarding in parent's contract tests, without adding a production provider.
- [ ] Attempt an external redirectTo; confirm Convex rejects it. Verify ordinary localized landing pages still process valid Convex codes, while Google signin/callback and Strava callback never do.
- [ ] From an authenticated apex session connect Strava: authorization redirect_uri is the apex `/api/strava/callback`, state and scopes survive, browser callback reaches Convex without losing `code`, returns through settings locale routing, and integration is connected. Test denied/missing/invalid/expired-state outcomes separately on test data. Confirm successful connection schedules import and does not clear the user's Next session.
- [ ] Legacy/www visits settle on apex before starting new flows. An already open pre-cutover flow may require restart; do not promise seamless transfer of old cookies. Verify normal `/api/auth` POST and localhost-dev test behavior separately.
- [ ] Owner separately verifies existing email-code login after Resend has verified `notifications.bikefitboost.com` and the sender setting is coordinated. This worker sent no mail.

## Release sequencing — owner operations only, not executed

1. Parent completes proxy/middleware contracts and combined validation; A/C complete origins/sender changes. Require Google signin and callback cookie/query/manual-redirect proof plus Strava middleware exclusion. Review this audit against final parent source. Do not flip CUSTOM_AUTH_SITE_URL while handlers are absent.
2. Owner records actual existing Google/Strava/Convex/Vercel settings securely for rollback. Verify domain ownership and new consent links, add the apex Google callback/origin/domain, retain the currently working callback temporarily, and satisfy any Console verification requirement before enabling the new flow publicly.
3. Deploy the compatible route handlers before switching the Convex auth base. Coordinate Vercel's current apex→www setting with the change to www→apex; remove the former first so an apex callback cannot bounce to www or loop. Ensure HTTPS apex routing, public legal URLs and upstream configuration work before starting the new flow. No code www redirect is assumed.
4. During the coordinated cutover, align Convex SITE_URL and CUSTOM_AUTH_SITE_URL to `https://bikefitboost.com`, Vercel public/site origins to apex, and Strava callback domain to `bikefitboost.com`. Keep Convex transport/issuer unchanged. Minimize or pause new OAuth starts during the transition; in-flight exchanges can fail when callback configuration changes. A frontend deployment alone cannot normalize the auth library's Convex SITE_URL.
5. Run the owner-authorized checklist, then observe auth errors and repeat-login behavior. Record evidence before declaring release success. Sender-domain activation is separately gated on Resend verification; Google callback readiness does not establish email readiness.
6. After a successful observation window and retirement of old starts, remove obsolete Google client registrations only after confirming they are unused. For rollback, restore the recorded coherent callback/site/domain-routing settings and compatible deployment together; retained old callback registration enables recovery but does not transfer host-only cookies or rescue all in-flight flows. Never roll back only the proxy while leaving CUSTOM_AUTH_SITE_URL pointed at it.

Worker result: scoped source audit, updated rollout document, 19 mocked Strava tests and the combined 61-test proxy/middleware run complete. Real provider/browser verification, Console state, production readiness, full build and release remain parent/owner gates. No commits, deployment, production requests/data access, environment edits, provider sign-ins or mail sends were performed.
