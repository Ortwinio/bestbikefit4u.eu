# R11 — newsletter opt-in

Rider worktree only. No newsletter sending, production calls, dependencies, commits or deployments.

## Consent boundary

- Default false, including legacy users with only service/marketing preferences. The signup choice
  is unticked. Account creation, requesting a code, resending, failed verification and an untouched
  checkbox never subscribe. Existing service/marketing defaults remain unchanged.
- Explicit authenticated writes record server-time consent source, locale and wording version.
  Atomic per-user/request receipts prevent a replay from re-enabling after an unsubscribe, even
  after a lost response. Account deletion removes those receipts.
- Signup requires the authenticated user's verified email to match expectedEmail. Normal code
  signup automatically persists only after this page's successful verification matches that email.
  Google, reload and ambiguous cross-tab auth use an explicit confirmation showing the actual
  signed-in address; no arbitrary browser flag is automatically drained into a different account.
  Lead was asked about the Google extra-confirmation UX; safe confirmation is the current choice.
- Intent storage is session-local, expires after 30 minutes, contains no email or measurement,
  and preserves the request ID for retries. Explicit uncheck/address change/cancel/success clears
  it. Expired/malformed entries are removed. Storage failure cannot imply consent.
- Existing locale and handoff destinations remain: checked auth returns through clean /login
  (with handoff=1 only when applicable), then /welcome or /dashboard after acknowledgment/cancel.
  No consent fields or IDs in URLs/analytics/logs. Logout helper integration requested from C/A,
  who own the shared shell/R12 cleanup; ambiguous leftover intent still cannot silently subscribe.

## Preferences and unsubscribe

Optional newsletter category is independent of marketing/service. Older two-category clients
omit it and preserve its saved value. Signed newsletter tokens retain HMAC, expiry and purpose
checks. GET only redirects to confirmation; one-click POST only disables the signed category.
Authenticated profile control and token/account preferences use explicit localized choices.
Value-free newsletter_opt_in is emitted only after a persisted false-to-true grant, through the
existing cookie-consent-gated logger. Newsletter sending and lifecycle cron rules are unchanged.

## Checks

Focused email/preferences/profile/login/welcome suite: 29 files, 380 tests pass. Parent's 53
signup/login/intent tests cover blank defaults, local verified-email binding, ambiguous/Google
confirmation, preservation of handoff destinations, failures, stable retries and no false analytics.
Full lint and the latest full typecheck pass after C's chain type corrections. Five analytics
helper tests pass, including authenticated-only registration of the value-free opt-in event.
The broader backend run still has six existing communication E2E fixtures missing source timestamps
required by C's new session snapshot; 978 tests pass. A/C were notified and own that integration fix.

24 real-route profile/preferences captures include NL/EN 1440/390 and dark profile contrast.
Signup/login captures cover unticked/checked/code/Google confirmation/error/retry in both locales
and widths. Parent reviewed NL desktop unticked, NL mobile account confirmation and NL mobile
preferences. Captures use offline fake auth/Convex and block external requests. No live signup,
OAuth provider, email or database was contacted. Detailed results/manifests are in R11-ui and
R11-login sidecar artifacts. Profile newsletter changes autosave on the explicit toggle; failures
retain the same request ID for retry. Existing email-preferences Save behavior remains.
