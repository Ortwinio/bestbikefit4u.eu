# 41 — Direct editing with autosave behind the login

Request (Ortwin, 2026-09-30): on "Mijn profiel" values must be editable directly, so the "Bewerken"
buttons can go. Everywhere behind the login, changing a value must update the data immediately, with
no separate save step. "Verzet" does not work well now. Check every page behind the login.

## Interaction contract (applies to every account page)

1. **No edit mode, no save button** for simple values. The field is always editable: sliders
   (value in DM Mono), segment buttons / option cards, text fields. Remove "Bewerken", "Opslaan",
   "Annuleren" for these blocks.
2. **Autosave:** sliders and segments save on commit (pointer up / key up, or ~500 ms after the last
   change); text fields save ~800 ms after typing stops and on blur. One request in flight per field
   group; newer values win; no duplicate writes for unchanged values.
3. **Status per block**, in a polite `aria-live` region: "Opslaan…" → "Opgeslagen" (fades after ~2 s)
   → on failure "Niet opgeslagen — Opnieuw proberen" with a retry button. The field keeps the user's
   value on failure (no silent revert). NL/EN copy in the owner's dictionary.
4. **Validation** stays server-side and client-side: an invalid value shows an inline message and is
   not saved. Ranges come from the existing engine/profile limits.
5. **Leaving the page** flushes pending saves (unmount/visibility change); nothing typed is lost.
6. **Keep explicit actions** where a click is a real decision: start a new fit, generate/e-mail a report,
   delete, import, payment, and multi-step wizards (the wizard may autosave its drafts, but "Volgende"
   and "Afronden" stay).
