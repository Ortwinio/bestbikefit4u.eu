# F3 — data reuse, leave notice and integrated QA

Final candidate: 5 October 2026, `feature/reliability-full`, after B's F2 account-layout freeze and the owner's final persistence decision. No calculation-only exemption remains in account calculators.

## Owner decision implemented

- Signed-in rider/body edits save to canonical profile fields with provenance. Automatic saves cannot replace measured observations with declared, estimated or derived values. The server checks current provenance, not only the client's earlier snapshot.
- Public calculator profile conflicts show the retained measurement and an explicit replacement button. Confirmation binds to the current value and observation timestamp; stale confirmation is rejected. Successful confirmations are consumed rather than replayed on later edits.
- Account calculators automatically save eligible profile changes; protected changes retain the explicit save action. The calculation-only option is hidden and disabled in this mode. Scenario saves remain independent of pending profile confirmation.
- Scenario inputs are scoped by user and calculator, not globally by field. The newest value wins within that scope. Power-speed power cannot replace climb-planner power. Existing account calculator state persists complete scenarios; the public/account performance bridge shares newer values only for the same calculator, without resetting active typing.
- Hip circumference now uses its existing saddle-width engine range, 70–160 cm, in the shared profile registry. It saves as a body observation rather than an unprotected scenario. The existing schema already supports the field. Profile-editor and backend regressions cover this registration.
- All automatic writes carry authenticated-user guards. Sign-out/account switches cancel pending client work; backend guards reject stale-account writes.

## Shared data and signup

- `bbf.handoff` is sessionStorage-only while signed out, regardless of cookie consent. Legacy persistent values are cleared and never revived into a fresh session. Current-session values survive consent changes.
- The root data provider supplies shared session/profile prefills. It does not write example defaults. Actual edits retain method, kind and timestamp; server plausibility checks control inseam warnings and repeat-measurement precision.
- Scenario values include power, speed, gradient, distance, duration, temperature, bike weight, gearing, raw FTP-test power and intensity. Profile measurements remain reusable across calculators; scenarios remain calculator-specific while signed in.
- Login/signup offers the existing review rather than silently importing session data. Explicit generic profile replacements carry value/date guards. Unexpectedly retained differing values keep the session for retry. Session data clears only after both generic and legacy import paths succeed.
- Prefill notices distinguish session input, profile measurements and last-used calculator values. Leave notices appear only after signed-out input: once-per-session desktop top-exit dialog, or dismissible touch bar. Shared focus trapping and Escape work; no beforeunload prompt. Auth/checkout and signed-in users are excluded.
- Consent-aware leave analytics contain locale/path only, never entered measurements or query values.

## Combined final gates

| Gate | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, including runtime, tooltip, contrast, CSS-token, image, brand and price guards |
| `npm run test:unit -- --maxWorkers=4` | PASS: 4,142 tests; 20 existing skips; 464 files passed, one skipped |
| `npm run test:contracts` | PASS: 610 tests, 54 files |
| Convex standalone `tsc --noEmit` | PASS |
| Offline production build | PASS, canonical `https://bikefitboost.com`, Convex URLs `http://127.0.0.1:9` |
| SEO crawl `--local --skip-build` | PASS: 875 checks, zero findings |
| Domain migration `--local --skip-build` | PASS: 684 redirects, zero findings |
| Board/runtime harness tests | PASS: three tests; 18 board scripts and 34 reference states |
| Public browser sweep | PASS: 68 scenarios |
| Signed-in calculator fixtures | PASS: 44 scenarios |
| Account/knee/dashboard fixtures | PASS: 96 scenarios, light and dark |
| Signup review fixtures | PASS: four scenarios |
| PDF QA | PASS: four six-page NL/EN PDFs and ten six-page HTML layouts |
| Email previews | PASS: 42 bilingual previews, 84 screenshots, zero layout/asset failures |

All 212 browser scenarios run NL/EN at 1440/390. Zero axe violations at any severity, overflow, application-console/page errors or scenario failures. Representative refreshed renders reviewed. See `F3-visual-notes.md` and `F3-pdf-notes.md` for scope and evidence.

## Integration corrections and limitations

- B corrected obsolete dashboard mocks/presentation assertions. A corrected the provenance contract to require one-repeat/false-tolerance scalar saves while preserving unrelated owner/bike rows; no invented repeated-measurement credit.
- Final owner-rule integration required updating two obsolete tests: account fit can no longer remain calculation-only; hip circumference is now editable within the existing engine bounds. Neither production assertions nor axe gates were weakened.
- Four unit workers avoid prior CPU-contention timeout failures. Existing non-fatal Vite/TypeScript source-map, Node module-type and jsdom navigation warnings remain; all test commands exit successfully.
- Browser account/signup fixtures exercise real components with explicit offline auth/query/mutation data. They are not proof of a real login or deployed database write. Backend unit/contract tests provide server-logic evidence. External requests are blocked; only exact disabled-loopback-backend diagnostics are separated from application errors.
- Logs, renders, PDFs and machine crawl/reference JSON stay ignored and are excluded from `files-F3.txt` (85 source/test/harness paths). No commits, deployments, production calls, environment-file changes or real mails.
