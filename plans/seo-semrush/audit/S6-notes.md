# S6 quick fixes

Worktree: bestbikefit4u-semrush, fix/seo-semrush. No login ?src= changes, commits or deployments.

- FAQ complete absolute titles are 48 characters NL / 32 EN, brand included once. Canonicals and
  FAQPage JSON-LD remain intact. Contact has at least 150 rendered paragraph words in each language,
  localized FAQ/measurement links, mailto only, and useful context/privacy guidance. Existing configured
  response estimates are explicitly not guarantees; no new service promise. See S6-copy-notes.md.
- GuideSoftToolCta's shared link and event label name the actual calculator in NL/EN, not “Open calculator”.
- MarketingLogo and BrandLogo images use alt BestBikeFit4U. Redundant link aria-labels and caller overrides
  are removed; responsive theme variants and 44px hit areas remain. Tests preserve equivalent accessibility
  checks using image alternatives instead of depending on the removed aria-label attribute.
- EditorialHero requires an intentional imageAlt. Informational illustrations have inspected, descriptive
  NL/EN alternatives; decorative bicycle art retains an empty alternative. ProfileWizardGuide has a localized
  measurement-illustration alternative. No visible layout/image changes. See S6-alt-notes.md.

New copy uses marketing/account dictionaries; frozen nl.ts/en.ts are untouched. Other agents are doing
S10/S11 concurrently in this tree: their dependencies, performance tooling and answer sections are not
part of B's manifest. S6 changes are limited to the listed files.

Validation evidence: copy worker 20 tests; alt worker 17 tests; parent layout/logo/CTA regression 54 tests.
Final parent run: 76 tests in 12 files pass, plus ten focused editorial/wizard tests in two files.
Typecheck, all lint stages, production build and 1,145 local SEO checks pass, zero crawl findings.
Evidence: plans/seo-crawl-fixes/audit/crawl-s6.json and crawl-s6.md. Local build/crawl use a closed
loopback Convex endpoint, never production. Worker tests overlap parent runs; counts are not added.
