# Output 01: Input Traceability Matrix

Date: 2026-02-19  
Scope: profile inputs, fit-session inputs, questionnaire inputs, bike geometry/setup inputs, and algorithm input slots.

## Traceability Matrix

### A) Profile + Session Inputs

| Field | Capture Source | Storage Path | Algorithm / Output Use | Status | Evidence |
|---|---|---|---|---|---|
| `heightCm` | Profile wizard step 1 | `profiles.heightCm` | Converted to `heightMm`, used in validation and reach fallback | `correctly used` | `src/components/measurements/MeasurementWizard.tsx:17`, `convex/profiles/mutations.ts:74`, `convex/recommendations/inputMapping.ts:92`, `convex/lib/fitAlgorithm/calculations.ts:206` |
| `inseamCm` | Profile wizard step 1 | `profiles.inseamCm` | Converted to `inseamMm`, used in crank, saddle height, setback, warnings | `correctly used` | `src/components/measurements/MeasurementWizard.tsx:18`, `convex/profiles/mutations.ts:75`, `convex/recommendations/inputMapping.ts:93`, `convex/lib/fitAlgorithm/calculations.ts:65` |
| `flexibilityScore` | Profile wizard step 3 | `profiles.flexibilityScore` | Mapped to 0-10, used in saddle height, bar drop, reach, warnings | `correctly used` | `src/components/measurements/MeasurementWizard.tsx:27`, `convex/recommendations/inputMapping.ts:86`, `convex/recommendations/inputMapping.ts:94`, `convex/lib/fitAlgorithm/calculations.ts:102` |
| `coreStabilityScore` | Profile wizard step 4 | `profiles.coreStabilityScore` | Mapped to 0-10, used in saddle height, bar drop, reach, warnings | `correctly used` | `src/components/measurements/MeasurementWizard.tsx:36`, `convex/recommendations/inputMapping.ts:87`, `convex/recommendations/inputMapping.ts:95`, `convex/lib/fitAlgorithm/calculations.ts:105` |
| `torsoLengthCm` | Profile wizard step 2 (optional) | `profiles.torsoLengthCm` | If missing, replaced by estimated `heightCm * 0.32`; used in reach formula when present | `transformed with risk` | `src/components/measurements/StepAdvancedMeasurements.tsx:38`, `convex/profiles/mutations.ts:77`, `convex/recommendations/inputMapping.ts:96`, `convex/lib/fitAlgorithm/calculations.ts:210` |
| `armLengthCm` | Profile wizard step 2 (optional) | `profiles.armLengthCm` | If missing, replaced by estimated `heightCm * 0.44`; used in reach formula when present | `transformed with risk` | `src/components/measurements/StepAdvancedMeasurements.tsx:59`, `convex/profiles/mutations.ts:76`, `convex/recommendations/inputMapping.ts:97`, `convex/lib/fitAlgorithm/calculations.ts:210` |
| `shoulderWidthCm` | Profile wizard step 2 (optional) | `profiles.shoulderWidthCm` | If missing, default `42`; used for handlebar width | `transformed with risk` | `src/components/measurements/StepAdvancedMeasurements.tsx:80`, `convex/profiles/mutations.ts:79`, `convex/recommendations/inputMapping.ts:98`, `convex/lib/fitAlgorithm/calculations.ts:289` |
| `femurLengthCm` | Profile wizard step 2 (optional) | `profiles.femurLengthCm` | Passed as `femurMm`, but not used in formula steps; only affects confidence score | `stored but not used` | `src/components/measurements/StepAdvancedMeasurements.tsx:100`, `convex/recommendations/inputMapping.ts:102`, `convex/lib/fitAlgorithm/index.ts:208` |
| `footLengthCm` | Not captured in profile wizard UI | `profiles.footLengthCm` | Passed as `footLengthMm`, but not used in formula steps; only affects confidence score | `stored but not used` | `convex/profiles/mutations.ts:28`, `convex/profiles/mutations.ts:80`, `convex/recommendations/inputMapping.ts:101`, `convex/lib/fitAlgorithm/index.ts:209` |
| `handSpanCm` | Not captured in profile wizard UI | `profiles.handSpanCm` | No downstream use found | `stored but not used` | `convex/profiles/mutations.ts:29`, `convex/profiles/mutations.ts:81`, `convex/schema.ts:50` |
| `sitBoneWidthMm` | Not captured in profile wizard UI | `profiles.sitBoneWidthMm` | No downstream use found | `stored but not used` | `convex/profiles/mutations.ts:30`, `convex/profiles/mutations.ts:82`, `convex/schema.ts:51` |
| `injuryHistory` | Not captured in profile wizard UI | `profiles.injuryHistory` | No downstream use found in recommendation generation | `stored but not used` | `convex/profiles/mutations.ts:33`, `convex/profiles/mutations.ts:85`, `convex/recommendations/mutations.ts:31` |
| `age` | Not captured in profile wizard UI | `profiles.age` | No downstream use found | `stored but not used` | `convex/profiles/mutations.ts:49`, `convex/profiles/mutations.ts:86` |
| `weightKg` | Not captured in profile wizard UI | `profiles.weightKg` | No downstream use found | `stored but not used` | `convex/profiles/mutations.ts:50`, `convex/profiles/mutations.ts:87` |
| `bikeType` | Fit start page | `fitSessions.bikeType` | Mapped to bike category used by algorithm | `correctly used` | `src/app/(dashboard)/fit/page.tsx:85`, `convex/sessions/mutations.ts:58`, `convex/recommendations/inputMapping.ts:58` |
| `bikeId` | Fit start page (optional) | `fitSessions.bikeId` | Used for bike ownership and fallback bike type if snapshot missing | `correctly used` | `src/app/(dashboard)/fit/page.tsx:88`, `convex/sessions/mutations.ts:39`, `convex/recommendations/mutations.ts:39` |
| `ridingStyle` | Fit start page | `fitSessions.ridingStyle` | Used only as fallback bike category when `bikeType` missing | `transformed with risk` | `src/app/(dashboard)/fit/page.tsx:86`, `convex/sessions/mutations.ts:60`, `convex/recommendations/inputMapping.ts:65` |
| `primaryGoal` | Fit start page | `fitSessions.primaryGoal` | Mapped to algorithm ambition | `correctly used` | `src/app/(dashboard)/fit/page.tsx:87`, `convex/sessions/mutations.ts:61`, `convex/recommendations/inputMapping.ts:68` |
| `weeklyHours` | Derived from questionnaire `weekly_hours` | `fitSessions.weeklyHours` | Not used in recommendation calculations | `stored but not used` | `convex/questionnaire/mutations.ts:154`, `convex/questionnaire/mutations.ts:167`, `convex/recommendations/mutations.ts:47` |
| `longestRideKm` | No active UI mapping in questionnaire flow | `fitSessions.longestRideKm` | Not used in recommendation calculations | `used but not collected` | `convex/schema.ts:173`, `convex/sessions/mutations.ts:123`, `convex/questionnaire/questions.ts:82` |
| `painPoints` | Derived from questionnaire (`pain_areas`, `pain_severity`) | `fitSessions.painPoints` | Used only to generate textual `painPointSolutions`, not core fit outputs | `transformed with risk` | `convex/questionnaire/mutations.ts:121`, `convex/questionnaire/mutations.ts:148`, `convex/recommendations/mutations.ts:109` |

