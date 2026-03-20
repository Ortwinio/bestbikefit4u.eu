# Output 04 — UX Flow Review

Static analysis of source code — no browser rendering available. Findings based on component structure, conditional rendering logic, and copy review.

---

## Flow 1: Landing Page (Public)

### Works well
- Hero section has a clear primary CTA ("Start Your Free Fit") and secondary CTA ("See How It Works") with high visual contrast
- Value proposition is structured in 3 steps (How It Works), reasons to start, and feature grid — logical reading flow
- `TrackMarketingEventOnView` fires on page load for analytics — good funnel instrumentation
- `buildLocaleAlternates` provides hreflang for SEO — EN/NL pages are correctly linked
- The `QuotesCarousel` adds social proof and handles locale selection for quotes

### Friction
- Several sections on the homepage use inline `locale === "nl" ? "..." : "..."` ternaries for headings and labels instead of the dictionary. This works but increases maintenance risk and is inconsistent with the rest of the translation approach.
- The "Popular Calculators" and "Popular Bike Fitting Guides" sections are hardcoded arrays with locale-switched labels — adding or updating links requires code changes.

### Gaps
- No error boundary on the public layout — if `getDictionary()` throws, the page will crash without a user-facing message
- The `bandenspanning-calculator` page exports a static `export const metadata` object with hardcoded Dutch title/description and no `alternates.languages` — the EN and NL variants of this page are not linked via hreflang

### Priority
- Inline ternary strings: P2
- Missing hreflang on `bandenspanning-calculator`: P2

---

## Flow 2: Authentication Flow (Login)

### Works well
- Login page is fully bilingual with a dedicated `loginCopy` object covering both locales — no keys missing
- The flow is well-structured: email → code → success, with clear state transitions
- Error states for send failure, invalid code, and resend failure are all handled with user-facing messages
- Resend cooldown timer prevents abuse while communicating time remaining to users
- `spamHint` copy ("Check your spam folder") addresses a common user concern
- `legalHint` (Terms/Privacy) is translated into Dutch

### Friction
- The login page has no `LanguageSwitch` component. A Dutch-speaking user arriving via an English link has no way to switch to NL on the login page without going back to the homepage.
- The "back" button (`text.back`) returns to the email step but uses an `<ArrowLeft>` icon + text combination — this is clear, but it is not a `<button>` with a visible border which may be harder to discover.

### Gaps
- No loading skeleton during authentication redirect (after `signIn` call before the `useEffect` redirect fires)
- The `successSubtitle` ("Redirecting to your dashboard...") appears but there is no spinner or progress indicator during the 1500ms delay before `window.location.href` redirect

### Priority
- No language switch on login: P2
- Missing redirect loading indicator: P2

---

## Flow 3: Questionnaire / Bike Fit Flow

### Works well
- `ProgressBar` component shows percentage complete, estimated minutes remaining, and question count — all translated
- Question navigation with Previous/Skip/Next/Complete buttons is fully translated and labeled
- Error state when required questions are unanswered provides clickable jump-links to missing questions — good UX
- Loading state while questions load: `LoadingState` with translated label
- Empty state if no questions are available: `EmptyState` with translated copy
- Session not found: `EmptyState` with translated copy and CTA
- The sticky progress bar (`sticky top-16`) remains visible during scroll

### Friction
- The `ProgressBar` uses a sticky position of `top-16` on desktop but `top-4` on mobile (`md:top-4`). On mobile, the dashboard mobile header is ~52px (py-3 + border), so `top-16` (64px) should be approximately correct, but this is untested.
- Questionnaire questions themselves (`questionText`, answer options) come from the Convex backend — these are not translated through the EN/NL dictionary. If the backend stores English-only question text, NL users will see English questions. This is outside the scope of the current i18n system.

### Gaps
- `QuestionnaireContainer` passes questions from backend — no locale parameter is passed to the backend query (`api.questionnaire.queries.getQuestions`). Backend question text localization is not handled.
- The `NumericQuestion` component likely has inline validation messages — needs verification (not read in this session).

### Priority
- Backend question text not localized: P1 (significant friction for NL users who see the questionnaire in English)
- Sticky progress bar mobile offset: P2

---

## Flow 4: Bike Setup / Dashboard Home

### Works well
- `DashboardPage` uses `useDashboardMessages()` throughout — all UI copy is translated
- Empty states for no bikes (`noBikeTitle`, `noBikeDescription`) and no fit sessions (`emptyTitle`, `emptyDescription`) are present with CTAs
- Loading state while data loads: checks `sessions === undefined || profile === undefined || user === undefined`
- The dashboard card layout (rider profile card + current bike card + pressure card + recent sessions) provides good information hierarchy
- Pressure stale indicator (`pressureStale`) and warning count (`pressureWarnings`) provide actionable status at a glance
- Stats (total sessions, completed fits, last fit date) are visible on the dashboard home

