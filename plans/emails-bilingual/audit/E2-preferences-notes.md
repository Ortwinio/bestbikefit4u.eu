# E2 preferences/unsubscribe subtask

Implemented only in `/Users/ortwinverreck/Developer/bestbikefit4u-emails`. No schema, sender, lifecycleData, cron, dependency, lockfile or generated API edits by this subtask. No deployment, commit or mail delivery.

## Sender contract

Node-only `convex/emails/unsubscribeTokens.ts`:

```ts
async function buildEmailPreferenceLinks(
  userId: string,
  locale: 'nl' | 'en',
  category: 'service' | 'marketing',
): Promise<{
  unsubscribeUrl: string;
  preferencesUrl: string;
  headers: {
    'List-Unsubscribe': string;
    'List-Unsubscribe-Post': string;
  };
}>
```

Requires `EMAIL_UNSUBSCRIBE_SECRET` >=32 characters, `SITE_URL` and `CONVEX_SITE_URL`. Both URLs must be HTTPS origins; the HTTP origin rejects `.convex.cloud` RPC URLs. Missing/invalid configuration fails closed. HMAC-SHA256 signature uses constant-time verification; tokens expire after 180 days and contain user ID, locale, category, purpose, version and expiry, never email. Tokens are signed, not encrypted. Secret rotation invalidates existing links.

`unsubscribeUrl`: `${CONVEX_SITE_URL}/emails/unsubscribe?token=...`.
POST requires no cookie and sets only the signed category to false, atomically preserving the other category; repeated requests succeed. GET only redirects to a localized confirmation page and cannot mutate. Invalid, expired, deleted-account and wrong-purpose POST requests return a generic 400 without logging token values. HTTP responses use no-store/no-referrer/noindex.

`preferencesUrl`: `${SITE_URL}/${locale}/email-preferences#token=...`.
The separate preferences-purpose token permits viewing/toggling both categories. Fragment delivery keeps the token out of website requests and Referer headers. The public page uses no-referrer/noindex metadata and generic errors; it never renders identity/email. Unsubscribe-purpose tokens expose only their signed category and require explicit confirmation. Public actions repeat signature/expiry/purpose checks on each operation. Only the internal default-runtime data layer touches the database; Node crypto never enters query/mutation imports.

Without a token, this same page uses authenticated `emails/preferences:get` and `:set`; settings links to it. Anonymous visitors see sign-in instructions. Missing stored preferences default to enabled. Transactional is not a supported category and cannot be disabled. NL/EN dictionary keys are checked by TypeScript. New function calls use typed `makeFunctionReference`; generated API edits are unnecessary.

## Validation

- `npx vitest run convex/emails/__tests__/preferences.test.ts src/app/email-preferences/EmailPreferencesClient.test.tsx`: 13 passing tests across two files, using existing fake ctx/db + `_handler` style and UI mocks; no new dependencies.
- Coverage: signatures/tampering/expiry/purpose/category checks; fail-closed secret and URL configuration; default preferences/auth ownership; category isolation/idempotency; missing user; GET no mutation; cookie-free POST; both languages; explicit submit only; authenticated preferences; invalid-token UI.
- Focused ESLint across all owned code passes. Full ESLint and Convex runtime boundaries passed as part of `npm run lint`.
- Full lint stopped at tooltip guardrail: parent must register `src/app/email-preferences/EmailPreferencesClient.tsx` in `scripts/check-tooltip-coverage.mjs` `EXEMPT_FILES`. The two checkboxes have persistent visible labels and descriptions, matching settings exemptions. Script is outside this subtask's ownership; exact request is in `messages/E2-preferences-to-B-tooltip-guardrail.md`.
- Remaining contrast, CSS-module and image checks pass when run individually.
- Final `npm run typecheck`: only two other-owner errors remain at `convex/emails/fitpass.ts:27` and `:60` (optional string passed to required string). No preferences errors. Parent should rerun after integration.
- `git diff --check` for the two existing source files passes.
