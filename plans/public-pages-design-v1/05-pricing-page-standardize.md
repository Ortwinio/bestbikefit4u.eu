# Prompt 05 — Standardize Pricing page structure

## Context

`src/app/(public)/pricing/page.tsx` is the only product page without a `PublicPageShell` wrapper. It uses raw `Card` component layouts for the plan comparison, which means it doesn't inherit the zone model backgrounds, max-width constraints, or consistent padding from the rest of the public pages.

Key issues:
- No `PublicPageShell` outer wrapper
- Plan cards use raw `<Card>` with inline `bg-` colour overrides instead of `public-card-surface` / `public-card-surface-subtle`
- The closing CTA section was previously using `bg-primary` (raw brand colour) — this was changed to `public-cta-surface` in design-language-v1, but verify no raw colour values remain
- No `RatingBadge` for social proof

## Task

In `src/app/(public)/pricing/page.tsx`:

1. **Wrap the page body in `PublicPageShell`**. The page currently renders directly with `<div className="...">` outer wrappers. Replace the outermost wrapper with `<PublicPageShell>`.

2. **Audit all `bg-` classes on plan cards**. Find any `bg-primary`, `bg-[color:...]`, or hardcoded colour overrides on `<Card>` or plan card wrappers. Replace with:
   - Regular plan cards: `public-card-surface-subtle` (via `PublicSurfaceCard` or direct `Card variant="secondary"`)
   - Highlighted plan card: `public-card-surface` with `border-[color:var(--primary)]` ring for emphasis — no raw `bg-primary` fill

3. **Verify the closing CTA** uses `public-cta-surface` (should already be done). If it still has `bg-primary`, replace with `<div className="public-cta-surface rounded-[2rem] ...">`.

4. **Add `RatingBadge`** after the hero description, matching the calculator page pattern.

## Verification

- Page renders inside `PublicPageShell` max-width container.
- No raw `bg-primary` or hardcoded hex values remain on any plan card or CTA section.
- `RatingBadge` visible near the top of the page.
- `npx tsc --noEmit` passes.
