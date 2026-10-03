# S5 trust — 3 October 2026

Worktree: bestbikefit4u-semrush, fix/seo-semrush. No production data, commits or deployments.

Removed the calculator rating constant, schema input/output and every application caller. WebApplication,
free Offer, canonical URLs and other structured data remain. Tests render both locales and parse schemas;
no aggregateRating is emitted. This verifies structure locally, not a submission to Google's live tester.

Home has no stored-data source supporting the rating, rider/fit count, brand count or named outcome stories.
Replaced those with bilingual measurement/testing guidance in the same hero strip, proof grid and three cards.
Removed the star-rating graphic and quotation/citation semantics; retained all section order, grid rules,
spacing and cards. Removed unused static rating values and unverified fallback testimonial entries too.
New copy lives in src/i18n/marketing/homeTrust.ts. Existing frozen message dictionaries were not edited.
The brand reference's historical permission for these figures is superseded by the explicit S5 brief.

## Checks

- 38 schema/calculator tests and seven homepage tests pass.
- Full typecheck, lint (all stages), production build and diff whitespace checks pass.
- Local SEO crawl: 1,145 checks pass, zero findings, completed build and closed loopback Convex endpoint.
  Evidence: plans/seo-crawl-fixes/audit/crawl-s5.json and crawl-s5.md.
- Eight before/after NL/EN 1440/390 captures use actual source, CSS, fonts and layout, with offline CMS/auth.
  Parent reviewed NL desktop and EN mobile after images; no layout redesign. See capture notes and manifests
  for runtime/overflow and geometric comparisons. No live data is represented by the fixture.

No login attribution, redirects, language switch, sitemap or other Semrush task was changed for S5.
