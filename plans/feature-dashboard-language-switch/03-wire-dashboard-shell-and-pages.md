# Step 03 - Wire Dashboard Language UX

## Objective
Apply the i18n model to dashboard shell and pages, and ensure language switching is visible and consistent while logged in.

## Tasks
1. Dashboard shell
   - Add `LanguageSwitch` to dashboard desktop/sidebar and mobile top bar/menu.
   - Ensure switch preserves current dashboard route + query.
2. Dashboard navigation
   - Localize `DashboardSidebar` labels.
   - Localize `UserMenu` labels.
3. Dashboard pages
   - Replace hardcoded text in:
     - `src/app/(dashboard)/dashboard/page.tsx`
     - `src/app/(dashboard)/fit/page.tsx`
     - `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx`
     - `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
     - `src/app/(dashboard)/profile/page.tsx`
     - `src/app/(dashboard)/bikes/page.tsx`
     - `src/app/(dashboard)/bikes/new/page.tsx`
     - `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx`
   - Include loading/empty/error/modal copy.
4. Questionnaire shared components
   - Localize UI labels in `src/components/questionnaire/**` where copy is user-visible.

## Deliverable
- Dashboard renders fully localized UI copy in EN and NL.

## Done When
- Switching EN/NL on dashboard immediately reflects localized labels without leaving dashboard.
