# 12 — Core marketing and content drafts

Drafts only. No app code, canvas publication or commit by this task. One board per subagent assignment; parent owns shared-footer reconciliation, renders and final checks.

## Shared shell

- Header follows `canvas/Pricing.dc.html`: 120 px margins, Calculators → BikeFit, Hoe het werkt → HowItWorks, Gidsen → Guides, Prijzen → Pricing, language pill and Login. Only HowItWorks has a current main-nav item in this set.
- Footer standard is defined in `drafts/HowItWorks.dc.html`, based on the five real columns in `src/components/layout/Footer.tsx:73` and Dutch labels in `src/i18n/messages/nl.ts:19`. Negative logo, all five columns, language links, copyright and matching scoped CSS are copied identically to every task-12 board.
- Header/footer language links go to the actual Dutch/English homepages, explicitly labelled as such; these Dutch drafts do not pretend to translate locally. Sitemap links to the real XML utility endpoint.
- Multiple guide/legal links share their planned template board from `audit/route-map.md`; GuideDetail/Legal/ScienceArticle content variants and yet-unpublished support boards are dependencies of later content tasks, not newly invented routes. Preserve the actual slug/locale destination when implementing.

## HowItWorks

- Route `/how-it-works`; source `src/app/(public)/how-it-works/page.tsx:82` Dutch hero, `:95` introduction, `:97` preparation and result, `:107` three steps, `:264` phase links, `:322` final CTA copy (`:340` / `:354` destinations).
- One static state, no review strip. Source has no FAQ, so none invented. House illustrations `01-racefiets.webp` and `06-meetset.webp`. Parent increased height to 3520 after detecting footer overflow.

## MeasurementGuide

- Route `/measurement-guide`; source `src/app/(public)/measurement-guide/page.tsx:221` hero, `:224` preparation, `:250` height, `:264` inseam, `:278` torso, `:294` arm, `:310` shoulders, `:326` femur, `:342` foot, `:238` recheck thresholds, `:244` CTA. Related tools/links at `:500`, `:513` and `:552`.
- Seven measures, each with its own endpoint diagram and short source-derived steps. Hero uses `06-meetset.webp`; diagrams are code-native, not unrelated stock imagery. One static state; no fabricated FAQ or review strip.
- Suggestion: commission anatomical house illustrations for these exact endpoints before app implementation; do not silently substitute generic bicycle art for measurement instructions.

## FitPass

- Route `/fit-pass`; source `src/app/(public)/fit-pass/page.tsx:100` hero/report proposition, `:185` paused introduction, `:107` three benefits (`:204` section intent), `:125` process (`:226` rendering), `:131` FAQs (`:254` rendering), `:273` final CTA.
- CTA/auth states from `src/components/features/fitpass/FitPassLandingCta.tsx:38` loading, `:48` existing Pro/Premium access, `:61` paused guest/member. Billing pause `src/config/billing.ts:1`; expired campaign `src/config/commercial.ts:5` omitted. `docs/BILLING_SUPPORT_NOTES.md` concerns reconciliation, not the pause wording.
- Four review states: guest, member, active, loading. Review strip outside the header. Native FAQs remain product disclosures; additional all-open render checks their full copy.
- Parent increased height to 3660 to contain every FAQ when open.
- Source process promises immediate new activation despite the pause. Draft instead labels activation unavailable and limits PDF download language to existing active users. Suggested source fix: align step two/final pitch/loading CTA with the current pause. No invented resume date or checkout.

## PainIndex

- Route `/pain`; source `src/app/(public)/pain/page.tsx:81` hero, `:131` disclaimer, `:147` usage steps, `:190` / `:203` tool links, `:249` complaint grid, `:288` final CTA.
- Five real Dutch complaint summaries from `src/content/painPages.ts:78` knee, `:161` back, `:244` neck, `:327` hands and `:411` saddle. No diagnosis or guaranteed relief claimed.
- One static state. Knee card opens `PainDetail.dc.html`; other complaint cards open their actual Dutch live slug pages, not the knee example under misleading labels. Stack/reach uses the actual Dutch science page until the science template has that variant. These intentional external links preserve content fidelity; future canvas variants can replace them.
- Parent adjusted height to 3060 for full footer containment.

## PainDetail

