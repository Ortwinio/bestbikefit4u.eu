# R7 pure prompt policy sidecar

Implemented only shared/profilePromptPolicy.ts and its tests, plus this handoff documentation. No schema, DB, UI, current-mutation edits, commit or deploy.

## Parent API

- `planProfilePrompts(input: ProfilePromptInput): PromptCandidate[]`: initial card selection, at most two questions and one measuring task.
- `describeProfilePrompt(input, { field, bikeId? }): PromptCandidate | null`: current values and score metadata for any allowlisted reserved slot, independent of completion, eligibility and skip metadata. Existing bike required for bike slots. Parent keeps stored status; no measurement values need to be stored on cards.
- `buildPromptCandidates(input)`: all eligible candidates in deterministic order, uncapped.
- `eligibleProfilePrompts(input)`: same uncapped eligibility implementation, used by plan selection. Parent intersects this with reserved pending keys after answers/skips; no replacement slots. Answered/skipped rows still use describeProfilePrompt.
- `selectProfilePrompts(input)`: same capped behavior as planProfilePrompts.
- `getPromptDefinition(field, bike)`, `RIDER_PROMPT_FIELDS`, `BIKE_PROMPT_FIELDS`: safe definition lookup independent of eligibility.
- `validatePromptValue(field, value, bike = false)`: returns valid number/string or throws; shared profile registry validation plus exact existing bike editor bounds and bikeType enum. No coercion, sensitive/unknown fields rejected.
- Exported types: PromptCandidate, ProfilePromptInput, PromptObservation, PromptFieldSpec. Input uses the dispatched profile/observations/bikes/bikeObservations/recentCalculators/history/now shape; observation value metadata supports scalar and array types.

## Policy

- Uses scoreRiderProfile and scoreBike for score weights/quality/freshness. Caller supplies conservative virtual legacy observations; the planner never labels undocumented legacy values measured.
- Exact current-value and bike scope matching, superseded observations excluded, latest matching provenance selected. Array values are compared structurally before metadata is supplied to the scoring API.
- Body values with estimated/derived provenance can be measured to improve confidence. Existing measured values and declared choices are not repeatedly asked merely because their quality is less than 1. Existing assessments are reasked only for defined staleness, not endless self-assessment upgrades.
- Only weight/FTP older than six calendar months and flexibility older than twelve calendar months produce stale confirmations. Actual field dates or matching observation dates are used by A's score functions. Missing/invalid/future dates are not treated as old; generic updatedAt is not used. No Date.now reads or invented timestamps.
- Rider completeness >90 permits only stale confirmations, including suppressing new bike questions; exactly 90 remains eligible. Bike completeness >90 also suppresses its non-stale questions.
- Questions are quick before measure, then gain multiplied once by 1.5 when any effect matches a recent calculator, then deterministic key order. Recent-calculator 30-day filtering belongs to parent. Candidate gain itself remains unboosted.
- Effects are calculator IDs for localized UI mapping. Compound-group gain is divided across its fields; completenessGain is awarded only if this answer can complete the group. No claim that existing advice was recalculated.
- Keys: rider:field / bike:ID:field. Per-key profileOnly, skipCount >=3 or skippedUntil > now suppresses selection; exact expiry is eligible. Parent owns two slots/login, one card/24h, seven-day dismissal and writing 14-day skip timestamps.
- Rider allowlist excludes all pain, age, injury and other sensitive fields. Bike allowlist is exactly bikeType, currentSetup.saddleHeightMm (400–1000 mm), currentSetup.crankLengthMm (120–220 mm); only actual input bikes are considered. Bike IDs/names and current values are returned as requested, never logged.
- Stale/measured values and draft nulls are preserved for the parent UI. Description lookup does not itself authorize writes or bypass parent ownership/conflict checks.

## Verification

- 29 policy cases cover cap/order/relevance/ties, skips/expiry, sensitive-field exclusion, safe validation, actual bike bounds/scope, legacy-derived and measured provenance, staleness/calendar boundaries/invalid dates, >90 and exactly90, compound gains, immutable inputs, and rehydration after answering/completion.
- Final eligibility-export follow-up: 30 policy tests pass, adding uncapped eligibility and pending-slot revalidation after crossing >90 or reaching a third skip. Scoped lint passes.
- `npx vitest run shared/profilePromptPolicy.test.ts shared/profileScore`: 115 tests passed across 2 files.
- Scoped ESLint passed for both owned files.
- Full typecheck attempted: no errors reference either owned file; concurrent public-calculator imports/layout props and parent's then-unwritten prompts module prevented a full pass. Parent retains combined gates.
- Full lint attempted: five errors in concurrent public-calculator effects and ten warnings in the parent's in-progress prompt contract tests; no owned-file errors. Later lint stages did not run. Scoped diff whitespace check passed.

Exact API coordination: ../messages/R7-policy-to-parent-api.md. Manifest: files-R7-policy.txt.
