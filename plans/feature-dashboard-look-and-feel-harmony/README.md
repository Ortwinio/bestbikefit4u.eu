# Plan: Dashboard Look-and-Feel Harmony

## Goal

Bring the authenticated dashboard environment into visual and component-level harmony with the public BestBikeFit4U experience, while preserving dashboard usability, density, and task efficiency.

The target outcome is not to make the dashboard look identical to the marketing site. The target is a coherent product family: same brand tone, same surface hierarchy principles, same interaction quality, and the same Prototyper UI foundation wherever appropriate.

## Background

The public pages recently received a clearer color and surface contract:

- explicit `public-*` tokens in `src/app/globals.css`
- stronger light/dark/system hierarchy
- broader Prototyper UI usage on touched surfaces
- more intentional CTA, card, and section treatment

The dashboard has improved shared wrappers, but it still mixes:

- older `panel-*` and `dashboard-*` shell conventions
- legacy `@/components/ui` facade usage
- page-specific utility styling
- a more app-panel aesthetic that no longer fully matches the public experience

The dashboard already uses some Prototyper-backed wrappers, so this should be treated as a contract-and-harmony pass rather than a raw rewrite.

## Scope

### Included

- Dashboard shell and sidebar visual contract
- Dashboard color/surface token contract in `src/app/globals.css`
- High-traffic dashboard pages:
  - `src/app/(dashboard)/dashboard/page.tsx`
  - `src/app/(dashboard)/fit/page.tsx`
  - `src/app/(dashboard)/settings/page.tsx`
  - `src/app/(dashboard)/bikes/page.tsx`
  - `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- Shared dashboard-facing primitives and wrappers used by those pages
- Audit of dashboard usage of `@/components/ui` versus Prototyper UI
- Validation of light/dark/system dashboard behavior

### Included With Constraint

- Sliders may only remain on the approved slider path.
- Do not replace slider-based controls unless the replacement uses the Prototyper UI slider/spider-compatible path already represented by:
  - `src/components/ui/Slider.tsx`
  - `src/components/measurements/NumberSlider.tsx`
  - `src/components/profile/RidingStyleCard.tsx`

### Not included

- Backend or schema work
- Admin information architecture redesign
- Deep dashboard workflow rewrites
- Copy overhaul unrelated to layout clarity or CTA consistency
- Public-site redesign work already covered by `feature-commercial-saas-ux-upgrade`

## Core Problem Statement

The dashboard currently feels adjacent to the public site rather than continuous with it.

Main causes:

- dashboard shell uses different visual language than the public shell
- dashboard cards and section blocks do not consistently map to a clear surface hierarchy
- high-value pages mix wrappers, one-off utility treatments, and different CTA patterns
- Prototyper UI adoption is partial and not yet documented as a dashboard contract

## Objectives

1. Define a dashboard visual contract that is intentionally related to the public visual contract.
2. Use shared tokens for shell, surfaces, borders, emphasis, and states instead of page-specific styling drift.
3. Confirm which dashboard primitives are already Prototyper-backed and which still need migration or normalization.
4. Improve the first-impression dashboard pages so the product feels premium and cohesive after sign-in.
5. Preserve fast scanning, dense workflows, and dashboard practicality.

## Existing Inputs

- `src/app/globals.css`
- `src/components/providers/ThemeProvider.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/DashboardSidebar.tsx`
- `src/components/ui/*`
- `src/components/prototyper-ui/ui/*`
- `plans/feature-commercial-saas-ux-upgrade/07-color-scheme-and-theme-contract.md`
- `plans/feature-commercial-saas-ux-upgrade/README.md`

## Approach

1. Audit the current dashboard shell, representative pages, and shared primitives.
2. Define a dashboard token and surface contract that harmonizes with the public contract without collapsing into the exact same layout language.
3. Normalize the dashboard shell and shared section/card/CTA patterns first.
4. Apply the new contract to a small set of high-traffic dashboard pages before extending further.
5. Validate component usage so approved wrappers and direct Prototyper UI usage are explicit.
6. Preserve slider exceptions and only restyle them to match the new dashboard contract.

## Success Criteria

- Dashboard shell and sidebar feel like part of the same BestBikeFit4U product family as the public site.
- Dashboard tokens are explicitly defined and documented in relation to the public token system.
- Shared dashboard pages rely more on common tokens/utilities and less on one-off color mixes.
- Prototyper UI usage in the dashboard is inventoried and normalized.
- Slider-based controls remain on the approved slider path.
- Light, dark, and system themes remain correct and visually coherent.
- No major regressions in dashboard task clarity, density, or navigation.

## Acceptance Criteria

### Theme And Surface Contract

- A dashboard surface hierarchy is explicitly defined in `src/app/globals.css`
- Dashboard shell, sidebar, card, muted card, accent band, and state surfaces are mapped to shared tokens
- The dashboard contract is intentionally related to the public `public-*` contract
- Light and dark themes both preserve strong hierarchy and readability
- `system` theme behavior remains correct in `src/components/providers/ThemeProvider.tsx`

### Component And Library Alignment

- A written audit exists for dashboard `@/components/ui` versus direct Prototyper UI usage
- Shared wrappers used by the dashboard are classified as:
  - approved wrapper over Prototyper UI
  - direct Prototyper UI usage
  - remaining migration target
- Slider-based controls remain on the approved slider/spider-compatible path only

### Shell And High-Traffic Pages

- `src/app/(dashboard)/layout.tsx` and `src/components/layout/DashboardSidebar.tsx` are visually aligned with the new dashboard contract
- Dashboard home, fit start, settings, bikes, and fit results use a consistent page-header, card, and CTA language
- Empty, loading, and support/info states feel coherent with the public product tone
- Mobile dashboard header and menu remain clear and visually aligned with the same product family

### Quality

- No visual regressions in key dashboard pages on desktop and mobile
- CTA emphasis remains clear without becoming marketing-heavy
- Dashboard remains practical and information-dense where needed
- Validation covers light, dark, and system themes

## Deliverables

- Dashboard UX/UI audit output
- Dashboard token and surface contract
- Component/library compliance matrix
- Implemented shell and high-traffic-page updates
- Validation and closeout artifact with residual gaps, if any

## Plan Files

- [01-dashboard-audit-and-implementation-matrix.md](01-dashboard-audit-and-implementation-matrix.md)
- [02-dashboard-token-and-shell-contract.md](02-dashboard-token-and-shell-contract.md)
- [03-dashboard-shared-primitives-and-library-alignment.md](03-dashboard-shared-primitives-and-library-alignment.md)
- [04-dashboard-high-traffic-page-harmony.md](04-dashboard-high-traffic-page-harmony.md)
- [05-dashboard-validation-and-closeout.md](05-dashboard-validation-and-closeout.md)

## Outputs

- [output-01-dashboard-audit-and-implementation-matrix.md](output-01-dashboard-audit-and-implementation-matrix.md)
- [output-02-dashboard-token-and-shell-contract.md](output-02-dashboard-token-and-shell-contract.md)
- [output-03-dashboard-shared-primitives-and-library-alignment.md](output-03-dashboard-shared-primitives-and-library-alignment.md)
- [output-04-dashboard-high-traffic-page-harmony.md](output-04-dashboard-high-traffic-page-harmony.md)
- [output-05-dashboard-validation-and-closeout.md](output-05-dashboard-validation-and-closeout.md)

## Progress

- [x] 01 Dashboard audit and implementation matrix
- [x] 02 Dashboard token and shell contract
- [x] 03 Dashboard shared primitives and library alignment
- [x] 04 Dashboard high-traffic page harmony
- [x] 05 Dashboard validation and closeout

## Notes

- Prefer small, contract-driven improvements over broad visual experimentation.
- Reuse the public design-system lessons, but do not force dashboard pages into marketing-page composition.
- Preserve dashboard density and workflow speed.
- Treat admin-only surfaces as secondary unless shell changes naturally affect them.
