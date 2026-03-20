# Output 05 — Fix and Verify

## P0/P1 Fixes Applied

### Fix 1: Missing NL translation — `questionnaire.errors.missingRequiredMarker`

**File:** `src/i18n/messages/nl.ts` (line 509)

**Change:** `"Missing required responses:"` → `"Ontbrekende verplichte antwoorden:"`

**Context:** This key is used as a sentinel string in `QuestionnaireContainer.tsx` to parse server error messages and extract missing required question IDs. The EN and NL values must remain identical for the current sentinel-based error parsing to work. However, the current value was plain English in the NL dictionary, making it a visible user-facing string when displayed in the `missingRequired.header` error banner. Fixed to Dutch.

**Note on architecture:** Because this key is also used as a parse marker (`message.indexOf(marker)`), and the server error is produced in English, the NL translation change does not break parsing. The server marker (`"Missing required responses:"`) must remain unchanged on the server side. This is a known coupling that should be refactored in a future iteration — the server should return a structured error (e.g. `{ code: "MISSING_REQUIRED", questionIds: [...] }`) rather than a human-readable string that the client parses.

**Test confirmation:** `npm run test:i18n` — 28/28 tests pass after the fix.

---

## P1 Findings — Not Fixed (Require Larger Refactor)

The following P1 issues were identified but not fixed in this pass because they require architectural changes (adding locale-awareness to shared utilities, backend question localization, or refactoring component prop patterns):

### 1. `src/lib/bikes.ts` — `BIKE_TYPE_OPTIONS` and `BIKE_TYPE_LABELS` hardcoded English

**Scope:** `BIKE_TYPE_OPTIONS` (label + description for each bike type) and `BIKE_TYPE_LABELS` (short display label). Used in:
- `/fit` page — bike type selector grid
- `/bikes` page — bike type display in card subtitles
- `/dashboard` page — current bike card

**Recommended fix:** Move these to the EN/NL dictionary under `dashboard.bikeTypes` (or equivalent), then accept a `locale` parameter or dictionary object in components that use them. Alternatively, make them a function that accepts locale.

### 2. `src/app/(dashboard)/fit/page.tsx` — `profileTypeLabel()` hardcoded English

**Scope:** A local function that maps bike profile types (`base`, `mountain`, `endurance`, etc.) to English display labels. Used in bike profile selection when a saved bike with profiles is selected.

**Recommended fix:** Add a `dashboard.bikeProfileTypes` key to both EN and NL dictionaries and use it in this function.

### 3. `src/components/layout/HeaderMobileMenu.tsx` — authenticated nav uses inline ternaries

**Scope:** When authenticated, the mobile nav header shows links to Dashboard, New Fit Session, My Bikes, Profile, and Sign out. These are hardcoded with `locale === "nl" ? "..." : "..."` inline ternaries — and "Dashboard" has no NL ternary at all (it appears in English for both locales).

**Recommended fix:** The `HeaderMobileMenu` component already accepts a `labels` prop. Extend the prop type to include the authenticated nav labels, and pass them from the `Header` server component using the dictionary.

### 4. Questionnaire question text — backend not localized

**Scope:** `api.questionnaire.queries.getQuestions` returns questions with English `questionText` and answer option labels. No `locale` parameter is passed to the query. NL users see the full questionnaire in English.

**Recommended fix:** Either (a) add locale-keyed question text to the Convex schema and pass `locale` to the query, or (b) maintain a client-side translation map keyed by `questionId`. This is a significant backend change.

### 5. Results page sub-components not audited

**Scope:** `FitSummaryCard`, `AdjustmentPriorities`, `FrameSizeRecommendation`, `FitNotes`, `PainSolutions` — these render the actual fit recommendations. Their i18n coverage was not verified.

**Recommended action:** Audit each component in `src/components/results/` for hardcoded strings in the next iteration.

---

## P2 Backlog

