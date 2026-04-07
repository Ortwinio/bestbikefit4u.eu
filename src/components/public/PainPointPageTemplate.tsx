import { Activity, HelpCircle, Target } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildFaqPageSchema,
} from "@/lib/seo/jsonLd";
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
  const painIndexUrl = new URL(withLocalePrefix("/pain", locale), BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString();

  return (
    <PublicPageShell>
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
          buildFaqPageSchema(copy.faqs),
          buildBreadcrumbListSchema([
            { name: locale === "nl" ? "Home" : "Home", item: homeUrl },
            {
              name: locale === "nl" ? "Pijnklachten" : "Pain points",
              item: painIndexUrl,
            },
            { name: copy.title, item: pageUrl },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={copy.categoryLabel}
          title={copy.title}
          description={copy.intro}
          actions={
            <>
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
            </>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <div className="hidden lg:block" />
          <PublicSurfaceCard className="bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--warning)_8%,var(--card)_92%))]">
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
          </PublicSurfaceCard>
        </div>

        <PublicSection
          className="mt-8"
          header={{ title: copy.symptomTitle, icon: <Activity className="h-5 w-5" /> }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {copy.symptomBullets.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/70 bg-background p-5 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-8"
          header={{ title: copy.fitTitle, icon: <Target className="h-5 w-5" /> }}
          contentClassName="bg-primary-soft/60"
        >
          <div className="grid gap-4">
            {copy.fitBullets.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 rounded-2xl border border-border/70 bg-background p-5 sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-8"
          header={{ title: copy.faqTitle, icon: <HelpCircle className="h-5 w-5" /> }}
        >
          <div className="grid gap-4">
            {copy.faqs.map((faq) => (
              <article key={faq.q} className="rounded-2xl border border-border/70 bg-background p-5">
                <h3 className="text-base font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.a}</p>
              </article>
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection title={copy.relatedTitle} links={copy.relatedLinks} locale={locale} />

        <FitDisclaimer locale={locale} />

        <PublicCtaBand
          className="mt-10"
          title={
            locale === "nl"
              ? "Klaar om dit naar jouw fiets te vertalen?"
              : "Ready to turn this into your own bike setup?"
          }
          description={
            locale === "nl"
              ? "Start met een gratis fit of stuur je situatie in als case-study kandidaat."
              : "Start with a free fit or send your situation in as a case-study candidate."
          }
          actions={
            <>
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
            </>
          }
        />
      </div>
    </PublicPageShell>
  );
}
