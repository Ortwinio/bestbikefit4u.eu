# R13 — general rider data (B scope complete)

Lead's latest order: R7, R13, R11, R8. Rider worktree only; no commit, deployment or database calls.

## Backend

- Optional profiles.sex: female / male / prefer_not_to_say; optional birthDate: ISO YYYY-MM-DD.
- Both use declared/self_report/profile_edit observations with actual recordedAt. Existing generic
  provenance save/query retains authentication, source tracking and expected-value conflicts.
- Upsert validates before any writes, records only changed fields, preserves omitted values, and
  updates riderProfileUpdatedAt for either demographic change. No inferred age or default values.
- Strict real calendar dates, no future dates, existing supported age range 10–100 at entry.
  UTC calendar arithmetic has no timezone-dependent date shifts. Invalid errors contain no values.
- No changes to score weights, profile-readiness requirements or measured/declared FTP/flexibility.

## Integration

A owns sourced estimates in shared/riderEstimates. Contract sent in messages/B-to-A-R13-contract.md.
B does not invent reference tables, formulas or estimate values. Existing recorded age is not
silently overwritten by date of birth. The caller can evaluate age from birth date when needed.

## UI and prompts

- Both optional fields are editable in Mijn profiel with visible bilingual reasons, method/source/date,
  explicit declared provenance and conflict protection. Dates display in UTC in the chosen locale.
- Prompt card can ask the two fields when useful for unknown FTP/flexibility. Scored questions
  retain priority; demographics add zero score weight/gain. No fabricated +0/effect promises.
- Prefer not to say is retained as a real choice, never guessed or repeatedly asked. Birth date is
  not asked solely for sex-dependent FTP after abstention. Existing skip/cap/>90% rules remain.
- No sourced estimate is implemented or shown by B. That remains A's R13 part; this completion is
  specifically the fields, observations, validation and UI requested from B.

## Gates

- Combined Convex, prompt policy, demographics, profile/dashboard and welcome suites: 95 files,
  943 tests pass. Includes 42 date-helper, 39 demographic-mutation and 69 prompt contract cases.
- Full typecheck and lint passed the R13 snapshot. A subsequent full typecheck during A's new R9
  work reports only convex/advice/provenance.ts:53: nonexistent by_user observation index.
  A was notified; no R13-owned diagnostic remains. Final combined gate awaits that R9 correction.
- 20 real-route offline captures at 1440/390 in NL/EN: prompt open/answered/declined and profile
  edit/filled. No runtime errors or horizontal overflow. A's R6 hero/sidebar are now visible.
  Parent reviewed NL desktop dashboard and mobile profile-edit. These are synthetic fixtures,
  not live authentication or database operations. See renders/R13-ui-results.json.
- Sidecar evidence: R13-policy-notes.md, R13-backend-tests-notes.md, R13-ui-notes.md.

No migration, production calls, commits, deploys, dependencies or frozen dictionary changes.

## R13A honest-copy supplement — 2026-10-03

Read `messages/A-to-B-R13A-estimate-contract.md` under this plan. Neither demographic estimator currently has a validated reference; no estimate or developer placeholder may be displayed. Updated NL/EN `demographicReasons` in `src/i18n/account/profileProvenance.ts`: sex is optional for future evidence-based references, birth date permits determining age, and neither currently estimates FTP or flexibility. `src/i18n/account/profilePrompts.ts` already imports these exact reasons through `getProfilePromptsCopy`; no duplicate wording or edit was needed there.

Focused verification: `npm test -- src/components/profile/ProfileProvenance.test.tsx src/components/dashboard/DashboardProfilePrompts.test.tsx` — **53 tests pass, two files**. Existing reason-prefix assertions remain valid; no test edits were necessary. Exact supplemental source inventory: **`src/i18n/account/profileProvenance.ts` only**, already listed in `files-R13.txt` and the UI manifest. This note is the only additional R13 audit edit. No values, score weights, backend, policy, or application components changed.

Recommendation for lead decision only: reconsider proactively reserving demographic questions while their proposed FTP/flexibility use is unavailable. An optional profile field with an honest limitation is distinct from spending a capped prompt slot on data with no present advice benefit. Do not promise future estimate availability; leave eligibility changes to the lead/policy owner. No policy change made here.
