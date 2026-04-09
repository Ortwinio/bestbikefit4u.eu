# Output 01: Dashboard Audit And Implementation Matrix

## Scope Reviewed

- `src/app/globals.css`
- `src/components/providers/ThemeProvider.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/DashboardSidebar.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/bikes/page.tsx`
- `src/components/ui/*`
- `src/components/prototyper-ui/ui/*`

## Current-State Findings

### 1. The dashboard uses a parallel shell language, not a harmonized one yet

The public side now has an explicit `public-*` hierarchy in `src/app/globals.css`:

- `--public-shell-background`
- `--public-card`
- `--public-card-subtle`
- `--public-hero`
- `--public-cta`
- `--public-border-soft`
- shared `public-*` utilities

The dashboard still depends on a separate `panel-*` contract and a single lightweight `dashboard-card` token:

- `--panel-surface`
- `--panel-surface-subtle`
- `--panel-foreground`
- `--panel-border`
- `--panel-shell-background`
- `--dashboard-card`
- `panel-surface-base`
- `panel-theme-context`
- `dashboard-nav-item-*`

Effect:

- the public site reads as brand-led and premium
- the dashboard reads as generic app/admin shell
- the transition from public pages to signed-in pages feels abrupt

### 2. The dashboard is partly Prototyper-aligned through wrappers, but the contract is implicit

The dashboard imports `@/components/ui` heavily, but the wrapper layer is already largely Prototyper-backed:

- `Button` wraps Prototyper UI in `src/components/ui/Button.tsx`
- `Card` wraps Prototyper UI in `src/components/ui/Card.tsx`
- `Input` wraps Prototyper UI in `src/components/ui/Input.tsx`
- `Select` wraps Prototyper UI in `src/components/ui/Select.tsx`
- `Slider` wraps Prototyper UI in `src/components/ui/Slider.tsx`

That means the primary issue is not “dashboard ignores Prototyper UI.” The issue is:

- wrapper usage is not formally classified
- shell and page composition still drift visually
- some high-level helpers are still visually closer to the older dashboard contract than the public contract

### 3. Sliders are already on the approved path

The slider exception is already satisfied:

- `src/components/ui/Slider.tsx` uses `@/components/prototyper-ui/ui/slider`
- `src/components/measurements/NumberSlider.tsx` and `src/components/profile/RidingStyleCard.tsx` build on the approved slider language

Conclusion:

- sliders should stay on this path
- the dashboard work should restyle or harmonize around them, not replace them with a different primitive

### 4. The shell is the highest-leverage mismatch

`src/app/(dashboard)/layout.tsx` and `src/components/layout/DashboardSidebar.tsx` drive the biggest product-family disconnect:

- shell background is flat relative to the public shell gradient and elevation rhythm
- mobile header and sidebar use the panel contract, not a dashboard contract intentionally tied to the public tokens
- nav active states are serviceable but not especially premium
- the signed-in shell feels more admin/system-like than rider/product-like

This should be fixed before page-level polish.

### 5. High-traffic pages already share some card wrappers, but composition is inconsistent

Representative pages:

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/bikes/page.tsx`

Observed pattern:

- cards often use `dashboard-card-surface`, but page headers, action bands, sub-panels, and secondary links are inconsistent
- CTA styles alternate between wrapped buttons, bare links, and ad hoc chip-like actions
- support/info states do not yet feel like a coherent family aligned with public trust/info treatments

### 6. Theme behavior is good enough to build on

`src/components/providers/ThemeProvider.tsx` already resolves:

- light
- dark
- system

The provider now updates `resolvedTheme` on OS theme changes and persists preference correctly. The dashboard plan should build on this and avoid reintroducing local theme hacks.

## Risk Assessment

### Low risk

- define dashboard token roles in `globals.css`
- refactor shell/sidebar classes to use those roles
- standardize card/header/CTA patterns on a few key dashboard pages
- classify wrappers and document approved usage

### Medium risk

- touching shared helpers used by both dashboard and admin surfaces
- over-brightening the dashboard until it loses product density

### Avoid in this pass

- rewriting workflows
- deep admin IA changes
- broad migration away from approved wrapper components when they already sit on top of Prototyper UI

## Dashboard Component/Library Classification

### Approved wrapper over Prototyper UI

- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Textarea.tsx`
- `src/components/ui/Progress.tsx`
- `src/components/ui/NumberInput.tsx`
- `src/components/ui/Slider.tsx`
- `src/components/ui/AccessibleDialog.tsx`

### Direct Prototyper UI already present on adjacent surfaces

- `src/components/prototyper-ui/ui/button.tsx`
- `src/components/prototyper-ui/ui/card.tsx`
- `src/components/prototyper-ui/ui/input.tsx`
- `src/components/prototyper-ui/ui/select.tsx`
- `src/components/prototyper-ui/ui/slider.tsx`
- `src/components/prototyper-ui/ui/dialog.tsx`

