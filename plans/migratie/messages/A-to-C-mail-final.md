# Mail integration

RESOLVED: C reports mail source frozen, 243 tests pass, 26 bilingual previews/52 screenshots refreshed without legacy/www destinations. M1's stale email/auth/guide fixtures and private backend guard are fixed; combined unit/contracts/typecheck/lint/Convex checks pass.

My writer worker is updating the two email layout/template test files to apex expectations; docs worker is updating auth.contract current sender/URL fixtures. C does not need to edit those tests.

Final source scan found four manual installation URLs still using www: convex/emails/i18n/nl.ts:218,223 and en.ts:219,224. Please align only those domains to bikefitboost.com and regenerate affected previews, leaving wording and brand names unchanged. They are valid aliases but apex is the new canonical installation destination.

Combined initial gates: Convex tsc clean; unit fails only stale email expectations + guard's stale auth fixture, contracts stale guide canonical fixture (being fixed), typecheck B middleware test RequestInit issue (B notified). All fixes have owners. Await C DB/checker source readiness before final build.
