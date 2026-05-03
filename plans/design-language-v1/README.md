# Design Language v1 — BestBikeFit4U

**Status**: Planning  
**Scope**: Homepage improvements + reusable design language for all public pages  
**Audit basis**: Production snapshot 2026-05-03

---

## Why This Plan Exists

The homepage redesign (Sprint 1–3) landed the right structural decisions — named testimonials, focused differentiators, consolidated CTA. But the audit of production revealed that execution is inconsistent in three areas:

1. **CTA hierarchy is broken at the top of every page** — two "Start gratis" buttons appear simultaneously in the header zone
2. **Visual rhythm collapses in the middle of the page** — five consecutive light-background sections blur into each other with no visual landmarks
3. **Icons and section components lack a consistent language** — differentiator icons are 16px inline markers, guide buttons have no icons at all, the ProofBar stats stack as full-width cards on mobile

Beyond the homepage, the same primitives (`PublicSection`, `PublicSurfaceCard`, `PublicSurfaceCard`) are used across calculator pages, guide pages, and the pricing page — but without a documented design language, each page makes different local decisions about spacing, icon size, section tone, and CTA placement.

This plan defines the design language once and applies it across the full public site.

---

## What Already Exists (Do Not Duplicate)

The codebase has a complete, well-designed CSS variable system in `src/app/globals.css`:

| Token group | Variables | Purpose |
|---|---|---|
| Brand blue | `--primary`, `--primary-light`, `--primary-middle`, `--primary-dark` | All interactive elements |
| Public surfaces | `--public-shell-background` → `--public-cta` | Page/section/card backgrounds in 7 steps |
| Semantic | `--success`, `--warning`, `--info`, `--destructive` | Status indicators |
| Shadows | `--public-shadow`, `--public-shadow-strong` | Elevation |
| Utilities | `public-card-surface`, `public-card-surface-subtle`, `public-cta-surface`, `focus-ring` | CSS `@utility` classes |

The component library already has:
- `PublicSection` — card wrapper with blue top-accent bar, eyebrow + title header
- `PublicSurfaceCard` — secondary card for items within a section
- `PublicSectionHeader` — eyebrow + h2 + description with optional action
- `PublicCtaBand` — conversion CTA surface
- `PublicInfoPanel` — info/warning notices
- `PublicIconBadge` — icon container used in `PublicSurfaceCard`

**The problem is not missing primitives. The problem is missing rules for when and how to use them.**

---

## Design Language Definition

### 1. Color System

All public pages use a **single chromatic family** — blue (hue ~242 in oklch). The palette has five surface steps and two interactive states.

#### Surface Steps (light mode, darkest to lightest)
```
--public-cta             ≈ very light blue-gray (section CTA band background)
--public-hero            ≈ light blue-gray     (hero card, featured blocks)
--public-band            ≈ lighter blue-gray   (secondary/accent band, = --secondary)
--public-card-strong     ≈ near-white blue     (strong card surface)
--public-card-subtle     ≈ near-white          (default card, = --surface-secondary)
--public-card            ≈ almost pure white   (primary card surface)
--public-shell-background≈ pure off-white      (page background)
```

**Rule**: Adjacent sections must differ by at least two surface steps. Never put two `--public-card` sections next to each other.

#### Interactive Colors
```
--primary                Blue CTA, links, numbers, eyebrows      (oklch 66% 0.156 242)
--primary-dark           Hover state for primary buttons          (oklch 57% 0.145 242)
--primary-soft           Ghost/soft background (14% primary)
--success                Green checkmarks, verified badges        (oklch 72% 0.192 160)
--warning                Amber alerts                             (oklch 74% 0.168 60)
```

#### Rules
- Never use raw hex or rgba values. Always use `var(--*)` or Tailwind semantic classes.
- The announcement bar background must use `var(--foreground)` family (dark navy), not `var(--primary)`.
- The `--accent` color (warm amber hue 60) is for micro-interactions only (e.g. hover on accent elements). **Never use it for primary CTAs.**

---

### 2. Typography Scale

All text uses `var(--font-sans)` = Inter.

| Role | Size | Weight | Usage |
|---|---|---|---|
| Hero H1 | `text-4xl` → `text-6xl` | 700 | Page hero only |
| Section H2 | `text-2xl` → `text-[2rem]` | 600 | Section titles via `PublicSectionHeader` |
| Card H3 | `text-lg` → `text-xl` | 600 | Card/item titles |
| Body large | `text-base` → `text-lg` | 400 | Section descriptions |
| Body | `text-sm` → `text-base` | 400 | Card descriptions |
| Eyebrow | `text-xs` | 600 | UPPERCASE + tracking-[0.22em], always `var(--primary)` |
| Label | `text-xs` | 500 | Badges, status chips |
| Micro | `text-xs` | 400 | Trust lines, footnotes, optional notes |

**Rules**:
- Section eyebrows are always uppercase, `text-xs`, `font-semibold`, `tracking-[0.22em]`, `text-[color:var(--primary)]`
- H1 only appears once per page (the hero)
- Card titles are `h3`, never `h2` unless they are genuinely section headings

---

### 3. Spacing & Section Rhythm

Each page follows a **zone model** with three zone types:

| Zone type | Background | `@utility` class | Used for |
|---|---|---|---|
| Shell | `--public-shell-background` | *(default page bg)* | Page wrapper |
| Raised | `--public-card` + border | `public-card-surface` | Content sections |
| Band | `--secondary` / `--public-band` | *(bg-secondary/55)* | Emphasis sections |
| CTA | `--public-cta` gradient | `public-cta-surface` | Conversion sections |

**Page rhythm rule**: Zones must alternate. Two consecutive Raised zones are only allowed if separated by a Band zone. Pattern:

```
Hero (dark overlay — special)
Shell gap
Raised  ← ProofBar / QuickCheck
Band    ← Calculators or Differentiators
Raised  ← Stepper
Band    ← Testimonials
Raised  ← Bike Search + Showcase
Shell gap
Raised  ← Guides + Scenarios
CTA     ← ClosingCtaBand
Footer
```

Section vertical padding: `py-16 sm:py-20` for major sections, `py-8 sm:py-10` for secondary sections (QuickCheck, ProofBar).

---

### 4. Icon System

All icons are from `lucide-react` at a consistent size per context:

| Context | Size | Container | Color |
|---|---|---|---|
| Feature card (differentiator, stepper) | 24px icon in 48px container | `rounded-full bg-[var(--primary-soft)] text-[var(--primary)]` | Primary |
| Section header accent | 20px icon in 40px container | `rounded-full bg-[var(--secondary)] border text-[var(--primary)]` | Primary |
| Inline list item | 16px | No container | `var(--primary)` or `var(--success)` |
| Navigation / utility | 16px | No container | `var(--muted-foreground)` |
| CTA button leading | 16px | Inline | Inherits button color |

**Rules**:
- Feature icons in differentiator/stepper cards always get the 48px container treatment — never inline
- Guide and scenario buttons always get a 20px leading icon from a curated set (see `04-guide-scenario-buttons.md`)
- Never use emoji as icons

---

### 5. CTA Hierarchy

**Absolute rules across every page on the site:**

1. **One primary (filled blue) button per visual section** — if two are needed, the second is `variant="outline"`
2. **Donate / campaign actions are always `variant="outline"` or `variant="link"`** — never primary
3. **Primary CTAs on the homepage appear at exactly three points**: hero, stepper, closing CTA band
4. **The announcement bar CTA is a separate zone** — it may have its own primary button that does not count against the homepage limit, but the **header nav must not duplicate it**
5. **Utility submit buttons** (search, filter, lookup) use `variant="outline"` — they are not conversion CTAs
6. **CTA text describes the outcome, not the action**: "Start gratis bike fit" > "Verzenden"

---

### 6. Reusable Components Needed

The following components are missing or need upgrading. Each has its own prompt file.

| Component | Status | Prompt |
|---|---|---|
| `FeatureIconCard` | Missing — replace inline icon in `DifferentiatorTriple` | `02-feature-icon-card.md` |
| `StatCounter` | Missing — replace ProofBar mobile stacking problem | `03-stat-counter.md` |
| `GuideLinkButton` | Missing — guide/scenario buttons need icon + description | `04-guide-scenario-buttons.md` |
| `SectionBand` | Missing — wrapper for band-zone sections | `05-section-rhythm.md` |
| `RatingBadge` | Missing — star rating + count for trust | `06-trust-signals.md` |
| `AnnouncementBar` (fix) | Exists — remove nav CTA duplication | `01-header-cta-fix.md` |

---

## Execution Order

| Prompt | Impact | Risk | Time |
|---|---|---|---|
| `01-header-cta-fix.md` | High — visible CTA bug on every page | Low | Small |
| `02-feature-icon-card.md` | High — differentiators look broken | Low | Small |
| `03-stat-counter.md` | Medium — mobile UX fix | Low | Small |
| `04-guide-scenario-buttons.md` | Medium — content quality | Low | Medium |
| `05-section-rhythm.md` | High — visual coherence | Medium | Medium |
| `06-trust-signals.md` | High — conversion impact | Low | Small |
| `07-other-pages.md` | Medium — consistency across site | Medium | Large |

## Acceptance Criteria (Homepage)

- [ ] No two "Start gratis" CTAs visible simultaneously in the header zone
- [ ] "Zoek fiets" submit uses `variant="outline"`
- [ ] Duplicate bike-search fallback text removed (one link only)
- [ ] Differentiator icons are 48px containers, not inline markers
- [ ] "Canyon Canyon Grizl" data error fixed
- [ ] ProofBar stats use `grid-cols-3` on mobile (no stacked cards)
- [ ] Section backgrounds alternate: never two identical consecutive surface zones
- [ ] Guide buttons have a leading icon and a 12px subtitle
- [ ] A star rating / aggregate social proof appears in or immediately below the hero
- [ ] All touched components use `var(--*)` tokens — no raw hex values
- [ ] `npm run typecheck` passes
- [ ] Manual QA on `/nl` and `/en` at 390px and 1440px

## Acceptance Criteria (Design Language)

- [ ] Every public-facing page uses only the zone model defined here
- [ ] No page has two consecutive Raised zones without a Band between them
- [ ] Every feature card uses the 48px icon container
- [ ] Every guide/scenario link button has an icon + subtitle
- [ ] CTA hierarchy rules are met on: homepage, calculator pages, guide pages, pricing page
