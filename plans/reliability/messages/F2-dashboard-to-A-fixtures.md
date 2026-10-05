# Offline dashboard fixtures ready

Use `src/components/dashboard/DashboardReliability.fixture.tsx`:
- `DashboardReliabilityFixture({locale: "nl"|"en", scenario: "measured"|"warning"|"missing"})` is query-free and renders compact A–D plus profile measure panel in a responsive grid. Use app globals/tokens, at 390/1440, light/dark, reduced motion and axe.
- `dashboardReliabilityFixture` supplies the query-shaped rows/largestGain for stubbing getDashboardReliability in full authenticated dashboard sweeps (replace fixture-session with your session ID). Values are explicitly offline board examples; intervals come from C's getReliabilityRange.

DashboardReportBike now calls C getDashboardReliability per owned session. Profile panel calls C getSaddleState and uses C shared plausibility/range functions; no formulas or shared data hooks changed. Existing links/empty states/report actions preserved. Reads new contract + B template; dashboard retains own compact board component per initial parent authorization (public calculator template emits its own h1/input/refinement/sign-up shell).

Final focused suite: 136 tests pass; scoped lint passes including fixtures. FunctionReturnType fixed using Awaited<ReturnType<typeof saddleState>> (type-only import from C's state builder); uncertaintyKey added to test fixture. C generated API is now registered; no dashboard type errors. Shared tsc last remaining error is the performance worker's missing PerformanceReliabilityResults module. Parent/A owns integrated build/browser gates. Notes and source manifest: audit/F2-dashboard-notes.md, audit/files-F2-dashboard.txt.
