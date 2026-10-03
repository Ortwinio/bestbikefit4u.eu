# R11 discovery — read-only implementation handoff

Scope: rider worktree inspection only. This document is the only file written for this audit. No source edits, auth attempts, database calls, tests, commits or deploys. Implementation awaits parent dispatch. Recommendations below are engineering proposals against the R11 plan, not a legal-compliance assessment.

## Existing behavior and integration points

| Area | Actual code and behavior |
| --- | --- |
| User storage | `convex/schema.ts` users.emailPreferences currently contains required `service` and `marketing` booleans inside an optional object. No newsletter field or newsletter consent metadata was found. |
| Authenticated preferences | `convex/emails/preferences.ts` get resolves the authenticated user; missing object defaults to `{service:true, marketing:true}`. set authenticates with `requireUserId` but replaces the entire preference object. |
| Signed-link persistence | `convex/emails/preferencesData.ts` read/update are internal functions; update normalizes the signed user id and rebuilds the object from service/marketing arguments plus existing/default values. Both replacement paths must preserve a newly introduced newsletter field and consent metadata. |
| Signed-link actions | `convex/emails/preferenceActions.ts` view/save/unsubscribe verify the token; preference-purpose tokens may edit both existing categories. Unsubscribe-purpose tokens can only set the signed category false. User id comes from the token, not caller input. |
| Email authentication | `src/app/(auth)/login/page.tsx` sends a code using signIn(resend), then verifies it separately; resends and change-email are separate handlers. Verification requires `result.signingIn`; navigation waits for authenticated state. No separate signup route or authoritative new-account result is exposed here. |
| Google authentication | Same page calls signIn(google, {redirectTo}), then navigates to its returned redirect URL. React state alone cannot survive this full-page round trip. Google is gated by both frontend and backend configuration. |
| Post-login destination | Login goes to locale-prefixed `/welcome` when handoff=1, otherwise `/dashboard`. The authenticated-state effect can navigate before an asynchronous preference write finishes. A login-page-only consumer would miss Google completion at those destinations. |
| Auth callbacks | `convex/auth.ts` afterUserCreatedOrUpdated also runs for unverified email requests. It deliberately does not set lastLoginAt for email/phone request events. Do not subscribe or record verified consent simply because this callback created a user. |
| Callback capability | Installed `@convex-dev/auth/src/server/types.ts` exposes userId, existingUserId, provider, type and profile to afterUserCreatedOrUpdated, not arbitrary submitted signIn params. beforeSessionCreation exposes userId only. Do not assume a newsletter flag passed into signIn reaches either callback or survives Google OAuth. |
| Shared authenticated mount | `src/app/ConvexClientProvider.tsx` mounts `LoginLocaleBackfill`. This is a useful placement precedent for post-auth work, but its attempt-ref/fire-and-forget/error-swallowing semantics are not sufficient for consent persistence/retry. |
| Session scope | `getAuthSessionId` is available and used in `convex/profiles/prompts.ts`. Installed authSessions has userId and expirationTime, plus Convex document creation time; no provider/intent binding field was found there. A session id alone does not prove which browser checkbox attempt initiated it. |
| Current preference UI | `src/app/email-preferences/EmailPreferencesClient.tsx` supports authenticated mode without a token and signed-token mode from a URL fragment. It loads two categories and submits both. No unsubscribe runs on mount. An invalid token is not silently replaced with the logged-in user's preferences. |
| Copy overlap | `src/i18n/account/emailPreferences.ts` already labels marketing as “News and offers” / “Nieuws en aanbiedingen.” New newsletter copy must distinguish categories; do not treat existing marketing=true as newsletter consent. |
| Logout | `UserMenu.tsx` and `DashboardSidebar.tsx` independently call signOut. Any pending signup-consent state needs cleanup on every logout route, not just one button. |

## Recommended checkbox → authenticated consent handshake

