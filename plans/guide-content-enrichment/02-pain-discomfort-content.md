# Prompt 02 — Pain & Discomfort Cluster Content

## Context

Read `plans/guide-content-enrichment/README.md` and `plans/guide-content-enrichment/01-content-schema.md` first. Task 01 must be complete (the `GUIDE_CONTENT` record and integration must exist).

Also read:
- `src/lib/guides/guide-content.ts` — add entries here
- `docs/bestbikefit4u_guides_cms_backlog_v1_en.csv` — reference for slugs, briefs, and related links
- `src/app/(public)/guides/data.ts` — the old curated content for knee pain and lower back pain that can serve as a starting point

## Task

Write real EN + NL guide content for all Pain & Discomfort cluster guides. Add each as an entry in `GUIDE_CONTENT` in `src/lib/guides/guide-content.ts`.

### Guides to write

**`bike-fitting-for-knee-pain`**
- EN intro: What causes knee pain from a fit perspective; why saddle height is the first variable; the difference between anterior and posterior knee pain patterns
- EN sections: "What type of knee pain you have" (anterior vs posterior, medial vs lateral, their most likely fit causes), "Saddle height: the first check" (how to identify over- or under-extension, the 25-35° recommended knee angle, testing approach), "Saddle setback and pedaling line" (KOPS reference, signs of too-far-forward or backward setback), "Reach and cleat factors" (secondary checks after saddle is dialed)
- EN FAQs: "Anterior vs posterior knee pain — what's the difference for bike fit?", "How much should I change saddle height at once?", "When does knee pain require a professional fitter or physio?"

Migrate and expand the existing content from `src/app/(public)/guides/data.ts` for this guide.

**`bike-fitting-for-lower-back-pain`**
- EN intro: How reach and drop load the lower back; pelvic tilt as the mechanism; why core stability matters as much as bar height
- EN sections: "Why lower back pain appears on longer rides" (fatigue-dependent pelvic tilt, progressive overload), "Cockpit length and drop: the primary levers" (how to assess current reach vs flexible reach, rule of thumb for drop reduction), "Saddle height and pelvic stability" (under-saddle height as a lower-back driver), "Core and flexibility: what fitting can't fix alone"
- EN FAQs: "Does raising the handlebars always fix lower back pain?", "How do I know if my reach is too long?", "Is lower back pain on the bike always a fit problem?"

**`bike-fit-for-neck-and-shoulder-pain`**
- EN intro: Neck and shoulder overload is usually a reach and weight-distribution problem, not just bar height; how forward head position builds up under fatigue
- EN sections: "Where the load comes from" (arm extension angle, shoulder elevation, neck extension), "Reach as the primary driver" (stem length, bar shape, hood position), "Bar height vs reach: which to change first", "Hood angle and lever reach" (how poorly positioned hoods force wrist and shoulder compensation)
- EN FAQs: "Should I shorten my stem or raise my bars first?", "Why does neck pain only appear after 2+ hours?", "Can handlebar width cause shoulder pain?"

**`bike-fit-for-hand-numbness-and-wrist-pain`**
- EN intro: Hand numbness is almost always a pressure or wrist-angle problem; the ulnar and median nerve pathways; why gloves and bar tape treat symptoms, not the cause
- EN sections: "Pressure distribution at the contact point" (weight on hands from too-long reach, dropped wrist angle), "Hood position and wrist angle" (neutral wrist vs extended/flexed, how to assess), "Bar width and grip width" (how shoulder-width bar matching reduces grip tension), "When to suspect something other than fit"
- EN FAQs: "Does bar tape thickness reduce hand numbness?", "Which nerve is usually affected?", "How quickly should numbness clear after a fit change?"

**`bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores`**
- EN intro: Saddle pressure problems combine three variables: saddle shape, tilt, and rider position over it; changing any one in isolation often fails
- EN sections: "Saddle tilt: the most over-adjusted variable" (nose-up vs nose-down, 0-2° range, the gender difference), "Saddle setback and pelvic rocking" (forward slide under load as a tilt signal), "Saddle width and sit-bone support" (how to measure, the 20–30mm wider rule), "When saddle choice matters more than position"
- EN FAQs: "How do I measure my sit-bone width at home?", "Does saddle height affect perineal pressure?", "When is saddle pressure a medical issue rather than a fit issue?"

**`bike-fit-for-foot-pain-hot-foot-and-numb-toes`**
- EN intro: Foot pain during cycling is primarily a shoe-fit and cleat problem, not a pedal or bike-frame problem; the metatarsal head under the cleat is the key pressure point
- EN sections: "Hot foot: causes and first checks" (cleat position fore-aft, stiff sole focus point, shoe width), "Numb toes: the circulation mechanism" (shoe closure over-tightening, vamp fit, temperature)", "Cleat fore-aft position" (ball-of-foot standard vs mid-foot, testing protocol), "When foot pain signals a need for wider shoes or insoles"
- EN FAQs: "What is the correct cleat fore-aft position?", "Can orthotics help with hot foot?", "Why does foot pain get worse as the ride goes on?"

For every guide above: provide equivalent NL content. The NL content should be a natural translation with idiomatic Dutch — not a literal word-for-word translation.

## Acceptance

- All 6 Pain & Discomfort leaf guides have entries in `GUIDE_CONTENT`
- Each entry has EN and NL content with intro (2-3 items), sections (3-5 sections of 2-4 items each), and FAQs (2-4 items)
- Content is specific and actionable (references real ranges, angles, or sequences where appropriate)
- `npx tsc --noEmit` passes
