# E2 locale API contract

Use `api.users.mutations.setLocale({ locale: "nl" | "en" })` for explicit language changes.
Use `api.users.mutations.setLocaleIfMissing({ locale: "nl" | "en" })` after login.
Both require the authenticated user via requireUserId. The latter never overwrites an existing locale.
B is implementing these in the email worktree only. No deployment or real mail.
