# B2 — site-wide brand presentation

Implemented rendered BikeFitBoost copy across NL/EN dictionaries, marketing/account/calculator pages, guide metadata/content, FAQ, legal pages, aria/alt labels and tests. Header and footer horizontal logos render at 34px; sidebar at 32px; both login presentations use the stacked mark on a paper-backed clear-space area.

PDF reports embed the new horizontal PNG at 172×30px. Footers and measurement-guide links use the shared BRAND origin; client downloads use bikefitboost-report. The formerly obsolete example-report generator now renders the current six-page production template with fixture data, bundled fonts, decoded images and no network requests. NL/EN examples and twelve page screenshots are in plans/rebrand/renders/. The old root BestBikeFit4U_ExampleReport_EN_v2.pdf is an unreferenced historical artifact, intentionally retained; there are no public PDF files or live links to it.

All 124 checked-in docs/cms-import records, 48 reviewed guide imports and both backlog CSV contents are rebranded, including nested SEO hints and library markdown, with current-domain OG URLs. Export scripts import the one shared SITE_ORIGIN. Source artifact filenames remain unchanged to preserve the existing import/loader contracts. Final node scripts/check-rebrand-copy.mjs passes with zero findings; git diff --check is clean.

CMS presentation normalization is deliberately scoped to known display fields in fetched guide records and localized blog text. It changes the legacy name only for rendering, does not mutate records, and preserves IDs, slugs, canonical URL keys and email addresses. This prevents published old CMS content leaking the retired name while preserving operator-controlled production data.

## Production CMS inventory limitation

No production Convex access or data mutation was performed. Therefore a production count and real record IDs cannot truthfully be supplied. B2-cms-source-inventory.json lists all 124 local source artifacts with slugs/locales; their absent database IDs are explicitly null. Lead must run a separately authorized read-only production guidePages scan before release and decide whether to persist the display-only rename. Runtime display normalization already protects the public rendering boundary.

## Legal review for Ortwin

Only the product name changes in privacy and terms (and their preservation fixture). No business entity, registration number, address, legal obligation or factual statement was invented. Ortwin must confirm the provider identity referenced by the terms of service and privacy controller text still accurately identifies the operating legal entity. Support/sender email addresses remain at bestbikefit4u.eu.

## Retained technical identifiers

No cookies, local/session storage keys, database IDs, event names or entitlement identifiers were renamed. Existing media URL filenames (bestbikefit4u-home assets, experience illustration and mascot), backlog CSV filenames, historical PDF filename and support/admin fixture email addresses remain stable. These are resource/identity compatibility references, not visible old-brand copy.

## Validation

Final read-only review confirmed the CMS normalizer only maps listed display fields; top-level IDs, slug, canonical, image URLs and unlisted fields retain their original values. Its string matcher preserves old-host URLs and email addresses, including mixed-case domains. Backend source scan found only intentional legacy emails and compatibility host/resource keys. Auth and email sender display names use BikeFitBoost.

Persisted legacy canonical overrides and JSON-LD image URLs in guide/blog metadata were found and fixed with the approved currentSiteUrl helper. Only trusted old HTTP(S) hosts remap; path, query and fragment survive; unrelated external canonicals remain untouched. Canonical and Open Graph URL share the remapped value. Complete URL/email spans inside CMS prose are protected even when a URL query contains the legacy name. Regression suite: 53 tests in four files passed, brand guard zero findings (/tmp/RB-canonical-review.log).

### Actual PDF raster review

All twelve actual PDF raster pages were individually inspected (not merely browser HTML screenshots). Status is ACCEPT for every page: consistent BikeFitBoost logo/new-domain footer, readable typography, no clipping or missing figures/values. Logo-region pixel hashes are identical on all twelve pages, confirming repeated PDF images render consistently.

| Locale | Page | Content | Status |
| --- | --- | --- | --- |
| NL | 1 | Summary, bicycle dimensions and priority values | ACCEPT |
| NL | 2 | Rider and bike base data | ACCEPT |
| NL | 3 | Fit values and target ranges | ACCEPT |
| NL | 4 | Tire pressure, illustration and limits | ACCEPT |
| NL | 5 | Fourteen-day plan and ride log | ACCEPT |
| NL | 6 | Measurement instructions and checklist | ACCEPT |
| EN | 1 | Summary, bicycle dimensions and priority values | ACCEPT |
| EN | 2 | Rider and bike base data | ACCEPT |
| EN | 3 | Fit values and target ranges | ACCEPT |
| EN | 4 | Tire pressure, illustration and limits | ACCEPT |
| EN | 5 | Fourteen-day plan and ride log | ACCEPT |
| EN | 6 | Measurement instructions and checklist | ACCEPT |

All 378 focused copy/login/report/guide/FAQ/analytics tests pass across 28 files in /tmp/RB-B2-focused-final.log. Full candidate gates and local NL/EN1440/390 page renders are owned by the parent RB integrator. Example PDFs were regenerated in both locales with all images decoded before capture. Actual PDF pages were rasterized with the existing /tmp/bbf26-pdf-env PyMuPDF environment: both PDFs have six pages, embed Figtree/Bricolage Grotesque/DM Mono, contain the new domain footer on every page, and no old brand in extracted text. Actual EN page1 and NL page6 visually verified; all twelve actual rasters live beside the HTML screenshots. No commits, deployments or production operations.