### B) Questionnaire Inputs (Question IDs)

| Question ID | Persisted As | Session/Algorithm Use | Status | Evidence |
|---|---|---|---|---|
| `experience_level` | `questionnaireResponses` | Not mapped to `FitInputs.experienceLevel` | `stored but not used` | `convex/questionnaire/questions.ts:44`, `convex/lib/fitAlgorithm/types.ts:37`, `convex/recommendations/inputMapping.ts:89` |
| `weekly_hours` | `questionnaireResponses` and `fitSessions.weeklyHours` | Session updated, but not used in calculations | `stored but not used` | `convex/questionnaire/questions.ts:67`, `convex/questionnaire/mutations.ts:154`, `convex/recommendations/mutations.ts:47` |
| `typical_ride_length` | `questionnaireResponses` | Not mapped to `fitSessions.longestRideKm` | `stored but not used` | `convex/questionnaire/questions.ts:82`, `convex/questionnaire/mutations.ts:153` |
| `has_pain` | `questionnaireResponses` | Controls conditional display only | `transformed with risk` | `convex/questionnaire/questions.ts:100`, `src/components/questionnaire/QuestionnaireContainer.tsx:37` |
| `pain_areas` | `questionnaireResponses` and `fitSessions.painPoints.area` | Used for textual pain solution generation | `transformed with risk` | `convex/questionnaire/questions.ts:117`, `convex/questionnaire/mutations.ts:121`, `convex/recommendations/mutations.ts:110` |
| `pain_severity` | `questionnaireResponses` and `fitSessions.painPoints.severity` | Mapped to session severity, but severity not used in solution logic | `stored but not used` | `convex/questionnaire/questions.ts:164`, `convex/questionnaire/mutations.ts:133`, `convex/recommendations/mutations.ts:113` |
| `knee_pain_timing` | `questionnaireResponses` | No downstream use | `stored but not used` | `convex/questionnaire/questions.ts:146`, `convex/recommendations/mutations.ts:47` |
| `position_priority` | `questionnaireResponses` | No downstream use | `stored but not used` | `convex/questionnaire/questions.ts:186` |
| `current_position_feeling` | `questionnaireResponses` | No downstream use | `stored but not used` | `convex/questionnaire/questions.ts:208` |
| `road_riding_type` | `questionnaireResponses` | No downstream use | `stored but not used` | `convex/questionnaire/questions.ts:229` |
| `mtb_terrain` | `questionnaireResponses` | No downstream use | `stored but not used` | `convex/questionnaire/questions.ts:244` |
| `injury_history` | `questionnaireResponses` | No downstream use | `stored but not used` | `convex/questionnaire/questions.ts:262` |
| `flexibility_confidence` | `questionnaireResponses` | No downstream use | `stored but not used` | `convex/questionnaire/questions.ts:281` |

