# 42 — Shared account tire-pressure calculator

## Initial audit

- `src/app/(dashboard)/pressure-calculator/PressureDashboardClient.tsx:121` mounted the separate multi-step `PressureWizard`, unlike the public single-page calculator.
- `src/components/features/pressure/PressureWizard.tsx` remains used by `PressureCalculatorDashboard.tsx`; only the account route's usage is removed.
- `convex/pressureCalculations/mutations.ts` previously exposed insertion-only calculation saving. Repeated account edits need an ownership-checked update path without overwriting historical advice.
- The account overview retains its bike cards, links, and selected-bike stale-pressure warning. Existing card notes are outside this form-reuse change.

## Implementation

- Public and account routes use the actual `PressureCalculatorForm`; optional initial values, callbacks and slots preserve public defaults and presentation.
- Account calculations save through the shared autosave primitive. Server-side basic-engine calculation validates inputs and upserts one managed row per user and optional bike. Existing historical rows and profile data remain unchanged.
- Saved inputs take precedence over profile/bike values, followed by public defaults. Authentication and selected-bike ownership remain server-enforced.
- The form uses a 500 ms debounce, commit flushing, retry, localized validation and an advice-updated status. Bike switching flushes the old selection first; failed edits remain visible. User-keyed editors plus a required server-checked `expectedUserId` prevent a late queued edit from writing into a different signed-in account.
- Profile-derived weight has a profile link. Calculator edits never change profile weight. Invalid imported/saved values are shown with an inline message rather than silently clamped.
- The account result bar clears the mobile account navigation. The public page keeps its existing layout, defaults, result wording and sign-in CTA.

## API / release

- New mutation: `pressureCalculations.mutations.upsertBasic({ expectedUserId, bikeId?, inputSnapshot })`.
- New query: `pressureCalculations.queries.getLatestWithoutBikeForUser({})`.
- No schema change. Deploy these backend functions before the new account frontend. Existing insertion APIs remain unchanged for other consumers.
- Runtime fixture changes are pressure-only additions to `tests/visual/account-batch4/runtime.jsx`; preserve other owners' existing autosave and calculator fixture edits.

## Validation

- Focused frontend/backend suite: **37 tests pass** across the account route, prefill helper, public form and backend autosave contract. Includes NL/EN restoration, saved/profile/default precedence, debounce, retry, invalid initial values, bike switching, unchanged-input deduplication, historical-row preservation and auth-change guards.
- `npm run lint`: PASS (254 contrast pairs; 19 token-only CSS modules). `npm run typecheck`: PASS after the final identity guard.
- Isolated production build: PASS. Sweep filter `/pressure-calculator,/bandenspanning-calculator,/tire-pressure-calculator`: 12 cases; every status, console/page error, overflow, H1, locale, SEO, touch-target, image and serious/critical axe check passes. All four account cases pass every check. Exact final source hash is recorded in `final-sweep/42/run-context.json`.
- Four public NL cases fail only the existing strict-language finding **“Vergelijk Free en Pro”**. Public-copy changes are explicitly outside task 42; reported to the lead/C in `messages/20261001-a-to-lead-c-info-42-public-language.md`. The public plan-name copy is unchanged. Full evidence: `final-sweep/42/report.json` and `report.md`.
- Final component capture: **16 comparisons pass** (public/account × NL/EN × 1440/390 × light/dark), with no overflow, small mobile controls, console/page errors or serious/critical axe findings. **10 persistence scenarios pass**: all eight account combinations cover save, reload, a fresh authenticated fixture client, no initial writes, retained failure values and retry; NL/EN no-bike calculations also survive reload. Screenshots `code-renders/42-*`; proof `audit/42-browser.json`.
- The browser fixture renders the actual public shared form and actual account route/shell with mocked auth/Convex/router boundaries. It proves UI restoration, not a live-provider sign-in test. The backend ownership and persistence contracts are tested separately.
- Four mobile account captures record the existing shell's moderate axe `region` finding on its `.w-[140px]` logo outside a landmark (`src/app/(dashboard)/layout.tsx:100`). Raw findings are preserved; the gate uses the same serious/critical threshold as the project sweep. No account-shell changes made.
- Visual review corrected an account-only sentence that still instructed a signed-in rider to use their account. The public copy remains unchanged. Reviewed desktop/mobile dark captures and the mobile light production capture.

No commit or deploy. Exact changed-file manifest: `files-42.txt`; screenshots are excluded.
