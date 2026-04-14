# Prompt 01 — Guide Content Schema and Engine Integration

## Context

Read `plans/guide-content-enrichment/README.md` first. Then read:
- `src/lib/guides/content.ts` — current template engine (`buildLeafSections`, `buildFaqs`)
- `src/lib/guides/backlog.ts` — `GuideBacklogEntry` type
- `src/app/(public)/guides/[slug]/page.tsx` — how sections and FAQs are consumed

## Task

### 1. Define the `GuideContent` type

Create `src/lib/guides/guide-content.ts` with:

```ts
export type GuideContentSection = {
  title: string;
  items: string[];
};

export type GuideContentFaq = {
  q: string;
  a: string;
};

export type GuideContent = {
  en: {
    intro: string[];
    sections: GuideContentSection[];
    faqs: GuideContentFaq[];
  };
  nl: {
    intro: string[];
    sections: GuideContentSection[];
    faqs: GuideContentFaq[];
  };
};

export const GUIDE_CONTENT: Record<string, GuideContent> = {
  // populated in subsequent tasks
};

export function getGuideContent(slug: string): GuideContent | undefined {
  return GUIDE_CONTENT[slug];
}
```

### 2. Update `buildLeafSections()` in `src/lib/guides/content.ts`

Add an optional `content?: GuideContent` parameter (or call `getGuideContent(entry.slug)` inside). When real content exists for the slug:
- Prepend an "Intro" section using `content[locale].intro` items
- Return `content[locale].sections` as the remaining sections
- Skip the template entirely

When no content exists: fall back to the existing template (unchanged).

### 3. Update `buildFaqs()` in `src/lib/guides/content.ts`

Same pattern: if `getGuideContent(entry.slug)` returns content with non-empty FAQs for the locale, return those. Otherwise fall back to the template.

### 4. Update `[slug]/page.tsx`

No changes needed to the page — sections and FAQs are already consumed via `buildLeafSections` and `buildFaqs`. Verify that passing an empty `GUIDE_CONTENT` still renders the template correctly.

## Acceptance

- `src/lib/guides/guide-content.ts` exists and exports `GUIDE_CONTENT` and `getGuideContent`
- `buildLeafSections` and `buildFaqs` use real content when available, template when not
- `npx tsc --noEmit` passes
- A guide slug with no entry in `GUIDE_CONTENT` renders the same as before this change