### C) Bike Geometry / Current Setup Inputs

| Field Group | Capture Source | Storage Path | Algorithm / Output Use | Status | Evidence |
|---|---|---|---|---|---|
| `currentGeometry.stackMm`, `currentGeometry.reachMm` | Bike form | `bikes.currentGeometry` | Never mapped to `FitInputs.frameStackMm/frameReachMm` in main recommendation flow | `stored but not used` | `src/components/bikes/BikeForm.tsx:244`, `convex/bikes/mutations.ts:18`, `convex/recommendations/inputMapping.ts:89` |
| `currentGeometry.seatTubeAngle`, `currentGeometry.headTubeAngle`, `frameSize` | Bike form | `bikes.currentGeometry` | No recommendation pipeline usage | `stored but not used` | `src/components/bikes/BikeForm.tsx:258`, `convex/bikes/mutations.ts:22`, `convex/recommendations/mutations.ts:47` |
| `currentSetup.saddleHeightMm`, `saddleSetbackMm`, `stemLengthMm`, `stemAngle`, `handlebarWidthMm`, `crankLengthMm` | Bike form | `bikes.currentSetup` | Displayed in bikes page, but not fed to fit algorithm/deltas | `stored but not used` | `src/components/bikes/BikeForm.tsx:289`, `convex/bikes/mutations.ts:27`, `src/app/(dashboard)/bikes/page.tsx:122` |

### D) Algorithm Inputs Used But Not Populated By Main Flow

