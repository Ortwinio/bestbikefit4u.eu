import Link from "next/link";
import type { Metadata } from "next";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { BikeSearchBar } from "@/components/home/BikeSearchBar";
import { BikeShowcaseSection } from "@/components/home/BikeShowcaseSection";
import { CalculatorGrid } from "@/components/home/CalculatorGrid";
import { ClosingCtaBand } from "@/components/home/ClosingCtaBand";
import { DifferentiatorTriple } from "@/components/home/DifferentiatorTriple";
import { HeroBlock } from "@/components/home/HeroBlock";
import { HOME_BIKE_SEARCH_CONTENT } from "@/components/home/homeRedesignContent";
import { HowItWorksStepper } from "@/components/home/HowItWorksStepper";
import { ProofBar } from "@/components/home/ProofBar";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { BikeQuickCheckCard } from "@/components/public/BikeQuickCheckCard";
import { Button } from "@/components/prototyper-ui/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getLocalizedPublicCalculatorPath,
  type PublicCalculatorId,
} from "@/lib/public-calculators";
import { getDictionary } from "@/i18n/getDictionary";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { BRAND } from "@/config/brand";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/jsonLd";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const { metadata } = dictionary.home;
  const alternates = buildLocaleAlternates("/", locale);

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.openGraphTitle,
      description: metadata.openGraphDescription,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function HomePage() {
  type PopularTool = {
    calculatorId: PublicCalculatorId;
    href: string;
    label: string;
  };

  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const { home } = dictionary;
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const homePath = withLocalePrefix("/", locale);
  const fitCalculatorHref = withLocalePrefix("/calculators/bike-fit", locale);
  const pricingHref = withLocalePrefix("/pricing", locale);
  const loginHref = withLocalePrefix("/login", locale);
  const localizedHomeUrl = new URL(
    homePath,
    BRAND.siteUrl
  ).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema({
        url: localizedHomeUrl,
        description: home.metadata.description,
        inLanguage: locale,
      }),
    ],
  };
  const guideLinks =
    locale === "nl"
      ? [
          { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
          { href: "/guides/bike-fitting-for-lower-back-pain", label: "Bikefitting bij lage rugklachten" },
          { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
          { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
        ]
      : [
          { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
          { href: "/guides/bike-fitting-for-lower-back-pain", label: "Bike Fitting for Lower Back Pain" },
          { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
          { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
        ];
  const popularTools: PopularTool[] =
    locale === "nl"
      ? [
          {
            calculatorId: "bike-fit",
            href: "/calculators/bike-fit",
            label: "Bike fit calculator",
          },
          {
            calculatorId: "saddle-height",
            href: "/calculators/saddle-height",
            label: "Zadelhoogte calculator",
          },
          {
            calculatorId: "saddle-width",
            href: "/calculators/saddle-width",
            label: "Zadelbreedtecalculator",
          },
          {
            calculatorId: "frame-size",
            href: "/calculators/frame-size",
            label: "Framemaat calculator",
          },
          {
            calculatorId: "gearing",
            href: "/calculators/gearing",
            label: "Verzet calculator",
          },
          {
            calculatorId: "tire-pressure",
            href: getLocalizedPublicCalculatorPath("tire-pressure", "nl"),
            label: "Bandenspanning calculator",
          },
        ]
      : [
          {
            calculatorId: "bike-fit",
            href: "/calculators/bike-fit",
            label: "Bike Fit Calculator",
          },
          {
            calculatorId: "saddle-height",
            href: "/calculators/saddle-height",
            label: "Saddle Height Calculator",
          },
          {
            calculatorId: "saddle-width",
            href: "/calculators/saddle-width",
            label: "Saddle Width Calculator",
          },
          {
            calculatorId: "frame-size",
            href: "/calculators/frame-size",
            label: "Frame Size Calculator",
          },
          {
            calculatorId: "gearing",
            href: "/calculators/gearing",
            label: "Gearing Calculator",
          },
          {
            calculatorId: "tire-pressure",
            href: getLocalizedPublicCalculatorPath("tire-pressure", "en"),
            label: "Tire Pressure Calculator",
          },
        ];
  const riderScenarios =
    locale === "nl"
      ? [
          {
            href: "/guides/bike-fitting-for-lower-back-pain",
            label: "Bikefit bij lage rugklachten",
          },
          { href: "/guides/gravel-bike-fit-guide", label: "Bikefit voor gravelrijden" },
          { href: "/guides/triathlon-bike-fit-guide", label: "Bikefit voor triathlon" },
          { href: "/guides/bike-fit-for-tall-riders", label: "Bikefit voor lange rijders" },
        ]
      : [
          {
            href: "/guides/bike-fitting-for-lower-back-pain",
            label: "Bike Fit for Lower Back Pain",
          },
          { href: "/guides/gravel-bike-fit-guide", label: "Bike Fit for Gravel Riding" },
          { href: "/guides/triathlon-bike-fit-guide", label: "Bike Fit for Triathlon" },
          { href: "/guides/bike-fit-for-tall-riders", label: "Bike Fit for Tall Riders" },
        ];
  const bikeShowcaseCopy = {
    ...home.bikeShowcase,
    useInFitLabel: HOME_BIKE_SEARCH_CONTENT[locale].useInFitLabel,
  };

  return (
    <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_35%,var(--background)_65%)_100%)]">
      <TrackMarketingEventOnView
        eventType="funnel_landing_view"
        locale={locale}
        pagePath={homePath}
        section="landing"
      />
      <JsonLd schema={structuredData} />
      <HeroBlock
        locale={locale}
        homePath={homePath}
        fitHref={fitCalculatorHref}
        pricingHref={pricingHref}
        loginHref={loginHref}
        title={home.hero.title}
        titleAccent={home.hero.titleAccent}
        description={home.hero.description}
        primaryCta={home.hero.primaryCta}
        secondaryCta={home.hero.secondaryCta}
      />
      <ProofBar locale={locale} />
      <section className="relative z-20 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted)_35%,var(--background)_65%)_0%,var(--background)_100%)] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <BikeQuickCheckCard
              locale={locale}
              pagePath={homePath}
              loginHref={loginHref}
              profileHref={withLocalePrefix("/profile", locale)}
              fitHref={withLocalePrefix("/fit", locale)}
              copy={home.bikeQuickCheck}
            />
          </div>
        </div>
      </section>
      <CalculatorGrid
        locale={locale}
        tools={popularTools.map((tool) => ({
          ...tool,
          href: withLocalePrefix(tool.href, locale),
        }))}
        upsellHref={fitCalculatorHref}
      />
      <HowItWorksStepper
        locale={locale}
        homePath={homePath}
        fitHref={fitCalculatorHref}
      />
      <DifferentiatorTriple locale={locale} />
      <TestimonialSection locale={locale} />
      <BikeSearchBar
        locale={locale}
        fitHref={fitCalculatorHref}
        manualHref={fitCalculatorHref}
      />
      <BikeShowcaseSection locale={locale} copy={bikeShowcaseCopy} />

      <section className="bg-muted/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="public-card-surface rounded-[calc(var(--radius-3xl)+0.25rem)] border p-5 sm:p-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
                {locale === "nl" ? "Verdiep verder" : "Go deeper"}
              </p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2rem]">
                {locale === "nl" ? "Populaire bikefitting gidsen" : "Popular Bike Fitting Guides"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
                {locale === "nl"
                  ? "Verdiep je in klachtgerichte en disciplinegerichte gidsen, en zet de volgende stap met je persoonlijke fitrapport."
                  : "Explore pain-focused and discipline-specific guides, then apply your own personalized fit report."}
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {guideLinks.map((guide) => (
                <Button
                  key={guide.href}
                  variant="outline"
                  size="lg"
                  className="h-auto min-h-20 justify-start rounded-2xl px-5 py-4 text-left text-sm font-medium"
                  render={<Link href={withLocalePrefix(guide.href, locale)} />}
                >
                  {guide.label}
                </Button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-sm font-semibold"
                render={<Link href={withLocalePrefix("/guides", locale)} />}
              >
                {locale === "nl" ? "Bekijk alle gidsen" : "View all guides"}
              </Button>
            </div>
          </section>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="public-card-surface-subtle rounded-[calc(var(--radius-3xl)+0.25rem)] border p-5 sm:p-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
                {locale === "nl" ? "Rijscenario's" : "Rider scenarios"}
              </p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2rem]">
                {locale === "nl" ? "Rijsituaties en klachten" : "Riding Scenarios and Pain Points"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
                {locale === "nl"
                  ? "Gebruik scenario-pagina's om sneller naar de juiste calculator of gids te gaan."
                  : "Use scenario pages to move faster toward the right calculator or guide."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {riderScenarios.map((item) => (
                <Button
                  key={item.href}
                  variant="outline"
                  size="lg"
                  className="h-auto min-h-20 justify-start rounded-2xl px-5 py-4 text-left text-sm font-semibold"
                  render={<Link href={withLocalePrefix(item.href, locale)} />}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-sm font-semibold"
                render={<Link href={withLocalePrefix("/guides", locale)} />}
              >
                {locale === "nl" ? "Bekijk alle gidsen" : "View all guides"}
              </Button>
            </div>
          </section>
        </div>
      </section>
      <ClosingCtaBand
        locale={locale}
        homePath={homePath}
        fitHref={fitCalculatorHref}
        pricingHref={pricingHref}
        campaignActive={campaignActive}
        campaign={{
          startFreeCta: campaign.startFreeCta,
          donateCta: campaign.donateCta,
          donationUrl: CONSUMER_CAMPAIGN_CONFIG.donationUrl,
          optionalNote: campaign.optionalNote,
        }}
        recommendation={{
          title: home.recommendationSection.title,
          description: home.recommendationSection.description,
          items: home.recommendationSection.items,
        }}
        cta={home.cta}
      />
    </div>
  );
}
