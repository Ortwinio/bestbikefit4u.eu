import { Activity, HelpCircle, Stethoscope, Target } from "lucide-react";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { buildArticleSchema } from "@/lib/seo/jsonLd";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { BRAND } from "@/config/brand";
import type { PainPageCopy } from "@/content/painPages";
import { FitDisclaimer } from "@/components/content/FitDisclaimer";
import { PainFitIllustration } from "@/components/content/PublicPageIllustrations";

export function PainPointPageTemplate({
  locale,
  slug,
  copy,
}: {
  locale: Locale;
  slug: string;
  copy: PainPageCopy;
}) {
  const pagePath = withLocalePrefix(`/pain/${slug}`, locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <div className="py-16">
      <TrackMarketingEventOnView
        eventType="pain_page_view"
        locale={locale}
        pagePath={pagePath}
        section={slug}
      />
      <JsonLd
        schema={[
          buildArticleSchema({
            headline: copy.title,
            description: copy.intro,
            url: pageUrl,
            inLanguage: locale,
          }),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <div className="dashboard-card-surface rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Stethoscope className="h-3.5 w-3.5" />
              {copy.categoryLabel}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{copy.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_primary_cta"
                    ctaLabel={copy.primaryCta}
                    conversionKey="pricing_signup"
                  />
                }
              >
                {copy.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix(`/case-study?pain=${slug}`, locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_secondary_cta"
                    ctaLabel={copy.secondaryCta}
                  />
                }
              >
                {copy.secondaryCta}
              </Button>
            </div>
          </div>

          <div className="dashboard-card-surface rounded-[2rem] border border-border/70 bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--warning)_8%,var(--card)_92%))] p-8 shadow-sm">
            <PainFitIllustration locale={locale} />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {locale === "nl" ? "Snelle check" : "Quick check"}
            </p>
            <div className="mt-4 space-y-3">
              {copy.riderChecklist.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border/70 bg-background/85 p-4 text-sm text-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary-soft p-3 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{copy.symptomTitle}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {copy.symptomBullets.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 bg-background p-5 text-sm text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-border/70 bg-primary-soft p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-background p-3 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{copy.fitTitle}</h2>
              <div className="mt-5 grid gap-4">
                {copy.fitBullets.map((item, index) => (
                  <div key={item} className="grid gap-4 rounded-2xl border border-border/70 bg-background p-5 sm:grid-cols-[auto_1fr]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary-soft p-3 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{copy.faqTitle}</h2>
              <div className="mt-5 grid gap-4">
                {copy.faqs.map((faq) => (
                  <article key={faq.q} className="rounded-2xl border border-border/70 bg-background p-5">
                    <h3 className="text-base font-semibold text-foreground">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <RelatedLinksSection title={copy.relatedTitle} links={copy.relatedLinks} locale={locale} />

        <FitDisclaimer locale={locale} />

        <section className="mt-10 rounded-[2rem] bg-primary px-8 py-10 text-center shadow-lg">
          <h2 className="text-2xl font-semibold text-primary-foreground">
            {locale === "nl"
              ? "Klaar om dit naar jouw fiets te vertalen?"
              : "Ready to turn this into your own bike setup?"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/85">
            {locale === "nl"
              ? "Start met een gratis fit of stuur je situatie in als case-study kandidaat."
              : "Start with a free fit or send your situation in as a case-study candidate."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="pain_footer_primary_cta"
                  ctaLabel={copy.primaryCta}
                  conversionKey="pricing_signup"
                />
              }
              className="bg-background text-primary hover:bg-muted"
            >
              {copy.primaryCta}
            </Button>
            <Button
              variant="outline"
              className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix(`/case-study?pain=${slug}`, locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="pain_footer_secondary_cta"
                  ctaLabel={copy.secondaryCta}
                />
              }
            >
              {copy.secondaryCta}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
