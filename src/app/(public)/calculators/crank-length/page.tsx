import { CalculatorAnswerSection } from "@/components/calculators/CalculatorAnswerSection";
import { getFitAnswer } from "@/lib/seo/calculatorAnswers/fit";
import { DEFAULT_SOCIAL_IMAGE } from "@/lib/seo/social-image";
import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import { Button } from "@/components/ui";
import { PublicCtaBand, PublicSection } from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildFaqPageSchema, buildCalculatorPageSchemas } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getDictionary } from "@/i18n/getDictionary";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  getFirstSearchParam,
  parseBikeCategory,
  parsePositiveNumberParam,
  type SearchParamRecord,
} from "@/lib/publicCalculators";
import { CrankLengthCalculatorForm } from "./CrankLengthCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/crank-length", locale);

  return {
    title: isNl
      ? "Cranklengte calculator | BestBikeFit4U"
      : "Crank Length Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken een praktisch startpunt voor cranklengte op basis van binnenbeenlengte en " +
        "fietsdiscipline."
      : "Calculate a practical crank-length starting point based on inseam and bike category.",
    keywords: isNl
      ? ["cranklengte calculator", "fiets crankmaat", "cranklengte fit"]
      : ["crank length calculator", "bike crank size", "cycling crank length fit"],
    openGraph: {
      images: [DEFAULT_SOCIAL_IMAGE],
      title: isNl ? "Cranklengte calculator" : "Crank Length Calculator",
      description: isNl
        ? "Vind een eerste cranklengte-aanbeveling op basis van binnenbeenlengte en categorie."
        : "Find a first-pass crank-length recommendation based on inseam and category.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function CrankLengthCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const locale = await getRequestLocale();
  const copy = (await getDictionary(locale)).crankLengthCalculator;
  const params = await searchParams;
  const inseamCm = parsePositiveNumberParam(params, "inseamCm") ?? undefined;
  const category = parseBikeCategory(getFirstSearchParam(params, "category"));
  const pagePath = withLocalePrefix("/calculators/crank-length", locale);
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  return (
    <div className="bg-background text-foreground">
      <JsonLd
        schema={[
          buildFaqPageSchema([...copy.faqs]),
          ...buildCalculatorPageSchemas({
            name:
              locale === "nl"
                ? "BestBikeFit4U cranklengte calculator"
                : "BestBikeFit4U Crank Length Calculator",
            description:
              locale === "nl"
                ? "Bereken een praktisch startpunt voor cranklengte op basis van binnenbeenlengte en categorie."
                : "Calculate a practical crank-length starting point based on inseam and category.",
            url: pageUrl,
            locale,
          }),
        ]}
      />
      <CrankLengthCalculatorForm
        locale={locale}
        copy={copy}
        initialInseamCm={inseamCm}
        initialCategory={category}
      />
      <CalculatorAnswerSection id="crank-length" locale={locale} content={getFitAnswer("crank-length", locale)} />
      <div className="mx-auto max-w-[1440px] space-y-10 px-4 pb-16 sm:px-8 xl:px-16">
        <PublicSection header={{ title: copy.trustTitle, description: copy.trustText }}>
          <div className="grid gap-4 md:grid-cols-3">
            {copy.trust.map((point) => (
              <article key={point.title} className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-display text-xl font-bold">{point.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </article>
            ))}
          </div>
        </PublicSection>
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-bold">{copy.guidance}</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground">
            {copy.guidancePoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
        <PublicCtaBand
          eyebrow={copy.next}
          title={copy.nextTitle}
          description={copy.nextText}
          aside={copy.aside}
          actions={
            campaignActive ? (
              <CampaignCtaGroup
                locale={locale}
                pagePath={pagePath}
                startHref={withLocalePrefix("/calculators/bike-fit", locale)}
                startSection="crank_length_result"
                donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                donateSection="crank_length_campaign_donate"
                startLabel={copy.start}
                donateLabel={campaign.donateCta}
              />
            ) : (
              <>
                <Button
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/calculators/bike-fit", locale)}
                      locale={locale}
                      pagePath={pagePath}
                      section="crank_length_result"
                      ctaLabel={copy.start}
                    />
                  }
                >
                  {copy.start}
                </Button>
                <Button
                  variant="outline"
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/pricing", locale)}
                      locale={locale}
                      pagePath={pagePath}
                      section="crank_length_pricing_cta"
                      ctaLabel={copy.pricing}
                    />
                  }
                >
                  {copy.pricing}
                </Button>
              </>
            )
          }
        />
        <section aria-labelledby="crank-faq">
          <h2 id="crank-faq" className="font-display text-3xl font-bold">
            {copy.faqTitle}
          </h2>
          <div className="mt-5 space-y-3">
            {copy.faqs.map((faq) => (
              <details key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                <summary className="min-h-11 cursor-pointer font-semibold">{faq.q}</summary>
                <p className="mt-3 text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
        <RelatedLinksSection
          title={copy.related}
          links={getRelatedLinks("crank-length", locale)}
          locale={locale}
        />
      </div>
    </div>
  );
}
