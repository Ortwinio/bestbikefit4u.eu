# Prompt 04 — Upgrade Guides hub page

## Context

`src/app/(public)/guides/page.tsx` (or its equivalent) has:
1. A `PublicHero`
2. A 3-column `PublicFeatureCard` grid for "why use guides"
3. A 2-column grid of `PublicSurfaceCard` items linking to guide clusters
4. A `PublicCtaBand`

The cluster links section (2-column `PublicSurfaceCard` items pointing to individual guides or guide clusters) is exactly the type of navigation that `GuideLinkButton` was built for. The feature grid should use `FeatureIconCard`.

## Task

In `src/app/(public)/guides/page.tsx`:

1. **Replace `PublicFeatureCard` with `FeatureIconCard`** in the "why use guides" grid. Use colour assignments:
   - Card 1: `color="teal"`
   - Card 2: `color="primary"`  
   - Card 3: `color="amber"`

2. **Replace the `PublicSurfaceCard` cluster link items with `GuideLinkButton`**. The existing `PublicSurfaceCard` items act as navigation cards with a title, description, and implicit link. Replace each with `<GuideLinkButton href={...} title={...} subtitle={...} icon={<BookOpen className="h-5 w-5" />} />`. Import `BookOpen` from lucide-react.

3. Update imports: add `FeatureIconCard`, `GuideLinkButton` from `@/components/public`. Remove `PublicFeatureCard` if no longer used.

## Verification

- "Why use guides" section shows `FeatureIconCard` with 3 distinct colours.
- Cluster navigation uses `GuideLinkButton` row layout.
- `npx tsc --noEmit` passes.
