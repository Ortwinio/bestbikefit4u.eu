# R2 partial-profile safety sidecar

Completed in bestbikefit4u-rider only. No commit/deploy; no edits to schema, profiles backend, login, welcome or calculator components.

- Shared hasFitMeasurements type guard requires height, inseam, flexibility and core. Arm/torso remain optional for existing engine estimates.
- Recommendation generation validates effective inputs (after explicit session calculator overrides) before changing status or scheduling calculation. Missing required values cannot reach the engine.
- Frontend isRiderProfileComplete now requires fit measurements as well as existing preferences/comfort. Existing /fit localized warning and disabled start flow consume this helper. No hasCompletedProfile callers found in src.
- Parent coordination: messages/R2-partial-to-B-readiness.md requested backend completion guards. Parent has integrated hasFitMeasurements into hasCompletedProfile and backend isRiderProfileComplete; this sidecar did not edit those files. Parent owns session/backend integration verification.
- Profile page retains the imported inseam in its direct editor, shows the existing localized completion warning and opens the wizard to finish missing data. Missing height goes to BMI as null, not zero. Optional profile types are modeled directly.
- Wizard preserves present values and no longer invents average flexibility, core 3 or comfort 5. Missing comfort is not derived from absent hasPain.
- Admin missing values render as em dashes; inseam outlier checks require both actual measurements.
- Autosave retains existing paired-assessment behavior: both assessments must be supplied before updateAssessment is sent. Completing via wizard or editor works without defaults. Parent was informed; independent assessment patches are outside this sidecar.

## Validation

- 65 focused tests passed across seven files: profile utility, profile page, profile autosave, measurement wizard, ProfileLanguage, recommendation generate contract and mapping integration.
- Scoped ESLint on all 12 source/test files passed; git diff --check passed.
- npm run typecheck -- --incremental false was attempted. All errors from the original R2 partial-types log in owned files are resolved. Workspace check failed on concurrent public-calculator imports/props and unfinished WelcomeClient; see /tmp/R2-partial-types-after.log. Parent should rerun after integration settles.
- npm run lint was attempted; ESLint stopped on six concurrent set-state-in-effect errors outside owned files, including public calculators and LoginHandoffPanel. See /tmp/R2-partial-lint.log. Later lint stages consequently did not run.
- R2-partial-visual.mjs passed NL/EN at 1440 and 390: real profile component with an inseam-only mocked query, saved inseam 83 visible, no horizontal overflow or browser errors. Four screenshots in ../renders/R2-partial-profile-*.png. Visually inspected NL mobile and EN desktop: missing body measurements and assessments display dashes. Fixture uses generated repository CSS and omits account shell/profile photo; it is not an authenticated end-to-end test or RP3 board validation.

Parent retains full backend/auth handoff integration and final workspace gates. Sidecar is ready for integration.
