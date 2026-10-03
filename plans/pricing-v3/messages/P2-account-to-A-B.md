# Account frontend integration — A/B coordination

Located canonical A-contract and B-ui-plan under plans/pricing-v3/messages (root messages copies absent). Read both; consuming the published flags/getAccess/refinement IDs, never reimplementing access.

I own AccountProfileStrength, DashboardProfileStrength, ProfileProvenance, ProfileDirectFields/ProfileAutosaveEditor, ProfileStrengthRings, BikeProfilePanel, BikeWithFitHistory/BikeFitHistorySection and account pages. A please do not edit those consumers. A owns shared/profileScore and shared account profile hook: please publish exact hook/score signature, bike refinement IDs and remove APIs. BikeProfilePanel currently uses getDetail.profileScore: please return access-aware score there. Rider consumers independently score provenance today; I will pass A's new third access argument once available.

Need legacy marker property or will consume per-session getReportAccess in a small badge. Guided fields flexibilityTestCm/coreTestSeconds need A schema/observation validators and removal support. One-bike creation UI will consume getAccess.maxBikes; existing saved bikes stay visible.

Initial work adds localized pricingAccess.ts and optional capped ring marker (no score logic), profile/bike access notices. Root messages/P2-account-to-A-B.md has earlier coordination; this plan-local message supersedes its missing-contract note.

Integration update: consuming scoreRiderProfile(context, now, access), query api.pricing.queries.getAccess, getReportAccess legacy badge and removePaidField as implemented. Direct account editor gates femur; separate ProfileRefinements owns six fields, real saveObservation/removePaidField, retaining expired values. Creation routes/new/manual/passport are wrapped in BikeCreationAccess using authoritative maxBikes plus actual saved count.

Cross-scope blocker for B parent: shared measurement wizard StepAdvancedMeasurements auto-populates femur from height and presents it editable to free users. This causes new free profiles to be rejected with enforcement ON. Please own or delegate MeasurementWizard + StepAdvancedMeasurements optional refinement lock prop, pass through from profile/page.tsx access; suppress femur auto-prediction when locked. I avoid shared measurement components per assigned scope. ProfileDirectFields already accepts refinementsLocked.

A: bike score/refinement contract still needed (board reach/drop/seat angle/head angle/gearing/Strava), including deletion. getDetail.profileScore remains uncapped currently. Please implement/confirm shared bike score and paid field helper; I will consume in BikeProfilePanel/editor. Also new refinement score keys foot/hand/flexibilityTest/coreTest need label fallback in account UI (I handle through pricingAccess dictionary).

Using A's useProfileAccess hook now in all three in-scope rider score consumers. WelcomeClient is outside delegated Dashboard/Profile/Bike/History scope; B parent please wire that fourth caller. New localized labels cover refinement next steps. Current typecheck only reports missing api.pricing generated declarations (including A's hook); A please update _generated/api.d.ts for your new modules. Report access and removal API types resolve already.

Account regressions from C unit run fixed: dashboard extra skipped query expectation, legacy badge no mount when OFF (preserves mutation-only history tests), advice skipped-query mock, message-locale skipped pricing query, creation gate off-path returns children without any Convex hooks (fixes Marktplaats chooser server render). Re-running focused suites with new flag ON/OFF tests.
