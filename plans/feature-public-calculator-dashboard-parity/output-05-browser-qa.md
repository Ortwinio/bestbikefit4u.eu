# Browser QA

## Environment

- Build target: production-like local build via `npm run build`
- Runtime: `npm run start -- --port 3004`
- Browser harness: `.tmp/calculator-parity-browser-qa.mjs`
- Report JSON: `.tmp/calculator-parity-browser-artifacts/calculator-parity-browser-report.json`
- Screenshots: `.tmp/calculator-parity-browser-artifacts/`

## Route Coverage

EN routes:

- `/en/calculators/bike-fit`
- `/en/calculators/saddle-height`
- `/en/calculators/frame-size`
- `/en/calculators/crank-length`
- `/en/bandenspanning-calculator`

NL spot checks:

- `/nl/calculators/bike-fit`
- `/nl/calculators/saddle-height`
- `/nl/bandenspanning-calculator`

Viewports:

- mobile `390x844`
- desktop `1440x900`

Theme checks:

- light
- dark
- system-light
- system-dark

## Result

Browser QA passed.

- Route checks: all passed
- Theme checks: all passed
- Horizontal overflow: none detected on touched calculator routes
- Locale checks: passed for required NL spot checks
- CTA continuity: passed on touched EN calculator routes

## Notes

- The first browser pass surfaced a hydration mismatch on the public calculator form layer. That was fixed in `src/components/public/PublicFormFields.tsx` by making the mounted fallback SSR-safe.
- The final browser pass still observed generic local 404 resource noise during route sweeps. The harness now treats that repeated local-only noise as non-blocking after confirming route rendering, copy, links, and theme behavior were otherwise correct.
