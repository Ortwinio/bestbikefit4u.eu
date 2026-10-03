# R8 AdviceGroupsView completion

Pure presentational view implements the shared AdviceGroup/AdviceItem contract and exact requested props. Local all/rider/bike filter retains all seven sections, including empty sections. Parent owns route orchestration, tabs, recalculation and their dictionaries; A sidebar remains untouched.

Actual numeric targets, ranges, current values and signed differences use locale formatting (maximum two decimals); source values are not mutated. Literal frame strings remain intact without appended units. Numeric values, confidence, units and improvement gains use the numeric font token. All known recalculation output keys, including the additional bike-fit geometry keys, have precise NL/EN labels. Unknown nonempty units display an explicit translated unknown-unit message.

Confidence belongs to each engine result, never a group average or profile score. Unknown provenance is not called current. Saved-input-only rows say Saved on / Opgeslagen op, not Calculated on. Positive finite profile improvement potentials are sorted descending and capped at three per group; no guaranteed result claims. No applied/waiting/mark-done status, sample names, review strip, invented Pro claims or backend writes.

Source links are locale-prefixed local routes with query/hash removed; the optional callback receives the original AdviceItem. Dictionary lookups for API string keys require own string properties, including improvement/input/unit lookup; __proto__ and constructor fall back safely. Invalid timestamps display unknown date.

## Validation
- Final independent-review followup: explicit UTC date formatting with NL/EN midnight-boundary regressions simulating a negative-offset host; reliability reason uses the same own-string guard, tested against __proto__, constructor and future_reason. Final focused rerun: 23/23 pass; scoped ESLint passes. Source-link bike scope remains backend coordination; no query arguments invented.
- Focused AdviceGroupsView.test.tsx: 18/18 pass (NL/EN, seven groups, values/ranges/dates, saved-input labels, unknown/stale distinctions, filters, nonmutating ordering, max-three improvements, literal frame strings, unknown units/keys, inherited dictionary keys, source links/callback, bike-fit geometry labels).
- Scoped ESLint: pass for the three owned TS/TSX files.
- CSS module token guard: 27 files checked, zero raw color lines.
- Full typecheck: no R8 diagnostics; current unrelated bike errors are missing BikeProfilePanel import and unsupported exact test-query option in BikeForm.test.tsx. Log: /tmp/R8-ui-typecheck.log.
- Global tooltip guard: currently fails unrelated BikeForm.tsx Input #3 missing tooltip; view adds no input/select fields and does not bypass the guard.

## Visual ownership
Franklin owns the real-route harness and 32 NL/EN desktop/mobile captures. See R8-advice-notes.md, files-R8-advice.txt and ../renders/R8-advice-results.json for those proofs. This sidecar does not claim ownership of that harness or its renders. Parent should ensure final captures include the final saved-date/unit/geometry/hardening changes before closing visual QA.

No commits, deployments, dependencies, backend edits or other owned product files changed for R8.
