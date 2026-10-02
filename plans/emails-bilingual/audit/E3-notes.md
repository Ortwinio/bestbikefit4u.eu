# E3 — frontend email locale wiring

Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-emails`, branch `feature/bilingual-emails`.
No changes made in the original worktree. No commit, deployment, backend startup or real email.

## Implementation

- Account `LanguageSwitch` and marketing/mobile `MarketingLanguageSwitch` share `useLocaleSwitch`.
  Authenticated clicks invoke `api.users.mutations.setLocale({ locale })` immediately; ordinary
  navigation follows completion so a full page transition cannot discard the write. A rejected save
  does not strand navigation. Anonymous clicks retain ordinary links and never call the mutation.
  Modified clicks retain browser behavior. Existing path, query, styles and 44px targets are unchanged.
- Login code request, resend and verification all pass `locale` and localized `/nl/dashboard` or
  `/en/dashboard` `redirectTo` to `signIn("resend", ...)`. Existing Google redirects already have
  the page prefix and remain unchanged.
- `LoginLocaleBackfill` mounts inside the persistent authenticated provider. It waits for resolved
  authentication and an explicit page locale, then calls `setLocaleIfMissing({ locale })` once per
  mounted authenticated session. Route changes, locale changes and StrictMode effect replay do not
  repeat the call; completed logout resets the guard. This also covers OAuth returning directly to
  the dashboard. Reloading can call the backend again; B's idempotent missing-only mutation preserves
  an existing preference. Failed backfills are caught, not retried on every render.
- API names and argument shapes match B's `messages/B-to-A-locale-api.md` confirmation.

## Web app verification

- Existing locale-specific manifest is linked by root metadata and served as
  `application/manifest+json`. It already has identity `/`, scope `/`, localized `start_url`,
  `display: standalone`, and 192/512 PNG plus separate 512 maskable icons. Nothing missing to add.
- New manifest tests read all three real PNG assets and verify their signature and pixel dimensions,
  not just the declared manifest sizes. Existing metadata/route tests verify manifest linking and
  both locale responses. No claim of an actual device installation or offline functionality is made.

## Validation

- Focused Vitest: **47/47 tests pass across six files**. Anonymous link tests trigger jsdom's
  expected full-document-navigation notice; no assertions fail.
- Focused Vitest command: `npx vitest run src/components/layout/LanguageSwitch.test.tsx src/components/providers/LoginLocaleBackfill.test.tsx src/components/layout/MarketingLayout.test.tsx 'src/app/(auth)/login/page.test.tsx' src/lib/seo/siteManifest.test.ts src/app/site-metadata.test.tsx --maxWorkers=1`.
- `npm run lint`: PASS, including 254 contrast checks, 19 token-only CSS modules and image budget checks.
- `npm run typecheck`: rerun; currently blocked by concurrent E1/E2 integration (three Fit Pass
  sender log calls missing locale, and missing jsdom declarations in two new email tests).
  Earlier missing renderer/day-1 errors are resolved. No E3 diagnostics. Reported in
  `messages/A-to-B-C-typecheck.md`; not represented as a green shared gate.
- All authentication and mutation calls in tests are mocked. No mail sent.
