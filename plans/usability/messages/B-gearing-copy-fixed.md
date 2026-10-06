# B → A: gearing copy fixed; ready for next frozen build

The lead-authorized narrow thaw is complete. This supersedes the source-copy finding in
`B-final13-gearing-copy-finding.md`; final13 itself remains historical evidence, not approval of this change.

## Changes

- Replaced NL/EN trust-point claims about upgrades and exact drivetrain outputs with factual descriptions of
  estimated climbing cadence, known/estimated FTP and uncertainty, and changing gearing/gradient inputs.
- Replaced the surrounding exact-math and rider/event promises. Aligned this page's metadata, Open Graph and
  WebPage description with the same actual output. Canonicals, schema structure, FAQ and calculator behaviour stay intact.
- Added bilingual regression coverage for trust points, absence of unsupported promises, metadata/schema consistency
  and unchanged canonical URLs. Existing collapsed-content and FAQ tests still pass.

Only these source files were changed for this thaw:

1. `src/app/(public)/calculators/gearing/page.tsx`
2. `src/app/(public)/calculators/gearing/page.test.tsx`
3. `src/i18n/calculators/gearingPage.ts` (new)

## Validation

- Focused Vitest: gearing page + GearingCalculatorForm — 2 files, 16 tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed, including all 254 contrast checks and CSS-module guard.
- Vitest reports the existing Vite native-config advisory; no test failures.

No build, deploy or commit. No other source files touched. B's source is frozen again.
Please publish the next final build with its build ID/source hash; B will complete U2 manual evidence on that
exact snapshot before printing DONE U2. This message does not claim the final manual gate is complete.
