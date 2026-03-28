import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";
import { Button, Card, CardContent } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { BRAND } from "@/config/brand";
import { buildArticleSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { GUIDE_SLUGS, getGuideBySlug, getGuideCopy } from "../data";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: locale === "nl" ? "Gids niet gevonden" : "Guide not found",
      description:
        locale === "nl"
          ? "De gevraagde bikefitting gids bestaat niet."
          : "The requested bike fitting guide does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const copy = getGuideCopy(guide, locale);

  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
    keywords: copy.seoKeywords,
    openGraph: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      type: "article",
    },
    alternates: buildLocaleAlternates(`/guides/${guide.slug}`, locale),
  };
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const copy = getGuideCopy(guide, locale);
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix(`/guides/${guide.slug}`, locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <div className="py-16">
      <JsonLd
        schema={[
          buildArticleSchema({
            headline: copy.h1,
            description: copy.intro,
            url: pageUrl,
            inLanguage: locale,
          }),
          buildFaqPageSchema(copy.faqs),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <Card className="dashboard-card-surface overflow-hidden border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]">
            <CardContent className="p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                <BookOpen className="h-3.5 w-3.5" />
                {guide.cluster === "pain"
                  ? isNl
                    ? "Klachtgids"
                    : "Pain guide"
                  : isNl
                    ? "Disciplinegids"
                    : "Discipline guide"}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
                {copy.h1}
              </h1>
              <p className="mt-4 text-lg leading-8 text-[color:var(--muted-foreground)]">
                {copy.intro}
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card-surface overflow-hidden border-[color:var(--border)] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--warning)_10%,var(--card)_90%))]">
            <CardContent className="flex h-full flex-col justify-between p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                  {isNl ? "Wat je hier krijgt" : "What you get here"}
                </p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                      {isNl ? "Takeaways" : "Takeaways"}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                      {copy.takeaways.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                      {isNl ? "Acties" : "Actions"}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                      {copy.adjustments.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--background)]/70 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[color:var(--primary)]" />
                  <p className="text-sm leading-6 text-[color:var(--foreground)]">
                    {isNl
                      ? "Gebruik deze gids als filter voor je eerste keuzes. Laat de calculator daarna de exacte afstelwaarden bepalen."
                      : "Use this guide to narrow your first decisions, then let the calculator define the exact setup values."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "Snelle samenvatting" : "Quick summary"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {copy.takeawaysTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {isNl
                  ? "Gebruik deze blokken om snel te scannen wat je wilt onthouden voordat je gaat aanpassen."
                  : "Use these blocks to scan the key decisions before you start changing your setup."}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {copy.takeaways.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--warning)]" />
                  <p className="text-sm leading-7 text-[color:var(--foreground)]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--primary-soft)] p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[color:var(--background)] p-3 text-[color:var(--primary)]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "Praktische volgorde" : "Practical order"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {copy.adjustmentsTitle}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {copy.adjustments.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5 sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[color:var(--foreground)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[color:var(--warning)]/14 p-3 text-[color:var(--warning)]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "Veelgestelde vragen" : "Frequently asked questions"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {copy.faqTitle}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {copy.faqs.map((faq) => (
              <article
                key={faq.q}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5"
              >
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <RelatedLinksSection
          title={copy.relatedTitle}
          links={copy.relatedLinks}
          locale={locale}
        />

        <section className="mt-10 rounded-[2rem] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_92%,black_8%),color-mix(in_oklch,var(--primary)_72%,var(--warning)_28%))] p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-[color:var(--primary-foreground)] sm:text-3xl">
            {isNl ? "Wil je jouw fit concreet laten berekenen?" : "Ready to calculate your personalized fit?"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[color:var(--primary-foreground)]/84 sm:text-base">
            {isNl
              ? "Start gratis en ontvang afstelwaarden met duidelijke prioriteiten."
              : "Start free and get setup targets with clear adjustment priorities."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="guide_final_cta"
                  ctaLabel={copy.primaryCta}
                />
              }
              className="bg-[color:var(--background)] text-[color:var(--primary)] hover:bg-[color:var(--muted)]"
            >
              {copy.primaryCta}
            </Button>
            <Button
              render={<Link href={withLocalePrefix("/about", locale)} />}
              variant="outline"
              className="border-[color:var(--primary-foreground)] bg-transparent text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary-foreground)]/10"
            >
              {copy.secondaryCta}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
