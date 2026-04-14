# Prompt 01 — Add Missing Structural Sections to All Guides

## Context

Read `plans/guide-guideline-alignment/README.md` first. Read the full writing guideline provided in context (it defines sections §6.6–§6.10).

Read:
- `src/lib/guides/guide-content.ts` — type definitions
- `src/lib/guides/content/pain-discomfort.ts`
- `src/lib/guides/content/ride-types.ts`
- `src/lib/guides/content/setup-parameters.ts`
- `src/lib/guides/content/shoe-foot-geometry.ts`
- `src/lib/guides/content/remaining-clusters.ts`

## What to add

The `GuideContent` type currently has `sections: GuideContentSection[]`. Each guide needs these additional section types added to its `sections` array (in this order, after any existing topical sections):

1. **"How to measure"** — Step-by-step measurement instructions. For each guide:
   - List the tools needed (e.g. tape measure, plumb line, friend to help)
   - Give 3–5 numbered steps the rider can follow at home
   - Note the most common measurement mistake
   - *Skip this section only for guides where measurement is not applicable (e.g. fueling basics, FTP explained)*

2. **"How to adjust"** — Adjustment sequence. For each guide:
   - What to change
   - In what order
   - How much at a time (with specific mm or degree increments where relevant)
   - What to test after each change and for how many rides
   - *Format: sequential steps, not just a bullet list of tips*

3. **"Warning signs"** — What to watch for. For each guide:
   - 3–5 specific symptoms that indicate the parameter may be wrong
   - Frame as fit-related possibilities, not medical diagnoses
   - Include at least one "escalate to a fitter or clinician" signal
   - *Pain cluster guides already have some of this — expand rather than duplicate*

4. **"Variations by rider type"** — How the same parameter differs across disciplines. For each guide:
   - Cover at least: road vs gravel vs MTB (or endurance vs race vs triathlon where more relevant)
   - Keep it concrete: "Road riders typically..., gravel riders often..., MTB riders..."
   - *Skip for nutrition and power guides — use training context instead (beginner vs experienced, short vs long rides)*

5. **"Practical recommendation"** — Closing action guidance. For each guide:
   - Where to start (the single most important first check)
   - When a calculator is enough vs when a full fit is better
   - One sentence on what to do next
   - *This should feel like a direct answer, not a generic wrap-up*

## Section title naming

Use these exact titles (EN):
- "How to measure"
- "How to adjust"
- "Warning signs"
- "Variations by rider type"
- "Practical recommendation"

NL equivalents:
- "Hoe je het meet"
- "Hoe je het afstelt"
- "Waarschuwingssignalen"
- "Verschillen per rijtype"
- "Praktische aanbeveling"

## Example: saddle height guide

```ts
{
  title: "How to measure",
  items: [
    "You need: a tape measure, a hard chair or box to sit on, and ideally someone to help read the measurement.",
    "Step 1: Stand barefoot on a hard floor with feet hip-width apart. Measure your inseam from the floor to the crotch using a book held firmly against the pubic bone.",
    "Step 2: On the bike, set the saddle height to inseam × 0.883 as a starting reference, measured from the center of the bottom bracket to the top of the saddle rail center.",
    "Step 3: Clip in and pedal at low resistance. At the bottom of the stroke, your heel should just rest on the pedal with the leg almost fully extended. If you have to rock the hips, lower the saddle.",
    "Common mistake: measuring inseam in soft-soled shoes or while slightly bent at the hip, which underestimates true inseam."
  ]
},
{
  title: "How to adjust",
  items: [
    "Start from your calculated reference height and move in 2–3 mm steps only.",
    "Test each change over at least 2 rides that include both easy spinning and some harder efforts.",
    "If you raise the saddle and hips start rocking, you have gone too far — drop 2 mm.",
    "If you lower the saddle and the knee feels cramped at the top of the stroke, raise 2 mm.",
    "Do not change saddle setback at the same time as height; changing both makes it impossible to know which change caused which result."
  ]
},
{
  title: "Warning signs",
  items: [
    "Hip rocking side to side during steady pedaling: saddle is likely too high.",
    "Persistent tightness or ache behind the knee after rides: over-extension, check if saddle is too high.",
    "Burning or pressure at the front of the knee, especially on climbs: saddle may be too low.",
    "Numbness in the feet that develops over longer rides: can be related to saddle height affecting pelvic stability and foot loading.",
    "Pain that is sharp, one-sided, or does not improve after 3–4 rides with a corrected height: involve a professional fitter or clinician."
  ]
},
{
  title: "Variations by rider type",
  items: [
    "Road riders optimising for efficiency often use the higher end of the saddle height range, where leg extension is near maximum without hip rocking.",
    "Gravel and endurance riders sometimes run 2–5 mm lower than their road height to improve stability and reduce fatigue on rough terrain and longer days.",
    "MTB riders typically set saddle height slightly lower for seated climbing traction, and many use a dropper post so the saddle can be raised for flats and lowered for descents.",
    "Triathlon and TT riders sometimes find a slightly higher saddle works because the forward saddle position changes the effective leg extension relative to the pedal."
  ]
},
{
  title: "Practical recommendation",
  items: [
    "Start with the inseam × 0.883 formula as your first reference, then validate by feel over 2–3 rides before making further changes.",
    "A simple saddle height calculator is enough for most riders to get close. A full fit is worth it if you are still experiencing knee pain or pelvic instability after 3–4 careful adjustments.",
    "Check saddle height before changing setback or cockpit length — get this right first."
  ]
}
```

Apply the same depth and specificity to all other guides in all five content modules.

## Acceptance

- All guides in all five content modules have all five new sections (or an explicit skip with rationale in a comment)
- Section content references specific numbers, angles, or increments where applicable
- Both EN and NL versions are complete for every new section
- `npx tsc --noEmit` passes
