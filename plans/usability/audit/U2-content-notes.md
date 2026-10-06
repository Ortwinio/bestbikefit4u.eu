# U2 content collapse handoff

Source ready for A's coordinated rebuild. Do not claim DONE/green from the interim build.

Content source frozen after removing the six unused imports reported by the combined lint. Targeted ESLint with --max-warnings=0 passes for all five affected calculator pages. Final typecheck passes. No .next rebuild was started by this subtask.

## Exact 13 catalog entries

Matches scripts/usability/routes.mjs: how-it-works, measurement-guide, pain-index, pain-detail (/pain/[slug]), why-bikefit, bike-fitting (NL /bikefitting; EN /bike-fitting), bike-setup (/fiets-afstellen; existing redirect unchanged), guides, guide-detail (/guides/[slug]), blog-article (/blog/[slug]), science-article, faq, pressure-landing.

ScienceArticle canvas also defines calculation-engine and stack-and-reach states; these explanatory routes are updated too. Dynamic templates cover all their slugs, including both legacy and rewritten guides. Direct content renderers are included because editing route wrappers alone would miss their content.

## Behavior and ownership

- Native closed details retain explanatory text, examples and FAQs in initial HTML. No click-to-fetch content.
- Short-answer marker wraps only the visible first two sentences; additional safety advice remains open outside the marker. Other overflow remains in a separate disclosure.
- Original JSON-LD and metadata remain intact. Redundant calculator CTA bands and guide mid-page CTA removed. Related links capped at three; calculator related blocks collapsed.
- Safety stays outside disclosures: saddle/pressure limits, pressure landing limits and generated warnings, pain support, article safety paragraphs, guide attention notes. Native guide FAQs replace the previous conditional client panel within the owned route.
- Canvas exceptions retained: required measurements stay open; optional measurements collapse. Pressure reference tables remain available. Topic/tool navigation remains in HTML in disclosures to reduce the very long live guide inventory.
- No calculator forms, journey/template, home/header, account, env, deployment, commits, or mails edited by this subtask.
- Article links now have 44px targets. Pressure shared visualization remains C's ownership.

## Evidence

Initial calculator validation: 112 passed, 20 pre-existing skipped across 14 files. Combined related run: 209 passed, one obsolete pressure FAQ title assertion failed, 20 skipped; corrected that assertion and reran the whole pressure page file (7/7 passed). Effective final total: 210 passed, 20 skipped. Metadata/schema assertions remain intact. Typecheck, targeted ESLint and diff whitespace check passed.

Blog SSR test at src/app/(public)/blog/[slug]/page.test.tsx renders the actual async page and real markdown/disclosure components through React server rendering with offline CMS records in NL/EN. It proves closed article text, open safety, short-answer and BlogPosting/BreadcrumbList JSON-LD without hydration. JsonLd's request nonce wrapper and unrelated CTA shell are stubbed; this is component-level SSR evidence, not a claim of testing a published CMS article.

Interim guard report inspected: all calculator closed text was already in server HTML; stale short-answer nesting and pressure safety marker are fixed in source. Interim mobile bike-fit 7.24 and pressure 8.31 screens prompted further compact answer spacing, collapsed related blocks, and collapsed pressure FAQ. All content height/44px/SSR guard measurements require the fresh coordinated build; old content snapshots are not used as proof.

Attempted guard: `node /Users/ortwinverreck/Developer/bikefitboost-usability/scripts/usability-check.mjs --local --scope=U2 --filter=blog-article --port=3243 --automated-only --output=/Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-content-blog`. Sandbox output creation was denied; rerun with escalation succeeded in starting the runner, which correctly rejected the stale production build before running any cases. Report: renders/guard/U2-content-blog/report.json, build 4wZIjdYmX-7sOsCBb9Zer, zero cases, not green. No server remains. A must rebuild, then run U2 scope (and manual checks); do not infer <=7 screens from source tests.

## Exact changed paths

Final integration follow-up: duplicate blog H2 IDs now preserve the preceding article heading counts across collapsed chunks, so the unchanged blog TOC tests retain #positie-2/#position-2. Updated only superseded collapse assertions in editorial-pages, PressureBikeLanding and calculatorAnswers/pages tests; complete method/limit/example/FAQ schema checks remain. Focused integration rerun: 39/39 tests across five files, log U2-focused.log. Source ready for the next coordinated build.

- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/science/editorial-pages.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/seo/PressureBikeLanding.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/lib/seo/calculatorAnswers/pages.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/audit/U2-focused.log
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/bandenspanning-calculator/PressureCalculatorPageContent.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/bandenspanning-calculator/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/bike-fitting/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/bikefitting/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/blog/[slug]/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/blog/[slug]/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/bike-fit/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/climb-planner/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/crank-length/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/crank-length/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/frame-size/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/frame-size/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/ftp-wkg/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/fuel-hydration/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/gearing/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/gearing/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/power-speed/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-height/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-height/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-width/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-width/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/faq/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/faq/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/fiets-afstellen/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/guides/[slug]/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/guides/[slug]/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/guides/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/guides/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/how-it-works/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/measurement-guide/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/pain/PainDetail.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/pain/page.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/pain/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/science/bike-fit-methods/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/science/calculation-engine/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/science/stack-and-reach/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/tire-pressure/[slug]/PressureLanding.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/why-bikefit-matters/page.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/calculators/CalculatorAnswerSection.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/calculators/CalculatorAnswerSection.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/content/BlogBodyMarkdown.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/content/CollapsedArticle.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/content/GuideBodyMarkdown.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/guides/GuideHero.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/guides/GuideQuickAnswer.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/guides/RewrittenGuide.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/science/EditorialLayout.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/seo/PressureBikeLanding.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/audit/U2-content-notes.md

## Pass2 mobile-height follow-up — source re-frozen

- Changed `/Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/measurement-guide/measurement-guide.module.css`: mobile grid gap is 16px and direct disclosure margins are zero, removing doubled spacing without changing required instructions or safety content.
- Changed `/Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/pain/pain.module.css`: mobile index-only section and CTA gaps are 32px and 40px. Pain detail spacing and all safety content remain unchanged.
- Validation: measurement-guide directory tests plus pain/page.test.tsx passed (3 files, 21 tests); git diff --check passed.
- Fresh browser height verification could not run because the shared preview at port 3241 refused the connection. No build was run. Final <=7-screen measurement remains for A's guard rerun; source is re-frozen.
