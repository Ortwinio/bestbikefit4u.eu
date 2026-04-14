# Prompt 04 — Setup Parameters Cluster Content

## Context

Read `plans/guide-content-enrichment/README.md`. Task 01 must be complete.

Read:
- `src/lib/guides/guide-content.ts` — add entries here
- `docs/bestbikefit4u_guides_cms_backlog_v1_en.csv` — slugs and briefs

## Task

Write real EN + NL guide content for all Setup Parameters cluster guides. These guides explain individual fit output variables in depth — readers are typically doing or reviewing a specific fit parameter.

### Guides to write

**`saddle-height-guide`**
- Focus: measurement methods (LeMond, Holmes, inseam × 0.883), validation by feel, the difference between static and dynamic methods, what over- and under-extension look like
- Sections: "How saddle height is calculated" (formula overview, why methods differ by 5–8mm, which to trust), "Validating saddle height by feel" (signs of too-high, too-low), "Dynamic vs static measurement" (why a static test may not match what you feel riding), "Fine-tuning in small increments" (2–3mm steps, how many rides to test)"
- FAQs: "What is the LeMond saddle height formula?", "Why does my saddle height feel right but still cause knee pain?", "How do I know I've reached the right saddle height?"

**`saddle-fore-aft-and-tilt-guide`**
- Focus: KOPS as a starting point, not a rule; pelvic angle as the output to optimise; tilt sensitivity; the relationship between setback and saddle height
- Sections: "Setback: what it controls and what it doesn't", "KOPS: a starting point, not a law", "Tilt: the small angle that changes everything", "How setback and saddle height interact"
- FAQs: "What is KOPS and should I follow it?", "How do I measure saddle tilt accurately?", "Does saddle setback affect knee pain?"

**`reach-and-stem-guide`**
- Focus: total cockpit length as the variable (frame reach + stem + bar shape + hood position); why changing stem alone often fails; stack as the pairing variable
- Sections: "Total cockpit length: what actually matters", "Frame reach as the constraint", "Stem length and angle: the adjustment tool", "Bar shape, flare, and how they affect effective reach"
- FAQs: "How do I measure my total cockpit length?", "Should I change stem length or stem angle first?", "Why does a shorter stem alone not always fix lower back pain?"

**`handlebar-drop-guide`**
- Focus: drop as a function of hip flexor length and core stability, not ambition; stack vs drop as independent variables; progressive adaptation
- Sections: "What handlebar drop actually measures", "Hip angle and flexible reach: the real limits", "Stack and drop as a pair", "Adapting to more drop progressively"
- FAQs: "What is a normal handlebar drop range?", "Why does adding spacers not always reduce back pain?", "How do I know if I have too much drop?"

**`crank-length-guide`**
- Focus: crank length as a hip-angle variable at top of stroke, especially relevant for triathlon and riders with limited hip flexion; the practical range (165–175mm) and when to deviate
- Sections: "Why crank length matters (and when it doesn't)", "Hip angle at top of stroke: the key variable", "Short cranks for triathlon and hip-limited riders", "Changing crank length: what else to re-check"
- FAQs: "Should most riders change their crank length?", "How does crank length affect knee pain?", "If I change crank length, does saddle height change too?"

**`handlebar-width-and-hood-position-guide`**
- Focus: shoulder-width matching as the baseline; how too-narrow or too-wide bars affect breathing, shoulder tension, and control; hood angle and lever reach as secondary variables
- Sections: "Bar width: matching to shoulder width", "How bar width affects breathing and shoulder position", "Hood angle: rotation and lever reach", "Wide vs narrow bars for different disciplines"
- FAQs: "How do I measure the correct bar width for me?", "Should gravel bars be wider than road bars?", "How does hood angle affect wrist pain?"

For every guide: provide equivalent NL content.

## Acceptance

- All 6 Setup Parameters leaf guides have entries in `GUIDE_CONTENT`
- Content includes specific numbers, angles, or ranges where relevant (these are parameter reference guides)
- `npx tsc --noEmit` passes