- Template `/pain/[slug]`, actual example **`knee-pain-cycling`** (`src/content/painPages.ts:33`). Dutch hero `:75`, symptoms `:81`, introductory causes `:80` and FAQ `:101`, pre-adjustment checklist `:93`, adjustments `:87`, FAQs `:99`, related content `:104`.
- Breadcrumb and CTA structure: `src/components/public/PainPointPageTemplate.tsx:71` through `:116`, final CTA `:205`. Safety wording: `src/components/content/FitDisclaimer.tsx:10`.
- One content state with native expandable FAQs; no invented review-only states. Medical escalation retains the source's physiotherapist/sports-physician guidance for acute, worsening or persistent pain, rather than promising a fitter can diagnose it. No original medical thresholds added.

## WhyBikeFit

- Route `/why-bikefit-matters`; source `src/app/(public)/why-bikefit-matters/page.tsx:170` Dutch hero, `:192` three contact points, `:198` repeated movement, `:213` five benefits, `:262` adjustments, `:273` methods, `:279` six signals (including source 60–90 min), `:430` related links and `:474` CTA.
- One static state; source has no FAQ. Benefits are qualified with “kan” rather than immediate guarantees. `HOME_QUOTES_BY_LOCALE` is deliberately not represented as verified customer testimony.
- Suggestions: establish testimonial provenance before restoring quotes; soften the source's certainty/instant-benefit claims; retain medical/complex-case limits from the brand guidance. Science/guide template destinations remain later-phase dependencies.

## BikeFittingLanding

- One Dutch design for `/bike-fitting` and `/bikefitting`. Content source `src/app/(public)/bikefitting/page.tsx:112` hero, `:150` benefits, `:190` online versus physical guidance, `:34` / `:218` related links, `:19` three FAQs, `:237` closing CTA, `:104` breadcrumb.
- Locale canonicals remain distinct: `/nl/bikefitting` (`bikefitting/page.tsx:16`) and `/en/bike-fitting` (`bike-fitting/page.tsx:16`). This template is not a redirect or merged canonical.
- One content state, native FAQs and an all-open render. Pricing link explicitly notes paused payments; no price or checkout invented. Parent height 3300 includes all expanded answers.

## BikeSetup

- Route `/fiets-afstellen`; source `src/app/(public)/fiets-afstellen/page.tsx:175` Dutch hero, `:195` start checklist, `:220` adjustment order, `:234` saddle height, `:258` saddle position, `:271` cockpit, `:288` reach/drop, `:300` cleats, `:315` riding context, `:325` online/physical fit choice, `:359` safety, `:372` ten FAQs, `:420` final CTA, `:1263` related calculators.
- Six ordered adjustment steps, all source section topics and ten shortened FAQs retained. Native disclosures, no artificial review strip. The long reference page is 6640 px high to contain all answers when open. FAQs start open for readable reference content without an empty lower page; visitors can collapse them. Default and explicit all-open PNGs provided.
- Source has no verified workshop tool kit or torque table. Do not invent one: current “tools” are the relevant calculators. Suggested follow-up: reviewed equipment/torque guidance before adding hardware instructions.

## Parent QA

- Both required checkers PASS for all eight drafts: 20 runtime states in total (13 FitPass auth/review states, one each for seven content pages). Native FAQ expansion is verified separately in browser renders, not counted as a DCLogic state.
- Shared-footer markup and scoped CSS match exactly across all eight boards. Footer SHA-256: `65f251bdb115ce81f5c1291fce2966454bc6555c7236078065d8877b3478c83b`; each rendered footer measures 1440 × 636.890625 px.
- One H1 per board, all illustration files present and loaded, all board links known to the route map. Planned content-template links are recorded as later-task dependencies, not asserted to be published.
- Parent normalized H1 size to brand 88 px and dark primary buttons on lime CTA panels. Root/preview heights were reconciled after actual layout and FAQ expansion, without clipping content.
- Fifteen 1440-wide PNGs in `drafts/_renders/`: eight default boards, three extra FitPass auth states, and all-open FAQs for FitPass, PainDetail, BikeFittingLanding and BikeSetup. Loaded all three brand fonts; checked product overflow, text clipping, unresolved bindings and button/input targets.
- Parent visually reviewed all eight page designs and their information hierarchy. No new commercial claims, reviews, prices, campaign dates or original medical instructions were introduced. Existing source/content limitations are recorded above for lead review.
- No app files or canvas snapshots changed by this task; no commit or publishing. Awaiting lead QA; no phase-4 gate claimed.
