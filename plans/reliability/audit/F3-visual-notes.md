# F3 visual QA — 5 October 2026

Status: final production rebuild and all four browser sweeps pass after B's F2 freeze and the owner's automatic-profile/calculator-scoped scenario decision. All 212 scenarios have zero axe violations at any severity, overflow or application errors.

## Reference execution

Executed all 18 `boards/project/*.dc.html` logic scripts in a DCLogic VM shim, resolving Calc-* imports through Calculator. Captured 34 default/interaction states to ignored `renders/F3-board-reference.json`. Account three-consistent-measurement reference gives 787 mm ±18; paid in-window gives ±13; outside-window adjustment steps remain ±5 mm. Reference tests pass.

The Main script narrows the yellow warning before confirmation, whereas the written model keeps unresolved-warning uncertainty. Provisional widths in Calculator/Calculators are subordinate to ontwerp §9. Board fixture centres do not replace real engine outputs. The VM executes formulas/states only; it does not fabricate a working canvas renderer where support.js is missing.

## Public sweep — PASS

`tests/visual/reliability/full-run-local.mjs` wraps the existing production HTTPS server and temporary trusted certificate. `full-public.mjs` prepares 68 real-page captures at NL/EN ×1440/390: all 11 actual public calculator routes, three reuse destinations after entering saddle height/inseam, fresh-context empty store, legacy persistent-store removal, desktop focus-trapped/Escape/once-per-session notice and touch dismissible notice. No invented pressure interval. Mobile contexts expose real touch media queries.

All68 scenarios pass, zero serious/critical axe, overflow or application errors. `full-runtime.mjs` blocks external requests, isolates exact disabled-loopback-backend diagnostics and keeps all hydration/application errors fatal. Three focused harness tests pass. Local production build and loopback server were used; no real authentication, backend writes or mails.

Initial desktop keyboard assertions caught asynchronous Base UI autofocus/focus guards. An isolated real-page diagnostic in NL/EN verified24 forward/reverse settled focus checks: initial focus settles4–8ms later; guards wrap in0–11ms. Harness now waits for focus inside the dialog before traversal and after each Tab. It does not count an outside guard as contained or suppress a persistent escape. Full68 rerun passes. No app focus-trap patch was necessary.

## Signed-in and account fixtures — PASS

- Signed-in44/44: actual11 calculator forms × NL/EN1440/390 with explicit profile context fixtures. No render writes; actual edits reach profile callbacks and survive remount. Scenarios use the current calculator's scope; profile fields remain global. All three exact localized source headings are recognized and saved calculator identity is asserted. Zero axe findings/runtime errors. Fuel assertions convert displayed hours to stored minutes; FTP assertions select the numeric FTP update instead of the later method update.
- Account96/96: actual account saddle, knee-angle and dashboard components with supplied offline model fixtures × NL/EN1440/390 × light/dark. Zero axe findings at any severity, overflow or runtime errors. B corrected the earlier dashboard fixture heading order; no findings are suppressed.
- Reviewed representative mobile/desktop/light/dark renders. Six-page bilingual PDF and42 email previews also pass; see F3-pdf-notes.md.

Signup review4/4: real WelcomeClient with explicit local auth/query/mutation fixtures. Session190cm declared +89cm measured is offered in review; real Save action sends exact import arguments, updates mock profile/provenance, clears session/local handoff and navigates to localized dashboard. Zero axe/overflow/runtime findings. Eight review/post-save screenshots; F3-signup.json. Backend mutation and existing welcome handoff integration tests remain the actual server-logic evidence.

Total212 scenarios across public68 +signed-in44 +account96 +signup4, all refreshed on the final candidate. Fixtures are explicit local profile callbacks/presentation props, not real authentication or production persistence proof. Outputs remain ignored under renders/F3-*. Final combined gates are separately recorded in F3-notes.md.
