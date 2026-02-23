# FAQ Section SEO Content Plan

## Goal
Refactor and optimize the existing multilingual FAQ section so it follows the current website UI guidelines and is fully SEO-ready.

## Scope
- Public FAQ page implementation at `/faq` (locale-aware routes: `/en/faq`, `/nl/faq`)
- EN and NL metadata updates (title + description)
- Structural cleanup of existing EN and NL FAQ content
- `<details>/<summary>` accordion rendering for FAQ items
- JSON-LD FAQPage for EN and NL, aligned with visible FAQ content
- Layout consistency with current website visual system and component patterns

## Non-Goals
- Creating a CMS for FAQ management
- Adding additional locales beyond EN/NL
- Reworking global navigation beyond existing FAQ link paths

## Provided Inputs (Source of Truth)
- EN page title:
  `BestBikeFit4U FAQ | Online Bike Fitting, Saddle Height, Frame Size & Pain Fixes`
- EN meta description:
  `Answers about BestBikeFit4U online bike fitting: measurements, saddle height, setback, reach & drop, stack & reach, MTB/gravel/TT setups, pain troubleshooting, plans, exports, and safety guardrails.`
- NL page title:
  `BestBikeFit4U FAQ | Online bikefitting, zadelhoogte, framemaat & klachten oplossen`
- NL meta description:
  `Antwoorden over BestBikeFit4U online bikefitting: metingen, zadelhoogte, zadelterugstand, reach & drop, stack & reach, MTB/gravel/TT, klachten, abonnementen, exports en veiligheidsregels.`
- Existing FAQ page content already live on `/en/faq` and `/nl/faq`

## Approach
1. Audit and normalize existing EN/NL FAQ content into a clear typed content structure.
2. Render FAQ sections with semantic headings and native `<details>` accordions, aligned to current site UI patterns.
3. Apply exact EN/NL SEO metadata and locale alternates.
4. Inject locale-specific FAQPage JSON-LD and keep it synchronized with visible questions/answers.
5. Validate accessibility, content parity, and build quality.

## Acceptance Criteria
1. `/faq` renders a structurally improved FAQ for EN and NL based on existing page content.
2. Metadata title/description match provided values exactly per locale.
3. FAQ UI uses native `<details>/<summary>` accordion pattern.
4. JSON-LD FAQPage is present and aligned with visible FAQs per locale.
5. FAQ page follows existing website UI guidelines (spacing, typography, cards/sections, CTA style).
6. Lint/tests/build checks pass for changed files.

## Status
- Complete
- [x] Step 01: `01-structure-content-model.md` (`output-01-content-model.md`)
- [x] Step 02: `02-implement-faq-page-ui.md` (`output-02-faq-ui.md`)
- [x] Step 03: `03-add-seo-and-jsonld.md` (`output-03-seo-jsonld.md`)
- [x] Step 04: `04-validate-and-polish.md` (`output-04-validation.md`)
