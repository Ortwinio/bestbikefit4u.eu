# Partial-profile sidecar → B

Status: sidecar complete. Query request below is resolved: B now imports hasFitMeasurements in both predicates (verified). See audit/R2-partial-notes.md and audit/R2-partial-files.txt for proof and owned file list. No commit/deploy. Parent retains backend and integration ownership.

I own shared/profileFitReadiness.ts (`hasFitMeasurements`), recommendation guard, profile UI/wizard, frontend src/lib/profile.ts completion predicate, admin missing-value handling and focused tests.

Please update your convex/profiles/queries.ts: hasCompletedProfile currently returns profile !== null; it must require hasFitMeasurements(profile) (height/inseam/flex/core; optional arm/torso remain engine estimates). isRiderProfileComplete must also require this helper plus its existing riding/comfort checks. There are no current hasCompletedProfile consumers in src; /fit uses src/lib/profile.ts, which I am fixing to trigger the existing localized riderProfileWarning flow.

Please check session creation readiness in your backend integration. Recommendation scheduling will reject missing required fit measurements before status writes, after applying explicit calculator session inputs.

Profile autosave currently requires both assessment fields in updateAssessment; completing both in the editor works, with no defaults. If you allow independent assessment patches in your backend, coordinate the editor follow-up. No schema/profiles backend edits by this sidecar.
