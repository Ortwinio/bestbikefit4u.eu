# R11 newsletter backend

Production implementation is ready against `messages/B-R11-contract.md`. Boyle owns backend test changes; parent owns schema, account deletion, login/verification, analytics and overall integration. This sidecar did not modify those files or any tests. No commit, deploy, database operation, real email or newsletter sender was run/added.

## Implemented API

- `emails/preferences:get` and internal `preferencesData:read` normalize service/marketing to their existing true defaults and newsletter to false, including old two-category objects.
- `emails/preferences:setNewsletter({subscribed,source,consent,expectedEmail?})` authenticates the current existing user and accepts only signup/profile source. Signup requires an existing finite emailVerificationTime and normalized expectedEmail matching the current user's email. Returns `{newsletter,granted}`; granted is true only for a new persisted false→true transition.
- Existing authenticated `preferences:set` and signed `preferenceActions:save` keep service/marketing arguments, add optional newsletter and consent, and return the three normalized booleans plus `newsletterGranted`. Omitting newsletter preserves its state and grant/withdrawal metadata. Source is fixed to preferences for these routes.
- Shared `NEWSLETTER_WORDING_VERSION` is `newsletter-v1`; exported types include NewsletterConsent, NewsletterConsentSource, EmailPreferences and EmailPreferencesResult. Consent uses exact nl/en locale/version plus an 8–128-character request id allowing only ASCII letters, digits, underscore and hyphen (including rejection of trailing newlines).

## Atomicity and replay

`convex/emails/newsletterConsent.ts` centralizes normalization and writes. Each explicit newsletter request requires valid consent and checks `newsletterConsentEvents.by_user_request` using exact userId/requestId and `.unique()`.

The receipt insert and preference/metadata patch execute in the same Convex mutation. Convex transaction semantics supply rollback and conflict retries; no separate action/read/write sequence is used. Existing receipts return the **current** preferences with granted=false and no writes, even if the request's original payload differs. The entire replay is inert, including service/marketing fields in a combined save.

Explicit no-op requests also receive receipts. This prevents a request first submitted while subscribed from re-enabling the account if retried after withdrawal. A new explicit request id can grant again. Receipt durability/account cleanup is parent-owned; deleting receipts prematurely would invalidate replay protection.

Positive consent metadata is written only on false→true, using actual server time and validated source/locale/wording. No-op requests do not refresh a grant timestamp. True→false records newsletterUnsubscribedAt and preserves prior grant evidence. A later grant preserves that historical withdrawal timestamp; the current newsletter boolean determines subscription state.

## Signed links and internal separation

Newsletter is added to the signer and verifier category allowlists while retaining token version, purposes, expiry, HMAC verification, origin validation and existing service/marketing tokens. Token views remain read-only. Token save uses the verified token identity, not the logged-in account; UI consent locale is explicit rather than inferred from the token.

New internal `emails/preferencesData:unsubscribe({userId,category})` is the only consent-free newsletter write path and can only disable. `preferenceActions:unsubscribe` verifies unsubscribe purpose and calls that endpoint with the signed category. Internal ordinary update cannot bypass consent requirements for newsletter. No positive consent receipt is created by signed withdrawal.

The existing HTTP route is unchanged: GET verifies/redirects to confirmation without a mutation; POST invokes the signed disable. Neither token nor value logging was added. Lifecycle thresholds, email sending and service/marketing defaults were not changed.

## Validation and handoff status

- Scoped ESLint: passed for all six owned source files.
- Full `npm run lint`: passed all stages, including runtime boundaries, 55 tooltip-control files and 254 contrast checks.
- Scoped tracked-file `git diff --check`: passed.
- Initial focused existing email run: 52 passed, four failed across 56 tests. Lifecycle and fitpass/case-study suites passed unchanged. The four preferences failures require Boyle's planned updates: assertions for the additional normalized newsletter field, and fake runMutation dispatch to the new unsubscribe endpoint instead of always calling update. No tests were edited by this sidecar.
- Full `npm run typecheck -- --incremental false`: no owned-file errors; currently fails in concurrent calculatorChain/profileSnapshot/session/recommendation/generated API consumers. These remain outside this ownership.
- Exact test requirements, internal endpoint routing and initial failures are recorded in `messages/R11-backend-to-Boyle-tests.md`. Final consent/replay/token regression acceptance awaits Boyle's suite and parent combined gates; this note does not claim those unrun tests passed.

Frontend integration must retain a stable request id after a lost response. The backend verifies signup email ownership; it does not claim to bind arbitrary OAuth/browser intent to an auth attempt. Parent handles verified-email completion and explicit Google/ambiguous confirmation per contract. No global provider/layout hook was added.
