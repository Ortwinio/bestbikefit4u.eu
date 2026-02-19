# Step 01 - Audit Dashboard i18n Gaps

## Objective
Create a complete inventory of dashboard UI strings that are still hardcoded and map where locale is already handled only for routing.

## Tasks
1. Inventory hardcoded strings in:
   - `src/app/(dashboard)/**`
   - `src/components/layout/DashboardSidebar.tsx`
   - `src/components/auth/UserMenu.tsx`
   - `src/components/questionnaire/**` (UI labels only)
2. Separate string categories:
   - navigation labels
   - page titles/subtitles
   - button labels
   - loading/empty/error copy
   - modal/dialog copy
3. Mark existing locale-aware behavior already present:
   - `withLocalePrefix(...)` usage
   - `extractLocaleFromPathname(...)` usage
4. Produce an output artifact with:
   - file path
   - string
   - proposed message key

## Deliverable
- `plans/feature-dashboard-language-switch/output-01-string-inventory.md`

## Done When
- No dashboard-facing string category is missing from inventory.
