import Link from "next/link";
import { Button } from "@/components/ui";
import { Ruler, Target, FileText, Bike, Activity, Shield } from "lucide-react";
import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { getDictionary } from "@/i18n/getDictionary";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { BRAND } from "@/config/brand";

const featureIcons = [Ruler, Target, FileText, Bike, Activity, Shield];
const reasonsIcons = [Activity, Target, Bike, Shield, FileText];
const trustIcons = [Shield, Ruler, FileText];

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
  const organizationId = `${BRAND.siteUrl}/#organization`;
  const websiteId = `${BRAND.siteUrl}/#website`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: BRAND.name,
        url: BRAND.siteUrl,
        email: BRAND.supportEmail,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: localizedHomeUrl,
        name: BRAND.name,
        description: home.metadata.description,
        inLanguage: locale,
        publisher: {
          "@id": organizationId,
        },
      },
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

  return (
    <div>
      <TrackMarketingEventOnView
        eventType="funnel_landing_view"
        locale={locale}
        pagePath={homePath}
        section="landing"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {home.hero.title}
              <span className="block text-blue-600">{home.hero.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              {home.hero.description}
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <TrackedCtaLink
                href={withLocalePrefix("/login", locale)}
                locale={locale}
                pagePath={homePath}
                section="hero_primary"
                ctaLabel={home.hero.primaryCta}
              >
                <Button size="lg">{home.hero.primaryCta}</Button>
              </TrackedCtaLink>
              <Link href={withLocalePrefix("/about", locale)}>
                <Button variant="outline" size="lg">
                  {home.hero.secondaryCta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {home.howItWorks.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{home.howItWorks.subtitle}</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {home.howItWorks.steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-2xl font-bold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {home.reasonsToStart.title}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              {home.reasonsToStart.subtitle}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {home.reasonsToStart.items.map((reason, index) => {
              const Icon = reasonsIcons[index] ?? Activity;

              return (
                <div key={reason.title} className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {home.features.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{home.features.subtitle}</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {home.features.items.map((feature, index) => {
              const Icon = featureIcons[index] ?? Ruler;

              return (
                <div key={feature.title} className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {home.trustSection.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{home.trustSection.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {home.trustSection.items.map((item, index) => {
              const Icon = trustIcons[index] ?? Shield;

              return (
                <div key={item.title} className="rounded-xl border border-gray-200 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {locale === "nl" ? "Populaire bikefitting gidsen" : "Popular Bike Fitting Guides"}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
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
                className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                {guide.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={withLocalePrefix("/guides", locale)}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              {locale === "nl" ? "Bekijk alle gidsen" : "View all guides"}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {home.recommendationSection.title}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {home.recommendationSection.description}
              </p>
              <ul className="mt-8 space-y-4">
                {home.recommendationSection.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <svg
                        className="h-4 w-4 text-green-600"
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
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
                <h3 className="text-2xl font-bold">
                  {home.recommendationSection.cardTitle}
                </h3>
                <p className="mt-4 text-blue-100">
                  {home.recommendationSection.cardDescription}
                </p>
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={homePath}
                  section="recommendation_card"
                  ctaLabel={home.recommendationSection.cardCta}
                >
                  <Button
                    size="lg"
                    className="mt-6 bg-white text-blue-600 hover:bg-blue-50"
                  >
                    {home.recommendationSection.cardCta}
                  </Button>
                </TrackedCtaLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">{home.cta.title}</h2>
          <p className="mt-4 text-lg text-blue-100">{home.cta.description}</p>
          <div className="mt-8">
            <TrackedCtaLink
              href={withLocalePrefix("/login", locale)}
              locale={locale}
              pagePath={homePath}
              section="final_cta"
              ctaLabel={home.cta.button}
            >
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                {home.cta.button}
              </Button>
            </TrackedCtaLink>
          </div>
        </div>
      </section>
    </div>
  );
}
