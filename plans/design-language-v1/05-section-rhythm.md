# Prompt 05 — Section Rhythm & Visual Flow

## Context

Read `plans/design-language-v1/README.md` first, specifically the **Zone Model** in the Spacing & Section Rhythm section.

**The problem**: Five consecutive sections in the middle of the homepage use nearly identical light backgrounds — stepper, differentiators, testimonials, bike search, bike showcase. Users lose their position on the page. The alternating zone pattern defined in the design language is not being applied.

**Files to read before starting**:
- `src/app/(public)/page.tsx` — full section order
- `src/components/home/HowItWorksStepper.tsx`
- `src/components/home/DifferentiatorTriple.tsx`
- `src/components/home/TestimonialSection.tsx`
- `src/components/home/BikeSearchBar.tsx`
- `src/components/home/BikeShowcaseSection.tsx`

## Current section backgrounds (the problem)

```
Hero             dark overlay       ✅ distinct
ProofBar         white card         OK
QuickCheck       light gradient     OK
Calculators      light muted        OK
Stepper          white              ← problem starts
Differentiators  secondary/55       OK
Testimonials     white              ← same as stepper
Bike Search      very light blue    ← nearly same
Bike Showcase    light              ← nearly same
Guides           light gray card    OK
Scenarios        white              ← same
ClosingCTA       white + card       OK
```

## Task

Apply the zone model by adjusting section backgrounds so adjacent sections visually separate. **Do not restructure the section order** — only change backgrounds and wrappers.

## Required Changes

### 1. Testimonials section — apply Band zone

`TestimonialSection` currently has no background (relies on the parent page wrapper gradient). Wrap the section content in the Band surface.

In `TestimonialSection.tsx`, add a background to the outer `<PublicSection>`:
```tsx
<PublicSection
  className={cn("bg-[color:color-mix(in_oklch,var(--secondary)_55%,var(--background)_45%)]", className)}
  ...
```

Or, since `TestimonialSection` is called from `page.tsx`, apply the background there:
```tsx
<div className="bg-[color:color-mix(in_oklch,var(--secondary)_55%,var(--background)_45%)]">
  <TestimonialSection locale={locale} />
</div>
```

Prefer the `page.tsx` approach so `TestimonialSection` stays background-agnostic.

### 2. Bike Search — use CTA/feature surface

`BikeSearchBar` currently uses `bg-background`. Change to use a contained white card on the Band:
```tsx
// In page.tsx, wrap BikeSearchBar with a subtle band background:
<div className="bg-[color:color-mix(in_oklch,var(--secondary)_35%,var(--background)_65%)] py-2">
  <BikeSearchBar ... />
</div>
```

Or, simpler: give `BikeSearchBar.tsx` its section background directly as part of the section element:
```tsx
<section className="bg-[color:color-mix(in_oklch,var(--muted)_44%,var(--background)_56%)] py-14 sm:py-16">
```

### 3. Bike Showcase — ensure visual separation from search

`BikeShowcaseSection` background currently matches the search section. Apply `bg-background` to the showcase so it reads as a distinct white surface after the tinted search area:
```tsx
// BikeShowcaseSection.tsx outer section:
className="bg-background py-14 lg:py-16"  // already correct — verify it's applied
```

### 4. Guides section — remove the nested border-card wrapper

Currently the guides section wraps everything in `public-card-surface rounded-[calc(var(--radius-3xl)+0.25rem)] border p-5`. This card-inside-section creates an awkward double border. Replace with a direct background tint:

```tsx
// In page.tsx, guides section:
<section className="bg-[color:color-mix(in_oklch,var(--muted)_44%,var(--background)_56%)] py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Verdiep verder</p>
      <h2 ...>{locale === "nl" ? "Populaire bikefitting gidsen" : "Popular Bike Fitting Guides"}</h2>
      <p ...>...</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {HOME_GUIDE_LINKS[locale].map(...)}
    </div>
    ...
  </div>
</section>
```

Apply the same to the rider scenarios section.

### 5. Resulting zone sequence after changes

```
Hero             dark overlay       ✅ Hero zone
ProofBar         card/white         ✅ Raised
QuickCheck       light gradient     ✅ Raised
Calculators      light muted        ✅ Band
Stepper          white/card         ✅ Raised
Differentiators  secondary/55       ✅ Band
Testimonials     secondary/45       ✅ Band (different shade)
Bike Search      muted/44           ✅ Band
Bike Showcase    pure white         ✅ Raised (visual reset)
Guides           muted/44           ✅ Band
Scenarios        muted/44           ✅ Band (continues)
ClosingCTA       card + cta surface ✅ CTA zone
```

## Constraints

- No structural changes to section order
- All background values use `var(--*)` tokens or `color-mix` with existing variables — no hex values
- `TestimonialSection` must remain usable as a background-agnostic component on other pages
- `BikeSearchBar` section background is set in `page.tsx`, not inside `BikeSearchBar.tsx` (so the component can be reused on other pages with different contexts)

## Also Fix: "Zoek fiets" primary button

The submit button in `BikeSearchBar.tsx` is currently default (primary) variant. Change to `variant="outline"`:

```tsx
// BikeSearchBar.tsx line ~65:
<Button type="submit" variant="outline" size="lg" className="min-h-12 rounded-full px-6 text-base">
  {content.submitLabel}
</Button>
```

## Also Fix: Duplicate bike-search fallback text

`BikeSearchBar.tsx` currently renders:
1. A ghost `<Link>` button: "Fiets niet gevonden? Voer de geometrie handmatig in."
2. A `<p>` below: "Kun je je fiets niet vinden? Voer de geometrie dan handmatig in."

Remove the `<p>` at line ~76. Keep only the link button.

## Completion Checklist

- [ ] Adjacent sections have visually distinct backgrounds
- [ ] No two consecutive sections use the same surface treatment
- [ ] `BikeSearchBar` submit is `variant="outline"`
- [ ] Duplicate fallback text removed from `BikeSearchBar`
- [ ] Guide/scenario sections no longer use nested border-cards
- [ ] `npm run typecheck` passes
