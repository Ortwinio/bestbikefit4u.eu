# Prompt 01 — Shared JSON-LD Structured Data

## Goal

Replace the current page-by-page JSON-LD duplication with a shared SEO utility layer and apply it to the existing public calculators, guide pages, homepage, and FAQ-capable pages.

## Repo Reality

- The repo already has JSON-LD on several pages, but it is inconsistent and duplicated
- The homepage already emits `Organization` and `WebSite`
- Guides already emit `Article` and `FAQPage`
- Calculators currently only emit minimal `WebApplication` schema

## Deliverables

1. Create `src/lib/seo/jsonLd.ts` with reusable schema builders
2. Create `src/components/seo/JsonLd.tsx`
3. Migrate existing public pages to use the shared builders where that reduces duplication
4. Add richer schema coverage to calculators and FAQ-bearing pages

## Acceptance Criteria

- No page needs to hand-roll basic JSON-LD objects if the shared builder already covers the use case
- Structured data remains server-rendered
- Existing schema coverage is preserved or improved, not reduced