### Needs harmony review, not necessarily primitive replacement

- `src/components/layout/DashboardSidebar.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/components/dashboard-messages/*`
- `src/components/reports/FitReportActionGroup.tsx`
- section-level helpers like `SectionHeader`, `InfoBox`, `MeasurementTile`, `StatRow`

### Approved slider exception surfaces

- `src/components/ui/Slider.tsx`
- `src/components/measurements/NumberSlider.tsx`
- `src/components/profile/RidingStyleCard.tsx`
- profile, measurement, and pressure wizard surfaces built on those components

## File-Level Implementation Matrix

| Area | Files | Role | Notes |
|---|---|---|---|
| Shell contract | `src/app/globals.css` | Token contract | Add explicit dashboard surface roles tied to public contract |
| Shell contract | `src/app/(dashboard)/layout.tsx` | Shell implementation | Apply dashboard shell/header/menu contract |
| Shell contract | `src/components/layout/DashboardSidebar.tsx` | Shell implementation | Align sidebar/nav/profile footer with dashboard contract |
| Theme verification | `src/components/providers/ThemeProvider.tsx` | Validation-only unless blocked | Current behavior appears good; do not churn unnecessarily |
| Shared primitive alignment | `src/components/ui/Button.tsx` | Approved wrapper review | Keep wrapper, verify variants map cleanly to dashboard contract |
| Shared primitive alignment | `src/components/ui/Card.tsx` | Approved wrapper review | Introduce clearer dashboard card variants if needed |
| Shared primitive alignment | `src/components/ui/Input.tsx` | Approved wrapper review | Keep wrapper, ensure field styling inherits new dashboard field tokens |
| Shared primitive alignment | `src/components/ui/Select.tsx` | Approved wrapper review | Same as Input |
| Shared primitive alignment | `src/components/ui/Slider.tsx` | Approved slider exception | Restyle only if needed; no primitive swap |
| Shared primitive alignment | `src/components/measurements/NumberSlider.tsx` | Approved slider exception | Keep path, harmonize styling only |
| Shared primitive alignment | `src/components/profile/RidingStyleCard.tsx` | Approved slider exception | Keep path, harmonize styling only |
| Page harmony | `src/app/(dashboard)/dashboard/page.tsx` | Reference page | Use as first page-level composition target |
| Page harmony | `src/app/(dashboard)/fit/page.tsx` | Reference page | High-value action page; align hero/action patterns |
| Page harmony | `src/app/(dashboard)/settings/page.tsx` | Reference page | Strong testbed for cards, forms, info states |
| Page harmony | `src/app/(dashboard)/bikes/page.tsx` | Reference page | Strong testbed for list rows and empty states |
| Page harmony | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` | Reference page | Must align trust, report, and premium product tone |
| Shared dashboard surfaces | `src/components/dashboard-messages/*` | Shared component review | Align message surfaces with new dashboard card hierarchy |
| Shared dashboard surfaces | `src/components/reports/FitReportActionGroup.tsx` | Shared component review | Align report action block with results and dashboard CTA language |

## Recommended Shell-First Execution Order

1. Define dashboard token roles in `src/app/globals.css`.
2. Refactor `src/app/(dashboard)/layout.tsx` to use those roles for:
   - shell background
   - mobile header
   - mobile menu overlay/panel
   - main content region
3. Refactor `src/components/layout/DashboardSidebar.tsx` to the same contract:
   - sidebar surface
   - nav states
   - profile footer
   - admin subsection
4. Verify `ThemeProvider` behavior remains correct without changes unless blocked.
5. After shell is stable, standardize one page pattern on:
   - dashboard home
   - settings
   - bikes
6. Then carry the same pattern into fit start and fit results.

## Proposed Dashboard Token Roles

These should be added as explicit dashboard roles rather than continuing with only `panel-*` and `dashboard-card`:

- `--dashboard-shell`
- `--dashboard-shell-elevated`
- `--dashboard-sidebar`
- `--dashboard-sidebar-elevated`
- `--dashboard-surface`
- `--dashboard-surface-muted`
- `--dashboard-surface-strong`
- `--dashboard-hero`
- `--dashboard-info`
- `--dashboard-warning`
- `--dashboard-success`
- `--dashboard-border-soft`
- `--dashboard-border-strong`
- `--dashboard-shadow`

Design rule:

- these should be visually related to the public `public-*` tokens
- they should not simply duplicate the public shell
- they should preserve dashboard focus and density

## Recommendation

Proceed with Step 02 next.

The shell/token pass is the right first implementation slice because it has the highest leverage and the lowest risk of fragmenting the dashboard further. The dashboard already has enough Prototyper-backed wrappers that a contract-first shell pass will unlock cleaner page-level work afterward.
