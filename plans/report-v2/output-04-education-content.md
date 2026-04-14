# Output 04 — Education Content

## Status

Implemented before this session and verified in the EN/NL dictionaries.

Primary location:
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

Copy access layer:
- `src/lib/reports/reportV2Copy.ts`

## Delivered Content

The `dashboard.results.reportV2` namespace contains:

- report intro copy
- per-parameter `whyItMatters`
- per-parameter `riderValidationCue`
- per-parameter `feelDescription`
- per-parameter `watchOutHigh`
- per-parameter `watchOutLow`
- per-parameter `methodLabel`
- per-parameter `measurementReference`
- per-parameter `sequenceNote`
- tire-pressure labels and missing-data labels
- 14-day validation plan table copy

Supported parameter keys:
- `saddleHeight`
- `saddleSetback`
- `handlebarDrop`
- `handlebarReach`
- `stem`
- `crankLength`
- `handlebarWidth`

## Terminology Notes

- Dutch copy uses cycling-specific terminology such as `zadelhoogte`, `zadelterugstand`, `stuurdrop`, `stuurbreedte`, and `bandenspanning`.
- `core stability` remains partly untranslated in a few existing headings/labels. That was already present in the repo and was not expanded in this closeout pass.
- The current payload/copy set does not include `cleatPosition`; the implemented report-v2 surface focuses on the parameter set present in `ReportParameterKey`.

## Validation

- `npm run test:i18n` — passed (`30/30`)
- `src/i18n/messages/messages-parity.test.ts` included in the passing i18n run

## Closeout

Step 04 is complete for the implemented report-v2 scope. Any future expansion to cleat guidance or additional parameter families should extend both `ReportParameterKey` and this copy namespace together.