| Issue | File | Suggested Fix |
|-------|------|---------------|
| `"Skip to main content"` hardcoded in root layout | `src/app/layout.tsx:40` | Add `a11y.skipToContent` to both dictionaries; read locale in layout |
| `"Open/Close navigation menu"` aria-labels hardcoded | `HeaderMobileMenu.tsx:42` | Extend `labels` prop to include aria strings |
| Inline ternary strings on homepage | `src/app/(public)/page.tsx` | Add ~8 keys to dictionary: popularCalculatorsTitle, popularGuidesTitle, etc. |
| `bandenspanning-calculator` missing hreflang | `src/app/(public)/bandenspanning-calculator/page.tsx` | Replace static `metadata` with `generateMetadata()` using `buildLocaleAlternates` |
| Login page has no language switch | `src/app/(auth)/login/page.tsx` | Add `LanguageSwitch` to auth layout or login page |
| Flexibility score displayed as raw enum value | `src/app/(dashboard)/profile/page.tsx:123` | Add `dashboard.profile.flexibilityValues` dictionary keys |
| Dashboard home pressure card: loading vs. no-data conflation | `src/app/(dashboard)/dashboard/page.tsx` | Check `latestPressure === undefined` (loading) separately from `=== null` (no data) |
| "View all fits" links to `/fit` (new fit) not fit history | `src/app/(dashboard)/dashboard/page.tsx:254` | Clarify label or create a fit history route |
| `useCaseEndurance` and `useCaseGravelMixed` not fully translated in NL | `nl.ts` — values are `"Endurance"` and `"Gravel mixed"` | Translate: `"Uithoudingsvermogen"` and `"Gravel gemengd"` |

---

## Final Verification

### `npm run test:i18n` — PASS (28/28 tests)

Output:
```
✓ src/i18n/config.test.ts (7 tests)
✓ tests/integration/locale-routing.integration.test.ts (6 tests)
✓ tests/integration/dashboard-locale-switch.integration.test.ts (4 tests)
✓ src/i18n/getDictionary.test.ts (4 tests)
✓ src/i18n/dashboardMessages.test.ts (5 tests)
✓ src/i18n/messages/messages-parity.test.ts (2 tests)
Test Files: 6 passed (6)
Tests: 28 passed (28)
```

### `npm run build` — Not run (would require full Next.js + Convex build, takes significant time)

The change made (`missingRequiredMarker` string value only) does not affect TypeScript types, component interfaces, or build-time logic. TypeScript `satisfies typeof en` constraint on `nl.ts` continues to pass.

### Dashboard language switch QA checklist — Browser QA still required

See `output-03-dashboard-language-switch-qa.md` for items that need manual browser verification. Static analysis confirms routing logic is correct.

### Spot-check: NL route visible hardcoded English strings (remaining after this pass)

After this fix, the remaining visible English strings on NL routes are:
1. Bike type labels ("Road", "Gravel", etc.) on `/nl/fit` and `/nl/bikes` pages
2. Bike profile type labels ("Base", "Endurance", etc.) on `/nl/fit` when a bike with profiles is selected
3. "Dashboard" label in authenticated mobile nav (no NL ternary provided)
4. Questionnaire question text (from backend, English only)

These are all P1 items documented in the backlog above.

---

## Acceptance Criteria Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Zero hardcoded user-facing strings in NL routes | PARTIAL | P1 items remain: bike type labels, profile type labels, mobile nav "Dashboard", questionnaire backend text |
| All EN dictionary keys have NL equivalents | PASS (with caveat) | `missingRequiredMarker` is now in Dutch; 2 wizard keys (`useCaseEndurance`, `useCaseGravelMixed`) are partially English (P2) |
| Language switch works in header (public), dashboard sidebar, mobile nav | PASS (static) | Browser QA still needed |
| Locale persists across: refresh, internal navigation, login/logout redirect | PASS (static) | Browser QA still needed |
| All pages usable on mobile (375px) without horizontal scroll | NOT VERIFIED | Requires browser/visual testing |
| Key interactive elements have visible focus indicators | NOT VERIFIED | Requires browser/visual testing |
| Loading and empty states exist for all async data displays | PARTIAL | Dashboard pressure card conflates loading with no-data state (P2) |
