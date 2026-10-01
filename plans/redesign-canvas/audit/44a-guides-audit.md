# 44a — Production guides audit

Read-only scan: 2026-09-30T21:33:20.455Z. **96/96 URLs fetched: 48 NL + 48 EN; 0 fetch failures.**
All 96 fail the complete writing-guide contract. No content, app code or database was changed.

## Scope and evidence

- **scope:** All 96 guide detail URLs from public sitemap and code backlog, 48 per locale. The 36 omitted from sitemap return real guide articles, not soft-404. /guides index is not a detail guide.
- **fetched:** Production public HTML and original hero assets. No Convex/database calls or writes.
- **wordCount:** Initial article text plus hero/quick answer; excludes global navigation/footer; hidden FAQ answers are separately counted from FAQPage. This is a visible-text count, not exact editable manuscript length.
- **sections:** H2 sections scored with documented heading regex proxies. Actual sequence differs from fixed writing-guide structure on all pages. Semantic matching and heading variants require editorial review.
- **language:** Raw detector candidates retained; terms such as cockpit/endurance/smaller may be legitimate. Confirmed English anchors and CTA independently fail NL language. No blanket claim all candidates are errors.
- **links:** Inbound counts within these 48 guides per locale only; excludes site header/footer, index and external pages.
- **keyword:** Proposed primary keyword, not H1-as-keyword. Exact text diagnostics do not reject sensible variants automatically.
- **provenance:** CMS libraryBody positive evidence from its exclusive Markdown render wrapper in page code; other fields are a CMS/code hybrid. Production code revision is not guaranteed identical to local HEAD.
- **image:** Original asset size/format/dimensions, not optimized Next image response. Visual review of local counterpart contact sheet; byte-count correspondence verified, not cryptographic identity.
- **unknown:** Claims, naturalness, active voice, full medical safety and full semantic translation parity need editorial review. Unverified checks are not marked pass.

The inventory includes 48 slugs: 30 sitemap entries and 18 additional real guides per locale. See JSON sitemapListed.
60 bodies have positive CMS-libraryBody evidence. The other 36 have no public source marker: CMS body versus code fallback remains unresolved. Rewriting only fallback TypeScript will not replace the 60 CMS bodies.
Prepare CMS import files in 44b; production publishing still needs the separate authorization in the brief.

The localCodeReferenceCommit in JSON identifies local code inspected, not a verified deployed release SHA.

Code: `src/lib/guides/content.ts:229` selects CMS first; `src/app/(public)/guides/[slug]/page.tsx:285`
selects libraryBody; `src/components/content/GuideBodyMarkdown.tsx:50` emits the exclusive render wrapper.
Hero intro/CTA may come from code; quick answer and FAQ may be extracted from CMS. Do not treat the page as one source.

## Check totals

| Check | Pass | Fail | Review |
|---|---:|---:|---:|
| structure | 0 | 96 | 0 |
| totalWords | 10 | 86 | 0 |
| quickLength | 71 | 25 | 0 |
| tipsNumbered | 68 | 28 | 0 |
| warningSigns | 33 | 63 | 0 |
| faqCountLength | 28 | 68 | 0 |
| guideCalculatorLinks | 12 | 84 | 0 |
| title | 43 | 53 | 0 |
| description | 22 | 74 | 0 |
| oneH1 | 96 | 0 | 0 |
| keywordH1 | 15 | 81 | 0 |
| keywordOpening | 15 | 81 | 0 |
| keywordH2 | 13 | 83 | 0 |
| language | 48 | 48 | 0 |
| personalTone | 95 | 1 | 0 |
| sentenceLength | 96 | 0 | 0 |
| paragraphLength | 96 | 0 | 0 |
| noHype | 96 | 0 | 0 |
| schema | 96 | 0 | 0 |
| dateModified | 0 | 96 | 0 |
| canonical | 96 | 0 | 0 |
| hreflang | 96 | 0 | 0 |
| imageSpec | 0 | 96 | 0 |
| imageAlt | 66 | 30 | 0 |
| imageOg | 60 | 36 | 0 |
| inbound | 80 | 16 | 0 |
| uniqueTitle | 96 | 0 | 0 |
| uniqueDescription | 96 | 0 | 0 |
| keywordTitleFront | 12 | 84 | 0 |
| imageAltDescriptive | 36 | 60 | 0 |
| imageHouseStyle | 36 | 60 | 0 |
| imageRelevance | 20 | 24 | 52 |
| descriptionComplete | 96 | 0 | 0 |
| anchorLanguage | 48 | 48 | 0 |
| linkRationale | 8 | 88 | 0 |
| sitemapListed | 60 | 36 | 0 |
| parityStructure | 36 | 60 | 0 |

Schema means presence only; tipsNumbered means an ordered list exists, not that the whole procedure is safe. QuickLength only measures the card word band, not the required 2–3-sentence answer. These are measured/heuristic checks. Claims, active voice, full safety and semantic parity remain **REVIEW**, not pass.
Keyword totals use editorial proposals below; there is no approved keyword registry or traffic evidence.

