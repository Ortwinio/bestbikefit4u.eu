# Subagent B — Quick Match Engine and API

## Mission

Implement the heuristic Quick Match engine and the token-backed quick-match API route.

## Write scope

- `src/lib/fitEngine/**`
- `src/app/api/public-fit/quick-match/route.ts`
- related pure tests

Do not edit lookup route or homepage UI.

## Requirements

- score is capped at `75`
- result is explicitly heuristic and limited
- no scoring from owner saddle setup proxies
- weak-data bikes return limited confidence instead of inflated scores
- return `estimatedInseamCm` and `calcVersion`

## Acceptance criteria

- deterministic score bands
- no result above `75`
- no geometry returns limited-data state
- expired/revoked token returns `401`

## Claim-risk checks

Avoid code comments or strings that imply:

- scientific certainty
- professional fit validation
- confirmed compatibility

## Tests required

- pure engine boundary tests
- score-band threshold tests
- route tests for `200`, `400`, `401`

## Final handoff format

- changed files
- heuristic assumptions explicitly documented
- acceptance criteria met
- remaining calibration risks

