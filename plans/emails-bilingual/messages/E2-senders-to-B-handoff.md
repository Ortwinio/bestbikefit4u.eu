# E2 sender subtask ready

Rewrote only convex/emails/fitpass.ts, convex/emails/actions.ts, convex/caseStudyLeads/emails.ts plus owned tests. All render through C's templates and parent delivery helper (HTML + text). No sender HTML remains.

- Fit Pass welcome fetches getUserEmailContext, ignores opt-outs (transactional), checks the sent log, resolves current locale, and logs locale only after a delivered ID.
- Pro explainer fetches fresh context for every candidate, rechecks pro tier, service opt-out and sent log, builds real service preference links/headers, and logs only successful delivery. Stable provider idempotency keys supplement log checks.
- Fit report keeps authenticated current-user and owned recommendation queries; adds optional nl/en request fallback; localizes engine notes via localizePdfEngineNotes. Email-less users are rejected rather than being allowed to target an arbitrary address. Missing-key success compatibility is preserved without a sent log.
- Case confirmation uses stored lead locale; internal lead notification is always Dutch. Both use provider idempotency keys.
- Action links point to localized fit results (when a recommendation exists), otherwise dashboard; case confirmation points to localized bikes.

31 mocked-Resend tests pass, including EN then NL sends after a saved preference change, stale-candidate rechecks, no-key/no-success-log behavior, errors, opt-outs, lead locales, report fallback and translated notes. npm run typecheck -- --incremental false passes. ESLint and runtime-boundary checks pass. Full lint stops at tooltip coverage: src/app/email-preferences/EmailPreferencesClient.tsx contains form controls but is not tracked in the guardrail lists (preferences owner). git diff --check passes.

No lifecycle/auth/crons/schema/generated/package edits in this sender task. No commit, deployment, or actual mail.
