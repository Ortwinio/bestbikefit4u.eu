# Output 01 - Content Architecture and Copy Mapping

## Route and Metadata Contract
- Route slug: `/why-bikefit-matters`
- File target (Step 03): `src/app/(public)/why-bikefit-matters/page.tsx`
- Meta title:
  `Why a good bike fit matters (comfort, power, injury prevention)`
- Meta description:
  `Real rider outcomes after a proper bike fit: less pain, fewer numb hands, better control, more efficiency. Learn why millimeters matter and what a fit actually changes.`

## Information Architecture (Final)
1. `H1` Why so many riders feel the difference after a good bike fit
2. Intro paragraph block
3. `H2` What riders notice after a proper fit
4. Top-20 quotes list section (single list with 20 items)
5. `H2` Why a bike fit works (and why millimeters matter)
6. Contact points subsection (feet, pelvis, hands/upper body)
7. `H2` The most common reasons riders feel immediate benefits
8. Numbered reason blocks (`H3`):
   - 1) Reduced pain and overload
   - 2) Better power transfer (without forcing an aggressive posture)
   - 3) Better control and confidence
   - 4) A position that matches your terrain
   - 5) Clarity: you get numbers you can repeat
9. `H2` What actually gets adjusted in a professional bike fit
10. Adjustments bullet list
11. Methods/principles bullet list (LeMond, Holmes, KOPS, Stack & reach)
12. `H2` When you should consider a fit
13. Trigger-signals bullet list
14. Bottom CTA section (same conversion intent as homepage final CTA)

## Content Constant Mapping (Implementation-Ready)
Proposed constant shape for Step 03:

```ts
type WhyBikefitMattersContent = {
  metadata: { title: string; description: string };
  h1: string;
  intro: string[];
  surpriseLine: string;
  ridersNoticeTitle: string;
  quotes: string[]; // exactly 20
  whyItWorksTitle: string;
  whyItWorksIntro: string;
  contactPointsTitle: string;
  contactPoints: string[];
  compensationParagraphs: string[];
  millimetersMatterParagraph: string;
  immediateBenefitsTitle: string;
  immediateBenefits: Array<{
    title: string;
    body: string[];
    bullets?: string[];
  }>;
  adjustedTitle: string;
  adjustedIntro: string;
  adjustedItems: string[];
  methodsTitle: string;
  methodsItems: string[];
  considerFitTitle: string;
  considerFitItems: string[];
  cta: { title: string; body: string; button: string };
};
```

## Quote Source of Truth Decision
- **Shared data**:
  - Reuse `HOME_QUOTES` from `src/content/homeQuotes.ts` for the page top-20 section.
  - Reason: avoids duplicate quote maintenance and guarantees homepage + content page parity.
- **Literal static page copy**:
  - All explanatory paragraphs, lists, and reason-block narratives from user draft.
- **Locale strategy for this feature scope**:
  - Implement English draft content as provided.
  - If locale routing loads `/nl/why-bikefit-matters`, fallback to English copy for this page in initial version (translation is out of current scope unless requested).

## Top-20 Quote Mapping (Exactly Once)
Top-20 section will render these IDs in order:
- Q01 = `HOME_QUOTES[0]`
- Q02 = `HOME_QUOTES[1]`
- Q03 = `HOME_QUOTES[2]`
- Q04 = `HOME_QUOTES[3]`
- Q05 = `HOME_QUOTES[4]`
- Q06 = `HOME_QUOTES[5]`
- Q07 = `HOME_QUOTES[6]`
- Q08 = `HOME_QUOTES[7]`
- Q09 = `HOME_QUOTES[8]`
- Q10 = `HOME_QUOTES[9]`
- Q11 = `HOME_QUOTES[10]`
- Q12 = `HOME_QUOTES[11]`
- Q13 = `HOME_QUOTES[12]`
- Q14 = `HOME_QUOTES[13]`
- Q15 = `HOME_QUOTES[14]`
- Q16 = `HOME_QUOTES[15]`
- Q17 = `HOME_QUOTES[16]`
- Q18 = `HOME_QUOTES[17]`
- Q19 = `HOME_QUOTES[18]`
- Q20 = `HOME_QUOTES[19]`

## Formatting Conventions
- Use paragraphs for explanatory body copy.
- Use ordered blocks for the 5 immediate-benefit sections.
- Use unordered bullet lists for:
  - contact points
  - adjustment outputs
  - method references
  - "when to consider a fit" triggers
- Keep quote list in a clear scannable style:
  - one quote per card/item
  - no truncation
  - preserve order in top-20 section

## Step 03 Build Notes
- Use `buildLocaleAlternates("/why-bikefit-matters", locale)` for metadata alternates.
- Keep final CTA style and route behavior aligned with homepage final CTA (`/login`, tracked CTA pattern).

