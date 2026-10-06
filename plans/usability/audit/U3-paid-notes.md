# U3 paid moments

Implemented shared PaidBoundary from the real PRODUCTS catalogue, NL/EN, six natural boundaries. Dashboard/garage/add-bike reuse BikeAccessNotice; history and bike compare use actual access queries; report uses ReportAccessPanel. Enforcement OFF retains full existing access. No overlay or modal upgrade.

Report/step-plan show a numbered preview of real capabilities without fabricated fit values; second-bike shows bike illustration; comparison strip describes stored setups, not an unbuilt automatic numerical comparison. FitResultsOverview's paid range chip shows only actual report reliability95 halfWidth, never the board example ± values. Missing uncertainty produces no chip. Reports keep both single-fit bike-specific checkout and annual alternative.

DashboardReportBike uses the shared PressureDisplay and retains the user's current pressure text. No fabricated min/max limits.

Canvas scripts executed locally for Dashboard (18 states), Bikes (9), BikeAdd (4), BikeProfile (14), BikeCompare (1), FitResults (13), FitReport (3), History (18), 80 renderVals calls total. The paid-specific content in the board is implemented as capability previews; real evidence and existing access override example values.

Focused tests: 26 passing across six files. Scoped ESLint passes. Intermediate whole-tree typecheck had only concurrent CreateBikeForm missing Textarea import/event type errors, reported to root. Root owns final integrated gates and U3 usability guard through actual offline component fixtures; this subtask does not certify a green visual guard yet.

## Offline fixture follow-up

Expanded tests/visual/usability/account-states.ts and added pure extend-runtime.mjs. Shared pricing policy distinguishes flag-off, enforced free and actual active annual entitlement; runtime rejects requested/compiled-flag mismatch. Real pressure engine output feeds report and production groupAdvice. CalculatorData and reliability states use existing shared models, with explicit one-measurement provenance. Unknown queries still fail. 7 fixture-state tests and 5 real-runtime extension tests pass; whole-tree typecheck passed at this point. Integration details published in messages/C-U3-fixture-ready.md for A (adapter/guard owner). No build or guard-green claim.

## Pressure integration completion

Replaced separate pressure tiles in BikeGarageOverview, BikePressureSection and fit-results TirePressureSection with the shared PressureDisplay (existing real numbers only). Garage retains current measured values; stale/error/empty states and report warning sections remain. Updated two results-page benefit CTA expectations without weakening URLs or paid/core access assertions. 38 integration tests passed, plus two new NL/EN garage shared-display assertions; typecheck and scoped ESLint passed before those test-only additions.

Bike-profile pressure deduplicated: exactly one shared recommendation display; current readings, status badges, stale warnings and saved presets retained. Two NL/EN regression tests and scoped ESLint pass.