| Algorithm Input | Used In Algorithm | Populated In `buildFitInputs`? | Status | Evidence |
|---|---|---|---|---|
| `experienceLevel` | Bar-drop experience modifier | No | `used but not collected` | `convex/lib/fitAlgorithm/calculations.ts:165`, `convex/lib/fitAlgorithm/calculations.ts:183`, `convex/recommendations/inputMapping.ts:89` |
| `frameStackMm`, `frameReachMm` | Stem/spacer solver for geometry-aware cockpit | No | `used but not collected` | `convex/lib/fitAlgorithm/index.ts:116`, `convex/lib/fitAlgorithm/calculations.ts:367`, `convex/recommendations/inputMapping.ts:89` |
| `currentSaddleHeightMm`, `currentSetbackMm`, `currentDropMm`, `currentReachMm` | Delta computation vs current setup | No | `used but not collected` | `convex/lib/fitAlgorithm/types.ts:40`, `convex/lib/fitAlgorithm/calculations.ts:503`, `convex/recommendations/inputMapping.ts:89` |

## Mismatch Findings (Severity-Ranked)

### P1

1. `experience_level` is captured but ignored in fitting calculations.
   - Impact: bar-drop aggression is not adjusted by rider capability.
   - Evidence: `convex/questionnaire/questions.ts:44`, `convex/lib/fitAlgorithm/calculations.ts:183`, `convex/recommendations/inputMapping.ts:89`.

2. Bike geometry and current setup are collected but never passed into recommendation generation.
   - Impact: stem/spacer optimization falls back to defaults; deltas are not produced.
   - Evidence: `src/components/bikes/BikeForm.tsx:244`, `convex/lib/fitAlgorithm/calculations.ts:367`, `convex/lib/fitAlgorithm/calculations.ts:503`, `convex/recommendations/inputMapping.ts:89`.

3. Femur and foot measurements do not influence core fit equations.
   - Impact: UI/tooltips and plan imply improved setback/cleat precision, but outputs are unchanged except confidence metadata.
   - Evidence: `src/components/measurements/StepAdvancedMeasurements.tsx:96`, `convex/recommendations/inputMapping.ts:101`, `convex/lib/fitAlgorithm/index.ts:208`.

4. Most questionnaire responses are stored but not consumed by the recommendation engine.
   - Impact: user-entered context has limited effect on fit outputs.
   - Evidence: `convex/questionnaire/questions.ts:39`, `convex/questionnaire/mutations.ts:153`, `convex/recommendations/mutations.ts:47`.

### P2

5. Optional anthropometric fields are auto-estimated and then shown as plain values without provenance.
   - Impact: users may believe estimated values were measured.
   - Evidence: `convex/profiles/mutations.ts:76`, `convex/profiles/mutations.ts:79`, `src/app/(dashboard)/profile/page.tsx:59`.

6. `typical_ride_length` has no mapping to `longestRideKm`.
   - Impact: session riding-volume context is incomplete.
   - Evidence: `convex/questionnaire/questions.ts:82`, `convex/schema.ts:173`, `convex/questionnaire/mutations.ts:153`.

7. Several profile fields exist with no UI path and no recommendation use (`handSpanCm`, `sitBoneWidthMm`, `injuryHistory`, `age`, `weightKg`).
   - Impact: schema/API complexity without behavioral value.
   - Evidence: `convex/schema.ts:50`, `convex/profiles/mutations.ts:29`, `convex/recommendations/mutations.ts:31`.

8. Foot-length unit conventions are inconsistent across validation and backend naming (`footLengthMm` vs `footLengthCm`).
   - Impact: future integration risk for unit conversion mistakes.
   - Evidence: `src/lib/validations/profile.ts:49`, `convex/schema.ts:49`, `convex/recommendations/inputMapping.ts:101`.

### P3

9. `questionDefinitions` table exists in schema but questionnaire runtime uses static in-code definitions.
   - Impact: data model and runtime model diverge.
   - Evidence: `convex/schema.ts:321`, `convex/questionnaire/queries.ts:13`, `convex/questionnaire/questions.ts:39`.

## Summary Counts

- `correctly used`: 8
- `transformed with risk`: 6
- `stored but not used`: 22
- `used but not collected`: 4

## Step-01 Completion Checklist

- [x] All profile/session/questionnaire inputs are listed
- [x] Every field has a traceability status
- [x] Conversion and mapping risks are documented
- [x] Findings are reproducible with file references
