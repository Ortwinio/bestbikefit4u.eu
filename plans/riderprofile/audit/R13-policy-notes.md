# R13 optional estimate-input prompt policy

## Scope and contract

Owned source changes are limited to `shared/profilePromptPolicy.ts` and its test.
Parent owns registry/schema/provenance, A owns sourced estimates, and another agent owns UI.
No database calls, migrations, commits or deploys were performed.

- `sex` and `birthDate` are explicit optional R13 exceptions to the R7 demographic exclusion. Legacy `age`, pain and injury fields remain excluded.
- Definitions come from the parent's shared registry: sex is declared/none with `female`, `male`, `prefer_not_to_say`; birth date is declared/date.
- Both can be eligible only while their current value is missing and FTP or flexibility is missing. Birth date is not requested solely for FTP when sex is `prefer_not_to_say`; missing flexibility still permits it.
- No sex guess, birth date inferred from age, estimate calculation, default, score weight, score gain, or completeness gain is introduced. Both gains are always zero.
- All scored questions precede these unscored inputs, including measurements. Existing quick-before-measure/relevance ordering remains within scored questions. Recent relevance cannot inflate a zero gain.
- Existing two-slot/one-measure selection, per-key skips, third-skip/profile-only handling, skip expiry and >90% stale-only suppression remain active. Neither demographic becomes stale.
- `eligibleProfilePrompts` includes all eligible new candidates; `planProfilePrompts` keeps existing caps. `describeProfilePrompt` rehydrates answered/skipped rows from current values despite eligibility changes, including a declined sex answer. These are never bike fields.
- `validatePromptValue` delegates to the parent's registry validator: exact sex enum and strict real ISO `YYYY-MM-DD` dates within supported age 10–100. No alternate parser or duplicated bounds are added.

## Integration notes

API signatures are unchanged. Candidate keys are `rider:sex` and `rider:birthDate`.
UI must supply the explicit bilingual optionality/reason and date control; the policy returns calculator effect identifiers, not estimate promises or localized text. Sourced estimate availability and displayed values remain A/parent responsibilities.

## Validation

- `npx vitest run shared/profilePromptPolicy.test.ts`: **44 passed** (14 R13 cases added).
- `npx vitest run shared/profilePromptPolicy.test.ts shared/profileScore convex/profiles/prompts.contract.test.ts`: **194 passed**, four test files.
- Scoped ESLint: passed.
- `npm run lint`: passed all stages, including 254 contrast checks, runtime boundaries, tooltip coverage, CSS tokens and image checks.
- `npm run typecheck -- --incremental false`: passed after the owned test's excess-property check was fixed.
- Scoped `git diff --check`: passed (source files are currently untracked alongside prior R7 work).

An initial test run stopped at module load while the parent registry additions were not yet present. They subsequently landed; the passing runs above use the real shared registry, with no mocked demographic definitions.

Coverage includes target-dependent eligibility, declined sex, present values, unchanged scores, scored-question priority, zero relevance gain, skips/expiry, selection caps, >90 stale-only behavior, independent answered-row descriptions, bike exclusion, strict dates/leap day and age bounds, and continued legacy-age exclusion.
