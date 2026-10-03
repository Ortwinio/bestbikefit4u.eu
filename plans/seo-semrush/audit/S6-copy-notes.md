# S6 FAQ and contact copy

Status: owned copy work complete on fix/seo-semrush in bestbikefit4u-semrush.

## FAQ

- Dutch title: “Veelgestelde vragen over bikefit | BestBikeFit4U” (48 characters).
- English title: “Bike Fitting FAQ | BestBikeFit4U” (32 characters).
- Metadata uses an absolute title containing the brand once, so an inherited site title template cannot append another suffix. Open Graph uses the same complete title.
- New titles live in src/i18n/marketing/faq.ts. Existing schema, FAQ answers, canonical URLs, language alternates, tracking and layout remain intact.

## Contact

- Expanded existing three guidance cards with bike details, riding goals, previous adjustments, calculator/page context, units and technical error details.
- Added measurement-guide text and a localized /measurement-guide link beside the existing FAQ help content.
- Added a response-time caveat: the existing commercial configuration's usual Free/Pro response targets are estimates, not guarantees. No new service level or response promise was invented.
- Replaced “fastest support / help quickly” wording with practical email guidance.
- At least 150 words in each language's rendered paragraphs alone, excluding headings, navigation, and response-time list items; covered by tests.
- New text lives exclusively in src/i18n/marketing/contact.ts. Mailto-only contact, original card/grid layout and CSS, existing FAQ/email CTA analytics, and metadata/canonicals are retained.

## Validation and handoff

20 focused tests passed across FAQ and contact route suites:

```sh
npm test -- --exclude 'plans/**' 'src/app/(public)/faq/page.test.tsx' 'src/app/(public)/contact/page.test.tsx'
```

Tests cover complete absolute title length, single brand occurrence, Open Graph consistency, unchanged FAQ schema hashes/visible answers, metadata/canonicals, paragraph word counts in both languages, response caveat, localized FAQ and measurement links, mailto-only channels, and existing CTA tracking.

Focused ESLint and git diff --check passed. Parent owns global gates and renders. No shared layouts, logo/EditorialLayout/calculator files, dependencies, frozen dictionaries, commits, deployments or production data were changed.

Exact changed files: audit/files-S6-copy.txt. Parent integrates overall S6 plan progress.