7. Derived results (fit advice, pressure advice) update when the inputs change, as today; say
   "Je advies is bijgewerkt" where a recalculation happens. Archived fit sessions keep their own
   snapshot (never overwrite a saved session's profile).

## Tasks

- **41a — Codex C (shared + your pages):** build the shared primitives in `src/components/ui`
  (e.g. `useAutosave` hook with debounce, in-flight/latest-wins, flush on unmount, retry; an
  `AutosaveStatus` component; field wrappers for slider/segment/text), with tests. Then fix **Verzet**
  (`src/app/(dashboard)/gearing`): changing a value must update the rider's current gearing setup
  (upsert per user+bike, not a new `gearingSessions` row per change) and the saved values must load
  again on the next visit. Backend change allowed but minimal and ownership-checked
  (`requireUserId` / `requireBikeOwner`), with Convex tests; no schema change unless unavoidable
  (then tell the lead first). Also apply the contract to your other account tools: settings,
  saddle-selector, shoe-cleat-fit, feedback where values are edited. (The pressure calculator behind
  the login moved to task 42, Codex A.)
- **41b — Codex B:** "Mijn profiel" (all blocks: body measurements, extra measurements, flexibility,
  core, comfort/pain areas), the dashboard profile tiles if editable, and other B-owned account pages
  (fit flow drafts, results where values are edited). Remove the Bewerken/Opslaan pattern. Use C's
  primitives once the lead confirms DONE 41a; do the audit and the layout work first.
- **41c — Codex D:** bikes behind the login (garage, bike detail/passport, geometry, wheelset and tire
  setup): same contract, using C's primitives after DONE 41a.
- **Every owner** starts with an audit of their pages: list every edit/save pattern (file:line) and
  what changes, in `audit/41<x>-notes.md`.

## Acceptance

- No "Bewerken"/"Opslaan" left for simple values behind the login (grep + screenshots).
- Tests: autosave timing (fake timers), latest-wins, retry after failure, flush on unmount, validation
  blocks the save, NL/EN status copy; Convex tests for the Verzet upsert and ownership.
- Screenshots NL 1440/390 light/dark of each changed page incl. the saving/saved/error states,
  `code-renders/41<x>-*`. Sweep with `--filter` on the changed routes (a11y, 44px, no overflow).
- `npm run lint`, `npm run typecheck`, focused tests. Notes + `files-41<x>.txt`. No commit.
  Print **DONE 41a / 41b / 41c**.

## 42 — Tire pressure calculator behind the login = the public calculator (Codex A)

Request (Ortwin, 2026-09-30): the logged-in pressure calculator (`src/app/(dashboard)/pressure-calculator`,
now a multi-step `PressureWizard`) looks very different from the public one
(`src/app/(public)/bandenspanning-calculator` → `components/features/pressure/PressureCalculatorForm`).
Make the logged-in version the same design and interaction as the public calculator, with one
difference: values are remembered and saved, so they are correct after logging in again.

- Reuse `PressureCalculatorForm` (add props such as `initialValues`, `onValuesChange`, optional header
  slot) instead of a second implementation; the public page must look and behave exactly as today.
- Add a bike selector (the user's bikes; none → the form still works and saves without a bike).
- Prefill per selected bike from the latest saved calculation
  (`api.pressureCalculations.queries.getLatestByBikeForUser`), else from the profile weight and the
  bike's tire setup, else the public defaults.
- Autosave per the 41 contract (C's shared primitives after the lead confirms DONE 41a; until then
  build layout, prefill and tests). Save the current inputs and the result for that bike; update rather
  than create a new row per slider move if the backend allows (check `pressureCalculations` mutations;
  minimal, ownership-checked change with Convex tests if needed; no schema change without the lead).
- Keep what the logged-in page offers beyond the public one (per-bike overview/cards, stale-pressure
  warning, dashboard links) below or beside the form, in the canvas style.
- Remove `PressureWizard` from this page if nothing else uses it (check first).
- Ownership for this task: A owns `src/app/(dashboard)/pressure-calculator/*` and may add props to
  `components/features/pressure/PressureCalculatorForm*` (C is informed); keep the public page tests green.
- Acceptance: side-by-side screenshots public vs logged-in (NL/EN, 1440/390, light/dark), reload/relogin
  test shows the saved values, focused tests, lint, typecheck, sweep `--filter=/pressure-calculator,/bandenspanning-calculator`.
  Notes `audit/42-notes.md`, `files-42.txt`, print **DONE 42**.

## 43 — Every calculator: one implementation, smart when logged in

Request (Ortwin, 2026-09-30): check that each public calculator has a logged-in counterpart that looks
the same; the logged-in version stores the data and is prefilled from the profile. Decision: **one
calculator per tool**; when the user is logged in it runs in *account mode*. No second, diverging
implementation.

Inventory (lead): tire pressure ↔ `/pressure-calculator` (wizard; task 42) · Verzet ↔ `/gearing` (own
form) · Zadelbreedte ↔ `/saddle-selector` (own form) · Bike fit ↔ `/fit` (full session, stays a
session) · Zadelhoogte, Framemaat, Cranklengte, Vermogen↔snelheid, Klimplanner, FTP/W/kg,
Voeding & drinken: no logged-in version.

**Account mode contract**
1. Same form component, same design, as the public page. The logged-in route shows it inside the
   account shell (e.g. `/tools/<calculator>` or the existing `/gearing`, `/saddle-selector`,
   `/pressure-calculator`), and the account sidebar gets a "Calculators" group linking to all of them.
2. Value precedence: **saved values for this user (and bike, where relevant) > profile/bike data >
   public defaults**. Show a small hint "Ingevuld vanuit je profiel" with a link to Mijn profiel for
   profile-derived fields. Changing a value in a calculator saves the calculator state; it does **not**
   silently change the profile.
3. Autosave per the 41 contract (shared primitives from 41a). After logging in again the values are there.
4. Public pages for logged-out visitors stay exactly as they are (same tests, same SEO).
5. Storage: existing tables where they exist (`gearingSessions` after the 41a upsert fix,
   `pressureCalculations`). For the others one additive table, e.g. `calculatorStates`
   (userId, calculator, bikeId?, values, updatedAt; index by user+calculator+bike) with an
   ownership-checked upsert mutation and query, validators per calculator, Convex tests. Additive schema
   change only. **Release note:** this needs a Convex production deploy before the frontend; the lead
   checks the deploy path before release.

**Tasks** (all after the 41a primitives exist; the lead confirms)
- **43a — Codex C:** the account-mode infrastructure (Convex table/mutations/tests, a
  `useCalculatorAccountState(calculator, { bikeId })` hook with prefill + autosave, docs in the brief's
  notes), then Zadelhoogte, Framemaat, Cranklengte in account mode. Print DONE 43a.
- **43b — Codex D:** Vermogen↔snelheid, Klimplanner, FTP/W/kg, Voeding & drinken in account mode
  (rider mass and FTP from the profile where available). After DONE 43a. Print DONE 43b.
- **43c — Codex A (after 42):** Verzet and Zadelbreedte: the logged-in pages use the public calculator
  component in account mode (bike selector for Verzet, keep saved sessions/history below). You own
  `src/app/(dashboard)/gearing/*` and `src/app/(dashboard)/saddle-selector/*` for this task. Print DONE 43c.
- **43d — Codex B (after 41b):** the "Calculators" group in the account sidebar and dashboard quick
  links; public Bike fit in account mode prefilled from the profile with "Start fit met deze waarden"
  into `/fit` (the session flow itself stays). Print DONE 43d.

Acceptance per calculator: side-by-side screenshots public vs logged-in (NL 1440/390, light/dark),
a test for precedence (saved > profile > default), relogin test showing saved values, lint,
typecheck, focused tests, sweep on the changed routes. Notes `audit/43<x>-notes.md`, `files-43<x>.txt`.
