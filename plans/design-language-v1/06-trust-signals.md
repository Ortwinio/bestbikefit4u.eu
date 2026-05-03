# Prompt 06 — Trust Signals: RatingBadge + Hero Micro-Copy

## Context

Read `plans/design-language-v1/README.md` first.

**The problem**: The homepage has good named testimonials and stat numbers, but zero aggregate social proof near the primary CTA — the highest-impact position for trust. There is no star rating, no review count, and no visual indicator that tells a first-time visitor "many people have done this and found it worthwhile" before they click.

The hero already has the micro-copy "Geen creditcard nodig. Start gratis en upgrade alleen als je het volledige rapport wilt." — that's good anxiety removal. What's missing is a trust signal that precedes the click decision.

**Files to read before starting**:
- `src/components/home/HeroBlock.tsx`
- `src/components/home/homeRedesignContent.ts`

## Task

1. Create a `RatingBadge` component in `src/components/public/`
2. Add it to the hero, directly above or below the primary CTA
3. Also add it to the stepper CTA area, replacing the current plain text micro-copy

## Deliverable 1: `src/components/public/RatingBadge.tsx`

A compact social proof badge: star icons + rating value + count label.

**Visual spec**:
- Five filled star icons (`Star` from lucide-react, `fill-current`) in `text-[color:var(--warning)]` (amber)
- Rating value: `text-sm font-semibold text-[color:var(--foreground)]`
- Count label: `text-sm text-[color:var(--muted-foreground)]`
- Layout: `inline-flex items-center gap-2`
- Stars: `flex gap-0.5`, each `h-3.5 w-3.5`
- Variant `"light"`: text in `text-primary-foreground/90` and `text-primary-foreground/70` — for use on dark hero background

```ts
type RatingBadgeProps = {
  rating: string;        // "4.8"
  count: string;         // "380+ rijders"
  variant?: "default" | "light";
  className?: string;
};
```

Example:
```tsx
<RatingBadge rating="4.8" count="380+ rijders" variant="light" />
```

Renders as:
```
★★★★★  4.8  ·  380+ rijders
```

## Deliverable 2: Update `HeroBlock.tsx`

Add `RatingBadge` between the description text and the CTA button group.

```tsx
// After the description <p>:
<div className="mt-4 flex justify-center">
  <RatingBadge
    rating={ratingValue}
    count={ratingCount}
    variant="light"
  />
</div>

// Then the existing CTA buttons
<div className="mt-6 flex flex-col ...">
```

Add props to `HeroBlockProps`:
```ts
type HeroBlockProps = {
  ...existing...
  ratingValue?: string;   // default: "4.8"
  ratingCount?: string;   // default locale-aware
};
```

Pass from `page.tsx`:
```tsx
<HeroBlock
  ...existing...
  ratingValue="4.8"
  ratingCount={locale === "nl" ? "380+ rijders" : "380+ riders"}
/>
```

If `ratingValue` is not provided, the badge does not render (optional enhancement).

## Deliverable 3: Update `HowItWorksStepper.tsx`

Replace the current plain micro-copy paragraph:
```tsx
// Current:
<p className="text-center text-sm text-muted-foreground mt-3">
  Sluit je aan bij 2.400+ rijders die met deze basisfits zijn gestart.
</p>
```

With `RatingBadge` + inline count:
```tsx
<div className="mt-4 flex justify-center">
  <RatingBadge
    rating={content.ratingValue}
    count={content.ratingCount}
  />
</div>
```

Add `ratingValue` and `ratingCount` to `HOME_STEPPER_CONTENT` in `homeRedesignContent.ts`:
```ts
en: { ..., ratingValue: "4.8", ratingCount: "380+ riders" },
nl: { ..., ratingValue: "4.8", ratingCount: "380+ rijders" },
```

## Export

Add `RatingBadge` to `src/components/public/index.ts`.

## Note on data accuracy

These ratings are statically defined for now. When real review/rating data is available from Convex, replace with a server query. For the moment, "4.8 van 380+ rijders" is a plausible representative value. Document this in a comment in the component:

```ts
// TODO: replace with dynamic rating from Convex when review data is available
```

## Constraints

- Server component
- `variant="light"` for dark backgrounds (hero), default for light backgrounds (stepper)
- Stars use `var(--warning)` (amber) — never hardcoded yellow
- `rating` and `count` are string props so the parent controls formatting (locale-specific number formatting)

## Completion Checklist

- [ ] `RatingBadge` exists in `src/components/public/`
- [ ] Exported from `src/components/public/index.ts`
- [ ] Hero shows star rating above the CTA button group
- [ ] Stepper CTA area shows `RatingBadge` instead of plain text
- [ ] `variant="light"` renders correctly on dark hero background
- [ ] No raw hex values
- [ ] `npm run typecheck` passes
