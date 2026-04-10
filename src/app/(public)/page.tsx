import Link from "next/link";
import {
  ArrowUpDown,
  Ruler,
  Target,
  FileText,
  Bike,
  Activity,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import { QuotesCarousel } from "@/components/home/QuotesCarousel";
import { BikeQuickCheckCard } from "@/components/public/BikeQuickCheckCard";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card, CardContent } from "@/components/prototyper-ui/ui/card";
import { PublicCtaBand } from "@/components/public/PublicCtaBand";
import { PublicSection } from "@/components/public/PublicSection";
import { PublicSurfaceCard } from "@/components/public/PublicSurfaceCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
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
import {
  HOME_QUOTES_DISPLAY_COUNT,
  selectRandomHomeQuotesForLocale,
} from "@/content/homeQuotes";

const featureIcons = [Ruler, Target, FileText, Bike, Activity, Shield];
const reasonsIcons = [Activity, Target, Bike, Shield, FileText];
const trustIcons = [ShieldCheck, Ruler, FileText];

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
    href: string;
    label: string;
    icon: LucideIcon;
    iconClassName: string;
  };

  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const { home } = dictionary;
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const homePath = withLocalePrefix("/", locale);
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
  const randomHomeQuotes = selectRandomHomeQuotesForLocale(
    locale,
    HOME_QUOTES_DISPLAY_COUNT
  );
  const popularTools: PopularTool[] =
    locale === "nl"
      ? [
          {
            href: "/calculators/bike-fit",
            label: "Bike fit calculator",
            icon: Bike,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--primary)_16%,var(--background)_84%)] text-[color:color-mix(in_oklch,var(--primary-dark)_78%,var(--foreground)_22%)]",
          },
          {
            href: "/calculators/saddle-height",
            label: "Zadelhoogte calculator",
            icon: Ruler,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--success)_16%,var(--background)_84%)] text-[color:color-mix(in_oklch,var(--success)_82%,var(--foreground)_18%)]",
          },
          {
            href: "/calculators/saddle-width",
            label: "Zadelbreedtecalculator",
            icon: ArrowUpDown,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary)_88%)] text-[color:color-mix(in_oklch,var(--primary-dark)_82%,var(--foreground)_18%)]",
          },
          {
            href: "/calculators/frame-size",
            label: "Framemaat calculator",
            icon: Target,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--warning)_18%,var(--background)_82%)] text-[color:color-mix(in_oklch,var(--warning)_78%,var(--foreground)_22%)]",
          },
          {
            href: "/calculators/gearing",
            label: "Verzet calculator",
            icon: ArrowUpDown,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--primary)_14%,var(--secondary)_86%)] text-[color:color-mix(in_oklch,var(--primary-dark)_82%,var(--foreground)_18%)]",
          },
          {
            href: getLocalizedPublicCalculatorPath("tire-pressure", "nl"),
            label: "Bandenspanning calculator",
            icon: Gauge,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--secondary)_70%,var(--background)_30%)] text-[color:color-mix(in_oklch,var(--primary)_80%,var(--foreground)_20%)]",
          },
        ]
      : [
          {
            href: "/calculators/bike-fit",
            label: "Bike Fit Calculator",
            icon: Bike,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--primary)_16%,var(--background)_84%)] text-[color:color-mix(in_oklch,var(--primary-dark)_78%,var(--foreground)_22%)]",
          },
          {
            href: "/calculators/saddle-height",
            label: "Saddle Height Calculator",
            icon: Ruler,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--success)_16%,var(--background)_84%)] text-[color:color-mix(in_oklch,var(--success)_82%,var(--foreground)_18%)]",
          },
          {
            href: "/calculators/saddle-width",
            label: "Saddle Width Calculator",
            icon: ArrowUpDown,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary)_88%)] text-[color:color-mix(in_oklch,var(--primary-dark)_82%,var(--foreground)_18%)]",
          },
          {
            href: "/calculators/frame-size",
            label: "Frame Size Calculator",
            icon: Target,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--warning)_18%,var(--background)_82%)] text-[color:color-mix(in_oklch,var(--warning)_78%,var(--foreground)_22%)]",
          },
          {
            href: "/calculators/gearing",
            label: "Gearing Calculator",
            icon: ArrowUpDown,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--primary)_14%,var(--secondary)_86%)] text-[color:color-mix(in_oklch,var(--primary-dark)_82%,var(--foreground)_18%)]",
          },
          {
            href: getLocalizedPublicCalculatorPath("tire-pressure", "en"),
            label: "Tire Pressure Calculator",
            icon: Gauge,
            iconClassName:
              "bg-[color:color-mix(in_oklch,var(--secondary)_70%,var(--background)_30%)] text-[color:color-mix(in_oklch,var(--primary)_80%,var(--foreground)_20%)]",
          },
        ];
  const riderScenarios =
    locale === "nl"
      ? [
          { href: "/use-cases/back-pain-cycling", label: "Bikefit bij lage rugklachten" },
          { href: "/use-cases/gravel-cycling-fit", label: "Bikefit voor gravelrijden" },
          { href: "/use-cases/triathlon-bike-fit", label: "Bikefit voor triathlon" },
          { href: "/use-cases/tall-rider-bike-fit", label: "Bikefit voor lange rijders" },
        ]
      : [
          { href: "/use-cases/back-pain-cycling", label: "Bike Fit for Lower Back Pain" },
          { href: "/use-cases/gravel-cycling-fit", label: "Bike Fit for Gravel Riding" },
          { href: "/use-cases/triathlon-bike-fit", label: "Bike Fit for Triathlon" },
          { href: "/use-cases/tall-rider-bike-fit", label: "Bike Fit for Tall Riders" },
        ];

  return (
    <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_35%,var(--background)_65%)_100%)]">
      <TrackMarketingEventOnView
        eventType="funnel_landing_view"
        locale={locale}
        pagePath={homePath}
        section="landing"
      />
      <JsonLd schema={structuredData} />
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-24 sm:py-28"
        style={{ backgroundImage: "url('/bestbikefit4u-home.gif')" }}
      >
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-primary-foreground/20 bg-black/35 px-6 py-10 text-center shadow-2xl backdrop-blur-sm sm:px-10 sm:py-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
              {locale === "nl" ? "Persoonlijke bike fit, overal" : "Personal bike fit, anywhere"}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl">
              {home.hero.title}
              <span className="block text-primary-foreground/80">{home.hero.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/90">
              {home.hero.description}
            </p>
            {campaignActive ? (
              <div className="mt-8 rounded-[1.5rem] border border-primary-foreground/15 bg-black/25 px-5 py-5 text-left shadow-xl backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/70">
                  {campaign.homepageEyebrow}
                </p>
                <p className="mt-3 text-base leading-7 text-primary-foreground/90">
                  {campaign.homepageDescription}
                </p>
                <CampaignCtaGroup
                  locale={locale}
                  pagePath={homePath}
                  startHref={withLocalePrefix("/calculators/bike-fit", locale)}
                  startSection="hero_primary"
                  donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                  donateSection="hero_donate"
                  startLabel={campaign.startFreeCta}
                  donateLabel={campaign.donateCta}
                  buttonSize="lg"
                  className="mt-5"
                />
              </div>
            ) : (
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="min-h-12 rounded-full px-6 text-base"
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/calculators/bike-fit", locale)}
                      locale={locale}
                      pagePath={homePath}
                      section="hero_primary"
                      ctaLabel={home.hero.primaryCta}
                    />
                  }
                >
                  {home.hero.primaryCta}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-12 rounded-full border-primary-foreground/25 bg-[color:color-mix(in_oklch,var(--background)_88%,white_12%)] px-6 text-base text-[color:var(--foreground)] shadow-[0_12px_32px_-18px_color-mix(in_oklch,var(--foreground)_28%,transparent)] after:bg-[color:color-mix(in_oklch,var(--background)_92%,white_8%)] hover-only:after:bg-[color:color-mix(in_oklch,var(--muted)_70%,var(--background)_30%)]"
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/pricing", locale)}
                      locale={locale}
                      pagePath={homePath}
                      section="hero_secondary"
                      ctaLabel={home.hero.secondaryCta}
                    />
                  }
                >
                  {home.hero.secondaryCta}
                </Button>
              </div>
            )}
            <p className="mt-4 text-sm text-primary-foreground/60">
              <TrackedCtaLink
                href={withLocalePrefix("/login", locale)}
                locale={locale}
                pagePath={homePath}
                section="hero_tertiary"
                ctaLabel={
                  locale === "nl" ? "Heb je al een account? Log in" : "Already have an account? Sign in"
                }
                className="underline underline-offset-2 hover:text-primary-foreground/80"
              >
                {locale === "nl" ? "Heb je al een account? Log in" : "Already have an account? Sign in"}
              </TrackedCtaLink>
            </p>
            <div className="mt-8 grid gap-3 text-left text-sm text-primary-foreground/80 sm:grid-cols-3">
              <Card className="border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-primary-foreground shadow-none">
                {locale === "nl" ? "Fitadvies gebaseerd op je lichaam en doel." : "Fit guidance matched to your body and goals."}
              </Card>
              <Card className="border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-primary-foreground shadow-none">
                {locale === "nl" ? "Praktische aanpassingen in millimeters." : "Practical changes in measurable millimeters."}
              </Card>
              <Card className="border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-primary-foreground shadow-none">
                {locale === "nl" ? "Snel van klacht naar duidelijke volgende stap." : "A faster path from pain point to the right next step."}
              </Card>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-20 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted)_35%,var(--background)_65%)_0%,var(--background)_100%)] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <BikeQuickCheckCard
              locale={locale}
              pagePath={homePath}
              loginHref={withLocalePrefix("/login", locale)}
              profileHref={withLocalePrefix("/profile", locale)}
              fitHref={withLocalePrefix("/fit", locale)}
              copy={home.bikeQuickCheck}
            />
          </div>
          {campaignActive ? (
            <PublicCtaBand
              className="mx-auto mt-8 max-w-4xl"
              eyebrow={campaign.homepageEyebrow}
              title={campaign.homepageTitle}
              description={campaign.homepageDescription}
              actions={
                <CampaignCtaGroup
                  locale={locale}
                  pagePath={homePath}
                  startHref={withLocalePrefix("/calculators/bike-fit", locale)}
                  startSection="homepage_campaign_start"
                  donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                  donateSection="homepage_campaign_donate"
                />
              }
              aside={campaign.optionalNote}
            />
          ) : null}
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              title: locale === "nl" ? "Populaire calculators" : "Popular Calculators",
              description:
                locale === "nl"
                  ? "Gratis tools die je direct kunt gebruiken, zonder account."
                  : "Free tools you can use right now, no account needed.",
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {popularTools.map((tool) => (
                <Button
                  key={tool.href}
                  variant="outline"
                  size="lg"
                  className="h-auto min-h-20 justify-start rounded-2xl px-5 py-4 text-left text-sm font-semibold"
                  render={<Link href={withLocalePrefix(tool.href, locale)} />}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/5 ${tool.iconClassName}`}
                    >
                      <tool.icon className="h-5 w-5" />
                    </span>
                    <span className="leading-6">{tool.label}</span>
                  </span>
                </Button>
              ))}
            </div>
          </PublicSection>
        </div>
      </section>
      <QuotesCarousel locale={locale} quotes={randomHomeQuotes} />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              title: home.howItWorks.title,
              description: home.howItWorks.subtitle,
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="grid gap-8 md:grid-cols-3">
              {home.howItWorks.steps.map((step, index) => (
                <PublicSurfaceCard
                  key={step.title}
                  compact
                  className="text-center"
                  leading={
                    <span className="text-base font-bold text-primary">{index + 1}</span>
                  }
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </PublicSection>
        </div>
      </section>

      <section className="bg-secondary/55 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              title: home.reasonsToStart.title,
              description: home.reasonsToStart.subtitle,
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {home.reasonsToStart.items.map((reason, index) => {
                const Icon = reasonsIcons[index] ?? Activity;

                return (
                  <PublicSurfaceCard
                    key={reason.title}
                    title={reason.title}
                    description={reason.description}
                    leading={<Icon />}
                  />
                );
              })}
            </div>
          </PublicSection>
        </div>
      </section>

      <section className="bg-muted/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              title: home.features.title,
              description: home.features.subtitle,
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {home.features.items.map((feature, index) => {
                const Icon = featureIcons[index] ?? Ruler;

                return (
                  <PublicSurfaceCard
                    key={feature.title}
                    title={feature.title}
                    description={feature.description}
                    leading={<Icon />}
                  />
                );
              })}
            </div>
          </PublicSection>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              title: home.trustSection.title,
              description: home.trustSection.subtitle,
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="grid gap-8 md:grid-cols-3">
              {home.trustSection.items.map((item, index) => {
                const Icon = trustIcons[index] ?? Shield;

                return (
                  <PublicSurfaceCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    leading={<Icon />}
                  />
                );
              })}
            </div>
          </PublicSection>
        </div>
      </section>

      <section className="bg-muted/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              title: locale === "nl" ? "Populaire bikefitting gidsen" : "Popular Bike Fitting Guides",
              description:
                locale === "nl"
                  ? "Verdiep je in klachtgerichte en disciplinegerichte gidsen, en zet de volgende stap met je persoonlijke fitrapport."
                  : "Explore pain-focused and discipline-specific guides, then apply your own personalized fit report.",
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="grid gap-4 md:grid-cols-2">
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
          </PublicSection>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              title: locale === "nl" ? "Rijsituaties en klachten" : "Riding Scenarios and Pain Points",
              description:
                locale === "nl"
                  ? "Gebruik scenario-pagina's om sneller naar de juiste calculator of gids te gaan."
                  : "Use scenario pages to move faster toward the right calculator or guide.",
              align: "center",
            }}
            contentClassName="pt-8"
          >
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
                render={<Link href={withLocalePrefix("/use-cases", locale)} />}
              >
              {locale === "nl" ? "Bekijk alle use cases" : "View all use cases"}
              </Button>
            </div>
          </PublicSection>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="items-center gap-10 border border-border/70 bg-card/95 p-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:p-10">
            <CardContent className="max-w-2xl p-0">
              <h2 className="text-3xl font-bold text-foreground">
                {home.recommendationSection.title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {home.recommendationSection.description}
              </p>
              <ul className="mt-8 space-y-4">
                {home.recommendationSection.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="mt-12 lg:mt-0">
              <Card className="gap-0 rounded-[1.75rem] bg-gradient-to-br from-primary to-primary-dark p-8 text-primary-foreground shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/70">
                  {locale === "nl" ? "Volgende stap" : "Next step"}
                </p>
                <h3 className="text-2xl font-bold">
                  {home.recommendationSection.cardTitle}
                </h3>
                <p className="mt-4 text-primary-foreground/80">
                  {home.recommendationSection.cardDescription}
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-6 min-h-12 rounded-full border-background/50 bg-background px-6 text-base text-primary after:bg-background hover-only:after:bg-muted"
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/calculators/bike-fit", locale)}
                      locale={locale}
                      pagePath={homePath}
                      section="recommendation_card"
                      ctaLabel={home.recommendationSection.cardCta}
                    />
                  }
                >
                  {home.recommendationSection.cardCta}
                </Button>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Card className="gap-0 rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
            {locale === "nl" ? "Start sterker" : "Start stronger"}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-primary-foreground">{home.cta.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">{home.cta.description}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {campaignActive ? (
              <CampaignCtaGroup
                locale={locale}
                pagePath={homePath}
                startHref={withLocalePrefix("/calculators/bike-fit", locale)}
                startSection="final_cta_primary"
                donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                donateSection="final_cta_secondary"
                startLabel={campaign.startFreeCta}
                donateLabel={campaign.donateCta}
                buttonSize="lg"
                className="items-center justify-center"
              />
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-12 rounded-full border-background/50 bg-background px-6 text-base text-primary after:bg-background hover-only:after:bg-muted"
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/calculators/bike-fit", locale)}
                      locale={locale}
                      pagePath={homePath}
                      section="final_cta_primary"
                      ctaLabel={home.cta.button}
                    />
                  }
                >
                  {home.cta.button}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-12 rounded-full border-primary-foreground/45 bg-transparent px-6 text-base text-primary-foreground after:bg-transparent hover-only:after:bg-primary-foreground/8"
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/pricing", locale)}
                      locale={locale}
                      pagePath={homePath}
                      section="final_cta_secondary"
                      ctaLabel={locale === "nl" ? "Bekijk prijzen" : "View pricing"}
                    />
                  }
                >
                  {locale === "nl" ? "Bekijk prijzen" : "View pricing"}
                </Button>
              </>
            )}
          </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
