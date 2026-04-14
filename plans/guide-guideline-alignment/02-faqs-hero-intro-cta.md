# Prompt 02 — Expand FAQs, Improve Hero Introductions and CTA Descriptions

## Context

Read `plans/guide-guideline-alignment/README.md`. Read the current content modules and the page template.

Read:
- `src/lib/guides/guide-content.ts` — type definitions; add `heroIntro` and `ctaDescription` fields here
- All five content modules (pain, ride-types, setup-parameters, shoe-foot-geometry, remaining-clusters)
- `src/app/(public)/guides/[slug]/page.tsx` — consume `heroIntro` and `ctaDescription`

## Part A — Expand FAQs to 4–6 per guide

Every guide currently has 2–3 FAQs. Add 2–3 more FAQs per guide to reach 4–6.

Good FAQs:
- Answer a real question a rider would type into a search engine
- Are specific to the guide topic (not generic cycling questions)
- Cover different angles: a measurement question, an "is this my problem?" question, a "how much / how long" question, and a "when to get help" question

Examples of good FAQ types:
- "What is a normal [X] range for a road rider?"
- "How do I know if [X] is causing my [symptom]?"
- "Does [X] affect [Y]?"
- "When should I see a professional fitter instead of adjusting myself?"

Write 2–3 additional FAQs per guide in both EN and NL and add them to the existing `faqs` arrays.

## Part B — Add `heroIntro` and `ctaDescription` fields

### 1. Extend the `GuideContentLocale` type in `src/lib/guides/guide-content.ts`

Add two optional fields:
```ts
export type GuideContentLocale = {
  heroIntro?: string;        // 2–3 sentence introduction for the hero area
  ctaDescription?: string;   // guide-specific CTA description
  intro: string[];
  sections: GuideContentSection[];
  faqs: GuideContentFaq[];
};
```

### 2. Write `heroIntro` for every guide (EN + NL)

The `heroIntro` replaces the one-line `pageBrief` in the `PublicHero` description. It should be 2–3 sentences that:
- State what the topic is
- Say why it matters to the rider
- Name who benefits most from reading it

Example for saddle height:
> "Saddle height sets the range of motion your leg works through on every pedal stroke. Getting it wrong by even a few millimetres can load the knee, reduce power transfer, or cause back and hip discomfort over longer rides. This guide is for riders who want to check their own height, understand the formulas, and know when they have found the right position."

### 3. Write `ctaDescription` for every guide (EN + NL)

Each guide's CTA band currently says: *"Use the context from this page, then continue into the best matching tool or workflow."*

Replace this with a guide-specific 1–2 sentence description that:
- Names the specific tool or next step
- Connects it to the guide's topic

Example for saddle height:
> "Use the Saddle Height Calculator to get your personal starting reference based on your inseam and riding style."

Example for knee pain:
> "Start your free fit to get a complete position check that covers saddle height, setback, and cockpit length in one guided flow."

### 4. Update `[slug]/page.tsx` to consume the new fields

In `GuidePage`:
- Pass `entry.heroIntro ?? entry.pageBrief` (or the content module's `heroIntro`) as the `description` prop to `PublicHero` for leaf pages
- Pass the `ctaDescription` to the `PublicCtaBand` `description` prop when available; fall back to the current generic string

To resolve the heroIntro: call `getGuideContent(slug)?.[locale].heroIntro` before falling back to `entry.pageBrief`.

Similarly for ctaDescription: call `getGuideContent(slug)?.[locale].ctaDescription` before falling back to the current generic string.

## Acceptance

- Every guide has 4–6 FAQs in both EN and NL
- `GuideContentLocale` type has optional `heroIntro` and `ctaDescription`
- Every guide content entry has `heroIntro` and `ctaDescription` in both EN and NL
- `PublicHero` on leaf guide pages shows the `heroIntro` (2–3 sentences) rather than the one-line `pageBrief`
- CTA band shows guide-specific description rather than the generic fallback
- `npx tsc --noEmit` passes
