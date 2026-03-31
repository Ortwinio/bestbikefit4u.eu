# T07 — Pain page template and data model

**Ticket:** T07
**Effort:** 1 developer-day
**Blocks:** T08

---

## Context

Pain-symptom queries ("cycling knee pain", "back pain on bike", "hand numbness cycling") are the highest-intent search traffic that converts to a bike fit sign-up. A cyclist with a specific symptom who lands on a page that names that symptom, explains the mechanism, and gives a concrete next step is primed to act.

The existing use-case and guide templates are close but not right for this purpose:
- **Guides** are comprehensive how-to content. They work for "how to fit a road bike" but not for "my knee hurts when cycling — what do I do?"
- **Use-cases** are scenario-first. They work for "I ride gravel" but not for "I have this symptom right now."

Pain pages are **symptom-first**. The reader has a problem they want named and a short, actionable path forward. Structure everything around that.

---

## Route

Pain pages live at `/pain/[symptom-slug]`.

This is a new route cluster, separate from `/guides/` and `/use-cases/`. The distinction:
- `/guides/[slug]` — comprehensive methodology content (how to fit, what to measure)
- `/use-cases/[slug]` — scenario-based content (I ride gravel, I'm a tall rider)
- `/pain/[slug]` — symptom-first content (I have knee pain, what do I do)

**Canonical strategy for overlapping content:**
- `/guides/bike-fitting-for-knee-pain` and `/pain/knee-pain-cycling` serve different intent
- Keep both
- Cross-link them: the guide links to the pain page as "quick symptom check", the pain page links to the guide as "full methodology"
- Do not set one as canonical for the other — they are different enough in structure and keyword target

---

## Data model

Create `src/app/(public)/pain/data.ts`:

```ts
export interface PainMechanism {
  heading: string;
  body: string;
}

export interface FitCheckStep {
  step: number;
  heading: string;
  body: string;
  calculatorLink?: {
    href: string;
    label: string;
  };
}

export interface PainPageFaq {
  q: string;
  a: string;
}

export interface PainPageRelatedLink {
  href: string;
  label: string;
}

export interface PainPage {
  slug: string;
  symptom: string;          // plain English: "knee pain"
  metaTitle: string;        // max 60 chars
  metaDescription: string;  // 140–160 chars
  keywords: string[];
  h1: string;
  intro: string;            // 1–2 sentences
  mechanismHeading: string; // "What usually causes [symptom] on a bike"
  mechanisms: PainMechanism[];
  fitCheckHeading: string;  // "What to check first"
  fitCheckSteps: FitCheckStep[];
  faqs: PainPageFaq[];
  relatedLinks: PainPageRelatedLink[];
}

export const PAIN_PAGES: PainPage[] = [
  // populated in T08 / 07-pain-pages-content.md
];
```

---

## Page component

Create `src/app/(public)/pain/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { FitDisclaimer } from "@/components/content/FitDisclaimer";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { BRAND } from "@/config/brand";
import { buildFaqPageSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { PAIN_PAGES } from "../data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PAIN_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = PAIN_PAGES.find((p) => p.slug === slug);
  if (!page) return {};

  const locale = await getRequestLocale();

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: "article",
    },
    alternates: buildLocaleAlternates(`/pain/${slug}`, locale),
  };
}

export default async function PainPage({ params }: Props) {
  const { slug } = await params;
  const page = PAIN_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const locale = await getRequestLocale();
  const pagePath = withLocalePrefix(`/pain/${slug}`, locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: page.h1,
            description: page.metaDescription,
            url: pageUrl,
          }),
          buildFaqPageSchema(page.faqs.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="rounded-[28px] border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              BestBikeFit4U
            </p>
            <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{page.intro}</p>
            <div className="mt-6">
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_hero"
                    ctaLabel="Check your fit — it's free"
                  />
                }
              >
                Check your fit — it&apos;s free
              </Button>
            </div>
          </div>
        </section>

        {/* Mechanism section */}
        <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {page.mechanismHeading}
          </h2>
          <div className="mt-6 space-y-5">
            {page.mechanisms.map((m) => (
              <div key={m.heading}>
                <h3 className="font-semibold text-foreground">{m.heading}</h3>
                <p className="mt-1 text-muted-foreground">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fit check section */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {page.fitCheckHeading}
          </h2>
          <ol className="mt-6 space-y-6">
            {page.fitCheckSteps.map((step) => (
              <li key={step.step} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{step.heading}</h3>
                  <p className="mt-1 text-muted-foreground">{step.body}</p>
                  {step.calculatorLink && (
                    <Link
                      href={step.calculatorLink.href}
                      className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      {step.calculatorLink.label} →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Disclaimer — always before CTA */}
        <FitDisclaimer locale={locale} />

        {/* FAQ */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
          <div className="mt-4 space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-1 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA card */}
        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Get your fit targets — free, no appointment needed
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Enter your measurements and riding context. The algorithm calculates saddle height, reach, bar drop, and more — in minutes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="pain_bottom_cta"
                  ctaLabel="Start my free fit"
                />
              }
            >
              Start my free fit
            </Button>
            <Button
              render={<Link href={withLocalePrefix("/calculators/bike-fit", locale)} />}
              variant="outline"
            >
              Try quick calculator
            </Button>
          </div>
        </section>

        {/* Related links */}
        <RelatedLinksSection
          title="Related tools and guides"
          links={page.relatedLinks}
          locale={locale}
        />
      </div>
    </div>
  );
}
```

---

## `FitDisclaimer` component

Create `src/components/content/FitDisclaimer.tsx` (defined in T06 prompt):

```tsx
export function FitDisclaimer({ locale }: { locale: string }) {
  const isNl = locale === "nl";
  return (
    <aside className="mt-10 rounded-2xl border border-border bg-secondary p-6 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">
        {isNl ? "Een noot over pijn en passing" : "A note on pain and fitting"}
      </p>
      <p className="mt-2">
        {isNl
          ? "Positieaanpassingen lossen veel voorkomende rijklachten op. Ze diagnosticeren of behandelen geen blessures. Bij acute, verergerende of aanhoudende pijn na aanpassing, raadpleeg een fysiotherapeut of sportarts."
          : "Position adjustments address many common riding discomforts. They cannot diagnose or treat injury. If pain is acute, worsening, or does not improve after a few rides with the adjusted position, see a physiotherapist or sports medicine specialist."}
      </p>
    </aside>
  );
}
```

---

## Acceptance criteria

- [ ] `src/app/(public)/pain/data.ts` exists with the `PainPage` interface and an empty `PAIN_PAGES` array
- [ ] `src/app/(public)/pain/[slug]/page.tsx` exists and renders all sections from the template
- [ ] `FitDisclaimer` component exists in `src/components/content/`
- [ ] Page renders correctly with no layout shifts at mobile viewport (375px)
- [ ] `generateStaticParams` returns slugs from `PAIN_PAGES` — confirms static generation is wired
- [ ] `generateMetadata` returns correct `title`, `description`, and `alternates` for each slug
- [ ] Visiting `/pain/nonexistent-slug` returns a 404 (notFound())
- [ ] The disclaimer block appears above the final CTA in every rendered page

## Edge cases

- If `PAIN_PAGES` is empty, `generateStaticParams` returns an empty array — no static pages are generated and the route returns 404 for all slugs. This is correct before T08.
- Do not build a "list all pain pages" index page in this ticket — that comes later. Focus on the individual page template only.
- The `calculatorLink` in a `FitCheckStep` is optional. If undefined, no link renders. Verify the component handles this cleanly.

## Human audit checklist

- [ ] Render one test pain page with dummy data — confirm all sections appear
- [ ] View source — confirm canonical, hreflang, JSON-LD present
- [ ] Check mobile viewport — confirm numbered steps and disclaimer are readable
- [ ] Verify 404 on unknown slug
