# First full QA sweep — DONE 21

70 routes × NL/EN × 1440/390 = 280 captured cases.
75 cases have no failed checks; 205 have findings. This is a baseline snapshot, not a clean app gate.
The lead will rerun after the parallel dark-mode fixes land. This required matrix uses light mode.

| Check | ✓ | ✗ | Skipped |
| --- | ---: | ---: | ---: |
| status | 280 | 0 | 0 |
| errors | 104 | 176 | 0 |
| overflow | 280 | 0 | 0 |
| h1 | 276 | 0 | 4 |
| locale | 276 | 0 | 4 |
| seo | 164 | 0 | 116 |
| language | 276 | 0 | 4 |
| touchTargets | 73 | 65 | 142 |
| images | 276 | 0 | 4 |
| axe | 192 | 84 | 4 |

## Accessibility findings

Axe 4.13.0 analyzed all 276 applicable cases without runner errors. Four intentional locale-404 cases are skipped.
84 cases have serious/critical violations. Rule counts below overlap when a case has multiple violations.

| Rule | Impact | Cases | Affected node occurrences |
| --- | --- | ---: | ---: |
| aria-allowed-attr | critical | 36 | 132 |
| color-contrast | serious | 44 | 44 |
| aria-progressbar-name | serious | 4 | 4 |
| label-title-only | serious | 8 | 8 |

## Other findings

- 65 mobile cases have visible interactive targets below 44×44 pixels; labels and dimensions are in the report.
- All 176 production cases log local Convex WebSocket/CSP and missing Vercel analytics script errors.
- Dutch `/calculators/gearing` and `/calculators/power-speed` report React error #418 at both widths.
- Expected document-404 diagnostics are recorded separately; other resource errors remain failures.

## Evidence and limits

- `report.md` and `report.json` contain all 280 cases, details, selectors and screenshot links.
- All 280 unique screenshots were verified at their exact viewport dimensions.
- The isolated production build, scoped ESLint and four tooling tests pass.
- Account fixtures render actual components with mocked auth/Convex. They do not prove backend authorization.
- The blog article uses the existing fixture because no published slug was available; metadata is skipped.
- Other SEO skips are account/auth/install routes and expected 404s. Desktop touch targets are not evaluated.
- Exactly `@axe-core/playwright: "4.13.0"` was added to devDependencies; no other package.json changes.
- The lockfile adds the adapter and updates its axe-core dependency to 4.13.0.
- No app source changes or commit. Source ownership list: `tooling-files.txt`.
- Initial `smoke/` startup diagnostics are superseded by this full run.

Source fingerprint: `c0fe299456bc3d13a0dcb644d1dc0ed0a744bbcfca92b14d00bd125fd9ab3d40`.
Build ID: `CrxsojY1bPDWAC36Ugm5L`.

Rerun: `node tests/visual/final-sweep/sweep.mjs`.
Exit 1 means completed with findings; exit 2 means setup failed.
