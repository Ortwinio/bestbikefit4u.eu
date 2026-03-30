import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { BRAND } from "@/config/brand";
import { buildFaqPageSchema, buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { BikeFitCalculatorForm } from "./BikeFitCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return {
    title: isNl ? "Gratis bike fit calculator | BestBikeFit4U" : "Free Bike Fit Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken gratis zadelhoogte, reach, drop en framedoelen op basis van je lichaamsmaten en rijdoel."
      : "Calculate saddle height, reach, drop, and frame targets for free based on your body measurements and riding goal.",
    keywords: isNl
      ? ["bike fit calculator", "gratis bikefit", "online bikefitting"]
      : ["bike fit calculator", "free bike fit", "online bike fitting tool"],
    openGraph: {
      title: isNl ? "Gratis bike fit calculator" : "Free Bike Fit Calculator",
      description: isNl
        ? "Krijg direct een eerste bike fit advies op basis van jouw maten."
        : "Get an immediate first-pass bike-fit recommendation from your measurements.",
      type: "website",
    },
    alternates: buildLocaleAlternates("/calculators/bike-fit", locale),
  };
}

function buildFaqs(isNl: boolean) {
  return isNl
    ? [
        {
          q: "Hoe nauwkeurig is deze gratis bike fit calculator?",
          a: "De calculator geeft een sterke eerste inschatting op basis van de productielogica uit de fit-engine. Voor een volledige analyse heb je in het dashboard meer context en vergelijking met je huidige setup.",
        },
        {
          q: "Welke waarde moet ik als eerste aanpassen?",
          a: "Begin meestal met zadelhoogte en algemene cockpitbalans. Daarna kun je reach, drop en framedoelen verfijnen.",
        },
      ]
    : [
        {
          q: "How accurate is this free bike-fit calculator?",
          a: "It provides a strong first-pass estimate based on the production fit-engine logic. The dashboard fit goes deeper with more context and comparison against your current setup.",
        },
        {
          q: "Which value should I adjust first?",
          a: "Start with saddle height and overall cockpit balance. Then refine reach, drop, and frame targets.",
        },
      ];
}

export default async function BikeFitCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/bike-fit", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = buildFaqs(isNl);

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U bike fit calculator" : "BestBikeFit4U Bike Fit Calculator",
            description: isNl
              ? "Gratis bike fit calculator voor zadelhoogte, reach, drop en framedoelen."
              : "Free bike-fit calculator for saddle height, reach, drop, and frame targets.",
            url: pageUrl,
          }),
          buildFaqPageSchema(faqs),
          buildHowToSchema({
            name: isNl ? "Hoe gebruik je de bike fit calculator" : "How to use the bike-fit calculator",
            description: isNl
              ? "Meet lengte en binnenbeenlengte, kies je rijdoel en beoordeel flexibiliteit en core."
              : "Measure height and inseam, choose your riding goal, and rate flexibility and core stability.",
            steps: isNl
              ? [
                  "Meet lengte en binnenbeenlengte zorgvuldig.",
                  "Kies je fietscategorie en rijdoel.",
                  "Vul flexibiliteit en core-stabiliteit in.",
                  "Gebruik de uitkomst als startpunt voor je setup.",
                ]
              : [
                  "Measure height and inseam carefully.",
                  "Choose your bike category and riding goal.",
                  "Enter flexibility and core stability.",
                  "Use the result as a starting point for your setup.",
                ],
          }),
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              BestBikeFit4U calculator
            </p>
            <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
              {isNl ? "Gratis bike fit calculator" : "Free Bike Fit Calculator"}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {isNl
                ? "Bereken zadelhoogte, reach, drop en framedoelen op basis van je lichaamsmaten en rijdoel. Dit is dezelfde fit-logica als in de app, verpakt als snelle publieke intake."
                : "Calculate saddle height, reach, drop, and frame targets from your body measurements and riding goal. It uses the same fit logic as the app, packaged as a faster public intake."}
            </p>
          </div>
        </section>

        <BikeFitCalculatorForm isNl={isNl} />

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {isNl ? "Volgende stap" : "Next step"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {isNl
              ? "Gebruik dit als vertrekpunt en verfijn daarna je setup, druk en huidige fietsgegevens in het dashboard."
              : "Use this as your starting point, then refine the setup, tire pressure, and current bike details inside the dashboard."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="bike_fit_result"
                  ctaLabel={isNl ? "Ga verder in dashboard" : "Continue in Dashboard"}
                />
              }
            >
              {isNl ? "Ga verder in dashboard" : "Continue in Dashboard"}
            </Button>
            <Button
              render={<Link href={withLocalePrefix("/bandenspanning-calculator", locale)} />}
              variant="outline"
            >
              {isNl ? "Open bandenspanning calculator" : "Open Tire Pressure Calculator"}
            </Button>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-1 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLinksSection
          title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("bike-fit", locale)}
          locale={locale}
        />
      </div>
    </div>
  );
}
