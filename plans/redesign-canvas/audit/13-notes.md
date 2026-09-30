# 13 — Library, service and report drafts

Drafts only. One board per subagent assignment; parent owns source-gap reconciliation, final checks, shared shell and renders. No app code, commit or canvas publication by this task.

## Shared references and limits

- Marketing header/footer copied from approved `drafts/HowItWorks.dc.html`, with Gidsen current on Guides/GuideDetail. Source navigation mappings are in `audit/route-map.md`. Native disclosures are product controls; review-only state switching stays in the 44 px strip above the header.
- Example data is marked once per screen with a small `Voorbeeldgegevens` chip. Bracketed missing facts are distinct from examples and are not presented as published facts.
- FitReport uses the lead's A4 fallback: 794 × 1123 px per page, text at least 12 pt (16 CSS px). `print.md` was not present under repository references or the available `.codex`/`.claude` skill trees. The report does not use the marketing shell.

## Guides

- Sources: `src/app/(public)/guides/page.tsx:76` hero, `:92` introduction, `:136` four highlighted tools, `:207` categories, `:49` / `:232` conditional related blog, `:240` CTA. `docs/cms-import/nl/001--guides.json:21` library body supplies category intent.
- Nine real top-level category groups from the NL guide backlog, not fabricated rankings. Source `src/lib/guides/backlog.ts:123` child matching currently makes other same-cluster articles appear to be hubs; the draft uses actual cluster entries rather than reproducing that index bug. Implementation follow-up: distinguish true hubs from articles.
- Review states: no related published blog articles (default), related-blog layout with explicitly missing title/summary. No source-supported “featured article” ranking exists; the four actual highlighted tool links serve that role.

## GuideDetail

- Real hub **`setup-parameters`** and article **`saddle-height-guide`**: `docs/cms-import/total/021--guides--setup-parameters.json:3` slug, `:10` heading, `:12` CTA, `:14` internal links, `:21` libraryBody; corresponding article in `022--guides--saddle-height-guide.json` at the same keys/lines.
- Hub body supplies adjustment order, measuring, cautions and four FAQs. Article body supplies quick answer, definition, measurement, high/low signs, source 2–3 mm / 2–3 rides / approximately 5 mm guidance, escalation and six condensed FAQs. Line 21 is a single escaped Markdown field; section headings disambiguate the source.
- Template behavior: `src/app/(public)/guides/[slug]/page.tsx:245` preview, `:285` Markdown fallback, `:329` banner, `:350` breadcrumbs, `:398` hub children, `:446` quick answer, `:476` matching tool, `:489` article, `:511` FAQ, `:549` final CTA.
- States: hub, article, article preview; FAQs also rendered open. Hub's saddle link switches to the real article variant. Other guides keep their real Dutch live URLs instead of falsely showing this single exemplar.
- Follow-up: preserve full CMS content in implementation; reconcile source intro saying vertical height with its detailed seat-tube measurement instructions. Draft follows the detailed instructions. Table of contents is the requested visible navigation.

## BlogIndex

- Source `src/app/(public)/blog/page.tsx:31` nine-item page size, `:69` category filtering/slicing, `:89` hero, `:114` categories, `:158` pagination, `:192` empty state, `:198` CTA.
- Read-only production check: `npx convex run blog/queries:listPublishedPosts '{"numItems":100}' --prod` returned `{"continueCursor":"","isDone":true,"page":[]}` during this task. No published blog examples exist in that source; local CMS imports contain guides rather than blog articles.
- Default is the actual empty state. A clearly labelled layout-review state contains ten bracketed slots solely to exercise the real nine-item pagination and category controls. These are not published posts; no factual total, author, date or read time is invented. Rendered page two and both sample filters.

## BlogArticle

- Source `src/app/(public)/blog/[slug]/page.tsx:40` word-based read time, `:120` absent article → 404, `:175` breadcrumbs, `:187` header, `:207` optional image, `:222` body, `:224` TOC, `:234` / `:240` related content, `:247` CTA. `src/components/content/BlogBodyMarkdown.tsx:81` supports headings/lists/quotes; `src/components/content/BlogTableOfContents.tsx:21` uses H2 sections.
- **No real article slug is available** from the empty published source. The draft is an explicitly marked layout template with bracketed title, metadata and article content. No fabricated editorial article, byline or reading time. Related content remains non-clickable until real destinations exist.
- One state, working three-section TOC, house illustration as placement example and real BikeFit CTA. Content lead must supply a published article before this board can represent a real blog page.