### Friction
- The `DashboardPage` uses a single `isLoading` check that waits for all 3 queries (`sessions`, `profile`, `user`). If any one is slow, the entire dashboard shows a loading spinner. A more progressive loading approach (e.g., skeleton cards per section) would improve perceived performance.
- The "View all" link for recent sessions (`messages.dashboardHome.viewAllFits`) links to `/fit` (the new fit page), not a fit history/list page. This may confuse users expecting to see all their sessions.
- Bike type labels (`BIKE_TYPE_LABELS`) are shown in English to NL users (e.g., "Road", "Gravel") in the current bike card.

### Gaps
- No empty state for the case where `currentBike` is loaded but `latestPressure` is `undefined` (still loading) — the `{currentBike && latestPressure ? ... : ...}` check treats loading as the no-calculation case, which shows the "No pressure calculated" message while loading.

### Priority
- `BIKE_TYPE_LABELS` in English: P1
- Pressure card loading vs. empty conflation: P2
- "View all" links to new-fit page: P2

---

## Flow 5: Tire Pressure Module (Dashboard)

### Works well
- `PressureCalculatorPage` is a server component that passes messages to `PressureWizard` — locale is resolved server-side
- The wizard title (`messages.pressure.wizard.title`) is translated
- All wizard step labels, form fields, result labels, warning messages, and preset use cases are fully translated in both EN and NL
- Step counter (`stepOf: "Step {current} of {total}"`) uses `formatMessage` for interpolation
- Validation error messages for out-of-range values are translated (`bikeWeightRange`, `widthRange`, etc.)
- The public tire pressure page (`/bandenspanning-calculator`) uses dictionary values for hero, form, and result labels

### Friction
- Entry point to the dashboard pressure calculator (`/pressure-calculator`) is only accessible via the sidebar nav. There is no contextual CTA from the bikes list or dashboard home that leads directly to it (the `messages.pressure.bikeCard.newCalculation` button exists on the dashboard home's pressure card, but only when a bike is selected).
- The wizard has 5 steps (bike → wheelset/tyres → weight/goal → route → result). Step 1 requires a saved bike or manual entry — new users with no bikes will be forced into manual entry, which has no guidance copy to explain why.

### Gaps
- The `PressureWizard` component itself was not read in full — detailed validation and error state coverage for the wizard steps is not verified here.
- No explicit "out of range" feedback for body weight inputs visible in the wizard labels (there is a range check for bike weight but not body weight in the visible keys).

### Priority
- No discoverability gap: P2
- Wizard step 1 confusion for new users: P2

---

## Flow 6: Results Page

### Works well
- Results page is fully translated: all headings, back link, algorithm version label, action buttons
- Email report dialog is fully translated (title, description, label, placeholder, CTA, error)
- PDF download uses `fetch` with error handling, and the error message is translated
- Processing/loading state while recommendation generates is handled with a `RefreshCw` spinner + translated copy
- Session not found and questionnaire incomplete states are handled with translated empty states + CTAs
- `pressureInsights` warnings use a `warningMessages` record with message keys mapped to translated strings — consistent with the public pressure calculator

### Friction
- The `FitSummaryCard`, `AdjustmentPriorities`, `FrameSizeRecommendation`, `FitNotes`, and `PainSolutions` components were not audited in this session — they likely contain hardcoded strings or recommendation labels that are not translated.
- The `algorithmVersionLabel` value (the algorithm version string like `v1.0`) is displayed raw — this is acceptable.
- PDF download errors show the raw `payload.error` from the API, which may be an English server message even on NL locale.

### Gaps
- Results component sub-components (`FitSummaryCard`, `AdjustmentPriorities`, etc.) not verified for i18n coverage
- No loading skeleton for the results grid — the page shows the `processing` state while generating, then jumps to full results with no skeleton transition

### Priority
- Results sub-components not audited: P1 (likely hardcoded strings)
- PDF API error messages not translated: P2

---

## Top 5 Highest-Priority UX Improvements

| # | Issue | Rationale | Priority |
|---|-------|-----------|----------|
| 1 | `BIKE_TYPE_OPTIONS` and `BIKE_TYPE_LABELS` in `src/lib/bikes.ts` are hardcoded English | Shown in the Fit setup flow (bike type selector) and Bikes list page. NL users see English bike type names throughout the core fit workflow. | P1 |
| 2 | Questionnaire question text is not localized | The questions themselves come from the Convex backend without locale routing. NL users complete the entire questionnaire in English. | P1 |
| 3 | Results page sub-components (`FitSummaryCard`, `AdjustmentPriorities`, etc.) not verified for i18n | These are the most content-rich parts of the results page — the actual recommendations. If hardcoded, the primary value delivery is in English for NL users. | P1 |
| 4 | `HeaderMobileMenu.tsx` authenticated nav uses inline ternaries instead of passed labels | Inconsistency and maintenance risk; `"Dashboard"` is hardcoded with no NL ternary at all. | P1 |
| 5 | Dashboard home: pressure card shows "No pressure calculated" while still loading | Users may think no calculation exists when the data is just loading. Adds unnecessary confusion on first dashboard visit. | P2 |
