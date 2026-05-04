# Prompt 06 — Wrap Privacy and Terms pages in PublicPageShell

## Context

`src/app/(public)/privacy/page.tsx` and `src/app/(public)/terms/page.tsx` are bare HTML pages — no `PublicPageShell`, no `PublicHero`, no component library usage at all. They use plain `<div>`, `<h1>`, `<h2>`, `<p>` with inline Tailwind classes. They look like leftover legal boilerplate rather than integrated public pages.

The fix is minimal: wrap both pages in `PublicPageShell` and add a `PublicHero` for the title + description. The existing content sections (paragraphs, headings) can remain as prose — no need to convert them to card-based components.

## Task

For both `privacy/page.tsx` and `terms/page.tsx`:

1. **Add `PublicPageShell` as the outer wrapper**, replacing the current outermost `<div>`.

2. **Add `PublicHero` at the top** with:
   - `eyebrow`: `"BestBikeFit4U"` (both pages)
   - `title`: existing `<h1>` text (e.g. "Privacy Policy" / "Terms of Service" / their NL equivalents)
   - `description`: first introductory paragraph of the page

3. **Remove the now-redundant `<h1>` and opening paragraph** from the body since they've moved into `PublicHero`.

4. **Leave all remaining content as-is** — prose paragraphs, section headings, lists. Only add a `<div className="prose prose-sm max-w-none mt-8">` wrapper around the remaining body content if one doesn't already exist, to give legal prose consistent line-height and spacing.

5. Add a simple `PublicCtaBand` at the bottom of each page with a link back to the calculator or homepage:
   - Privacy: CTA → `/calculators/bike-fit`, label "Back to the calculator"
   - Terms: CTA → `/`, label "Back to the homepage"

## Imports to add

```ts
import { PublicCtaBand, PublicHero, PublicPageShell } from "@/components/public";
```

## Verification

- Both pages render with consistent `PublicPageShell` outer container and `PublicHero` header.
- Legal content is still fully readable.
- `npx tsc --noEmit` passes.
