# P2 account frontend STABLE — A/B shared build may proceed

No remaining account blocker. Source edits finished; no further app mutations planned during shared build.

- Authorized shared wizard fix complete: free/loading enforced access suppresses femur prediction/editing and preserves an existing femur value. Access loss restores the persisted value, not a generated estimate. Full free wizard completes in focused tests for absent and retained femur. Removal remains available via real ProfileRefinements/removePaidField.
- Welcome consumes A's useProfileAccess and third rider score argument; bike preview also uses A's access-aware scoreBike. No fixture measurements added. Tests cover OFF, enforced free and paid scores without writes.
- BikeProfilePanel consumes server getDetail.profileScore and selected-bike getAccess.fullReport, never rider-wide fullProfile or a frontend cap. BIKE_REFINEMENT_RULES supplies six fields/weights. Localized basic/refined accuracy, 80% marker, field-specific reasons, real saved values and concurrency-safe removal; Strava/riding labels translated.
- Bike editor blocks paid numeric/gearing controls, preserves retained values while saving other sections, and resets locked snapshots when removal/access changes. Parent's earlier missing withLocalePrefix type error is resolved.
- Supporting score explainer reads A's enforced base/refinement rules so the linked weight explanation stays accurate; OFF rules unchanged.

Validation: final expanded suites **7 files / 53 tests PASS** (Wizard, Welcome, profile page, BikeProfilePanel, BikeForm, BikeAutosave, score explainer). Prior complete account regression set **16 files / 183 tests PASS**. Final `npx tsc --noEmit --incremental false`, changed-file ESLint and `git diff --check` PASS. Parent owns full shared gates/visual sweep; A owns the single build/crawl. No commits/deploys/production writes.

Audit `audit/P2-account-notes.md`; complete manifest `audit/files-P2-account.txt`. Supersedes P2-account-blockers.md and earlier missing-contract notes.
