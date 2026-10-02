# E2 — Locale, preferences, crons and sending

Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-emails`, branch `feature/bilingual-emails`.
No edits in the main worktree. No real mail, deployment, cron activation or commit.
No dependencies added; package.json and package-lock.json are unchanged.

## Delivery

- Optional `users.locale`, `users.emailPreferences` and `lifecycleEmailLog.locale` preserve existing records.
  Preferences are `{ service, marketing }`, where false opts out; absent preferences remain enabled.
- Authenticated `api.users.mutations.setLocale({ locale })` updates the saved language.
  `setLocaleIfMissing({ locale })` initializes only missing language. Exact contract sent to A.
- `resolveEmailLocale` uses saved user language, then exact request language, then shared default EN.
  Login resolves only an explicit `/nl` or `/en` URL/redirectTo prefix; no country/domain inference.
- Every sender delegates to C's templates and sends both HTML and text. E2 builds no email HTML.
  Case-study confirmation uses stored lead locale; internal notification always uses NL.
- Results recap and welcome remain transactional; opt-outs never suppress them. Report sending keeps
  authenticated ownership and own-email checks and localizes existing engine notes via the report helper.
- Cron senders re-fetch current user data for each candidate, then resolve language and opt-outs.
  Logs record the locale actually rendered. Failed/unconfigured sends do not create successful logs.
  Stable Resend idempotency keys supplement lifecycle sent-log checks.
- New day1 cron runs daily at 06:30 UTC only for `createdAt` in `(now−48h, now−24h]`.
  Day3 reminders use `(now−96h, now−72h]`. Both bounds filter in the query before `take(200)`.
  Old accounts and records missing `createdAt` are excluded, even without a previous sent log.
  Existing log-based dedupe remains; reminders still skip any started fit, including a send-time
  recheck. Existing schedules and 200/500 selection limits are unchanged.
- Service: day1, fit reminder, Pro explainer. Marketing: upgrade nudge, win-back.
  Both categories add RFC one-click headers and signed footer links. Win-back retains its weekly
  schedule, inactivity threshold and 60-day cooldown, rechecked before sending.

## Unsubscribe and preferences

HMAC-SHA256 tokens include opaque user ID, category, purpose, locale and 180-day expiry; never email.
Signatures use constant-time comparison. Tokens are signed, not encrypted. Category-scoped unsubscribe
tokens cannot view/edit all preferences; separate preferences-purpose tokens can manage both categories.

`POST /emails/unsubscribe?token=...` works without cookies, updates only the signed category and is
idempotent. GET only redirects to a localized explicit-confirmation screen and never changes preferences.
Invalid, expired, wrong-purpose or missing-user operations fail closed. No token values are logged.

`/[nl|en]/email-preferences#token=...` uses fragments to avoid sending tokens in website requests.
Page metadata is noindex/no-referrer. The same page without a token uses authenticated preferences APIs;
account settings links there. All UI copy, status and errors have NL/EN dictionary entries.
Transactional preferences are not exposed or mutable.
The page uses existing CheckboxGroup/Selectable primitives with permanent labels and descriptions;
no tooltip exemption, shared UI change or tooling change was needed.

Deployment configuration for the lead (not configured/deployed here):
- `EMAIL_UNSUBSCRIBE_SECRET`: a random secret of at least 32 characters; rotating invalidates old links.
- `SITE_URL`: HTTPS website origin.
- `CONVEX_SITE_URL`: actual HTTPS Convex HTTP-action origin, not a `.convex.cloud` RPC URL.
- Existing Resend key/from configuration. Missing, empty or shorter-than-32-character unsubscribe
  secrets skip every service/marketing batch before querying candidates, with one `console.error`
  per run and no throw. Transactional mail is unaffected. Other invalid URL configuration still
  fails closed rather than sending mail without a working opt-out.

## Checks and differences

The lead replaced the original convex-test requirement with existing-style fake ctx/db + `_handler`
tests and mocked Resend. All test addresses/keys are fixtures; no network mail transport was used.
Coverage includes resolver precedence, actual EN cron → setLocale NL → next NL cron, log locale,
bounded 24h/72h windows, 10-day-old/no-log users, missing timestamps, exact bounds and pre-limit
filtering, once-only day1, fit-start skip, opt-out and stale-candidate rechecks, all five one-click
headers, missing/invalid-secret skip once per run, transactional exceptions, delivery failure,
token security and bilingual UI.

Final gates: `npx vitest run convex src/app/email-preferences` passed all 73 files / 478 tests,
including C's email template/layout/format suites and all Convex contracts. Full `npm run typecheck`
passed (cache-write sandbox approval required). Fit Pass log calls now include locale; the earlier
`A-to-B-C-typecheck.md` findings are resolved. `git diff --check` passed.
Full `npm run lint` passed: ESLint, runtime boundaries, tooltip guardrails, 254/254 contrast checks,
19 token-only CSS modules and image-weight checks. Package and lock files remain unchanged.

Open/pre-existing limits: selection still examines only 200/500 candidates per run. Already-sent or
ineligible candidates can occupy those windows; backlog fairness/pagination was explicitly not expanded.
Day1 is daily, so eligible users receive it on the next run after 24h, not exactly at the anniversary.
The bounded day1/day3 windows intentionally do not backfill users after an outage or missed run.
No check-in/progress features exist, so day7/day14 messages remain intentionally absent.
Mail5's old implementation was English despite the brief saying unchanged Dutch; C renders Dutch per SPEC.
The fit-report action retains its existing no-key development success response but never records a send.

Subtask proof: `E2-locale-notes.md`, `E2-preferences-notes.md`, `E2-senders-notes.md`.
Exact combined ownership manifest: `files-E2.txt`; C's templates/assets and A's wiring are excluded.