1. Render a distinct optional, initially unchecked newsletter checkbox shared by the email and Google entry actions, with the actual NL/EN wording shown at selection time. Never initialize it from cookie consent, calculator handoff, marketing=true, Google profile data, or stale pending intent. Authentication works with the box unchecked and when optional consent storage is unavailable.
2. On explicit checked submission, capture a **separate short-lived, one-attempt intent** containing only the necessary consent choice, displayed locale/wording version, attempt identifier and timing information. Stage it before starting either provider. Session storage can bridge the same-tab Google redirect; do not put consent flags, metadata or email into redirectTo, OAuth authorization URLs, analytics, or calculator handoff. Do not reuse R12's localStorage/30-day persistence for consent. Unchecked signup means no opt-in request, not an instruction to unsubscribe an existing account.
3. Clear/invalidate stale intent when starting another attempt, unchecking, changing email/provider, cancelling, logging out, or expiring. Resend/retry of the same email attempt should not fabricate another consent event. Failed authentication must never subscribe an unverified user. If preserving intent for retry, keep it bound to that attempt only.
4. After verified authentication, submit to an **authenticated mutation** that resolves userId/session server-side. Do not accept an authoritative caller-supplied userId, consentAt or source. Signup/profile entry points establish their own source; token preferences use their verified token identity. Validate locale and supported wording version and record server acceptance time honestly as that event, not a guessed original click time.
5. Bind consumption to the same successful auth attempt and make it idempotent server-side, not only with a React ref. A persisted processed-intent/session marker can prevent StrictMode, reload or network-retry duplication and, critically, prevent a delayed retry from re-enabling a subscription after withdrawal. Use an atomic mutation for preference + metadata + consumption result. Return a value-free changed/accepted outcome so analytics is emitted only after persistence.
6. Mount completion where both `/welcome` and `/dashboard` arrivals are covered, or deliberately introduce a fixed internal completion route before the existing destinations. Keep the destination locale/handoff behavior intact. Do not redirect away before the only consumer can persist the choice. On uncertain failure, keep newsletter false and offer explicit retry/profile control; do not display success or silently bind the intent to a later account.

### Binding decision the parent must resolve before implementation

A generic provider effect that drains any sessionStorage flag whenever `isAuthenticated` becomes true is **not safe enough**: another tab can establish a session, an abandoned Google flow can leave a flag, and a later account can receive that flag. A browser nonce or checking a “recent” session timestamp alone is not proof of the matching auth attempt.

Prefer an explicit server-verifiable attempt/session binding carried in request bodies or protected server-side flow state, without modifying the library's OAuth state/PKCE protocol. Its supported hook needs investigation before promising automatic one-tap completion across both providers; the inspected callbacks do not expose arbitrary parameters. Email flow must also verify the intended verified account rather than blindly accepting any auth transition. Google must not infer the selected identity before provider completion.

If reliable binding cannot be established within the chosen auth integration, fail closed and request an explicit authenticated confirmation for that account rather than silently subscribing it. That is a UX tradeoff against the one-tap brief and needs parent approval, not an implicit implementation change. Browser storage being unavailable should likewise degrade to optional post-auth consent, never a default opt-in or blocked login.

Also decide whether “signup” consent can be newly granted during an existing-account login, since the current screen combines both. Do not determine newness from profile completion, or only from user._creationTime: an email request can create the user before code verification. A first verified-login marker would be a separate backend decision.

## Defaults, metadata and update semantics

- Add newsletter as optional storage for backwards-compatible documents, but normalize every relevant read to `newsletter: existing.newsletter ?? false`. Do this even when the old preference object already exists. Keep service/marketing defaults and prior settings unchanged; R11 does not authorize a migration of their historical semantics.
- Never backfill consent for existing users. A stored false/default-false value needs no invented consent timestamp, source or wording.
- Required positive-consent metadata from the plan: `newsletterConsentAt`, source `signup | profile | preferences`, locale and wording version. Server acceptance time must be real; version must identify the text actually shown, not whatever text is current after an old pending intent returns.
- Positive transitions require explicit intent and metadata. No-op updates and ordinary login must not refresh the consent date. Avoid erasing newsletter/metadata when service or marketing is changed by an older client.
- Withdrawal sets only newsletter=false and must remain possible without supplying affirmative-consent metadata. Preserve historical grant evidence rather than rewriting it as a new grant; if recording withdrawal, use separately named withdrawal/event fields. Parent decides snapshot versus append-only consent history and retention.
- Prefer narrowly scoped patch arguments for profile/newsletter controls. Existing “replace all preferences” calls need merging in one shared internal implementation; full stale-form writes can otherwise resurrect a withdrawn category. Consider version/conflict protection or submit only explicitly changed categories.
- Keep newsletter opt-in independent from current lifecycle mail. `convex/emails/lifecycle.ts`, lifecycleData and fitpass paths gate service/marketing using “not false”; a future newsletter sender must require affirmative newsletter=true. Newsletter sending is explicitly out of scope.

