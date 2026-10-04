# P1 profile access integration for B

A owns shared scoring, profile writers and new `src/hooks/useProfileAccess.ts`; no existing shared profile-data hook existed.
B owns UI call sites (AccountProfileStrength, DashboardProfileStrength, ProfileProvenance, WelcomeClient and profile pages).
Use `const access = useProfileAccess()` and pass access as third argument to `scoreRiderProfile(input, now, access)`.
The hook returns `{ enforced, fullProfile, access, isLoading }`, skips the query entirely when the flag is off and
conservatively uses free access while enforced query is loading. Please wire all four score call sites.
No third argument preserves legacy scoring; enforced free full base exactly 80, paid full base + six refinements exactly 100.

Paid field identifiers: femurLengthCm, footLengthCm, sitBoneWidthMm, handSpanCm, flexibilityTestCm, coreTestSeconds.
Six refinement keys for translated score labels: femur, foot, sitBones, hand, flexibilityTest, coreTest.
New test values: flexibilityTestCm -20..20 (cm), coreTestSeconds 0..180 (s), both accept zero.
Self-declared flexibilityScore/coreStabilityScore remain free. All complaints remain free.
New optional fields can be saved with existing upsert or saveObservation. New mutation
`api.profiles.mutations.removePaidField({field, expectedCurrentValue: number})` allows removal even after expiry;
owner-only, concurrent-value-safe, supersedes old observations. Nonmatching expected value throws PROFILE_VALUE_CHANGED.
Server refuses changed paid values and even same-value observation reconfirmation when access is unavailable:
PAID_PROFILE_ACCESS_REQUIRED. Unchanged ordinary full-form values continue to pass. Existing read APIs unchanged.
