# Prompt 07 — Standard guide page template with conversion zones

## Context

This prompt redesigns the guide page template (`src/app/(public)/guides/[slug]/page.tsx`) to:
1. Render `libraryBody` Markdown imported via Prompt 06
2. Show the hero image
3. Structure four conversion zones aligned with the visitor-to-account strategy
4. Apply a consistent, opinionated layout for every guide page (leaf and hub)

Read the full "Standard Guide Page Template" and "Visitor-to-Account Conversion Strategy" sections in the plan README before starting. Complete Prompts 01, 02, and 06 first.

## Dependencies

Install `react-markdown` and `remark-gfm` if not already in the project:
```bash
pnpm add react-markdown remark-gfm
```

## What to implement

### 1. Markdown renderer component (`src/components/content/GuideBodyMarkdown.tsx`)

A client-safe server component that renders `libraryBody` Markdown with styled components:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface GuideBodyMarkdownProps {
  content: string;
}

export function GuideBodyMarkdown({ content }: GuideBodyMarkdownProps) {
  return (
    <div className="guide-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // h2: full-width section heading
          // h3: sub-heading
          // p: muted prose paragraph
          // ul / ol: styled lists
          // table: responsive overflow container
          // a: internal Link when relative, <a> when external
          // blockquote: left-border accent
          // strong: bold foreground
          // code (inline): mono pill
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

All Markdown rendering targets: h2, h3, p, ul, ol, li, table, thead, tbody, tr, th, td, a, blockquote, strong, em, code, hr. Styles must match the existing Prototyper UI design tokens (use `text-muted-foreground`, `text-foreground`, `border-border/70`, `bg-card`, `text-primary`, etc.).

**Important:** `a` elements — use Next.js `Link` for relative paths (starting with `/`), plain `<a target="_blank" rel="noopener noreferrer">` for external. Never use `<a>` for internal links.

### 2. Quick answer extractor (`src/lib/guides/markdown-utils.ts`)

Utility functions that extract structured blocks from Markdown at render time:

```ts
export type QuickAnswer = {
  keyTakeaway: string;
  commonMistake: string;
  payAttention: string;
};

export type GuideFaqItem = {
  q: string;
  a: string;
};

/**
 * Extracts the ## Quick answer section from libraryBody Markdown.
 * Returns null if section is not found.
 */
export function extractQuickAnswer(markdown: string): QuickAnswer | null {
  // finds "## Quick answer" section
  // parses "**Key takeaway:**", "**Most common mistake:**", "**Who should pay..."
  // returns structured object or null
}

/**
 * Extracts the ## FAQ section from libraryBody Markdown.
 * Each FAQ entry is a "### {question}" heading followed by a paragraph.
 * Returns [] if section is not found.
 */
export function extractFaqs(markdown: string): GuideFaqItem[] {
  // finds "## FAQ" section
  // for each "### {question}", collects following paragraph text as answer
  // NL FAQ headings use "## FAQ" as well — no locale change needed
  // returns array of { q, a }
}
```

These functions are pure (no DOM, no async) and safe to call in server components. Write unit tests for both in `src/lib/guides/markdown-utils.test.ts` covering: section found, section missing, multiple FAQ items, tables within sections, empty section.

### 3. Soft tool CTA component (`src/components/content/GuideSoftToolCta.tsx`)

A subtle inline suggestion card:

```tsx
interface GuideSoftToolCtaProps {
  toolLabel: string;    // e.g. "saddle height calculator"
  toolHref: string;     // e.g. "/calculators/saddle-height"
  locale: Locale;
}
```

Design: `bg-muted/50 rounded-xl border border-border/50 p-4 flex items-center gap-3`. Icon on the left (Calculator icon from lucide). Text: "While you read — try the [toolLabel] for this." Link: "[Open calculator →]" in `text-primary text-sm font-semibold`.

This component fires `TrackedCtaLink` with `section="guide_soft_tool_cta"`.

### 4. Guide CTA resolver (`src/lib/guides/cta-resolver.ts`)

```ts
export type GuideSoftTool = {
  label: string;          // localized
  href: string;           // locale-prefixed
} | null;

export function resolveSoftCtaTool(
  cluster: string,
  slug: string,
  locale: Locale
): GuideSoftTool {
  // maps cluster + slug to matching calculator
  // returns null if no matching tool
}

export type GuideCtaZoneCopy = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export function resolveClosingCtaCopy(
  funnel: "TOFU" | "MOFU" | "BOFU" | string,
  cluster: string,
  locale: Locale
): GuideCtaZoneCopy {
  // returns funnel-appropriate title, description, and CTA label
}
```

See README for the tool matching table and funnel copy table. All copy must have EN and NL variants.

### 5. Updated guide page template (`src/app/(public)/guides/[slug]/page.tsx`)

Rewrite the guide page to use the new template anatomy. The data source is:
1. First: Convex `getPublishedGuide({ slug })` — returns DB record with all fields including `libraryBody`
2. Fallback: existing TypeScript content modules (unchanged)

**Data resolution at top of page component:**
```ts
// 1. Try DB
const dbGuide = await fetchDbGuide(slug, locale);  // server-side Convex call
// 2. Fall back to backlog
const entry = dbGuide ?? getGuideEntryBySlug(slug, locale);
if (!entry) notFound();

// Determine content source
const libraryBody = dbGuide?.libraryBody?.[locale] ?? null;
const quickAnswer = libraryBody
  ? extractQuickAnswer(libraryBody)
  : buildQuickAnswer(entry, locale);
const faqs = libraryBody
  ? extractFaqs(libraryBody)
  : buildFaqs(entry, locale);
const softTool = resolveSoftCtaTool(entry.cluster, slug, locale);
const closingCta = resolveClosingCtaCopy(dbGuide?.seoHints?.funnel ?? "MOFU", entry.cluster, locale);
```

**Template structure** (see README anatomy):

```tsx
<PublicPageShell>
  <JsonLd schema={[articleSchema, faqSchema, breadcrumbSchema]} />

  <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

    {/* ZONE 1: HERO */}
    {heroImagePublicPath && (
      <div className="mt-6 mb-8 overflow-hidden rounded-[var(--radius-xl)]">
        <Image
          src={heroImagePublicPath}
          alt={`${entry.h1} — BestBikeFit4U guide`}
          width={1200}
          height={675}
          className="w-full object-cover"
          priority={false}
        />
      </div>
    )}
    <PublicHero
      eyebrow={isHub ? "Hub" : isNl ? "Gids" : "Guide"}
      title={entry.h1}
      description={entry.pageBrief}
      chips={...}
      actions={<BackToGuidesButton />}
    />

    {isHub ? (
      <HubPageContent ... />
    ) : (
      <>
        {/* Disclaimer banner for pain cluster */}
        {isPainCluster && <FitDisclaimer locale={locale} />}

        {/* ZONE 2: QUICK ANSWER */}
        {quickAnswer && (
          <PublicSection className="mt-10" header={{ eyebrow: "Quick answer", ... }}>
            <div className="grid gap-4 md:grid-cols-3">
              <PublicSurfaceCard title="Key takeaway" description={quickAnswer.keyTakeaway} />
              <PublicSurfaceCard title="Most common mistake" description={quickAnswer.commonMistake} />
              <PublicSurfaceCard title="Pay extra attention if..." description={quickAnswer.payAttention} />
            </div>
          </PublicSection>
        )}

        {/* CTA ZONE A: SOFT TOOL CTA */}
        {softTool && (
          <div className="mt-6">
            <GuideSoftToolCta
              toolLabel={softTool.label}
              toolHref={softTool.href}
              locale={locale}
            />
          </div>
        )}

        {/* ZONE 3: BODY CONTENT */}
        <PublicSection className="mt-10">
          {libraryBody ? (
            <GuideBodyMarkdown content={libraryBody} />
          ) : (
            <LegacySections sections={leafSections} />
          )}
        </PublicSection>

        {/* CTA ZONE B: MID-PAGE CONVERSION CTA */}
        <div className="mt-10">
          <GuideMidPageCta
            funnel={dbGuide?.seoHints?.funnel}
            cluster={entry.cluster}
            locale={locale}
            pagePath={pagePath}
          />
        </div>

        {/* ZONE 4: FAQ ACCORDION */}
        {faqs.length > 0 && (
          <PublicSection className="mt-10" header={{ title: "FAQ", icon: <HelpCircle /> }}>
            <GuideFaqAccordion faqs={faqs} />
          </PublicSection>
        )}

        {/* ZONE 5: RELATED GUIDES */}
        <RelatedLinksSection
          title={isNl ? "Gerelateerde gidsen en tools" : "Related guides and tools"}
          links={relatedLinks}
          locale={locale}
        />

        {/* CTA ZONE C: CLOSING CTA BAND */}
        <PublicCtaBand
          className="mt-10"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={closingCta.title}
          description={closingCta.description}
          actions={
            <Button render={
              <TrackedCtaLink
                href={withLocalePrefix(closingCta.ctaHref, locale)}
                section="guide_closing_cta"
                ctaLabel={closingCta.ctaLabel}
                locale={locale}
                pagePath={pagePath}
              />
            }>
              {closingCta.ctaLabel}
            </Button>
          }
        />
      </>
    )}

  </div>
</PublicPageShell>
```

### 6. FAQ accordion component (`src/components/content/GuideFaqAccordion.tsx`)

Replace the current FAQ rendering (flat `PublicSurfaceCard` list) with a simple accordion:
- Uses `<details>`/`<summary>` elements (no JS dependency)
- Or uses Radix `Accordion` if already in the component library
- Shows question in `<summary>` (bold), answer expands below
- Styling: `border-b border-border/50`, smooth height transition
- Each item renders a `FAQ` JSON-LD entry (handled at page level, not component level)

### 7. Mid-page CTA component (`src/components/content/GuideMidPageCta.tsx`)

A medium-weight CTA block:

```tsx
interface GuideMidPageCtaProps {
  funnel?: string;
  cluster: string;
  locale: Locale;
  pagePath: string;
}
```

For MOFU/BOFU guides: show the "What you get with a free account" value list + "Start Free Fit" button.
For TOFU guides: show a softer "explore the tools" message.

The value list:
```
✓ Your personal fit measurements stored
✓ Saddle height, reach, frame size — calculated for your body
✓ Connected to your bike — check fit for any bike you own
✓ Symptom tracking — see whether changes helped
Free. No credit card. 10 minutes.
```

NL variant uses the Dutch translations of the same bullets.

### 8. `generateMetadata` updates

Ensure `generateMetadata` uses the DB guide fields when available:
- `title`: `dbGuide?.metaTitle?.[locale] ?? entry.metaTitle`
- `description`: `dbGuide?.metaDescription?.[locale] ?? entry.pageBrief`
- `openGraph.images`: `dbGuide?.heroImagePublicPath ? [{ url: dbGuide.heroImagePublicPath }] : undefined`
- `robots`: `dbGuide?.robotsIndex === false ? { index: false } : undefined`
- `alternates`: built from `dbGuide?.slug` or `entry.path`

### 9. JSON-LD updates

Use extracted FAQs (from `libraryBody` or fallback) for `FAQPage` schema.
Use hero image URL in `Article` schema `image` field when available.

## Validation

- Load at least 5 imported guide pages and verify the full template renders correctly
- Verify hero image loads on guides that have `heroImagePublicPath`
- Verify Quick Answer 3-card block shows correct extracted content
- Verify Soft Tool CTA appears on saddle height guide and knee pain guide, is absent on nutrition guide
- Verify body Markdown renders correctly: h2, h3, p, tables, lists, bold, links
- Verify internal Markdown links use Next.js `Link` (inspect rendered HTML)
- Verify FAQ accordion renders extracted FAQs (not duplicated from body)
- Verify mid-page CTA shows MOFU copy on a pain guide, TOFU copy on a hub guide
- Verify closing CTA band title and description matches funnel level
- Verify TrackedCtaLink fires for zone A, B, and C CTAs (check network/analytics events)
- Verify `<title>`, meta description, OG image, Article and FAQ JSON-LD in `<head>`
- Test fallback: a guide NOT in DB still renders correctly using TypeScript content
- `npx tsc --noEmit` must pass
- All existing guide tests must pass
- Run `pnpm run build` — no build errors
