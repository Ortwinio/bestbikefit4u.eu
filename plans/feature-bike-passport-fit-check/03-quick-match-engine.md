# BP-03 — Quick Match Heuristic Engine and API

## Objective

Build a deterministic heuristic Quick Match that screens a bike for rough size compatibility from rider height plus available bike geometry.

## User story

As a visitor, I want a first-pass answer about whether a bike looks roughly compatible with my size before I spend more time on it.

## Business value

- provides immediate value without requiring sign-up
- creates a clean handoff to profile completion
- keeps the claim honest by staying intentionally limited

## Dependencies

- BP-01 complete
- BP-02 complete
- existing fit/saddle-height code reviewed before extraction

## Scope for this sprint

Ship only:

- anonymous Quick Match
- max score `75`
- result band + confidence + explanation
- no persistent fit assessment table

Do not ship:

- stored anonymous assessment history
- full rider-profile scoring
- “best bike” comparison logic

## Scoring rules

The engine must be described in code and tests as a **heuristic screening model**, not a scientific fit model.

### Inputs

- `heightCm`
- `publicFitSnapshot`

### Allowed heuristics

- height-derived inseam estimate
- frame size/height window
- stack/reach proxy if actual geometry is known

### Output

```ts
type QuickMatchResult = {
  score: number;
  scoreMax: 75;
  scoreBand: "unlikely" | "weak" | "borderline" | "could_fit";
  confidence: "high" | "medium" | "limited";
  explanationCode: string;
  estimatedInseamCm: number;
  dimensionScores: {
    frameSize: number;
    cockpit: number;
    geometryConfidence: number;
  };
  calcVersion: "qm_v1";
};
```

### Important change from the old plan

Do **not** score from `currentSetup.saddleHeightMm` or any owner-derived saddle proxy.

Quick Match should screen from:

- known geometry
- declared frame size
- geometry completeness

If no useful geometry exists, return a limited-data result with low confidence instead of manufacturing a strong score.

## Copy rules

Use practical wording:

- “Could suit your size”
- “Looks compatible on paper”
- “Limited estimate based on height and available geometry”

Do not use:

- “This bike fits you”
- “Accurate fit”
- “Fit confirmed”

## API contract

`POST /api/public-fit/quick-match`

Request:

```json
{ "previewToken": "...", "heightCm": 178 }
```

Response:

```json
{
  "score": 61,
  "scoreMax": 75,
  "scoreBand": "could_fit",
  "confidence": "medium",
  "explanationCode": "frame_size_close",
  "estimatedInseamCm": 84,
  "dimensionScores": {
    "frameSize": 25,
    "cockpit": 21,
    "geometryConfidence": 15
  },
  "calcVersion": "qm_v1"
}
```

## Acceptance criteria

- [ ] score never exceeds `75`
- [ ] bikes with no usable geometry return `confidence: "limited"`
- [ ] score bands are deterministic and covered by tests
- [ ] expired or revoked token returns `401`
- [ ] out-of-range height returns `400`
- [ ] `estimatedInseamCm` is returned and later disclosed as an estimate in UI

## Edge cases

- bike has only size label, no stack/reach
- bike has stack/reach but no explicit size label
- bike has neither
- rider height at lower/upper validation bounds
- linked geometry and manual geometry disagree; snapshot precedence from BP-01 must already resolve this

## Analytics events

- `bike_public_fit_quick_match_completed`
- `bike_public_fit_signup_cta_clicked`

## Human audit checks

- inspect a weak-data bike and confirm result wording stays cautious
- inspect a strong-data bike and confirm the UI still reads as “on paper,” not as certainty
- verify the inseam estimate is disclosed plainly

## Testing

- pure engine tests for score caps and band boundaries
- boundary tests for height validation
- token-backed route tests for `200`, `400`, `401`
- regression tests for `geometryQuality` handling

