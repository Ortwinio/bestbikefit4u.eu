# Locale subtask contract

- `api.users.mutations.setLocale({ locale: "nl" | "en" })`: authenticated user only, overwrites locale, returns null.
- `api.users.mutations.setLocaleIfMissing({ locale: "nl" | "en" })`: authenticated user only, initializes absent locale, returns null; never overwrites saved language.
- `resolveEmailLocale(user?: { locale?: "nl" | "en" } | null, requestLocale?: unknown): "nl" | "en"` exported by `convex/emails/locale.ts`: saved locale > exact request locale > shared DEFAULT_LOCALE (en).
- `loginEmailLocale(url: string): "nl" | "en"`: explicit first pathname segment wins, then explicit first segment of redirectTo (absolute URL or root-relative path), else en. No substring, domain, locale query, or regional-tag inference.
- `users.emailPreferences?: { service: boolean; marketing: boolean }`: true enabled, false opted out; absent object is legacy default (senders own policy).
- `users.locale` and `lifecycleEmailLog.locale` optional nl/en.

Parent owns sender integration: fetch user at send time before resolving locale, including previously scheduled messages. No locale captured in scheduled payloads.

Implemented and ready for parent integration. 56 focused tests pass using fake ctx/db and definition._handler, with no dependency changes. Full npm run lint passes. Typecheck with --incremental false fails only at convex/emails/templates/index.ts:50 (missing ./renderers, E1 work in progress). Initial default typecheck also encountered sandbox cache-write denial; the no-cache rerun removed that failure. git diff --check passes.

Tests exercise authentication, both language updates, idempotent backfill, deleted-user backfill rejection, latest preference resolution after a switch, strict request language values, direct URL paths and encoded redirectTo paths, and rejection of substring/domain/hash inference. These are helper/mutation tests, not an actual cron-send integration test; parent should cover the sender path with mocked Resend.
