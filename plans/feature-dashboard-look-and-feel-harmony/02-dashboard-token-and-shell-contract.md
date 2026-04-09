# Step 02: Dashboard Token And Shell Contract

## Objective

Define and implement the dashboard theme/surface contract so it harmonizes with the public experience while remaining appropriate for signed-in product use.

## Inputs

- `src/app/globals.css`
- `src/components/providers/ThemeProvider.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/DashboardSidebar.tsx`
- Output from Step 01

## Tasks

1. Define dashboard-specific token roles tied to the public contract, for example:
   - dashboard shell
   - dashboard shell elevated
   - dashboard sidebar
   - dashboard surface
   - dashboard surface muted
   - dashboard hero/accent band
   - dashboard info, warning, success
   - dashboard border soft and strong
2. Implement those tokens in `src/app/globals.css` without weakening the public contract.
3. Update dashboard shell classes and utilities so the layout stops depending on one-off panel styling where shared tokens are more appropriate.
4. Update `src/app/(dashboard)/layout.tsx` and `src/components/layout/DashboardSidebar.tsx` to use the new shell/surface contract.
5. Verify that light, dark, and system theme behavior still works correctly and that theme preference persistence remains intact.

## Deliverable

An implemented dashboard token contract and updated shell/sidebar styling.

## Completion Checklist

- [ ] Dashboard token roles are explicitly defined.
- [ ] Shell and sidebar use the new token contract.
- [ ] Public and dashboard contracts feel related rather than disconnected.
- [ ] Light/dark/system themes still behave correctly.
- [ ] No shell-level UX regression is introduced.
