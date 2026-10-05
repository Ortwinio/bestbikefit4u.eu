# F2 dashboard UI handoff

Implemented only dashboard presentation, dashboard page mount, its localized copy, tests and offline fixtures. No backend/model/PDF/shared-data-hook/public-form/account-saddle changes. No commits/deployments/environment changes/mails.

## Implementation
- DashboardReportBike consumes `api.reliability.queries.getDashboardReliability({sessionId})`, maps C's numeric ranges directly, orders A–D and shows shared compact RangeBar, ± and localized basis. Removes legacy safety/test-band rendering and per-advice global confidence/priorities; one backend-selected greatest gain per report. Preserves bike/fit/report actions, pressure data/links, missing-report/loading/no-fit states.
- DashboardReportMeasurementPanel consumes authenticated `getSaddleState({})`. Shows actual stored inseam/origin/date, shared plausibility check, warning/tolerance precedence and C-model current/potential uncertainty. No saved inseam means no inferred measurement/width. Legacy unknown provenance does not get a measurement date. Remeasure links to the existing account saddle tool. Profile rings remain above the profile card.
- No uncertainty formulas implemented in UI. Profile checks and the hypothetical three-consistent-measurement range call C's shared functions. Backend report advice remains unchanged.
- Read FULL-RELEASE.md, rekenmodel.md, ontwerp.md, C-contract.md/C-model-types.md and B-F2-template-contract.md. Executed Dashboard.dc.html script in Node VM. The board's example numbers remain fixtures, never production fallbacks. Non-saddle bounds follow C's supplied range, not board-local round-to-five logic. Dashboard uses its authorized compact component; the public calculator template supplies input/sign-up/page headings unsuitable for nesting in an authenticated dashboard.

## Verification
- Focused dashboard + existing RangeBar suite: **15 files, 136 tests pass**, including **56 new tests** for NL/EN query mapping, supplied numeric values, missing evidence, repeated-measurement provenance, date semantics, warning/check states, aria descriptions, reduced-motion classes, private-query skip, and preserved links/empty states.
- ESLint: all changed dashboard files, fixture, dictionary and dashboard page pass.
- `tsc --noEmit --incremental false --pretty false`: no dashboard errors after C registered generated API modules. Remaining shared error at last check: public power-speed `PerformanceReliabilityResults` module still being implemented by its owner.
- Full build, real-page 390/1440 renders and axe remain with A, as assigned. Offline fixtures supplied through `messages/F2-dashboard-to-A-fixtures.md`; no claim of browser/axe validation from unit tests.

Source manifest: `files-F2-dashboard.txt` (absolute paths).

## Bounded dashboard page-test integration recovery (2026-10-05)

- Edited only `src/app/(dashboard)/dashboard/page.test.tsx` plus this audit and its source manifest; no dashboard application/component edits.
- Added the authenticated `useConvexAuth` mock and real query-name routing for `getSaddleState` and per-session `getDashboardReliability`, retaining report-source overrides, skip handling and null/loading report states. Reliability fixtures use the shared range API and the new backend response shape, with no production code changes.
- Preserved identity, profile rings/prompts, localized measurements/scores/questionnaire enums, calculator links, bike-specific actions, latest-session selection, climbing data, tire pressure and missing-data assertions. Updated NL reach formatting to the localized decimal comma.
- Replaced obsolete global-confidence/safety-band assertions with all four queried reliability rows, exact advice/range/half-width values, one greatest gain, and absence of the legacy confidence/priority/band presentation. Both report queries are checked per bike, and no-fit queries must be skipped.
- Validation: all **29 dashboard page tests pass**; focused ESLint passes without diagnostics after removing the obsolete import. Earlier verification entries above describe the original worker's runs, not new runs in this recovery. Browser/saddle work remains with parent; no browser or axe claims.
