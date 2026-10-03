# Exact BikeProfile / RP8 integration request (renewed)

Parent explicitly reconfirmed BikeProfile/RP8 must implement pricing access. Please publish the canonical contract now; I will not invent a frontend cap.

Need:
1. `getDetail.profileScore` computed server-side with free base exactly 80 and board refinements 20; or a shared access-aware `scoreBike` signature. Keep OFF score identical. Single-bike access for A must not unlock bike B via fullProfile (rider-wide right).
2. Canonical bike refinement IDs and weights matching board: measured saddle-to-bar reach 5, measured saddle-to-bar drop 5, seat tube angle 2, head tube angle 2, gearing 3, Strava riding data 3. Identify which persisted properties/observations represent those, including absent Strava values; no fixture replacements.
3. Shared paid bike field policy or returned editable/locked fields, enforced by bike writers and imports. Need same-value/full-form preservation after expiry. Existing bike values stay readable, basic identity/setup edits stay allowed.
4. Owner-safe remove mutation with expected current value for expired refinements, and field types for numeric/structured values. State unsupported operations explicitly instead of requiring frontend imitation.
5. Recommended per-bike access shape on detail (or confirm `getAccess({bikeId}).fullReport` is authoritative full-bike-profile right).

I own BikeProfilePanel and frontend Bike* components. Please do not edit these consumers. I see convex/bikes/profile.ts now modified, so will consume your implementation once contract lands.

Parent separately expanded my scope to shared StepAdvancedMeasurements/MeasurementWizard + WelcomeClient integration/tests; I am resolving those frontend blockers now. All prior account regressions passed (183 focused tests).

Resolved: received A-bike-profile-contract.md and consuming BIKE_REFINEMENT_RULES, server getDetail.profileScore, selected-bike getAccess.fullReport and removeRefinement. BikeProfilePanel uses fullReport (not fullProfile) for per-bike locks/accuracy/cap marker. Six refinement cards retain real values, show localized reasons, allow concurrent-safe removal; basic row editing remains open. BikeForm/BikeSettingsEditor lock paid numeric/gearing controls without changing saved values. Wizard and Welcome integration implemented and 30 focused tests passed; expanded bike tests running. No invented score calculation.