## ScienceArticle

- Three actual route variants, all sources under `src/app/(public)/science/`: `bike-fit-methods/page.tsx:125` hero, `:139` interpretation/limits, `:147` methods, `:168` links; `calculation-engine/page.tsx:137` hero, `:147` inputs, `:170` outcomes, `:196` links; `stack-and-reach/page.tsx:106` hero, `:120` comparison, `:126` definitions, `:144` links.
- States `methods`, `calculation`, `stack`; review strip outside product header. Stack/reach figure is individually editable frame segments, axes, dots and labels rather than one SVG. No unsupported dimension values or formula coefficients were invented.
- Source technical wording is translated to rider language. No FAQs exist on these pages, so none added. Editorial suggestion: add reviewed references to support scientific claims, not invented citations.

## About

- Source `src/app/(public)/about/page.tsx:166` hero, `:273` trust introduction, `:168` biomechanical basis, `:171` saddle, `:181` reach, `:191` drop ranges, `:201` components, `:221` ten measurements/context inputs, `:235` related links, `:243` / `:462` Login CTA.
- Source drop ranges 0–50 / 50–80 / 80–120 / 120+ mm are explicitly indicative, not personal advice. Unsupported-sounding accuracy promises are softened. No invented team, metrics or testimonials. One state; actual science route links preserve variant meaning.

## FAQ

- Source `src/app/(public)/faq/page.tsx:238` hero; `:242` getting started (three questions), `:259` fitting (four), `:280` reports (three), `:297` account (two), `:314` related guides, `:322` fit CTA, `:325` Contact CTA, `:364` trust cards.
- Twelve real questions in four groups, native details initially open for reading. No invented categories/filter interaction. Payment-pause rule supersedes obsolete upgrade sales language; existing Pro report/multiple-bike access from `src/config/commercial.ts:395` is retained. Source `:93` does not promise a guarantee.
- Professional-accuracy phrasing is qualified as an initial position to test. Missing research references are not fabricated.

## Contact

- Source `src/app/(public)/contact/page.tsx:73` through `:86` hero/email/FAQ/message details, `:119` through `:135` direct support and languages; mailto destinations `:217` and `:270`.
- Source response guidance `src/config/commercial.ts:428` through `:437`: Free usually three business days; Pro usually one. Retains “doorgaans,” not an invented guarantee or upgrade pitch. Mailto and FAQ only, no form. One state.

## CaseStudy

- Source `src/app/(public)/case-study/page.tsx:67` hero, `:121` reasons, `:162` form explanation, `:186` suitability, `:203` expectations and `:219` guides. This is recruitment, not a published success story.
- `src/components/public/CaseStudyRecruitmentForm.tsx:58` states, `:65` submit, `:92` successful reset, `:98` failure, `:114` fields, `:151` consent, `:160` pending. Backend `convex/caseStudyLeads/mutations.ts:11` email validation, `:13` three-per-hour limit, `:68` consent and `:71` text bounds; matching validation module limits are 100 / 500 / 5000 characters.
- Seven review states: empty, filled, invalid, submitting, success, error, rate-limited. Inputs/consent map to source; browser max-length constraints surface actual backend bounds. Status copy is Dutch and inline rather than relying on an invisible toast.
- Local simulation only: no lead is submitted, no account or production data modified. One example chip on sample-data states, no labels embedded in names or form buttons.

## Legal

- Privacy source `src/app/(public)/privacy/page.tsx:112` date, `:115` collection and three subtopics, `:132` use, `:142` external providers, `:155` retention, `:159` cookies, `:163` rights, `:172` security, `:176` contact.
- Terms source `src/app/(public)/terms/page.tsx:100` date, `:103` acceptance through `:158` contact. Monthly EUR Pro/cancellation terms remain from `src/config/commercial.ts:440` through `:453`; a separate availability notice states the actual payment pause without rewriting the legal clause.
- Two variants: privacy (eight topics) and terms (ten), with working table of contents. Original date **15 February 2026** preserved, not replaced with today's date. Real text retained; an explicit `[…]` marks the abbreviated Convex storage sentence. No new legal claims.
- These are design excerpts, not replacement legal policies. Lead/legal review required before implementation; retain complete authoritative source text in production.

## PressureLanding

