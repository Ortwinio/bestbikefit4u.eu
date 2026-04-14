# Prompt 05 — Shoe/Foot/Cleat + Bike Size & Geometry Cluster Content

## Context

Read `plans/guide-content-enrichment/README.md`. Task 01 must be complete.

Read:
- `src/lib/guides/guide-content.ts` — add entries here
- `docs/bestbikefit4u_guides_cms_backlog_v1_en.csv` — slugs and briefs

## Task

Write real EN + NL guide content for the Shoe/Foot/Cleat and Bike Size & Geometry clusters.

---

### Shoe / Foot / Cleat guides

**`foot-measurement-guide-for-cyclists`**
- Focus: how to measure foot length and width at home accurately; left-right asymmetry; when to measure (end of day); the relationship between shoe size and fit
- Sections: "How to measure foot length correctly", "Width and volume: the often-ignored dimensions", "Left-right differences: when they matter", "Translating measurements to shoe size"
- FAQs: "When is the best time of day to measure my feet?", "My feet are different sizes — which shoe size do I buy?", "Does cycling shoe sizing match regular shoe sizing?"

**`cycling-shoe-fit-width-and-last-guide`**
- Focus: the last (shoe shape) as the primary fit variable; volume and vamp height; why stiff soles need better fit than soft-sole shoes; common width and volume issues
- Sections: "What 'last' means and why it matters", "Width and volume mismatches: symptoms and solutions", "Boa vs velcro vs lace closure for fit adjustability", "When shoes are the problem, not the cleat"
- FAQs: "How do I know if my cycling shoes are too narrow?", "Does a stiff sole make shoe fit more critical?", "Should I go up a size if my shoes feel tight?"

**`cleat-position-basics-guide`**
- Focus: the ball-of-foot landmark; fore-aft as the most impactful variable; float and rotation as comfort variables; what neutral setup means before chasing marginal adjustments
- Sections: "Fore-aft position: placing the cleat under the first metatarsal", "Rotation and float: starting neutral", "Heel in vs heel out: the Q-factor relationship", "How to check your cleat position without a professional"
- FAQs: "What is the correct fore-aft cleat position?", "Should I use zero-float or float cleats?", "How often do cleats need to be replaced?"

**`stance-width-q-factor-and-pedal-spacer-guide`**
- Focus: Q-factor as the distance between pedal spindle faces; how it relates to hip width; when to add spacers; how MTB and road Q-factor differ
- Sections: "What Q-factor is and what it affects", "Hip width and ideal stance width", "Pedal spacers: when and how much", "Road vs MTB Q-factor differences"
- FAQs: "How do I know if my Q-factor is too narrow or too wide?", "Will adding spacers fix knee tracking?", "Does Q-factor affect saddle height?"

**`insoles-arch-support-and-footbeds-guide`**
- Focus: the difference between arch support and volume fill; when stock insoles are sufficient; the risk of over-correction; heat-mouldable vs custom orthotics
- Sections: "What insoles can and can't do for bike fit", "Stock vs aftermarket insoles: when to upgrade", "Arch height and power transfer", "When to see a podiatrist"
- FAQs: "Do insoles help with hot foot?", "Can insoles change my cleat position needs?", "Are custom orthotics worth it for cycling?"

---

### Bike Size & Geometry guides

**`frame-size-guide`**
- Focus: why size labels (S/M/L or cm) are unreliable; stack and reach as the real comparison metrics; standover as a secondary check; what to do when a bike is between sizes
- Sections: "Why frame size labels mislead", "Stack and reach: what to compare instead", "Standover and top tube length: secondary checks", "Between sizes: how to decide"
- FAQs: "How do I find the right frame size using stack and reach?", "Can a stem compensate for a frame that's the wrong size?", "Is standover height important for road bikes?"

**`road-vs-endurance-vs-race-geometry`**
- Focus: what actually differs geometrically between race, endurance, and sportive frames; how the same rider needs different cockpit setups across categories; common misconceptions
- Sections: "Race geometry: what it means in practice", "Endurance geometry: longer head tube, shorter top tube", "How geometry affects what components you can use", "Choosing a geometry category for your goals and flexibility"
- FAQs: "Can I ride an endurance bike as fast as a race bike?", "What geometry suits a new road rider?", "Does frame geometry matter if I'm adjusting my fit anyway?"

**`how-to-compare-two-bikes-for-fit`**
- Focus: a structured process for comparing two shortlisted bikes using stack, reach, and cockpit adjustability; the fit-risk assessment when swapping bikes
- Sections: "Step 1: Compare stack and reach numbers", "Step 2: Check cockpit adjustability range", "Step 3: Calculate effective reach with different stems", "Step 4: Assess fit risk and transition adjustment"
- FAQs: "If two bikes have the same stack and reach, will they fit the same?", "How much can I adjust a bike after buying it?", "Should I buy the geometry that fits now or the geometry that fits my goal position?"

For every guide: provide equivalent NL content.

## Acceptance

- All Shoe/Foot/Cleat and Bike Size & Geometry leaf guides have entries in `GUIDE_CONTENT`
- Shoe/foot content references shoe-specific concepts (last, vamp, Boa); geometry content references geometry numbers (stack, reach)
- `npx tsc --noEmit` passes
