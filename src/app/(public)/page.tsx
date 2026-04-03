import Link from "next/link";
import { Button } from "@/components/ui";
import { Ruler, Target, FileText, Bike, Activity, Shield } from "lucide-react";
import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { QuotesCarousel } from "@/components/home/QuotesCarousel";
import { BikeQuickCheckCard } from "@/components/public/BikeQuickCheckCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/getDictionary";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { BRAND } from "@/config/brand";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/jsonLd";
import {
  HOME_QUOTES_DISPLAY_COUNT,
  selectRandomHomeQuotesForLocale,
} from "@/content/homeQuotes";

const featureIcons = [Ruler, Target, FileText, Bike, Activity, Shield];
const reasonsIcons = [Activity, Target, Bike, Shield, FileText];
const trustIcons = [Shield, Ruler, FileText];
const framedSectionClass =
  "rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm sm:p-10";
const sectionHeaderWidthClass = "mx-auto max-w-3xl text-center";
const softCardClass =
  "rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm";

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
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const { home } = dictionary;
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
  const popularTools =
    locale === "nl"
      ? [
          { href: "/calculators/bike-fit", label: "Bike fit calculator" },
          { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
          { href: "/calculators/frame-size", label: "Framemaat calculator" },
          { href: "/bandenspanning-calculator", label: "Bandenspanning calculator" },
        ]
      : [
          { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
          { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
          { href: "/calculators/frame-size", label: "Frame Size Calculator" },
          { href: "/bandenspanning-calculator", label: "Tire Pressure Calculator" },
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
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={homePath}
                    section="hero_primary"
                    ctaLabel={home.hero.primaryCta}
                  />
                }
                size="lg"
              >
                {home.hero.primaryCta}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/70 bg-primary-foreground/10 !text-primary-foreground after:!bg-transparent hover:bg-primary-foreground/20"
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
            <div className="mt-8 grid gap-3 text-left text-sm text-primary-foreground/80 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3">
                {locale === "nl" ? "Fitadvies gebaseerd op je lichaam en doel." : "Fit guidance matched to your body and goals."}
              </div>
              <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3">
                {locale === "nl" ? "Praktische aanpassingen in millimeters." : "Practical changes in measurable millimeters."}
              </div>
              <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3">
                {locale === "nl" ? "Snel van klacht naar duidelijke volgende stap." : "A faster path from pain point to the right next step."}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-20 -mt-6 pb-8 sm:-mt-10 sm:pb-10">
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
        </div>
      </section>
      <QuotesCarousel locale={locale} quotes={randomHomeQuotes} />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={framedSectionClass}>
          <div className={sectionHeaderWidthClass}>
            <h2 className="text-3xl font-bold text-foreground">
              {home.howItWorks.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{home.howItWorks.subtitle}</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {home.howItWorks.steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-border/70 bg-muted/35 p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft shadow-sm">
                  <span className="text-2xl font-bold text-primary">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/55 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={sectionHeaderWidthClass}>
            <h2 className="text-3xl font-bold text-foreground">
              {home.reasonsToStart.title}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              {home.reasonsToStart.subtitle}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {home.reasonsToStart.items.map((reason, index) => {
              const Icon = reasonsIcons[index] ?? Activity;

              return (
                <div key={reason.title} className={softCardClass}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft shadow-sm">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={framedSectionClass}>
          <div className={sectionHeaderWidthClass}>
            <h2 className="text-3xl font-bold text-foreground">
              {home.features.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{home.features.subtitle}</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {home.features.items.map((feature, index) => {
              const Icon = featureIcons[index] ?? Ruler;

              return (
                <div key={feature.title} className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
          </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={framedSectionClass}>
          <div className={sectionHeaderWidthClass}>
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "nl" ? "Populaire calculators" : "Popular Calculators"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {locale === "nl"
                ? "Directe ingangen naar de belangrijkste gratis tools."
                : "Direct entry points into the most important free tools."}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {popularTools.map((tool) => (
              <Link
                key={tool.href}
                href={withLocalePrefix(tool.href, locale)}
                className="rounded-2xl border border-border/70 bg-muted/35 px-5 py-4 text-sm font-semibold text-primary shadow-sm transition hover:bg-secondary/70"
              >
                {tool.label}
              </Link>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={sectionHeaderWidthClass}>
            <h2 className="text-3xl font-bold text-foreground">
              {home.trustSection.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{home.trustSection.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {home.trustSection.items.map((item, index) => {
              const Icon = trustIcons[index] ?? Shield;

              return (
                <div key={item.title} className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted shadow-sm">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={framedSectionClass}>
          <div className={sectionHeaderWidthClass}>
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "nl" ? "Populaire bikefitting gidsen" : "Popular Bike Fitting Guides"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {locale === "nl"
                ? "Verdiep je in klachtgerichte en disciplinegerichte gidsen, en zet de volgende stap met je persoonlijke fitrapport."
                : "Explore pain-focused and discipline-specific guides, then apply your own personalized fit report."}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {guideLinks.map((guide) => (
              <Link
                key={guide.href}
                href={withLocalePrefix(guide.href, locale)}
                className="rounded-2xl border border-border/70 bg-background/90 px-5 py-4 text-sm font-medium text-primary shadow-sm transition hover:bg-secondary/70"
              >
                {guide.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={withLocalePrefix("/guides", locale)}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              {locale === "nl" ? "Bekijk alle gidsen" : "View all guides"}
            </Link>
          </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={framedSectionClass}>
          <div className={sectionHeaderWidthClass}>
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "nl" ? "Rijsituaties en klachten" : "Riding Scenarios and Pain Points"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {locale === "nl"
                ? "Gebruik scenario-pagina's om sneller naar de juiste calculator of gids te gaan."
                : "Use scenario pages to move faster toward the right calculator or guide."}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {riderScenarios.map((item) => (
              <Link
                key={item.href}
                href={withLocalePrefix(item.href, locale)}
                className="rounded-2xl border border-border/70 bg-muted/35 px-5 py-4 text-sm font-semibold text-primary shadow-sm transition hover:bg-secondary/70"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={withLocalePrefix("/use-cases", locale)}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              {locale === "nl" ? "Bekijk alle use cases" : "View all use cases"}
            </Link>
          </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center gap-10 rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:p-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-foreground">
                {home.recommendationSection.title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {home.recommendationSection.description}
              </p>
              <ul className="mt-8 space-y-4">
                {home.recommendationSection.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success/15">
                      <svg
                        className="h-4 w-4 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="rounded-[1.75rem] bg-gradient-to-br from-primary to-primary-dark p-8 text-primary-foreground shadow-lg">
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
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/login", locale)}
                      locale={locale}
                      pagePath={homePath}
                      section="recommendation_card"
                      ctaLabel={home.recommendationSection.cardCta}
                  />
                  }
                  size="lg"
                  className="mt-6 bg-background text-primary hover:bg-muted"
                >
                  {home.recommendationSection.cardCta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-primary px-6 py-12 shadow-lg sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
            {locale === "nl" ? "Start sterker" : "Start stronger"}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-primary-foreground">{home.cta.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">{home.cta.description}</p>
          <div className="mt-8">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={homePath}
                  section="final_cta"
                  ctaLabel={home.cta.button}
                />
              }
              size="lg"
              className="bg-background text-primary hover:bg-muted"
            >
              {home.cta.button}
            </Button>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
