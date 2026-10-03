# R15 gearing — owned implementation

## Coverage and behavior

- Public gearing has no FTP input or slider: its engine compares gearing, wheel circumference and cadence. No public FTP control was added. NL/EN regression tests keep its existing gear result visible and verify no FTP slider or numeric input appears.
- Account gearing already has an optional numeric FTP input, bounded 80–500 W with step 1. It now displays the parent-owned `getFtpSliderStart` value when FTP is unknown and sex/weight support a start. Existing control type and bounds are preserved.
- The start is presentation-only: `chain.values.ftp` remains empty until an actual input change or explicit confirmation. The unchanged result never receives the demographic start; unrelated cadence autosave serializes `ftpWatts: undefined`.
- Confirming or editing enters the existing profile-save versus calculation-only choice. Confirmation alone does not write to the profile/backend. Clearing leaves the field empty rather than silently reinstating the suggestion.
- Known profile FTP wins over saved-session FTP; either wins over any demographic start. Incoming authoritative FTP replaces an untouched start. Missing sex/weight or unsupported sex retains the existing blank optional input.
- The shared helper supplies the Fair-boundary calculation and rounding. This worker adds no demographic formula, flexibility estimate, schema, backend or shared-engine change. No `accountState` change is required.

## Ownership

Only R15 additions were made to the already-modified account form and its tests, plus public-form coverage tests. Existing R2/R4 changes were preserved. Parent owns `shared/riderEstimates/ftpSliderStart.ts`, `src/i18n/calculators/ftpSliderStart.ts` and the plan README. The manifest lists touched files, not exclusive ownership of their complete pre-existing diffs.

## Validation

- Focused Vitest: 21/21 tests across account/public gearing form suites. Covers NL/EN starts, no untouched persistence (including unrelated autosave), explicit confirmation, local trials, clearing, absent demographics, known FTP precedence and reactive profile updates.
- Focused ESLint: passed for all three modified source/test files.
- Offline real-source esbuild/Playwright fixture: eight screenshots, NL/EN at 1440/390, pending and confirmed states. No horizontal overflow, runtime errors, external requests or mutation calls before profile-save choice. Synthetic female 60 kg profile; actual route components, Tailwind/CSS modules and repository fonts. Inspected EN mobile pending render.
- Parent reports 190 combined tests and full repository typecheck/lint passed. Parent also reviewed the NL 390 pending render and accepted it. No further capture scope is outstanding.

Evidence: `R15-gearing-browser.json`, `R15-gearing-capture.mjs`, `../renders/R15-gearing-*.png`. The fixture checks the route content, not full Next SSR/auth hydration or the surrounding dashboard shell. Existing RP6 board comparison remains covered by R4; R15 adds only the pending FTP helper/confirmation inside that layout.

No commits, deployment, production access, real user data or new dependencies.

Status: DONE R15 gearing-owned scope. Broader helper/table scope questions remain with the lead; this integration uses the supplied parent helper and never treats an untouched start as FTP evidence.
