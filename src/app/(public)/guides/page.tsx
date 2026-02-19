import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { GUIDES, getGuideClusterLabel, getGuideCopy } from "./data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return {
    title: isNl
      ? "Bikefitting gidsen voor klachten en disciplines | BestBikeFit4U"
      : "Bike Fitting Guides for Pain and Disciplines | BestBikeFit4U",
    description: isNl
      ? "Bekijk praktische bikefitting-gidsen voor kniepijn, rugklachten, racefiets, gravel, MTB en triathlon."
      : "Explore practical bike fitting guides for knee pain, back pain, road, gravel, MTB, and triathlon setups.",
    keywords: isNl
      ? [
          "bikefitting gids",
          "bikefitting kniepijn",
          "racefiets fit",
          "gravel bikefitting",
        ]
      : [
          "bike fitting guides",
          "bike fitting knee pain",
          "road bike fit",
          "gravel bike fit",
        ],
    openGraph: {
      title: isNl
        ? "Bikefitting gidsen voor klachten en disciplines"
        : "Bike Fitting Guides for Pain and Disciplines",
      description: isNl
        ? "Praktische gidsen voor betere comfort, controle en prestaties op de fiets."
        : "Practical guides to improve comfort, control, and performance on the bike.",
      type: "website",
    },
    alternates: buildLocaleAlternates("/guides", locale),
  };
}

export default async function GuidesHubPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/guides", locale);

  const painGuides = GUIDES.filter((guide) => guide.cluster === "pain");
  const disciplineGuides = GUIDES.filter((guide) => guide.cluster === "discipline");

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {isNl ? "Bikefitting gidsen" : "Bike Fitting Guides"}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          {isNl
            ? "Gebruik deze gidsen om sneller de juiste afstellingen te kiezen voor jouw klachten of discipline."
            : "Use these guides to choose better setup priorities for your pain points or cycling discipline."}
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            {getGuideClusterLabel("pain", locale)}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {painGuides.map((guide) => {
              const copy = getGuideCopy(guide, locale);
              return (
                <article key={guide.slug} className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{copy.cardTitle}</h3>
                  <p className="mt-2 text-gray-600">{copy.cardDescription}</p>
                  <Link
                    href={withLocalePrefix(`/guides/${guide.slug}`, locale)}
                    className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-800"
                  >
                    {isNl ? "Lees gids" : "Read guide"}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            {getGuideClusterLabel("discipline", locale)}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {disciplineGuides.map((guide) => {
              const copy = getGuideCopy(guide, locale);
              return (
                <article key={guide.slug} className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{copy.cardTitle}</h3>
                  <p className="mt-2 text-gray-600">{copy.cardDescription}</p>
                  <Link
                    href={withLocalePrefix(`/guides/${guide.slug}`, locale)}
                    className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-800"
                  >
                    {isNl ? "Lees gids" : "Read guide"}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14 rounded-2xl bg-blue-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            {isNl ? "Klaar voor je persoonlijke fitrapport?" : "Ready for your personalized fit report?"}
          </h2>
          <p className="mt-3 text-blue-100">
            {isNl
              ? "Start gratis en ontvang afstelwaarden die passen bij jouw lichaam, doelen en rijstijl."
              : "Start free and get setup targets matched to your body, goals, and riding style."}
          </p>
          <TrackedCtaLink
            href={withLocalePrefix("/login", locale)}
            locale={locale}
            pagePath={pagePath}
            section="hub_final_cta"
            ctaLabel={isNl ? "Start gratis fit" : "Start Free Fit"}
          >
            <Button size="lg" className="mt-6 bg-white text-blue-700 hover:bg-blue-50">
              {isNl ? "Start gratis fit" : "Start Free Fit"}
            </Button>
          </TrackedCtaLink>
        </section>
      </div>
    </div>
  );
}
