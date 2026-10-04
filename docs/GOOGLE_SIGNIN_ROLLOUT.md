# Google Sign-In Rollout Notes

## Production contract

Canonical origin: **`https://bikefitboost.com`**, without www. The browser-facing Google OAuth endpoints are Next route handlers; Convex still performs provider authorization, token exchange and session management.

| Endpoint | Behavior |
| --- | --- |
| `/api/auth` | Existing Convex Auth action POST endpoint; creates the Next verifier cookie when starting Google sign-in. |
| `/api/auth/signin/google` | GET proxied to the same path on `NEXT_PUBLIC_CONVEX_SITE_URL`; preserves the verifier `code`, optional `redirectTo`, cookies and provider redirect. |
| `/api/auth/callback/google` | GET/POST proxied to the same upstream path; preserves query, Cookie, POST body/content type, status, Location and separate Set-Cookie headers. |
| Localized app landing page | Convex Auth middleware exchanges the final Convex verification code and sets the session cookies. |

Sources: `src/app/api/auth/signin/[...path]/route.ts:1`, `src/app/api/auth/callback/[...path]/route.ts:1`, `src/lib/auth/oauthProxy.ts:38`. The helper uses manual redirects, no-store caching, a 15-second fetch timeout, generic 503 for invalid/missing upstream configuration and generic 502 for transport failure. It never follows the provider redirect itself.

`src/proxy.ts:274` bypasses Convex Auth middleware for the Google signin/callback namespaces. This is necessary because the installed middleware otherwise consumes any HTML GET `code` as a Convex verification code. Normal landing-page exchange, `/api/auth` POST and `/api/auth/localhost-dev` remain on the existing middleware path.

## Required environment configuration

These are owner-applied release values, not commands already executed. Do not switch the Convex auth base before deploying the handlers.

| Runtime | Variable | Value |
| --- | --- | --- |
| Convex | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Existing matching Google Web application credentials; secret remains backend-only. |
| Convex | `CUSTOM_AUTH_SITE_URL` | `https://bikefitboost.com` — no trailing slash; controls both signin and provider callback URLs. |
| Convex | `SITE_URL` | `https://bikefitboost.com` — controls post-auth landing URL and redirectTo validation. |
| Vercel/Next | `SITE_URL`, `NEXT_PUBLIC_SITE_URL` | `https://bikefitboost.com` |
| Vercel/Next | `NEXT_PUBLIC_CONVEX_SITE_URL` | Existing Convex HTTP actions origin, **not** the application origin. |
| Vercel/Next | `NEXT_PUBLIC_CONVEX_URL` | Existing Convex API origin, unchanged. |
| Vercel/Next | `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | `true` only when release prerequisites pass; public build-time configuration requires the matching deployment. |

Keep built-in Convex `CONVEX_SITE_URL` and the JWT issuer unchanged. The recorded production HTTP origin is `https://elegant-panther-767.eu-west-1.convex.site`; owner must confirm it against the selected deployment. Installed `@convex-dev/auth` 0.0.95 uses CUSTOM_AUTH_SITE_URL in `src/server/implementation/signIn.ts:239` and `src/server/oauth/convexAuth.ts:12` under its package directory; SITE_URL is separately read in `src/server/implementation/redirects.ts:56`. The shared frontend origin helper does not change that library behavior.

## Exact Google Console entries

Apply to the existing Web application client whose ID matches Convex. Retain the app name; no further brand changes are part of this migration.

| Field | Production value |
| --- | --- |
| Authorized JavaScript origins | `https://bikefitboost.com` |
| Authorized redirect URIs | `https://bikefitboost.com/api/auth/callback/google` |
| Branding: authorized domain | `bikefitboost.com` |
| Application homepage | `https://bikefitboost.com/en` |
| Privacy policy | `https://bikefitboost.com/en/privacy` |
| Terms of service | `https://bikefitboost.com/en/terms` |

JavaScript origins contain no path; the entry is not a substitute for the redirect URI in this server-side OAuth flow. The callback has no trailing slash. Explicit English public pages avoid locale negotiation during review. Verify domain ownership and the public pages before submitting updated branding. Google requires exact callback matching and accurate public consent links: [web-server OAuth requirements](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred), [brand verification requirements](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification).

Add the apex callback first. Retain the currently registered previous callback temporarily for rollback and review other client entries before removing them. The migration inventory records a direct Convex callback; its current Console registration has not been verified. Use separate client/deployment configuration for development. Merely registering `http://localhost:3000/api/auth/callback/google` does not configure the backend or prove production Secure/Partitioned cookie behavior.

