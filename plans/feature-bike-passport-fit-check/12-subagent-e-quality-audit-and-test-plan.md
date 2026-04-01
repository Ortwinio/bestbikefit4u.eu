# Subagent E — Quality Audit and Test Plan

## Mission

Audit the completed Bike Passport Fit Check MVP for data-model alignment, privacy safety, claim safety, and test completeness.

## Write scope

- no product code changes by default
- audit notes, validation notes, and small test-gap recommendations only unless explicitly asked to patch

## Audit checklist

### Data model

- does the feature use `geometryRecordId` as canonical geometry source?
- does it avoid storing rider-derived saddle-range assumptions on `bikes`?
- is `publicFitSnapshot` narrow and cache-like?

### Security

- does public lookup hide internal IDs and owner data?
- are invalid and disabled-preview states indistinguishable?
- are token revocation checks real, not only signature-based?

### Claims

- any “this bike fits you” language?
- any “accurate” or “scientific” fit claims?
- does every result state expose confidence and limitation?

### Tests

- are contract, route, engine, and UI tests all present?
- are boundary cases covered?
- are EN/NL strings covered?

## Ship verdict

Return one of:

- `ready`
- `ready_with_low_risk_followups`
- `not_ready`

If not ready, list blocking findings first with file references.

## Final handoff format

- verdict
- findings ordered by severity
- missing tests
- recommended follow-up items

