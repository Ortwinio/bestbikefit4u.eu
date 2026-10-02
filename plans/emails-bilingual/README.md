# Bilingual emails + new email design

**Goal:** implement the new BestBikeFit4U email design for every user email and make them NL/EN,
following the language the user chose on the website. Full product spec (fixed copy): `SPEC.md`.

**Branch / worktree:** `feature/bilingual-emails` in `/Users/ortwinverreck/Developer/bestbikefit4u-emails`
(branched from `release/2026-10-01` @ `1ca197e`, the open release PR #4). **All work happens in that
worktree, never in `~/Developer/bestbikefit4u`.** Delivered as a PR; the lead commits and opens it.

## Rules
- **Never send mail to real users.** No Convex deployment exists for this branch; verify with
  fake in-memory ctx/db + `_handler` tests with mocked Resend, previews and screenshots. Do not run `npx convex deploy` or `convex dev`
  against production, and do not enable crons for real users.
- No commits. At DONE, list exact files in `audit/files-<id>.txt` (inside this folder), notes in `audit/<id>-notes.md`.
- Edit only your own files (table below). Need something in another owner's file? Write
  `plans/emails-bilingual/messages/<from>-to-<to>-<topic>.md` and tell the lead.
- Frozen: `src/i18n/messages/nl.ts`, `en.ts`. Copy from SPEC section 5 is literal.
- Gates per task: focused vitest, `npm run typecheck`, `npm run lint`.

## Research (lead, 2026-10-02) — differences from the brief marked ⚠

- **Website language:** route prefix `/nl` / `/en`, chosen in `src/proxy.ts` via `decideProxyAction`
  (`src/i18n/proxyDecision.ts`): path prefix wins, else cookie `bf_locale` (1 year), else
  Accept-Language. Switching = `src/components/layout/LanguageSwitch.tsx` (links to the other prefix;
  proxy sets the cookie). **Site default: `DEFAULT_LOCALE = "en"`** (`src/i18n/config.ts:5`).
- **User record:** `users` table, `convex/schema.ts:221` (auth fields + tier, displayName, googleName,
  theme_preference, unit_preference, proSince, stripe…). **No locale and no email-preference field.**
  `marketingEligible` at schema.ts:652 is on another table (profiles/consent), not users.
- **Sending:** Resend SDK (`resend` ^6.16) directly in each action, `from: AUTH_EMAIL_FROM || BRAND.authEmailFrom`.
  HTML strings, no React Email. Wrapper `convex/emails/htmlHelpers.ts` (`emailWrapper`: brand-name text
  in blue #2563eb, white card radius 12, © footer; `primaryButton` blue). ⚠ Old blue palette, not the house style.
  Login mail (auth.ts) has its own inline HTML, no wrapper. No plain-text parts anywhere.
- **Mails (line numbers checked against code):**
  1. Login code — `convex/auth.ts:140` (`resend.emails.send`; subject at :145). ⚠ The brief's :145 is the
     subject line, not the start of the provider. Provider gets no request params from @convex-dev/auth,
     only `url` (which carries `redirectTo`) — see "Login locale" below.
  2. Results summary — `convex/emails/lifecycle.ts:12`, scheduled 60 s after recommendation generation
     (`convex/recommendations/internalMutations.ts:172`) ✓.
  3. Fit report — `convex/emails/actions.ts:23` (public `action`) ✓.
  4. Fit Pass welcome — `convex/emails/fitpass.ts:10`, from Stripe webhook `convex/http.ts:187` ✓.
  5. Case study lead (internal) — `convex/caseStudyLeads/emails.ts:10` ✓.
  6. Case study confirmation — `convex/caseStudyLeads/emails.ts:41` ✓. Form already sends `locale`
     (`caseStudyLeads/mutations.ts:57`, stored on the lead) — mail ignores it today.
  7. Fit reminder — `lifecycle.ts:76`, cron daily 07:00 UTC; selection `lifecycleData.ts:6`
     (>48 h, no fitSession, take 200). Already skips users with any fitSession ✓.
  8. Upgrade nudge — `lifecycle.ts:122`, daily 08:00 UTC, free + recommendation >72 h (take 500) ✓.
  9. Win-back — `lifecycle.ts:163`, ⚠ **weekly** (Wednesday 09:00 UTC), ≥21 days inactive ✓.
  10. Pro 24 h — `fitpass.ts:63`, daily 10:00 UTC ✓.
- **Check-in / progress view:** not present in the app → day 7 / day 14 mails are **skipped** (report in PR).
- **Installable web app:** `src/app/manifest.webmanifest` + `manifest.ts` exist; A verifies icons (192/512, maskable) and installability.

## Login locale (mail 1)
@convex-dev/auth calls `sendVerificationRequest({ identifier, url, token, expires, provider })`; `url` is
built from `params.redirectTo`. Contract: the login page passes `redirectTo` with the locale prefix
(`/nl/...` or `/en/...`) **and** a `locale` param; `auth.ts` reads the locale from `url`'s path prefix
via a pure helper, falling back to `DEFAULT_LOCALE`. New accounts get their first `locale` from the
frontend right after sign-in (`users.setLocaleIfMissing`, page locale).

## Ownership and tasks

| Task | Owner | Files |
|---|---|---|
| **E1 design system + templates** | Codex C | `convex/emails/layout/*`, `convex/emails/i18n/*`, `convex/emails/templates/*`, `convex/emails/format.ts`, `convex/emails/htmlHelpers.ts`, `public/email/*` (hosted PNGs), `scripts/render-email-previews.mjs`, their tests |
| **E2 locale, preferences, crons, sending** | Codex B | `convex/schema.ts` (users.locale, users.emailPreferences, lifecycleEmailLog.locale), `convex/users/*` (setLocale, setLocaleIfMissing), `convex/emails/locale.ts` (resolveEmailLocale), `convex/emails/preferences.ts` + unsubscribe token + `convex/http.ts` route, `convex/emails/lifecycle.ts`, `lifecycleData.ts`, `fitpass.ts`, `fitpassData.ts`, `actions.ts`, `mutations.ts`, `queries.ts`, `convex/caseStudyLeads/emails.ts`, `convex/auth.ts` (send part only), `convex/crons.ts`, email-preferences page + settings link (`src/app/(dashboard)/settings/*`, public token page), `src/i18n/account/*` |
| **E3 frontend locale wiring** | Codex A | `src/components/layout/LanguageSwitch.tsx` (+ the call site that saves locale), `src/app/(auth)/login/page.tsx` (locale + redirectTo), post-login `setLocaleIfMissing` hook, manifest check, `src/i18n/marketing/*` |

### Contract between C and B (C writes it first, within its first step)
`convex/emails/templates/index.ts` exports per mail `render<Name>(data: <Name>Data, locale: EmailLocale)
→ { subject, preheader, html, text }`, plus `EmailLocale = "nl" | "en"`. Kinds: `loginCode`,
`resultsSummary`, `fitReport`, `fitPassWelcome`, `caseStudyLead` (NL only), `caseStudyConfirmation`,
`fitReminder`, `upgradeNudge`, `winback`, `proExplainer`, `day1Tips`. Data types hold already-resolved
values (numbers as numbers, dates as epoch ms, optional fields optional); the template formats them.
Service/marketing mails take `unsubscribeUrl` and `preferencesUrl` in data. B never builds HTML.

## Acceptance (whole feature)
SPEC sections 2–7: every mail via the shared layout, NL/EN with literal copy, key parity is a type error,
`resolveEmailLocale` 3-step tests, number/date/price tests, language-switch test (EN cron mail → switch →
NL cron mail) with fake ctx/db, lifecycle log has `locale`, List-Unsubscribe + one-click POST, crons skip
unsubscribed users, day-1 cron, mail 7 on day 3, previews + PNG screenshots of all 22 renders
(11 × NL/EN) at 600 and 375 px in `plans/emails-bilingual/renders/` (git-ignored), typecheck/lint/tests green.

## Progress
- 2026-10-02 — E2 implemented: send-time locale, signed category preferences, bilingual senders,
  day1/day3 bounded signup windows and fail-closed missing-secret batch guards. Convex + email/UI
  suites: 73 files / 478 tests pass; full typecheck and lint pass. Preferences reuse shared controls;
  no tooltip exemption needed. Previous Fit Pass type errors resolved. Final proof and exact files:
  `audit/E2-notes.md`, `audit/files-E2.txt`. No dependencies, real mail, deployment or commit.
- 2026-10-02 — A: E3 frontend wiring implemented against B's confirmed locale API. Both switch variants,
  localized login parameters and once-per-session backfill covered. Manifest/icons already complete.
  Focused tests and lint pass; shared typecheck awaits E1/E2 integration. See `audit/E3-notes.md` and
  `audit/files-E3.txt`. No commit, deployment or mail delivery.
- 2026-10-02 — Lead: research done, worktree and branch created, E1/E2/E3 dispatched to C/B/A.

- 2026-10-02 — C: E1 implementation and visual review complete. Shared typed contract, all 11 bilingual
  templates, table/VML layout, dictionaries/formatting, hosted PNG assets and 22 HTML/44 PNG previews.
  47 E1 tests and 138 combined email/asset tests pass; typecheck passes. Full lint awaits E2 preferences
  tooltip registration (routed to B); all other lint gates pass. See audit/E1-notes.md and audit/files-E1.txt.
  No commit, mail delivery or deployment.
