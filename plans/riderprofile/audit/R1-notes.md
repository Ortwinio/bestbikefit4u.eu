# R1 public calculator handoff

Implemented in the rider worktree only; R0 baseline work remains separate. No commit, deploy, production data access or schema changes by C.

## Product behavior
Every public calculator uses the RP1 split ink/lime personalize block below its visible result. NL/EN copy is in owner dictionaries. The block shows only real session entries, provenance labels, previous-calculator labels and a count from three entries onward. The login CTA carries calculator ID and `handoff=1` only. No measurement values go into URLs or analytics. The review-only Ontwerpstaat strip is absent from product UI.

The bounded, versioned `bbf.handoff` store uses sessionStorage only. Explicit edits/confirmations write entries; untouched slider defaults and prefill never write or refresh timestamps. Cross-calculator prefill applies compatible fields once and announces only the accepted fields. Account-mode forms ignore public session state. Optional current crank and saddle model start empty. Legacy public gearing/saddle-width backend writes were removed; logged-in persistence remains in account wrappers.

Shared tooltip registry integration includes C's new inputs, welcome's permanent inline guidance, ProfileProvenance and DashboardProfilePrompts. No tooltip enforcement was removed from existing fields.

## Integration and validation
- Shared storage/component/dictionary tests: 33 passed.
- Tooltip coverage: 54 files passed.
- Combined calculator regression, typecheck, full lint and visual results are recorded in the completion update below.
- B-owned `src/app/welcome/handoff-flow.test.tsx` initially required a theme provider at LoginPage. Reported in `messages/C-to-B-shared-integration.md`; remaining transfer tests passed (71).

## Scope and data limits
The fuel engine currently uses duration, temperature and sweat, not FTP/body weight. R1 retains prior session entries in the shared block but does not invent a new nutrition formula. FTP test outputs must never become measured observations. Unknown input provenance remains unknown until the rider chooses a method. Incompatible entries are removed when drivetrain/test method changes.

Visual captures use the real public forms, shared layout and compiled styles with offline routing/backend fixtures. This verifies responsive UI and session behavior without writing backend data. PNGs stay ignored and are excluded from the file manifest.

## Completion — 3 October 2026

177 focused tests passed, 20 existing skipped; full typecheck and full lint passed. `git diff --check` passed. Four browser scenarios (NL/EN × 1440/390) passed, with initial/filled captures, no horizontal overflow or runtime errors, and same-session saddle→frame prefill assertions. Board comparisons and actual mobile/desktop captures were visually inspected; comparison harness now asserts both images decoded.

FTP protocol changes remove the previous incompatible FTP; raw ramp/20-minute test power and untouched test defaults are not stored as FTP. Selecting 1× clears the inner ring. Optional rim type starts unset and is explicitly described as profile-only for this calculation. Public aero ambition maps to the existing broad profile goal performance; the calculator itself still uses aero. Declared/estimated prefill never upgrades to measured.

The R2-owned acceptance fixture's theme-provider issue is recorded for B; no R2 file was changed to bypass it. Other 71 transfer/store/import tests passed in that run. PNGs are local-only; audit/R1-browser.json records scenario results.
