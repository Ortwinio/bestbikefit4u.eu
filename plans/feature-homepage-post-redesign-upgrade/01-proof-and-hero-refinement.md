# Prompt 01 — Proof And Hero Refinement

## Context

Read:

- `plans/feature-homepage-post-redesign-upgrade/README.md`
- `plans/homepage-redesign/README.md`

The existing hero cleanup should be preserved. This phase improves hierarchy and persuasion without reintroducing duplicate messaging.

## Task

Strengthen the top of the homepage so the transition from hero to body feels more confident and the hero’s support content reads as deliberate proof rather than leftover decoration.

## Deliverables

### 1. Strengthen `ProofBar`

Review `src/components/home/ProofBar.tsx` and improve its hierarchy.

Goals:

- more vertical breathing room
- stronger scale for trust text
- clearer stat emphasis
- better handoff from hero into the first content section

Do not simply make it taller without improving the reading order.

### 2. Improve hero trust-card identity

Review the three trust cards inside `src/components/home/HeroBlock.tsx`.

Improve them so they read as a distinct proof row, not just more text on the same glass surface.

Acceptable moves:

- icon + text pairing
- stronger text hierarchy
- spacing/layout changes
- better card differentiation within the existing design system

### 3. Upgrade hero secondary CTA copy

Replace the current comparison-style secondary CTA wording with more benefit-driven copy in EN/NL.

The label should create curiosity about value and outcomes, not just “compare plans”.

### 4. Add hesitation-reduction microcopy near the hero CTA cluster

Add one short microcopy line that reduces signup/payment anxiety.

Examples of the type of message:

- no credit card required
- stop whenever you want
- start free first

Use only claims the product can actually support.

## Constraints

- Keep only one primary CTA in the hero.
- Do not reintroduce campaign-card duplication in the hero.
- Reuse existing icons and primitives where possible.
- Keep the hero visually bold, but do not overload it with extra paragraphs.

## Completion Checklist

- [x] `ProofBar` reads as a meaningful trust section, not a footnote.
- [x] Hero trust cards have clearer visual identity.
- [x] Hero secondary CTA copy is stronger and benefit-driven.
- [x] A short anxiety-reduction microcopy line is visible near the hero CTA cluster.
- [x] EN/NL copy remains aligned.