## Signed unsubscribe paths: preserve and extend

`convex/emails/unsubscribeTokens.ts` currently uses HMAC-SHA256 with timingSafeEqual, a minimum 32-character secret, a 2048-character token cap, version 1, 180-day expiry, signed userId/locale/purpose/category, and only service/marketing categories. These are signed bearer tokens, not encrypted payloads; no email is in the payload. Keep tokens out of logs/analytics.

Extend `EmailCategory`, signer input validation, verifier category allowlist, action return types, internal update arguments, schema, UI Preferences/TokenView, and localized category labels together for newsletter. Existing service/marketing tokens should remain valid. Preserve purpose separation: unsubscribe can only disable its signed category, never enable it or edit another category; preference-purpose tokens may save explicit choices using the signed identity. Enabling newsletter through a preferences token must record source=preferences and validated wording/locale metadata; viewing the link never grants consent.

The existing URL architecture is intentional and separate from the **no signup-consent data in URLs** requirement:

- One-click link is `{CONVEX_SITE_URL}/emails/unsubscribe?token=...` with List-Unsubscribe and List-Unsubscribe-Post headers. Do not remove that existing token transport while adding the category.
- `convex/http.ts` GET verifies and 303-redirects to the localized website fragment confirmation; GET does not mutate. POST performs idempotent category-scoped disable without requiring account cookies. Responses set no-store/no-referrer/noindex headers.
- Website preferences links use `/{locale}/email-preferences#token=...`; the UI loads the signed view and requires an explicit button/form submission. Keep invalid-token handling fail-closed and do not substitute the current account when a bearer token points elsewhere.
- Older preference clients may omit newsletter. Treat omission as preserve, not false or true, so an unrelated save cannot wipe a grant or create one.

## Dispatch map and tests to retain/add

Suggested coordination boundaries (not ownership claims): parent backend/schema/auth-attempt binding and shared consent persistence; login agent checkbox/pending lifecycle; provider agent authenticated consumer; profile/preferences UI agent controls and NL/EN; email agent category token/action extension. Shared changes must agree on metadata names, transition results, retry semantics and old-client compatibility first.

Useful existing suites: `convex/emails/__tests__/preferences.test.ts`, `convex/__tests__/auth.contract.test.ts`, `src/app/(auth)/login/page.test.tsx`, `src/components/providers/LoginLocaleBackfill.test.tsx`, and `src/app/email-preferences/EmailPreferencesClient.test.tsx`.

Acceptance additions:

- Missing object and old two-field object normalize newsletter=false; no inferred consent from marketing=true or auth creation.
- Email send/resend/invalid code, Google cancel/failure and unchecked submit perform zero subscription writes; successful explicit choice works for both destinations/providers.
- Auth transition in another tab, different account/provider, expired intent, blocked storage and logout cannot consume an unrelated intent.
- Double effect, reload, lost response and post-unsubscribe replay remain idempotent and cannot re-enable a withdrawn subscription.
- Positive grant records validated source/locale/version and honest server time; unrelated preference changes preserve it and the other categories/users.
- Newsletter signed GET never mutates; repeated POST disables only newsletter, with no authentication cookie needed. Tamper, expiry, wrong purpose/category and absent secret fail closed; existing category links still work.
- Token-mode and authenticated UI agree on defaults; no unsubscribe on load; no prechecked signup box; localized wording and narrow updates; no consent data in auth URLs/logs.
- Add `newsletter_opt_in` to the authenticated analytics allowlist if using the existing logger (`src/lib/analytics/marketing.ts`, consumed by `convex/analytics/mutations.ts`); do not add it to anonymous events or attach consent values/email/token/ids. Emit only after a real persisted grant, not on checkbox change.

No legal or external-provider behavior beyond inspected local code was asserted; auth-binding feasibility remains the principal implementation question.
