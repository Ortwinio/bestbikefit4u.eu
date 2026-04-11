# Step 02: Link And Heading Remediation

Trace the reported warnings back to shared templates and reusable components.

## Read First

- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/HeaderAuthActions.tsx`
- `src/components/layout/HeaderMobileMenu.tsx`
- `src/components/public/PublicSection.tsx`
- `src/components/public/PublicSurfaceCard.tsx`
- `src/components/public/PublicInfoPanel.tsx`
- `src/components/public/BikeQuickCheckCard.tsx`
- representative public pages in `src/app/(public)`

## What To Produce

1. Map which shared components create `h2`/`h3` structure across templates.
2. Identify public links that point to robots-blocked or redirected URLs.
3. Separate acceptable multi-`h2` usage from actual non-sequential heading problems.
4. Recommend template-level changes first, then content-governance changes only where needed.

## Done When

- the heading warnings are explained by component behavior, not just by page screenshots
- the blocked-link and redirect-link sources are mapped to concrete components or CSV-driven content
