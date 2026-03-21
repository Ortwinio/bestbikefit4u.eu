import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui";
import { Ruler, Target, FileText, Bike, Activity, Shield } from "lucide-react";
import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { QuotesCarousel } from "@/components/home/QuotesCarousel";
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

function linkButtonProps(href: string): ButtonProps {
  return {
    render: <Link href={href} />,
    nativeButton: false,
  } as ButtonProps;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const { metadata } = dictionary.home;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.openGraphTitle,
      description: metadata.openGraphDescription,
      type: "website",
    },
    alternates: buildLocaleAlternates("/", locale),
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
    <div>
      <TrackMarketingEventOnView
        eventType="funnel_landing_view"
        locale={locale}
        pagePath={homePath}
        section="landing"
      />
      <JsonLd schema={structuredData} />
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-24"
        style={{ backgroundImage: "url('/bestbikefit4u-home.gif')" }}
      >
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl">
              {home.hero.title}
              <span className="block text-primary-foreground/80">{home.hero.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/90">
              {home.hero.description}
            </p>
            <div className="mt-10 flex justify-center gap-4">
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
                className="border-primary-foreground/70 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                {...linkButtonProps(withLocalePrefix("/about", locale))}
              >
                {home.hero.secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <QuotesCarousel locale={locale} quotes={randomHomeQuotes} />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {home.howItWorks.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{home.howItWorks.subtitle}</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {home.howItWorks.steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
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
      </section>

      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
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
                <div key={reason.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft">
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

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {home.features.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{home.features.subtitle}</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {home.features.items.map((feature, index) => {
              const Icon = featureIcons[index] ?? Ruler;

              return (
                <div key={feature.title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft">
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
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
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
                className="rounded-xl border border-border bg-card px-5 py-4 text-sm font-semibold text-primary shadow-sm hover:bg-secondary"
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {home.trustSection.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{home.trustSection.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {home.trustSection.items.map((item, index) => {
              const Icon = trustIcons[index] ?? Shield;

              return (
                <div key={item.title} className="rounded-xl border border-border bg-background p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
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

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
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
                className="rounded-lg border border-border bg-card px-5 py-4 text-sm font-medium text-primary hover:bg-secondary"
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
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
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
                className="rounded-xl border border-border bg-card px-5 py-4 text-sm font-semibold text-primary shadow-sm hover:bg-secondary"
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
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
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
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-8 text-primary-foreground">
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

      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground">{home.cta.title}</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">{home.cta.description}</p>
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
      </section>
    </div>
  );
}
