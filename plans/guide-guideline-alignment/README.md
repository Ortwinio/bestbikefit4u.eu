# Guide Guideline Alignment

## Goal

Bring every guide page into full conformance with the BestBikeFit4U guide page writing guideline. The content enrichment sprint (goal 08) replaced template filler with real bike-fit knowledge. This sprint adds the structural sections, depth, and rendering capabilities the guideline requires but that are currently missing.

## Background

A full audit against the writing guideline found the following gaps across all guide pages:

1. **Introduction too thin** — hero shows a one-line `pageBrief`; the intro paragraphs are buried below the fold in the first section card
2. **Missing structural sections** — no dedicated "How to measure", "How to adjust", "Warning signs", or "Variations by rider type" sections
3. **No practical recommendation wrap-up** — no "where to start / what to test first" section before the CTA
4. **FAQ count too low** — 2–3 per guide vs 4–6 recommended
5. **Generic CTA descriptions** — same text on every guide regardless of topic
6. **Rendering format limits content richness** — card-per-bullet prevents tables and multi-line prose blocks
7. **No visuals** — zero illustrations or diagrams (tracked separately, requires design input)

## Scope

**In scope:**
- Add missing sections to all guides in the content modules
- Expand FAQs to 4–6 per guide
- Improve hero introductions (promote the authored intro paragraphs to the `PublicHero` description)
- Add guide-specific CTA descriptions to the page template
- Update the page template to support richer section rendering (prose paragraphs, optional tables)

**Out of scope:**
- Visual/illustration design and implementation (tracked separately)
- Adding new guide slugs or clusters
- Changing routing, URLs, or the CSV backlog

## Tasks

| ID | Title | Depends on |
|----|-------|-----------|
| 044 | Add missing structural sections to all guides | — |
| 045 | Expand FAQs and improve hero introductions + CTA descriptions | — |
| 046 | Enable richer content rendering in the page template | — |
| 047 | QA guideline alignment closeout | 044, 045, 046 |

## Acceptance criteria

- Every guide has dedicated "How to measure", "How to adjust", "Warning signs / risks", "Variations by rider type", and "Practical recommendation" sections (or an explicit note where a section is not applicable to the topic)
- Every guide has 4–6 FAQs
- Hero description shows 2–3 sentences (not the one-line pageBrief)
- CTA descriptions are guide-specific, not generic
- Page template supports prose paragraphs and optional tables
- `npx tsc --noEmit` passes
- Guideline minimum quality checklist passes for all guides