## Cookies

Installed OAuth cookies are host-only, HttpOnly, Secure, SameSite=None, Path=/ and Partitioned, typically with `__Host-googleOAuth…` names and a 15-minute lifetime. Preserve each Set-Cookie header separately and forward callback Cookie headers. Next JWT/refresh/verifier cookies are separately host-only, HttpOnly, SameSite=Lax and Secure outside localhost. Old-host/www sessions do not transfer to the apex. Inspect actual browser behavior; the installed callback does not serialize all temporary-cookie clearing instructions.

## Data Ownership Rules

- `users.displayName` is the app-owned display name.
- `users.displayNameSource="manual"` prevents future automatic Google overwrite.
- `users.profile_image_url` is the custom uploaded profile image.
- `users.profileImageSource="manual"` prevents future automatic Google image takeover.
- Google provider data is still stored separately in:
  - `users.googleEmail`
  - `users.googleName`
  - `users.googleProfileImageUrl`

## Effective UI Fallbacks

Display name fallback:

1. `displayName`
2. `googleName`
3. auth `name`
4. email local-part
5. app fallback label

Profile image fallback:

1. `profile_image_url`
2. `googleProfileImageUrl`
3. auth `image`
4. `/default-profile.svg`

## Release order and acceptance checklist

These checks are pending owner-authorized release work; documentation and mocked tests do not certify live sign-in.

1. Complete local proxy/middleware contracts and the parent's combined validation gates. Run an isolated test deployment/browser flow with a separate provider client before production cutover. Record current Console, Convex and Vercel settings securely for rollback; do not put secrets or auth codes in evidence.
2. Confirm ownership of `bikefitboost.com`, public homepage/privacy/terms availability and any Google verification requirement. Add the exact apex client entries before changing Convex runtime settings. Temporarily retain the currently working callback.
3. Deploy the compatible Next handlers and middleware bypass before setting CUSTOM_AUTH_SITE_URL to apex. Confirm the upstream points to Convex and the public flags match the deployed build. Coordinate Vercel domain routing: remove the current apex→www redirect before enabling www→apex; ensure HTTPS apex callbacks stay on apex without a redirect loop. Keep new OAuth starts paused or tightly coordinate the transition.
4. Align Convex SITE_URL and CUSTOM_AUTH_SITE_URL and Vercel site origins to the values above. Leave Convex API/HTTP transport and issuer settings unchanged. Restart flows begun before the switch if needed; changing the callback base mid-exchange can fail token exchange.
5. Enable/expose Google sign-in only after prerequisites pass, then perform and record the acceptance checks below. Coordinate the new sender separately: email-code tests follow verification of `notifications.bikefitboost.com` and the intended `noreply@notifications.bikefitboost.com` sender configuration.
6. Observe errors and repeat-login behavior before removing old client registrations. Rollback restores the recorded coherent domain-routing, callback/site configuration and compatible deployment together. Retaining the old callback supports recovery but does not transfer host-only sessions. Do not remove the handlers while CUSTOM_AUTH_SITE_URL still targets them.

- [ ] On `/en/login` and `/nl/login`, `/api/auth` POST creates a verifier and sends the browser to apex signin; signin retains `code`/`redirectTo`, sets separate OAuth cookies and returns Google redirect_uri exactly as registered.
- [ ] Google approval returns via apex callback with original code/state/cookies. Convex then returns a distinct app verification code to the expected localized landing page; middleware exchanges/removes it and establishes a session. Refresh, protected navigation and logout succeed.
- [ ] Chrome, Safari and Firefox fresh-session flows have correct cookie attributes and no partition/cookie loop. Legacy/www visits settle on apex before new sign-in; users may need to reauthenticate.
- [ ] Consent denial, invalid/missing state or cookies, and expired flows create no successful session and permit retry. An external redirectTo is rejected. POST callback body handling remains covered by proxy contracts.
- [ ] Welcome/newsletter handoff and locale survive sign-in. First Google sign-in seeds defaults; manual display-name/profile-image edits survive subsequent Google logins, per the ownership rules above.
- [ ] Normal `/api/auth` action POST and localhost-dev test behavior remain intact. App landing pages exchange valid Convex codes; provider signin/callback never consume them through middleware.
- [ ] Email magic-code login still works after the separately verified sender transition.

Detailed installed-source evidence, worker test results, limitations and the manual protocol are in [M2 auth audit](../plans/migratie/audit/M2-auth.md). No production/provider verification, deployment, environment changes or mail sends were performed for that audit.
