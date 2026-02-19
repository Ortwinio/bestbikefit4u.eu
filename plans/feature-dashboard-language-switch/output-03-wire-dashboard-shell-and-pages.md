# Step 03 Output - Dashboard Language UX Wiring

## Implemented

1. Dashboard shell language switch visibility
- Added `LanguageSwitch` to dashboard mobile top bar in `src/app/(dashboard)/layout.tsx`.
- Added `LanguageSwitch` to desktop sidebar in `src/components/layout/DashboardSidebar.tsx`.
- Preserved locale-aware navigation paths using `withLocalePrefix`.

2. Dashboard navigation localization
- Localized `DashboardSidebar` labels and user actions in `src/components/layout/DashboardSidebar.tsx`.
- Localized `UserMenu` labels via dashboard dictionary in `src/components/auth/UserMenu.tsx`.

3. Dashboard pages localization
- Localized dashboard pages and state copy (loading/empty/errors/actions) for:
  - `src/app/(dashboard)/dashboard/page.tsx`
  - `src/app/(dashboard)/fit/page.tsx`
  - `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx`
  - `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
  - `src/app/(dashboard)/profile/page.tsx`
  - `src/app/(dashboard)/bikes/page.tsx`
  - `src/app/(dashboard)/bikes/new/page.tsx`
  - `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx`
  - `src/components/bikes/BikeForm.tsx`
- Localized dashboard error boundary in `src/app/(dashboard)/error.tsx`.

4. Questionnaire shared components localization
- Localized shared questionnaire labels, progress, and actions in:
  - `src/components/questionnaire/QuestionnaireContainer.tsx`
  - `src/components/questionnaire/ProgressBar.tsx`
  - `src/components/questionnaire/questions/SingleChoice.tsx`
  - `src/components/questionnaire/questions/MultipleChoice.tsx`
  - `src/components/questionnaire/questions/NumericQuestion.tsx`
  - `src/components/questionnaire/questions/TextQuestion.tsx`

## Validation
- `npm run typecheck` passed.
- `npm run test:i18n` passed.
