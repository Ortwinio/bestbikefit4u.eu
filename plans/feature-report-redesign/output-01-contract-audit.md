# Report V2 Contract Audit

## Final payload fields

`ReportV2Payload` now includes these additive contract fields:

- `reportDate: string`
  - ISO-8601 timestamp
  - derived from `session.completedAt`, else `session.createdAt`
- `rider`
  - `name: string | null`
  - `heightCm: number | null`
  - `weightKg: number | null`
  - `inseamCm: number | null`
  - `armLengthCm: number | null`
  - `torsoLengthCm: number | null`
  - `shoulderWidthCm: number | null`
  - `bmi: number | null`
  - `bmiCategory: "underweight" | "normal" | "overweight" | "obese" | null`
  - `flexibilityScore: number | null`
  - `flexibilityLabel: string | null`
  - `coreStabilityScore: number | null`
  - `comfortScore: number | null`
- `bike`
  - `name: string`
  - `bikeType: string`
  - `brand: string | null`
  - `model: string | null`
  - `ridingStyle: string | null`
  - `goal: string | null`
  - `description: string | null`
  - `imageUrl: string | null`
  - `questionnaire`
    - `experienceLevel: string | null`
    - `weeklyHours: string | null`
    - `rideLength: string | null`
    - `positionPriority: string | null`
    - `typeOfRiding: string | null`

Existing fields remain in place:

- `profile`
- `prioritySummary`
- `detailedFit`
- `adjustmentSequence`
- `tirePressure`
- `frameTargets`
- `fitNotes`

## Query contract

`getReportV2` now returns these additional source fields:

- `user`
- `questionnaireResponses`

`questionnaireResponses` are returned as raw session response docs sorted by `questionOrder`. Canonical user-facing normalization happens in `reportV2Mapper.ts`, not in the query.

## Nullability rules

- The mapper does not intentionally emit `undefined` for render-facing payload fields.
- `reportDate` is always a string.
- `rider.name`
  - falls back in this order: `user.displayName` -> `user.name` -> `user.googleName` -> email local-part -> `null`
- `rider.*` measurement fields are `null` when `profile` is absent.
- `rider.bmi` and `rider.bmiCategory` are `null` unless both height and weight are present.
- `rider.flexibilityScore` and `rider.flexibilityLabel` are `null` unless `profile.flexibilityScore` exists.
- `rider.coreStabilityScore` is `null` unless `profile.coreStabilityScore` exists.
- `rider.comfortScore` is `null` when the pain inputs are absent; otherwise it is derived from profile pain fields.
- `bike.name` is always a string and falls back to `"Unnamed bike"`.
- `bike.bikeType` is always a string and falls back to the fit session bike type.
- `bike.brand`, `bike.model`, `bike.description`, and `bike.imageUrl` are nullable.
- `bike.ridingStyle` falls back from `bike.ridingStyle` to `session.ridingStyle`, else `null`.
- `bike.goal` falls back from `bike.primaryGoal` to `session.primaryGoal`, else `null`.
- `bike.questionnaire.*` fields are normalized strings or `null`.
- Existing `profile.bikeImageUrl` remains nullable for compatibility with the current results page and PDF template.

## Score derivation rules

- `rider.flexibilityScore`
  - derived from the actual stored enum on `profiles.flexibilityScore`
  - mapping:
    - `very_limited -> 1`
    - `limited -> 2`
    - `average -> 3`
    - `good -> 4`
    - `excellent -> 5`
- `rider.flexibilityLabel`
  - derived from `flexibilityTests` in `src/lib/validations/profile.ts`
- `rider.coreStabilityScore`
  - read directly from `profiles.coreStabilityScore`
- `rider.comfortScore`
  - derived from the existing `deriveComfortScore(hasPain, painSeverity)` helper in `src/lib/validations/profile.ts`
  - this uses actual stored pain fields instead of a nonexistent `profiles.comfortScore` field
- `rider.bmi`
  - derived as `weightKg / (heightM^2)`, rounded to one decimal

## Questionnaire normalization rules

Canonical normalization lives in `reportV2Mapper.ts`.

- Session questionnaire responses are read from `questionnaireResponses`.
- Shared rider-profile answers fall back to `profiles` when session responses are absent:
  - `experienceLevel`
  - `weeklyHours`
  - `typicalRideLength`
  - `positionPriority`
- Session-only bike-context answers remain response-driven:
  - `road_riding_type`
  - `mtb_terrain`
- The mapper now preserves raw response values for report payload stability.
- Locale-specific label rendering happens later in `pdfLayoutTemplate.ts`, not in the mapper.

## Known deferrals

- The payload still stores human-readable `flexibilityLabel` for convenience, but the PDF template now prefers locale-specific score copy derived at render time.
- `profile.bikeImageUrl` is intentionally retained for compatibility even though `bike.imageUrl` is now the preferred additive field for the redesign.
- No query-side response-map compression was introduced. Raw ordered responses are returned so the mapper remains the single normalization layer.
