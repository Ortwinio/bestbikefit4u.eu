# Prompt 06 — Authority Content Pages

## Goal

Strengthen head-term coverage by expanding the existing guide collection with a few deeper evergreen guides.

## Repo Reality

- `src/app/(public)/guides/data.ts` already powers guide index/detail pages
- The simplest safe implementation is to add new entries to that dataset
- Any new guide must include EN and NL copy, FAQs, and related links

## Candidate Guides

1. `complete-bike-fitting-guide`
2. `optimal-tire-pressure-guide`
3. `road-vs-gravel-bike-fit`

## Acceptance Criteria

- New guides appear automatically on `/guides` and `/guides/[slug]`
- Each guide has strong metadata, FAQ schema eligibility, and related links to calculators/use cases
- Sitemap coverage continues to come from `GUIDE_SLUGS`
