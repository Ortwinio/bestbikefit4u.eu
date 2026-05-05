# Output 03 — Internal Linking And Science Cross-Links

## Shipped

- Added homepage body links to the new landing-page cluster:
  - `/nl/fiets-afstellen`
  - `/nl/bikefitting`
  - `/en/bike-fitting`
- Added a shared Dutch inline link from pain detail pages to `/nl/fiets-afstellen`
- Improved guide related-link descriptions in the real guide routing layer so calculator and science targets are more topic-specific
- Reinforced the bike-fit calculator cluster with:
  - `/measurement-guide`
  - `/science/bike-fit-methods`
  - `/science/calculation-engine`
  - `/guides/road-bike-fit-guide`
  - `/guides/bike-fitting-for-knee-pain`
  - `/pain`
- Added explicit calculation-engine transparency links from:
  - `/how-it-works`
  - `/measurement-guide`

## Files Touched

- `src/app/(public)/page.tsx`
- `src/components/public/PainPointPageTemplate.tsx`
- `src/lib/guides/content.ts`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/lib/seo/relatedLinks.ts`
- `src/app/(public)/how-it-works/page.tsx`
- `src/app/(public)/measurement-guide/page.tsx`

## Intentional Deferrals

- `src/app/(public)/use-cases/[slug]/page.tsx` is currently a redirect shim, not a rendered public content surface. The route-level matrix was applied to live donor pages instead of editing a dead renderer.
- `/science/calculation-engine` is currently a redirect alias rather than a standalone science article. Links to that route were added only where “calculation engine transparency” reads naturally.

## Validation

- `npm run typecheck`
- `npx vitest run src/lib/seo/sitemap/sources.test.ts 'src/app/(public)/guides/[slug]/page.test.tsx' 'src/app/(public)/bandenspanning-calculator/page.test.tsx' 'src/app/(public)/page.test.tsx'`
