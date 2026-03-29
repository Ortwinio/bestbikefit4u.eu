# Plan: Dashboard Design System Consistency

## Goal
Make all dashboard pages visually consistent with the **My Profile page**, which is the design reference. Apply the same cards, section headers, score bars, sliders, measurement tiles, info boxes, and page-level layout patterns everywhere.

## Background
The My Profile page (`src/app/(dashboard)/profile/page.tsx`) has a polished, cohesive visual language: bordered cards with icon+title headers, colour-coded score bars, snap-point sliders, compact measurement tiles, gradient hero sections, and semantic info boxes. The other dashboard pages were built more pragmatically and have inconsistencies — plain `<h2>` headings instead of icon+title card headers, missing tile patterns, ad-hoc colour usage, and inline one-off styles.

## Design Reference: My Profile Patterns

| Pattern | Classes / Component | Where it lives |
|---------|---------------------|----------------|
| **Bordered card** | `Card variant="bordered" className="dashboard-card-surface"` | `src/components/ui/Card.tsx` |
| **Card header** | Icon + `CardTitle` + optional `Button variant="primary-soft" size="sm"` inside `CardHeader className="border-b border-[color:var(--border)]"` | Profile page |
| **Score bar (5-segment)** | `ComfortLevelBar`, `CoreStabilityBar` | `src/components/profile/` |
| **Progress bar** | `FlexibilityScale` using `Progress` + `--progress-indicator-color` | `src/components/profile/` |
| **Snap-point slider** | `ReadOnlySlider` / `SliderQuestion` | `src/components/profile/RidingStyleCard.tsx` |
| **Measurement tile** | `bg-surface-secondary rounded-[var(--radius-md)] px-4 py-3` — label `text-xs uppercase tracking-wide text-muted-foreground`, value `text-lg font-semibold text-foreground` | Dashboard page, Profile page |
| **Stat row (key-value)** | `<dt> text-xs text-muted-foreground` / `<dd> text-sm font-semibold text-foreground` in `grid grid-cols-2 gap-x-4 gap-y-2.5` | Profile body measurements |
| **Info box (coloured)** | `rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--X)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--X)_8%,var(--card)_92%)] p-4` where X = primary/warning/success/danger | Profile, Settings |
| **Inline action link** | `inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20` + `ArrowRight h-3.5 w-3.5` | Profile |
| **Page header** | `<h1 className="text-2xl font-bold text-foreground">` + `<p className="mt-2 text-sm text-muted-foreground">` | Dashboard home |
| **Gradient hero** | `bg-gradient-to-br from-primary to-primary/75 rounded-[var(--radius-xl)] p-6` | Profile status card |

## Architecture
All changes are in `src/` (no backend changes required). The work splits into:
1. Creating/extracting shared primitive components
2. Applying those primitives page-by-page

## Scope

**In scope:**
- Create shared primitive components: `SectionHeader`, `MeasurementTile`, `InfoBox`, `StatRow`
- Apply consistent card headers (icon + title + optional action) to: Bikes garage, Fit history, Fit session, Settings, Feedback, Pressure calculator
- Apply measurement tiles to: Bikes garage (fit numbers), Fit session (rider profile summary)
- Apply info box pattern consistently across all pages (replace ad-hoc coloured divs)
- Apply page header pattern (h1 + subtitle) consistently on pages that lack it
- Apply stat row pattern (key-value dl grid) to fit history session cards

**Out of scope:**
- Changing any data or logic
- Redesigning page layouts or information architecture
- Changing the Profile page (it is the reference — do not touch it)
- Any changes to the report PDF

## Pages to update

| Page / Component | Primary gaps |
|-----------------|--------------|
| `BikeGarageOverview.tsx` | Card headers lack icons; fit numbers use ad-hoc divs instead of tiles; info boxes inconsistent |
| `BikeWithFitHistory.tsx` | Session cards use plain divs; stat display is ad-hoc; no icon+title header |
| `fit/page.tsx` | Alert boxes ad-hoc; card header lacks icon; bike selection tiles could use card pattern |
| `settings/page.tsx` | Mixed info box patterns; card headers lack icons on some sections |
| `feedback/` components | Plain card layout; no icon+title headers |
| `pressure-calculator/` components | Plain card layout; no icon+title headers |
| `dashboard/page.tsx` | Minor: profile summary card could use gradient hero pattern |

## Prompts
- `01-shared-primitives.md` — Create `SectionHeader`, `MeasurementTile`, `InfoBox`, `StatRow` components
- `02-bikes-garage.md` — Apply design system to `BikeGarageOverview.tsx`
- `03-fit-history.md` — Apply design system to `BikeWithFitHistory.tsx` and `BikeFitHistorySection.tsx`
- `04-fit-session.md` — Apply design system to `fit/page.tsx`
- `05-settings.md` — Apply design system to `settings/page.tsx`
- `06-feedback-and-pressure.md` — Apply design system to feedback and pressure calculator components
- `07-dashboard-home.md` — Apply gradient hero and polish to `dashboard/page.tsx`

## Progress
- [ ] 01 Shared primitives
- [ ] 02 Bikes garage
- [ ] 03 Fit history
- [ ] 04 Fit session
- [ ] 05 Settings
- [ ] 06 Feedback and pressure calculator
- [ ] 07 Dashboard home

## Notes
- Always import from `@/components/ui` for cards, buttons, and new primitives
- Use CSS variables (`var(--primary)`, `var(--border)`, etc.) not hardcoded hex values — the app supports light/dark themes
- `dashboard-card-surface` is a global CSS class defined in `src/app/globals.css` — use it on every top-level card
- Never remove existing functionality — only change visual presentation
