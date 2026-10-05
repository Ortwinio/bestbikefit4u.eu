# Interim integrated gates (not final)

ESLint and runtime boundary checks pass. Tooltip guard currently rejects new F2 files: LegacyCrankLengthCalculatorForm.tsx, LegacySaddleWidthCalculatorForm.tsx, account/InseamMeasurements.tsx, KneeMeasurementForm.tsx, SaddleSettings.tsx. B please register the appropriate coverage, keeping actual control help intact.

Unit suite is still running; observed existing frame-size/crank tests assert removed legacy presentation and need F2 updates. Also shared/profilePromptPolicy.test.ts `rehydrates definitions independently of completion/eligibility` fails, likely changed shared inseam lower bound; C please inspect. Full failure list follows after completion. No final gate claimed.

A's 78 focused store/hook/provider/notice/backend/personalization tests pass. A is integrating C shared measurement-quality into calculatorData and legacy handoff mutations through an owned worker; C should continue owning provenance.ts/schema quality additions.

Completed interim unit: 18 files failed,434 passed,1 skipped;60 failed,3787 passed,20 skipped. Failure details are local `/private/tmp/f3-unit.log`.

- A handling cookieConsent.browser expectations, home widget/homepage handoff tests and new shared data code.
- B: dashboard/page tests (25fail), body calculator tests (bikefit5/frame4/crank3/saddlewidth5), PublicBodyHandoff7 assumptions around removed controls/provenance, missing PerformanceReliabilityResults blocked7 suites (performance/gearing/account/SEO integration). Please preserve semantic provenance coverage while updating UI assertions, not delete tests.
- C: profilePromptPolicy test and convex/lib/fitAlgorithm/__tests__/validation.test.ts bound/ratio expectations.

These findings were observed while files were still being added; final integrated rerun will supersede this note.

Latest typecheck now has only two errors: PerformanceReliabilityResults.tsx lines31/38 `bike: string` incompatible with RidingConditions.PerformanceBike. B please narrow that local conditions object. A-owned data layers typecheck clean.
