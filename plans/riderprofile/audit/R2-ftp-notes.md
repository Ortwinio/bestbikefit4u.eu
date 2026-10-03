# R2 FTP sidecar

Implementation complete: account performance FTP attribution and account-only gearing FTP input. Profile FTP is a mount-time prefill only; saved session values (including blank gearing FTP) and edits take priority. No profile mutation, public form edit, commit, deployment, or dependency change.

## Verification

- 47 tests passed across account performance, account gearing, gearing adapters, account value resolution, and FTP attribution using `npx vitest run --config plans/riderprofile/audit/R2-ftp-vitest.config.ts src/components/calculators/AccountPerformanceCalculator.test.tsx 'src/app/(dashboard)/gearing/GearingCalculatorForm.test.tsx' 'src/app/(dashboard)/gearing/gearingPrefill.test.ts' src/components/calculators/RiderFtpPrefill.test.tsx src/lib/calculators/accountState.test.ts`.
- The audit-only config substitutes missing C-owned `PersonalizeAdviceBlock` / `HandoffPrefillNotice` imports with throwing sentinels. They must never mount in account mode. When real files exist the config uses them automatically. Standard tests currently cannot resolve those pending imports; rerun standard suites after C finishes.
- Targeted ESLint on all eight source/test files and three audit scripts passes. `git diff --check` passes.
- `npm run typecheck` and `npm run lint` attempted: global failures from concurrent public-handoff components/layout types and optional-profile migration consumers. No owned-file diagnostics. Parent must rerun full gates after integration.
- `node plans/riderprofile/audit/R2-ftp-visual.mjs`: eight screenshots (gearing / FTP-Wkg × NL / EN × 1440 / 390), no browser errors or horizontal overflow. Actual account components with mocked Convex data; public-only imports are throwing sentinels. Four representative captures visually inspected, covering both tools, both widths, and both languages. No clipping in the added FTP/date UI.

## Integration details

Profile contract uses optional `ftpWatts`, `ftpMethod`, numeric epoch-ms `ftpMeasuredAt`. Performance controls support 80–500 W; out-of-range profile FTP is not silently clamped or represented as a saved/default fact. Gearing uses the same range. Dates use the active NL/EN locale with UTC for stable calendar display; missing dates are explicitly unknown.

- No calculation-derived FTP or slider default is written to the rider profile. Attribution only uses the explicit profile field. A saved profile estimate is described as recorded, never as measured; its method is not reapplied to an already-calculated FTP.
- Fuel/hydration has no FTP input and retains its existing behavior. Power/speed, climb planner, FTP/Wkg retain existing profile prefill behavior and now expose the recorded date.
- Gearing's visible result remains the shared public gear-ratio model; the new account-only FTP input is persisted in the existing gearing session/analysis path. No change to public result logic.
- Shared hook diff is six additive lines: import, mount-time provenance state, guarded provenance initialization, return property. Existing value resolution, edits, autosave, and readiness logic are untouched. No concurrent hook edits were present when inspected; preserve this addition alongside future R4 work.
- Source-only manifest: `R2-ftp-files.txt`. Only those eight source/test paths belong to this sidecar; other worktree changes belong to parallel owners.
- Captures: `plans/riderprofile/renders/R2-ftp-{gearing,ftp-wkg}-{nl,en}-{1440,390}.png`.

DONE R2-ftp (sidecar; full integration gates remain with parent).
