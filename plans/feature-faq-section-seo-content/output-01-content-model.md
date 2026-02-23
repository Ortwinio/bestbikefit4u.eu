# Output 01 - FAQ Content Model

## Audit Summary (Current State)
- Source file: `src/app/(public)/faq/page.tsx`
- Current model already centralized in one `content: Record<Locale, FAQCopy>`.
- Locale coverage:
  - `en` and `nl` are both present.
  - Section parity exists (4 categories each, aligned by intent).
- Structural gaps against target plan:
  - FAQ items currently render as static `dl/dt/dd` cards, not native `<details>/<summary>` accordions.
  - Requested SEO metadata (new EN/NL title+description) not yet applied.
  - FAQPage JSON-LD is not present.

## Finalized Content Model (Implementation-Ready)
Proposed normalized model for Step 02/03:

```ts
type FaqQuestion = {
  id: string; // stable key for rendering + schema sync
  question: string;
  answer: string;
};

type FaqGroup = {
  id: string; // e.g. getting_started, measurements
  title: string;
  items: FaqQuestion[];
};

type FaqSeo = {
  title: string;
  description: string;
  keywords?: string[];
};

type FaqPageCopy = {
  seo: FaqSeo;
  title: string;
  intro: string;
  groups: FaqGroup[];
  guideTitle: string;
  guideBody: string;
  guideLinks: Array<{ href: string; label: string }>;
  cta: {
    title: string;
    subtitle: string;
    contactLabel: string;
    startLabel: string;
  };
};
```

Implementation container:

```ts
const faqByLocale: Record<Locale, FaqPageCopy> = { en: ..., nl: ... };
```

## EN/NL Structural Mapping
- Current EN categories:
  - `Getting Started`
  - `Bike Fitting`
  - `Results and Reports`
  - `Account and Pricing`
- Current NL categories:
  - `Aan de slag`
  - `Bikefitting`
  - `Resultaten en rapporten`
  - `Account en prijzen`

Parity decision:
- Keep one-to-one category mapping by `id` across locales.
- Keep same question ordering per category to simplify schema sync and QA.

## Duplication Cleanup Strategy
- Consolidate repeated shape definitions around one normalized `FaqGroup/FaqQuestion` model.
- Keep locale copy separate by value only, not by structure.
- Move render-time assumptions (accordion vs card) out of content data; keep data UI-agnostic.

## JSON-LD Synchronization Strategy
- Build schema from visible `groups/items` data to avoid drift.
- Per locale:
  - output `FAQPage` with `mainEntity` derived from rendered questions/answers.
- Mapping function:

```ts
function buildFaqJsonLd(groups: FaqGroup[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
  };
}
```

## UI-Structure Contract for Step 02
- Keep page scaffolding consistent with existing public pages.
- Render FAQ items with native semantic accordion:
  - `<details>`
  - `<summary><strong>Question</strong></summary>`
  - `<p>Answer</p>`
- Preserve guide links + final CTA block, styled according to current website patterns.

## Step 03 SEO Contract
- Replace current metadata with provided EN/NL values exactly.
- Maintain `buildLocaleAlternates("/faq", locale)`.
- Inject locale-specific JSON-LD generated from the same FAQ data source.

