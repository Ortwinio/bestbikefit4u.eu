import type { Metadata } from "next";
import { Button, Card, CardContent } from "@/components/ui";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PainFitIllustration } from "@/components/content/PublicPageIllustrations";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { PAIN_PAGES, getPainPageCopy } from "@/content/painPages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const alternates = buildLocaleAlternates("/pain", locale);
  return {
    title:
      locale === "nl"
        ? "Bikefit bij veelvoorkomende klachten | BestBikeFit4U"
        : "Bike Fit for Common Pain Points | BestBikeFit4U",
    description:
      locale === "nl"
        ? "Verken pagina's voor knie-, rug-, nek-, hand- en zadelklachten en ontdek welke bikefit-factoren je eerst controleert."
        : "Explore knee, back, neck, hand, and saddle discomfort pages to see which bike-fit factors to review first.",
    openGraph: {
      title:
        locale === "nl"
          ? "Bikefit bij veelvoorkomende klachten | BestBikeFit4U"
          : "Bike Fit for Common Pain Points | BestBikeFit4U",
      description:
        locale === "nl"
          ? "Verken pagina's voor knie-, rug-, nek-, hand- en zadelklachten en ontdek welke bikefit-factoren je eerst controleert."
          : "Explore knee, back, neck, hand, and saddle discomfort pages to see which bike-fit factors to review first.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function PainIndexPage() {
  const locale = await getRequestLocale();
  const pagePath = withLocalePrefix("/pain", locale);

  return (
    <div className="py-16">
      <TrackMarketingEventOnView
        eventType="pain_page_view"
        locale={locale}
        pagePath={pagePath}
        section="pain_index"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <div className="rounded-[2rem] border border-border/70 bg-card/95 px-6 py-10 shadow-sm sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {locale === "nl" ? "Symptoomgerichte start" : "Symptom-led starting point"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl">
              {locale === "nl"
                ? "Bikefit voor veelvoorkomende klachten"
                : "Bike Fit for Common Pain Points"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
              {locale === "nl"
                ? "Kies de klacht die het best past bij wat je op de fiets voelt. Elke pagina laat zien welke fitfactoren je eerst moet beoordelen en wanneer je beter extra hulp inschakelt."
                : "Choose the symptom that best matches what you feel on the bike. Each page shows the fit factors worth checking first and when extra support may be the better next step."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_index_primary_cta"
                    ctaLabel={locale === "nl" ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
                  />
                }
              >
                {locale === "nl" ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/case-study", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_index_secondary_cta"
                    ctaLabel={locale === "nl" ? "Doe mee aan case study" : "Join case study"}
                  />
                }
              >
                {locale === "nl" ? "Doe mee aan case study" : "Join case study"}
              </Button>
            </div>
          </div>
          <PainFitIllustration locale={locale} />
        </section>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground">
            {locale === "nl" ? "Kies de pagina die het best past" : "Choose the page that fits best"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {locale === "nl"
              ? "Gebruik deze pagina's als fitgerichte eerste stap. Ze zijn bedoeld om je beoordeling te structureren, niet om een medische diagnose te vervangen."
              : "Use these pages as a fit-first review. They are meant to structure your next checks, not to replace a medical diagnosis."}
          </p>
        </section>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PAIN_PAGES.map((page) => {
            const copy = getPainPageCopy(page, locale);
            return (
              <Card key={page.slug} className="dashboard-card-surface rounded-[2rem] border border-border/70">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {copy.categoryLabel}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-foreground">{copy.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.intro}</p>
                  <Button
                    variant="outline"
                    className="mt-5"
                    render={
                      <TrackedCtaLink
                        href={withLocalePrefix(`/pain/${page.slug}`, locale)}
                        locale={locale}
                        pagePath={pagePath}
                        section={`pain_index_${page.slug}`}
                        ctaLabel={locale === "nl" ? "Open pagina" : "Open page"}
                      />
                    }
                  >
                    {locale === "nl" ? "Open pagina" : "Open page"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
