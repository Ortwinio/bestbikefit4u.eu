# Prompt 04 — QA and Guideline Alignment Closeout

## Context

Read `plans/guide-guideline-alignment/README.md`. Tasks 01–03 must be complete.

## Checklist

Run `npx tsc --noEmit` and fix any type errors.

Then verify the following for at least 3 guides per cluster:

### Structure
- [ ] "How to measure" section renders as numbered steps
- [ ] "How to adjust" section renders as numbered steps
- [ ] "Warning signs" section is present and has 3–5 items
- [ ] "Variations by rider type" section is present
- [ ] "Practical recommendation" section renders as prose
- [ ] Hero description shows 2–3 sentence `heroIntro`, not the one-line `pageBrief`
- [ ] CTA description is guide-specific, not the generic fallback string

### Content
- [ ] Every guide has 4–6 FAQs
- [ ] FAQs are guide-specific, not generic cycling questions
- [ ] No nutrition or power guide contains bike-fit pain language
- [ ] "How to measure" sections include tools, steps, and common mistakes
- [ ] "Variations by rider type" sections give concrete, discipline-specific guidance

### Guideline minimum quality checklist (§16)
For each spot-checked guide, verify:
- [ ] Is the page solving one clear user problem?
- [ ] Is the introduction useful and specific?
- [ ] Does the page explain both why and how?
- [ ] Are the adjustment steps practical?
- [ ] Does it include warnings or common mistakes?
- [ ] Is the language easy to understand?
- [ ] Does it contain at least one strong internal link?
- [ ] Is there a relevant CTA?
- [ ] Does it reflect BestBikeFit4U's fit logic and positioning?
- [ ] Would a cyclist genuinely learn something useful from it?

## Acceptance

- `npx tsc --noEmit` passes
- All 10 checklist items pass for a representative sample of 3+ guides per cluster
- No regression in template fallback for slugs without authored content