## Every guide, both locales

P = measured pass; F = measured fail; R = unverified semantic judgement. Each cell lists checks in header order.
Structure/words: ordered required blocks / total visible words / quick answer length. Tips: numbered / warning proxy.
SEO: title / description / one H1 / keyword H1-opening-H2. Links: 3–5 guides + calculator / inbound / rationale.
Tone: language screen / je-vorm / sentence length / paragraphs / hype. Data: schemas / dates / canonical / hreflang.
Image: spec / descriptive alt / style / relevance / OG. Claims and bilingual equivalence = R for every row.

| Locale / guide | Source | Words | Structure/words | Tips | FAQ | Links | SEO | Tone | Data | Image |
|---|---|---:|---|---|---|---|---|---|---|---|
| [en/bike-fit-for-beginners-and-returning-riders](https://bestbikefit4u.eu/en/guides/bike-fit-for-beginners-and-returning-riders) | CMS body | 2337 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fit-for-foot-pain-hot-foot-and-numb-toes](https://bestbikefit4u.eu/en/guides/bike-fit-for-foot-pain-hot-foot-and-numb-toes) | CMS body | 2560 | F/F/F | P/P | F | P/P/F | F/P/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fit-for-hand-numbness-and-wrist-pain](https://bestbikefit4u.eu/en/guides/bike-fit-for-hand-numbness-and-wrist-pain) | CMS body | 2772 | F/F/P | P/P | F | F/P/F | F/P/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fit-for-neck-and-shoulder-pain](https://bestbikefit4u.eu/en/guides/bike-fit-for-neck-and-shoulder-pain) | CMS body | 2592 | F/F/F | P/P | F | F/P/F | F/P/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fit-for-riders-with-a-shorter-torso](https://bestbikefit4u.eu/en/guides/bike-fit-for-riders-with-a-shorter-torso) | CMS body | 2623 | F/F/P | P/F | F | F/P/F | F/P/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fit-for-riders-with-limited-flexibility](https://bestbikefit4u.eu/en/guides/bike-fit-for-riders-with-limited-flexibility) | CMS body | 2359 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores](https://bestbikefit4u.eu/en/guides/bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores) | CMS body | 2601 | F/F/P | P/P | F | F/P/F | F/P/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fit-for-tall-riders](https://bestbikefit4u.eu/en/guides/bike-fit-for-tall-riders) | CMS body | 2582 | F/F/F | P/P | F | F/P/F | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/bike-fitting-for-knee-pain](https://bestbikefit4u.eu/en/guides/bike-fitting-for-knee-pain) | CMS body | 2755 | F/F/P | P/F | F | F/P/P | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/bike-fitting-for-lower-back-pain](https://bestbikefit4u.eu/en/guides/bike-fitting-for-lower-back-pain) | CMS body | 2646 | F/F/F | P/F | F | F/P/P | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/cleat-position-basics-guide](https://bestbikefit4u.eu/en/guides/cleat-position-basics-guide) | CMS body | 2474 | F/F/F | P/F | F | F/P/F | F/P/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/crank-length-guide](https://bestbikefit4u.eu/en/guides/crank-length-guide) | CMS body | 2283 | F/F/P | P/P | F | F/P/F | F/F/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/cycling-shoe-fit-width-and-last-guide](https://bestbikefit4u.eu/en/guides/cycling-shoe-fit-width-and-last-guide) | CMS body | 2432 | F/F/F | P/P | F | F/P/F | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/endurance-bike-fit-guide](https://bestbikefit4u.eu/en/guides/endurance-bike-fit-guide) | CMS body | 2536 | F/F/P | P/F | F | F/P/F | F/F/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/foot-measurement-guide-for-cyclists](https://bestbikefit4u.eu/en/guides/foot-measurement-guide-for-cyclists) | CMS body | 2441 | F/F/P | P/P | F | F/P/F | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/gravel-bike-fit-guide](https://bestbikefit4u.eu/en/guides/gravel-bike-fit-guide) | CMS body | 2496 | F/F/P | P/F | F | F/P/F | F/P/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/handlebar-drop-guide](https://bestbikefit4u.eu/en/guides/handlebar-drop-guide) | CMS body | 2321 | F/F/P | P/P | F | F/P/F | F/F/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/handlebar-width-and-hood-position-guide](https://bestbikefit4u.eu/en/guides/handlebar-width-and-hood-position-guide) | CMS body | 2221 | F/F/F | P/P | F | F/P/F | F/F/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/indoor-trainer-bike-fit-guide](https://bestbikefit4u.eu/en/guides/indoor-trainer-bike-fit-guide) | CMS body | 2536 | F/F/F | P/F | F | P/P/F | F/P/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/mountain-bike-fit-guide](https://bestbikefit4u.eu/en/guides/mountain-bike-fit-guide) | CMS body | 2661 | F/F/P | P/F | F | F/P/F | F/P/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/pain-and-discomfort](https://bestbikefit4u.eu/en/guides/pain-and-discomfort) | CMS body | 2403 | F/F/P | P/P | F | F/F/F | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/reach-and-stem-guide](https://bestbikefit4u.eu/en/guides/reach-and-stem-guide) | CMS body | 2600 | F/F/F | P/F | F | F/P/F | F/P/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/ride-types](https://bestbikefit4u.eu/en/guides/ride-types) | CMS body | 2827 | F/F/F | P/F | F | F/F/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/rider-profiles](https://bestbikefit4u.eu/en/guides/rider-profiles) | CMS body | 2184 | F/F/F | F/F | F | F/F/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/road-bike-fit-guide](https://bestbikefit4u.eu/en/guides/road-bike-fit-guide) | CMS body | 2945 | F/F/F | P/F | F | F/P/P | P/F/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/saddle-fore-aft-and-tilt-guide](https://bestbikefit4u.eu/en/guides/saddle-fore-aft-and-tilt-guide) | CMS body | 2475 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/saddle-height-guide](https://bestbikefit4u.eu/en/guides/saddle-height-guide) | CMS body | 2421 | F/F/F | P/F | F | F/P/F | F/F/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/setup-parameters](https://bestbikefit4u.eu/en/guides/setup-parameters) | CMS body | 2485 | F/F/P | P/F | F | F/F/F | F/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [en/shoe-foot-cleat-fit](https://bestbikefit4u.eu/en/guides/shoe-foot-cleat-fit) | CMS body | 2391 | F/F/F | P/F | F | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/triathlon-bike-fit-guide](https://bestbikefit4u.eu/en/guides/triathlon-bike-fit-guide) | CMS body | 2778 | F/F/P | P/P | F | P/P/P | F/F/P/P/P/P | P/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/bike-fit-for-beginners-and-returning-riders](https://bestbikefit4u.eu/nl/guides/bike-fit-for-beginners-and-returning-riders) | CMS body | 2575 | F/F/P | P/F | F | P/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fit-for-foot-pain-hot-foot-and-numb-toes](https://bestbikefit4u.eu/nl/guides/bike-fit-for-foot-pain-hot-foot-and-numb-toes) | CMS body | 2828 | F/F/P | P/P | F | P/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fit-for-hand-numbness-and-wrist-pain](https://bestbikefit4u.eu/nl/guides/bike-fit-for-hand-numbness-and-wrist-pain) | CMS body | 3144 | F/F/P | P/P | F | F/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fit-for-neck-and-shoulder-pain](https://bestbikefit4u.eu/nl/guides/bike-fit-for-neck-and-shoulder-pain) | CMS body | 2842 | F/F/P | P/P | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fit-for-riders-with-a-shorter-torso](https://bestbikefit4u.eu/nl/guides/bike-fit-for-riders-with-a-shorter-torso) | CMS body | 2856 | F/F/F | P/F | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fit-for-riders-with-limited-flexibility](https://bestbikefit4u.eu/nl/guides/bike-fit-for-riders-with-limited-flexibility) | CMS body | 2540 | F/F/P | P/F | F | P/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores](https://bestbikefit4u.eu/nl/guides/bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores) | CMS body | 2869 | F/F/P | P/P | F | F/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fit-for-tall-riders](https://bestbikefit4u.eu/nl/guides/bike-fit-for-tall-riders) | CMS body | 2775 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/bike-fitting-for-knee-pain](https://bestbikefit4u.eu/nl/guides/bike-fitting-for-knee-pain) | CMS body | 3061 | F/F/P | P/P | F | F/P/P | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/bike-fitting-for-lower-back-pain](https://bestbikefit4u.eu/nl/guides/bike-fitting-for-lower-back-pain) | CMS body | 2864 | F/F/P | P/F | F | F/P/P | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/cleat-position-basics-guide](https://bestbikefit4u.eu/nl/guides/cleat-position-basics-guide) | CMS body | 2791 | F/F/P | P/P | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/crank-length-guide](https://bestbikefit4u.eu/nl/guides/crank-length-guide) | CMS body | 2348 | F/F/P | P/F | F | P/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/cycling-shoe-fit-width-and-last-guide](https://bestbikefit4u.eu/nl/guides/cycling-shoe-fit-width-and-last-guide) | CMS body | 2793 | F/F/P | P/F | F | F/P/F | F/F/P/P/P/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/endurance-bike-fit-guide](https://bestbikefit4u.eu/nl/guides/endurance-bike-fit-guide) | CMS body | 2792 | F/F/P | P/F | F | P/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/foot-measurement-guide-for-cyclists](https://bestbikefit4u.eu/nl/guides/foot-measurement-guide-for-cyclists) | CMS body | 2657 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/gravel-bike-fit-guide](https://bestbikefit4u.eu/nl/guides/gravel-bike-fit-guide) | CMS body | 2666 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/handlebar-drop-guide](https://bestbikefit4u.eu/nl/guides/handlebar-drop-guide) | CMS body | 2571 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/handlebar-width-and-hood-position-guide](https://bestbikefit4u.eu/nl/guides/handlebar-width-and-hood-position-guide) | CMS body | 2441 | F/F/P | P/P | F | P/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/indoor-trainer-bike-fit-guide](https://bestbikefit4u.eu/nl/guides/indoor-trainer-bike-fit-guide) | CMS body | 2685 | F/F/P | P/P | F | P/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/mountain-bike-fit-guide](https://bestbikefit4u.eu/nl/guides/mountain-bike-fit-guide) | CMS body | 2796 | F/F/P | P/F | F | F/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/pain-and-discomfort](https://bestbikefit4u.eu/nl/guides/pain-and-discomfort) | CMS body | 2549 | F/F/P | P/F | F | F/F/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/reach-and-stem-guide](https://bestbikefit4u.eu/nl/guides/reach-and-stem-guide) | CMS body | 2917 | F/F/P | P/P | F | F/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/ride-types](https://bestbikefit4u.eu/nl/guides/ride-types) | CMS body | 3026 | F/F/P | P/F | F | F/F/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/rider-profiles](https://bestbikefit4u.eu/nl/guides/rider-profiles) | CMS body | 2317 | F/F/P | F/F | F | P/F/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/road-bike-fit-guide](https://bestbikefit4u.eu/nl/guides/road-bike-fit-guide) | CMS body | 3178 | F/F/F | P/F | F | F/P/P | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/saddle-fore-aft-and-tilt-guide](https://bestbikefit4u.eu/nl/guides/saddle-fore-aft-and-tilt-guide) | CMS body | 2752 | F/F/P | P/F | F | F/P/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/saddle-height-guide](https://bestbikefit4u.eu/nl/guides/saddle-height-guide) | CMS body | 2547 | F/F/F | P/P | F | F/P/F | F/P/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/setup-parameters](https://bestbikefit4u.eu/nl/guides/setup-parameters) | CMS body | 2783 | F/F/P | P/F | F | F/F/F | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/R/P |
| [nl/shoe-foot-cleat-fit](https://bestbikefit4u.eu/nl/guides/shoe-foot-cleat-fit) | CMS body | 2689 | F/F/P | P/P | F | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [nl/triathlon-bike-fit-guide](https://bestbikefit4u.eu/nl/guides/triathlon-bike-fit-guide) | CMS body | 2960 | F/F/P | P/F | F | P/P/P | F/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/F/F/P/P |
| [en/bike-size-and-geometry](https://bestbikefit4u.eu/en/guides/bike-size-and-geometry) | unresolved | 333 | F/F/F | F/F | F | F/F/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [en/carbs-per-hour-guide](https://bestbikefit4u.eu/en/guides/carbs-per-hour-guide) | unresolved | 315 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/climb-time-and-event-pacing-guide](https://bestbikefit4u.eu/en/guides/climb-time-and-event-pacing-guide) | unresolved | 1076 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/cycling-fueling-basics](https://bestbikefit4u.eu/en/guides/cycling-fueling-basics) | unresolved | 343 | F/F/P | F/F | P | F/P/F | P/F/P/P/P/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/fit-science](https://bestbikefit4u.eu/en/guides/fit-science) | unresolved | 279 | F/F/P | F/F | F | F/F/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [en/frame-size-guide](https://bestbikefit4u.eu/en/guides/frame-size-guide) | unresolved | 351 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [en/ftp-explained](https://bestbikefit4u.eu/en/guides/ftp-explained) | unresolved | 347 | F/F/F | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/how-to-compare-two-bikes-for-fit](https://bestbikefit4u.eu/en/guides/how-to-compare-two-bikes-for-fit) | unresolved | 1160 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [en/hydration-and-sweat-rate-guide](https://bestbikefit4u.eu/en/guides/hydration-and-sweat-rate-guide) | unresolved | 311 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/insoles-arch-support-and-footbeds-guide](https://bestbikefit4u.eu/en/guides/insoles-arch-support-and-footbeds-guide) | unresolved | 1150 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/nutrition-and-hydration](https://bestbikefit4u.eu/en/guides/nutrition-and-hydration) | unresolved | 332 | F/F/F | F/F | F | F/F/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/power-ftp-pacing](https://bestbikefit4u.eu/en/guides/power-ftp-pacing) | unresolved | 332 | F/F/P | F/F | F | F/F/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/power-to-speed-guide](https://bestbikefit4u.eu/en/guides/power-to-speed-guide) | unresolved | 308 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/road-vs-endurance-vs-race-geometry](https://bestbikefit4u.eu/en/guides/road-vs-endurance-vs-race-geometry) | unresolved | 335 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [en/sodium-and-electrolytes-guide](https://bestbikefit4u.eu/en/guides/sodium-and-electrolytes-guide) | unresolved | 1062 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/stance-width-q-factor-and-pedal-spacer-guide](https://bestbikefit4u.eu/en/guides/stance-width-q-factor-and-pedal-spacer-guide) | unresolved | 342 | F/F/F | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [en/when-online-bike-fit-has-limits](https://bestbikefit4u.eu/en/guides/when-online-bike-fit-has-limits) | unresolved | 1057 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [en/wkg-and-power-zones-guide](https://bestbikefit4u.eu/en/guides/wkg-and-power-zones-guide) | unresolved | 327 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | P/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/bike-size-and-geometry](https://bestbikefit4u.eu/nl/guides/bike-size-and-geometry) | unresolved | 309 | F/F/F | F/F | F | F/F/F | P/F/P/P/P/F | F/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [nl/carbs-per-hour-guide](https://bestbikefit4u.eu/nl/guides/carbs-per-hour-guide) | unresolved | 294 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/climb-time-and-event-pacing-guide](https://bestbikefit4u.eu/nl/guides/climb-time-and-event-pacing-guide) | unresolved | 1034 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/cycling-fueling-basics](https://bestbikefit4u.eu/nl/guides/cycling-fueling-basics) | unresolved | 333 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/fit-science](https://bestbikefit4u.eu/nl/guides/fit-science) | unresolved | 262 | F/F/P | F/F | F | F/F/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [nl/frame-size-guide](https://bestbikefit4u.eu/nl/guides/frame-size-guide) | unresolved | 323 | F/F/F | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [nl/ftp-explained](https://bestbikefit4u.eu/nl/guides/ftp-explained) | unresolved | 331 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/how-to-compare-two-bikes-for-fit](https://bestbikefit4u.eu/nl/guides/how-to-compare-two-bikes-for-fit) | unresolved | 1087 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [nl/hydration-and-sweat-rate-guide](https://bestbikefit4u.eu/nl/guides/hydration-and-sweat-rate-guide) | unresolved | 291 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/insoles-arch-support-and-footbeds-guide](https://bestbikefit4u.eu/nl/guides/insoles-arch-support-and-footbeds-guide) | unresolved | 1074 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/nutrition-and-hydration](https://bestbikefit4u.eu/nl/guides/nutrition-and-hydration) | unresolved | 328 | F/F/F | F/F | F | F/F/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/power-ftp-pacing](https://bestbikefit4u.eu/nl/guides/power-ftp-pacing) | unresolved | 318 | F/F/P | F/F | F | F/F/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/power-to-speed-guide](https://bestbikefit4u.eu/nl/guides/power-to-speed-guide) | unresolved | 297 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | F/F/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/road-vs-endurance-vs-race-geometry](https://bestbikefit4u.eu/nl/guides/road-vs-endurance-vs-race-geometry) | unresolved | 307 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [nl/sodium-and-electrolytes-guide](https://bestbikefit4u.eu/nl/guides/sodium-and-electrolytes-guide) | unresolved | 1021 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/stance-width-q-factor-and-pedal-spacer-guide](https://bestbikefit4u.eu/nl/guides/stance-width-q-factor-and-pedal-spacer-guide) | unresolved | 316 | F/F/F | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |
| [nl/when-online-bike-fit-has-limits](https://bestbikefit4u.eu/nl/guides/when-online-bike-fit-has-limits) | unresolved | 1014 | F/P/P | P/P | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/R/F |
| [nl/wkg-and-power-zones-guide](https://bestbikefit4u.eu/nl/guides/wkg-and-power-zones-guide) | unresolved | 314 | F/F/P | F/F | P | F/P/F | P/F/P/F/F/F | F/P/P/P/P | P/F/P/P | F/P/P/F/F |

## Proposed Dutch keywords, illustration briefs and priority fixes

These are editorial proposals, with no search-volume or ranking claims. Each applies to its NL/EN pair.
Every replacement: code-drawn fineliner, mint paper, lime focus, petrol measurement arrows, no text; 1600×1000 WebP <200kB.

| Guide | Proposed NL primary keyword | Illustration subject | Top content fixes (NL / EN where different) |
|---|---|---|---|
| bike-fit-for-beginners-and-returning-riders | fiets afstellen voor beginners | Zijaanzicht beginnende fietser; ontspannen ellebogen, zadelhoogte en bereik met maatpijlen. | Words 2575/2337; H2 16/15; FAQ 8/8; title 85/78, description 137/127. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fit-for-foot-pain-hot-foot-and-numb-toes | gevoelloze tenen fietsen | Voet in doorsnede van fietsschoen; voorvoetdruk en ruimte rond tenen, cleat zichtbaar. | Words 2828/2560; H2 18/17; FAQ 7/7; title 81/73, description 130/144. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fit-for-hand-numbness-and-wrist-pain | gevoelloze handen fietsen | Hand op remgreep in zijaanzicht; neutrale polshoek naast overstrekte pols, drukpunt gemarkeerd. | Words 3144/2772; H2 20/19; FAQ 7/7; title 83/82, description 142/141. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fit-for-neck-and-shoulder-pain | nekpijn fietsen | Bovenlichaam op racefiets; nek, schouders en afstand tot remgrepen met maatpijl. | Words 2842/2592; H2 19/18; FAQ 8/8; title 87/77, description 122/144. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fit-for-riders-with-a-shorter-torso | fiets afstellen korte romp | Fietser met korte romp; twee cockpitlengtes en ontspannen ellebooghoek naast elkaar. | Words 2856/2623; H2 19/18; FAQ 8/8; title 98/85, description 136/142. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fit-for-riders-with-limited-flexibility | fiets afstellen beperkte flexibiliteit | Fietser met beperkte heupbuiging; hogere cockpit en heuphoek als veilige bewegingsruimte. | Words 2540/2359; H2 26/25; FAQ 8/8; title 84/82, description 149/139. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores | zadelpijn fietsen | Zadel in bovenaanzicht met zitbotsteun en ontlast middengebied; geen medische diagnose. | Words 2869/2601; H2 18/17; FAQ 8/8; title 90/80, description 147/143. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fit-for-tall-riders | fiets afstellen lange fietsers | Lange fietser op passend frame; zadelhoogte en stuurafstand met evenwichtige verhoudingen. | Words 2775/2582; H2 18/17; FAQ 8/8; title 75/76, description 133/137. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fitting-for-knee-pain | kniepijn fietsen | Knie bij pedaal onderaan en bovenaan; zadelhoogte als maatlijn, pijngebied subtiel gemarkeerd. | Words 3061/2755; H2 18/17; FAQ 8/8; title 82/76, description 144/133. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-fitting-for-lower-back-pain | lage rugpijn fietsen | Bekken en lage rug van fietser; stuurdrop en reach zichtbaar met twee maatpijlen. | Words 2864/2646; H2 17/16; FAQ 8/8; title 71/72, description 140/128. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| cleat-position-basics-guide | schoenplaatjes afstellen | Onderzijde fietsschoen met cleat; voor-achterpositie en rotatie aangegeven met pijlen. | Words 2791/2474; H2 17/16; FAQ 7/7; title 91/80, description 161/143. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| crank-length-guide | cranklengte kiezen | Twee cranklengtes rond dezelfde trapas; pedaalcirkel en maatlijn van as tot pedaalas. | Words 2348/2283; H2 17/16; FAQ 8/8; title 84/76, description 153/139. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| cycling-shoe-fit-width-and-last-guide | fietsschoenen breedte | Voet en schoenleest in bovenaanzicht; voorvoetbreedte en teenruimte als maatlijnen. | Words 2793/2432; H2 19/18; FAQ 7/7; title 74/75, description 114/119. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| endurance-bike-fit-guide | fiets afstellen lange ritten | Fietser in ontspannen duurhouding; zadelsteun, lichte handdruk en gematigde stuurdrop. | Words 2792/2536; H2 18/17; FAQ 8/8; title 88/77, description 144/136. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| foot-measurement-guide-for-cyclists | voet opmeten fietsschoenen | Voet op vel papier met omtrek, meetlint langs lengte en breedte; bovenaanzicht. | Words 2657/2441; H2 20/19; FAQ 8/8; title 81/80, description 129/132. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| gravel-bike-fit-guide | gravelbike afstellen | Gravelfiets op ongelijke ondergrond; ontspannen armen en bereik naar remgrepen benadrukt. | Words 2666/2496; H2 18/17; FAQ 8/8; title 76/72, description 126/144. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| handlebar-drop-guide | stuurhoogte racefiets | Zadel en stuur van opzij met horizontale hulplijnen en verticale drop-maatpijl. | Words 2571/2321; H2 22/21; FAQ 8/8; title 66/66, description 159/139. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| handlebar-width-and-hood-position-guide | stuurbreedte racefiets | Stuur in bovenaanzicht; breedte en symmetrische remgreephoeken, handen ontspannen. | Words 2441/2221; H2 15/14; FAQ 8/8; title 97/85, description 121/119. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| indoor-trainer-bike-fit-guide | fiets afstellen indoortrainer | Fiets op trainer met waterpas; zadel- en handcontactpunten, voorwielhoogte zichtbaar. | Words 2685/2536; H2 17/16; FAQ 7/7; title 86/80, description 142/147. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| mountain-bike-fit-guide | mountainbike afstellen | Mountainbiker in klim- en afdaalhouding; bewegingsruimte boven fiets en stuurcontrole. | Words 2796/2661; H2 18/17; FAQ 8/8; title 75/80, description 142/146. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| pain-and-discomfort | pijn bij fietsen | Fietser van opzij met knie, onderrug, hand, zitbot en voet als vijf contact-/klachtgebieden. | Words 2549/2403; H2 15/14; FAQ 8/8; title 69/70, description 140/137. Add ≥2 inbound links. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| reach-and-stem-guide | stuurpenlengte bepalen | Cockpit van opzij; stuurpenlengte en bereik naar remgreep als verschillende maatlijnen. | Words 2917/2600; H2 16/15; FAQ 8/8; title 96/79, description 142/143. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| ride-types | fiets afstellen per fietstype | Race-, gravel- en mountainbikehoudingen naast elkaar met verschillende contactpunten. | Words 3026/2827; H2 18/17; FAQ 7/7; title 43/44, description 133/132. Add ≥2 inbound links. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| rider-profiles | fiets afstellen lichaamsbouw | Twee fietsers met andere romp-beenverhouding; passend bereik en zadelhoogte naast elkaar. | Words 2317/2184; H2 12/11; FAQ 8/8; title 49/48, description 138/137. Add ≥2 inbound links. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| road-bike-fit-guide | racefiets afstellen | Racefiets met fietser; drie contactpunten zadel, remgrepen en pedalen in samenhang. | Words 3178/2945; H2 34/33; FAQ 7/7; title 68/58, description 133/131. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| saddle-fore-aft-and-tilt-guide | zadel terugstand en kanteling | Zadel op rails van opzij; horizontale verplaatsing en kantelhoek met aparte pijlen. | Words 2752/2475; H2 17/16; FAQ 8/8; title 93/81, description 121/139. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| saddle-height-guide | zadelhoogte instellen | Meetlint van trapas tot bovenkant zadel; fietser toont beenhoek onderaan pedaalslag. | Words 2547/2421; H2 18/17; FAQ 8/8; title 75/76, description 147/139. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| setup-parameters | fiets afstellen maten | Fiets van opzij met aparte maatlijnen voor zadelhoogte, reach, stuurdrop en crank. | Words 2783/2485; H2 15/14; FAQ 8/8; title 73/70, description 133/133. Add ≥2 inbound links. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| shoe-foot-cleat-fit | fietsschoenen en schoenplaatjes afstellen | Voet, passende schoen en cleat naast elkaar; breedte, steun en pedaalpositie verbonden. | Words 2689/2391; H2 17/16; FAQ 6/6; title 52/45, description 133/134. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| triathlon-bike-fit-guide | triatlonfiets afstellen | Triatleet op aerobars; heuphoek, zadelsteun en afstand tot armsteunen duidelijk zichtbaar. | Words 2960/2778; H2 19/18; FAQ 8/8; title 77/77, description 133/126. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| bike-size-and-geometry | fietsmaat en geometrie | Twee frames naast elkaar met stack en reach; gelijke maatnaam maar andere verhoudingen. | Words 309/333; H2 4/4; FAQ 2/2; title 50/43, description 102/107. Add ≥2 inbound links. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| carbs-per-hour-guide | koolhydraten per uur fietsen | Bidon, banaan en gel naast eenvoudige klok; geen doseringscijfers of tekst in beeld. | Words 294/315; H2 4/4; FAQ 5/5; title 46/36, description 73/70. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| climb-time-and-event-pacing-guide | klimtijd fietsen berekenen | Fietser op klimprofiel; stijging, afstand en klok als afzonderlijke factoren. | Words 1034/1076; H2 13/13; FAQ 5/5; title 44/47, description 100/96. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| cycling-fueling-basics | eten tijdens fietsen | Fietser met bidon en voedsel uit achterzak; rustige eet- en drinkmomenten onderweg. | Words 333/343; H2 4/4; FAQ 5/5; title 39/38, description 97/88. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| fit-science | wetenschap achter bikefitting | Fietser met drie contactpunten en meetlijnen; eenvoudige observatie in plaats van diagnose. | Words 262/279; H2 4/4; FAQ 2/2; title 27/27, description 94/89. Add ≥2 inbound links. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| frame-size-guide | framemaat fiets bepalen | Fietser naast frame; binnenbeenmaat, standover, stack en reach als meetpunten. | Words 323/351; H2 4/4; FAQ 5/5; title 29/32, description 97/90. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| ftp-explained | wat is FTP fietsen | Fiets op trainer met vermogensmeter en klok; gemeten inspanning, geen prestatielabel. | Words 331/347; H2 4/4; FAQ 5/5; title 29/29, description 97/77. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| how-to-compare-two-bikes-for-fit | fietsen vergelijken zithouding | Twee fietssilhouetten met gedeelde trapas; zadel- en stuurcontactpunten tegenover elkaar. | Words 1087/1160; H2 13/13; FAQ 5/5; title 53/48, description 103/97. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| hydration-and-sweat-rate-guide | zweetverlies meten fietsen | Weegschaal voor en na rit, bidon en maatbeker; meetprocedure zonder voorgeschreven dosis. | Words 291/311; H2 4/4; FAQ 5/5; title 44/44, description 66/66. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| insoles-arch-support-and-footbeds-guide | inlegzolen fietsschoenen | Voetboog boven fietsinlegzool in doorsnede; ondersteuningsvlak en schoenvolume zichtbaar. | Words 1074/1150; H2 13/13; FAQ 5/5; title 46/44, description 94/82. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| nutrition-and-hydration | voeding en drinken wielrennen | Bidon en eenvoudige koolhydraatbronnen naast fiets; voeding en vocht afzonderlijk herkenbaar. | Words 328/332; H2 4/4; FAQ 2/2; title 55/52, description 111/99. Add ≥2 inbound links. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| power-ftp-pacing | vermogen en tempo fietsen | Fietser met vermogensmeter en eenvoudige gelijkmatige inspanningscurve zonder labels. | Words 318/332; H2 4/4; FAQ 2/2; title 48/42, description 93/91. Add ≥2 inbound links. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| power-to-speed-guide | vermogen en snelheid fietsen | Fietser met tegenwindpijlen en bandencontact; lucht- en rolweerstand naast vermogen. | Words 297/308; H2 4/4; FAQ 5/5; title 40/36, description 92/84. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| road-vs-endurance-vs-race-geometry | racefiets of endurance geometrie | Twee racefietsframes naast elkaar; hogere voorkant en korter bereik bij duurgeometrie. | Words 307/335; H2 4/4; FAQ 5/5; title 51/50, description 106/97. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| sodium-and-electrolytes-guide | natrium sportdrank fietsen | Bidon met maatbeker en kleine hoeveelheid sportdrankpoeder; concentratieconcept zonder getal. | Words 1021/1062; H2 13/13; FAQ 5/5; title 44/43, description 101/90. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| stance-width-q-factor-and-pedal-spacer-guide | standbreedte pedalen afstellen | Crank, pedaal en schoen van voren; standbreedte en pedaalring afzonderlijk aangeven. | Words 316/342; H2 4/4; FAQ 5/5; title 45/45, description 93/95. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| when-online-bike-fit-has-limits | wanneer professionele bikefit | Fietser naast fitter die contactpunten bekijkt; online meetgegevens als startpunt. | Words 1014/1057; H2 13/13; FAQ 5/5; title 52/47, description 119/104. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |
| wkg-and-power-zones-guide | watt per kilo fietsen | Weegschaal naast vermogensmeter; twee verschillende meetgrootheden, geen genderindeling. | Words 314/327; H2 4/4; FAQ 5/5; title 39/40, description 95/83. Repair guide/calculator link mix. Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |

## Concrete cross-guide fixes

- **Sitemap:** 36 live guide URLs are absent. Align the sitemap with the intended indexable guide inventory; the newly discovered pages also need the content review below.
- **Structure:** CMS bodies exceed the target and use extra chapters; fallback-like pages are thin. NL often repeats “Kort antwoord” inside the body in addition to the hero answer because stripping uses the English heading.
- **Links:** related blocks contain generic “Open de volgende relevante pagina…” rationale, not a topic-specific reason. NL target labels and “Start Free Fit” remain English. Raw links and inbound sources are retained per row.
- **Metadata:** keep slugs/canonical/hreflang; rewrite overlong titles and out-of-band descriptions, retain unique metadata.
- **Dates:** Article exists but lacks dateModified; no visible updated label was found. Implement both from an honest revision date.
- **Images:** CMS originals are PNG; hero alt repeats the page title. Existing blue/orange digital riders fail the requested illustration style. Fallback-like pages reuse a cockpit illustration regardless of topic. Use proposed subjects.
- **Claims/safety:** numeric values are inventoried in JSON; each needs a source, engine reference or accepted rule-of-thumb decision. This audit does not assert the existing figures are fabricated. Review rest/night pain, swelling, radiating tingling and persistent symptoms individually; the automated warning check is only a proxy.
- **Translation parity:** every slug has both locales. For the 30 CMS pairs, removing the extra NL quick-answer chapter aligns chapter counts and numeric sequences (decimal comma normalized); this supports structural/numeric parity only. Rewrite NL first and review EN against it sentence by sentence.

## Reproduce and handoff

Run `node tests/visual/guides-audit/audit.mjs`, then `node tests/visual/guides-audit/review.mjs`.
The first command performs public GET reads and closes Chromium; no local server, CMS call or mutation is used.
The second applies explicitly documented editorial proposals to retained evidence. Full details and text are in
`44a-guides-audit.json`. Re-run before 44b acceptance; manual R items still need an editorial decision.

Validation: both scripts pass ESLint; all 96 records have a counterpart and 48 unique NL proposals; no links to guide detail URLs remain outside the final inventory. All 96 have a real #guide-content article.

Files: `tests/visual/guides-audit/audit.mjs`, `tests/visual/guides-audit/review.mjs`, this Markdown, matching JSON,
`files-44a.txt`. No PNGs are versioned or listed. No commit.
