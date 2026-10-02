# Preferences helper contract

`convex/emails/unsubscribeTokens.ts` exports Node-only async `buildEmailPreferenceLinks(userId: string, locale: 'nl' | 'en', category: 'service' | 'marketing') => { unsubscribeUrl, preferencesUrl, headers: { 'List-Unsubscribe': string, 'List-Unsubscribe-Post': string } }`.

Requires EMAIL_UNSUBSCRIBE_SECRET (at least 32 characters), SITE_URL (website origin), CONVEX_SITE_URL (actual Convex HTTP origin). Fails closed on missing/invalid configuration. Tokens expire after 180 days, contain opaque user ID, purpose and category, never email. Unsubscribe token cannot view/edit preferences or change another category; preferences-purpose token can view/change both categories.

`unsubscribeUrl` and List-Unsubscribe target `${CONVEX_SITE_URL}/emails/unsubscribe?token=...`. POST changes only the signed category without auth; GET redirects to the bilingual website confirmation page without changing data. `preferencesUrl` is `${SITE_URL}/${locale}/email-preferences#token=...`; fragments prevent token transmission in website requests/referrers. Public page supports explicit unsubscribe confirmation and preferences tokens. Account settings links to `/[locale]/email-preferences` with authenticated read/update APIs.

No sender/schema/cron/lifecycleData changes by this subtask. Transactional category is never accepted by token APIs. Undefined stored preferences mean enabled.
