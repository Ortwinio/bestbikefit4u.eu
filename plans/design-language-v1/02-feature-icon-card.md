# Prompt 02 — FeatureIconCard Component

## Context

Read `plans/design-language-v1/README.md` first.

**The problem**: `DifferentiatorTriple` currently passes icons to `PublicSurfaceCard` via the `leading` prop. `PublicSurfaceCard` wraps the icon in `PublicIconBadge`, which renders it at approximately 16–20px inline — essentially a bullet-point marker. The design language specifies 48px icon containers for feature-level icons.

Additionally, the stepper step cards and the calculator grid cards have similar feature-icon needs but inconsistent treatments.

**Files to read before starting**:
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/public/PublicIconBadge.tsx`
- `src/components/home/DifferentiatorTriple.tsx`
- `src/components/home/HowItWorksStepper.tsx`
- `src/app/globals.css` (for `--primary-soft`, `--primary` token usage)

## Task

Create a new `FeatureIconCard` component in `src/components/public/` that renders a card with a prominent 48px icon container, title, and description. Update `DifferentiatorTriple` to use it. The stepper cards are already more custom (numbered circles), so leave them as-is.

## Deliverable: `src/components/public/FeatureIconCard.tsx`

A card component with a top-aligned 48px icon container, title below, and description below that.

**Visual spec**:
- Icon container: `h-12 w-12` (48px), `rounded-2xl`, background `var(--primary-soft)`, icon color `var(--primary)`, icon size 24px
- Title: `text-xl font-semibold tracking-tight text-[color:var(--foreground)]`
- Description: `text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base`
- Card: uses `public-card-surface-subtle` utility, `rounded-[14px]`, full height
- Padding: `p-6`
- Card layout: `flex flex-col gap-4`

```ts
type FeatureIconCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};
```

Example rendering:
```tsx
<FeatureIconCard
  icon={<Database className="h-6 w-6" />}
  title="Geometriedatabase als basis"
  description="180+ fietsmerken met geverifieerde geometrie en bandenspanning."
/>
```

**Important**: The icon is passed as a `ReactNode` — the parent provides the icon element with `h-6 w-6` size. The card handles the container (background, border-radius, padding). This keeps the component flexible without prop drilling icon names.

## Update `DifferentiatorTriple.tsx`

Replace `PublicSurfaceCard` with `FeatureIconCard`:

```tsx
import { FeatureIconCard } from "@/components/public/FeatureIconCard";

// inside the grid:
<FeatureIconCard
  key={item.title}
  icon={<Icon className="h-6 w-6" />}
  title={item.title}
  description={item.description}
/>
```

Remove the `DIFFERENTIATOR_ICONS` map — pass the icon directly with the `className`.

## Export

Add `FeatureIconCard` to `src/components/public/index.ts`.

## Constraints

- Server component (no `"use client"`)
- No new npm packages
- Do not modify `PublicSurfaceCard` — `FeatureIconCard` is a new, separate primitive
- Icon size 24px (`h-6 w-6`) inside a 48px container — do not change `PublicIconBadge`

## Completion Checklist

- [ ] `FeatureIconCard` exists in `src/components/public/FeatureIconCard.tsx`
- [ ] Exported from `src/components/public/index.ts`
- [ ] `DifferentiatorTriple` uses `FeatureIconCard`
- [ ] Icons are visually prominent (48px container, not inline markers)
- [ ] No raw hex values — all colors from `var(--*)` tokens
- [ ] `npm run typecheck` passes