- Actual example slug **`75kg-racefiets`**. Source `src/lib/seo/programmatic/tirePressure.ts:7` weight steps, `:31` labels/links, `:56` defaults, `:89` Dutch parser, `:103` input; `src/app/(public)/bandenspanning/[slug]/page.tsx:81` calculation, `:85` FAQs, `:119` breadcrumbs, `:126` hero, `:142` results, `:160` usage guidance, `:181` FAQs, `:195` next step; `src/lib/seo/relatedLinks.ts:115` real Dutch destinations.
- Exact `calculateBasicPressure` in `src/lib/pressure-engine.ts:300` executed through TypeScript transpilation, not a rewritten approximation. Rider 75 kg, default bike 8 kg (`:135`), both tyres 28 mm, average asphalt, balance goal.
- Verified table: tubeless **5.2 / 5.6 bar**, **75 / 81 psi**; inner tube **5.4 / 5.9 bar**, **78 / 86 psi**, front/rear respectively. No engine warnings for these inputs. Draft displays decimal commas and explicit assumptions, no invented test range or precision.
- One SEO content state plus native FAQ expansion. Single example chip; no fake personal intake. Suggestion: localize the source's currently English calculation explanation during implementation.

## FitReport

- Source `BestBikeFit4U_ExampleReport_EN_v2.pdf`, visually inspected all three source pages; report structure also `plans/report-v2/README.md` and `plans/report-v2/05-pdf-report-v2.md`. Source values translated to Dutch without recalculation.
- Page 1: source date 15-02-2026, session `jh74v8r7ykqypbzx69d67abvqn8161hw`, Road/Performance, advice confidence 90%. Priorities: cleats 3 mm behind ball of foot, saddle 754 mm (731–774), setback 49 mm (39–59). Other targets: drop 98 (85–110), reach 538 (525–555), stem 100 (90–110) mm at −6° (−6° to +6°), crank 172.5 (170–172.5), bar 420 (400–440) mm, frame XL approximately 59–62 cm.
- Source page 2: days 1–3 cleats, 4–7 saddle, 8–14 setback/cockpit; pain scale 0–10. Source test suggestions preserved and qualified as tests, not diagnosis: saddle ±3–5 mm for front/rear knee discomfort and handlebar +10 mm or reach approximately −10 mm for hand/neck issues. Persistent pain → qualified fitter/care professional.
- Source page 3: four measurement references and required tools, small 2–5 mm changes, data-quality limits. No fabricated rider body measurements, current-vs-target deltas or pressure values. Missing-pressure notice comes from report-v2 section 6 because the source sample supplies no tyre-pressure inputs.
- Three stacked A4 pages, root 794 × 3369; each sheet 794 × 1123 px. All text ≥16 CSS px (12 pt), including the single example chip (print readability overrides screen chip sizing). Brand negative headers, DM Mono values and lime priority block. Parent refines spacing without shrinking text.
- Publishing handoff only: canvas entry needs `"paper":"a4","print":"flow"`. Canvas snapshot deliberately untouched. Native CSS page breaks included. Three per-page PNGs plus combined preview are the deliverables, not a modified production PDF renderer.

## Parent QA and handoff

- Parent reran `check-board.mjs` and `check-runtime.mjs` for all twelve boards: PASS, **109 explored runtime states**. Native FAQ expansion is separately checked in the browser render pass.
- Eleven marketing footers and their scoped CSS match approved HowItWorks exactly; footer SHA-256 `65f251bdb115ce81f5c1291fce2966454bc6555c7236078065d8877b3478c83b`. Rendered dimensions match at 1440 × 636.890625 px. FitReport deliberately uses its own print footer.
- **35 PNGs**: 32 board/state captures plus three individual FitReport pages. All marketing captures are 1440 px wide; report pages are 794 × 1123. Every rendered state has one H1, all three brand fonts, no missing house images and no unresolved bindings.
- Fixed content/footer overflow by matching board and preview heights to the longest review state. Refined print spacing and prevented flex-page shrinking: report boundaries are exactly y=0, 1123 and 2246, with no content crossing page boundaries and no text below 16 CSS px.
- Parent visually inspected the twelve designs, including diagram, form, pressure table, legal layout and each report page. Corrected lime-panel button colors and placed CaseStudy's sample-data chip beside the page heading. Textarea values are included in the filled-state render.
- Board navigation destinations are known route-map entries; shared-template variant routing remains an implementation concern. Non-exemplar content links intentionally use actual source URLs rather than displaying the wrong example.
- Outstanding content dependency: a real published blog article. Empty source is reflected honestly; layout fixtures and named missing facts are not publication-ready content. Other suggestions/source inconsistencies are recorded per board above.
- No app code or canvas metadata changed; no commit. Await lead visual/content review, not a phase-4 gate declaration.
