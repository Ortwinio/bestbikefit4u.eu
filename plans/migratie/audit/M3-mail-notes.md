# M3 mail/contact migration

- Fallback sender: `BikeFitBoost <noreply@notifications.bikefitboost.com>` in frontend/backend brand configs. Explicit `AUTH_EMAIL_FROM` delivery addresses still work, with the existing display name normalization.
- Support contact, NL/EN contact page (including formerly split address), privacy/terms and legal baselines now use `support@bikefitboost.com`. SECURITY contact uses `security@bikefitboost.com`; no brand-name edits.
- Four admin demo addresses use neutral `example.com` addresses.
- `ANALYTICS_ADMIN_EMAILS` has no runtime support-address fallback: an unset value remains an empty allowlist. The old template default was in `.env.example`, updated by M1. Runtime authorization semantics are unchanged.
- Focused contact/legal/frontend-backend identity tests: **25 passed / 4 files** (`/private/tmp/M3-address-tests.log`).
- Local-only email renderer: `node scripts/render-email-previews.mjs plans/migratie/renders/mails`, **26 bilingual HTML/text previews and 52 screenshots** at 600/375 px. All automated layout/asset checks pass; network requests blocked except locally fulfilled assets. NL mobile login screenshot inspected, showing BikeFitBoost logo and apex footer correctly. Output intentionally ignored; no PNGs in manifest.
- Final mail integration: four NL/EN manual-install domains now use `bikefitboost.com`, with wording and brand names unchanged. M1 updated stale apex expectations in the email tests. Final combined email/contact/legal/identity run: **243 passed / 16 files** (`/private/tmp/M3-mail-tests-final.log`). No mail sent, no environment or production changes.
