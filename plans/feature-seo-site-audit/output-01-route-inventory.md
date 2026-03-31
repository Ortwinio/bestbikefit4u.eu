# SEO Route Inventory

## Summary

The public SEO surface is broad but structured. Every public `page.tsx` currently has `generateMetadata`, the main route families are represented in sitemap sources, and auth/dashboard/private routes are excluded from `robots.txt`.

The biggest route-level risks are not missing pages, but:
- programmatic calculator families that need careful canonical consistency
- an empty blog sitemap section that adds noise
- lower-value legal/support pages being treated the same as acquisition pages in sitemap priority

## Route Families

| Route family | Representative paths | Intent | Indexability | Metadata | Sitemap | Notable risks |
| --- | --- | --- | --- | --- | --- | --- |
| Core marketing | `/`, `/about`, `/how-it-works`, `/pricing`, `/measurement-guide`, `/why-bikefit-matters` | Brand, education, conversion | Indexable | Strong; page-level metadata present | Covered | None major |
| Calculator hubs | `/calculators/bike-fit`, `/calculators/saddle-height`, `/calculators/frame-size`, `/calculators/crank-length`, `/bandenspanning-calculator` | High-intent acquisition | Indexable | Present | Covered in calculators sitemap | None major |
| Tire-pressure landers | `/bandenspanning/racefiets`, `/bandenspanning/gravelbike`, `/bandenspanning/mtb` | Acquisition by discipline | Indexable | Present | Covered in calculators sitemap | Locale/canonical consistency is important because these are Dutch-path-first surfaces |
| Programmatic tire-pressure pages | `/en/tire-pressure/[slug]`, `/nl/bandenspanning/[slug]` | Long-tail SEO | Indexable with caution | Dynamic metadata present; invalid slugs noindex | Covered in calculators sitemap | Large surface area; metadata logic is more brittle than shared builder usage |
| Guides | `/guides`, `/guides/[slug]`, `/why-bikefit-matters` | Educational SEO | Indexable | Strong | Covered in guides sitemap | None major |
| Use cases | `/use-cases`, `/use-cases/[slug]` | Solution-oriented SEO | Indexable | Strong | Covered in pages sitemap | None major |
| Pain pages | `/pain`, `/pain/[slug]` | Symptom/problem SEO | Indexable | Strong | Covered in pages sitemap | None major |
| Science pages | `/science/calculation-engine`, `/science/bike-fit-methods`, `/science/stack-and-reach` | Authority/trust SEO | Indexable | Present | Covered in pages sitemap | None major |
| Support/legal | `/faq`, `/contact`, `/privacy`, `/terms` | Trust/support | FAQ/contact indexable; privacy/terms indexable with caution | Present | Covered in pages sitemap | Legal pages are low-priority SEO targets but still consume sitemap slots |
| Recruitment | `/case-study` | Conversion/supporting content | Indexable | Present | Covered in pages sitemap | Could use richer structured data |

## Dynamic Route Notes

- `pain/[slug]`, `guides/[slug]`, and `use-cases/[slug]` all use `generateStaticParams()`.
- Invalid slugs return `robots: { index: false, follow: false }` on dynamic route pages.
- Programmatic tire-pressure pages are sitemap-included and therefore deserve stricter regression checks than the other dynamic families.

## Non-Indexable / Excluded Surfaces

These are correctly outside the public crawl target:
- dashboard routes
- admin routes
- auth/login routes
- fit-session and bike-management flows
- API routes

Private route exclusion is enforced in:
- [robots.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/robots.ts)
- [config.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/seo/sitemap/config.ts)

## Inventory Conclusions

1. Public route coverage is not the core SEO problem; most route families are already exposed and metadata-enabled.
2. The priority should shift to technical validation reliability, sitemap correctness, and stronger metadata/content patterns on key acquisition pages.
3. Blog sitemap presence without actual blog entries should be reconsidered or clearly treated as reserved infrastructure.

