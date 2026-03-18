# Prompt 03 — Use Cases Section

## Goal

Add a `/use-cases` content section that captures rider pain points and scenario-based search intent between informational guides and conversion pages.

## Repo Reality

- The existing guides system under `src/app/(public)/guides/*` is the correct pattern to copy
- The content should be file-backed, not Convex-backed
- Use cases belong in the `pages` sitemap section, not a new sitemap family

## Deliverables

1. Create `src/app/(public)/use-cases/data.ts`
2. Create `/use-cases` index and `/use-cases/[slug]` detail pages
3. Add article/FAQ structured data
4. Cross-link to calculators, guides, and product CTAs

## Suggested Initial Use Cases

- endurance cycling fit
- mountain biking fit
- gravel cycling fit
- triathlon bike fit
- commuter bike fit
- lower back pain cycling
- short torso bike fit
- tall rider bike fit

## Acceptance Criteria

- Pages are server-rendered and locale-aware
- Each use case has EN + NL copy, metadata, and related links
- New routes are represented in the pages sitemap
