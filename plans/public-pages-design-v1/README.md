# Public Pages Design v1

## Goal

Apply the design language established on the homepage to all public sub-pages. The homepage now uses: colored `FeatureIconCard` grids, per-step colored stepper, per-calculator `CalculatorLogo` color accents, `GuideLinkButton` for navigation links, `RatingBadge` for trust, `StatCounter` for proof bars. The public sub-pages still use older components (`PublicFeatureCard`, `PublicSurfaceCard` for grids, no color differentiation).

## Status

- `2026-05-04`: Completed by Codex

## Background

### Component hierarchy (current state)

| Component | Background | Icon | Color | Used on |
|-----------|-----------|------|-------|---------|
| `PublicFeatureCard` | `public-card-surface` | Small `PublicIconBadge` (36px, primary only) | Single blue | How It Works, Guides hub, calculator trust grids |
| `PublicSurfaceCard` | `public-card-surface-subtle` | Inline leading (36px, primary only) | Single blue | How It Works 2-col, FAQ, measurement guide |
| `FeatureIconCard` | `public-card-surface-subtle` | Large container (48px, primary only) | Single blue | Homepage differentiators only |

### What the homepage now has that sub-pages don't

- **FeatureIconCard** with 48px icon containers — more visual weight than `PublicFeatureCard`
- **Per-item color accents** — stepper uses teal/blue/green, calculator logos use 7 distinct hues
- **RatingBadge** — only on homepage hero and stepper
- **GuideLinkButton** — related links on homepage; `RelatedLinksSection` already uses it on all subpages (done in previous session)

## Priority tiers

### Tier 1 — High traffic, high conversion impact

| Prompt | Page(s) | Change |
|--------|---------|--------|
| 01 | `FeatureIconCard` component | Add `color` prop for per-card accent (reusable across all pages) |
| 02 | Calculator pages (6) | Replace `PublicFeatureCard` 3-column trust grids with `FeatureIconCard`; add `RatingBadge` below hero chips |
| 03 | How It Works page | Replace 3-card step grid with colored step cards matching the homepage stepper visual language |

### Tier 2 — Structure and consistency

| Prompt | Page(s) | Change |
|--------|---------|--------|
| 04 | Guides hub page | Replace `PublicFeatureCard` in "why guides" grid with `FeatureIconCard`; replace `PublicSurfaceCard` cluster links with `GuideLinkButton` rows |
| 05 | Pricing page | Wrap in `PublicPageShell`, apply zone model backgrounds, fix plan card surface classes, remove raw `bg-primary` CTA section (already `public-cta-surface` from previous session — verify and clean up any residual raw colours) |

### Tier 3 — Structural completeness

| Prompt | Page(s) | Change |
|--------|---------|--------|
| 06 | Privacy and Terms pages | Wrap both in `PublicPageShell` + `PublicHero` for basic structural consistency |

## Out of scope

- Dashboard pages
- Admin pages  
- Pain detail pages and guide detail pages (already standardized)
- About, Fit Pass, Contact, Measurement Guide, Why Bike Fit Matters (already fully standardized)
- FAQ accordion styling (functional, low priority)
- Science pages (already standardized)

## Acceptance criteria

- `FeatureIconCard` accepts an optional `color` prop with distinct oklch hue values.
- All 6 calculator trust grids use `FeatureIconCard` with differentiated colours.
- How It Works step cards use the same per-step accent approach as the homepage stepper.
- Guides hub uses `FeatureIconCard` and `GuideLinkButton`.
- Pricing page uses `PublicPageShell` and no raw `bg-primary` or hardcoded hex values.
- Privacy and Terms are wrapped in `PublicPageShell`.
- `npx tsc --noEmit` passes after all prompts.
