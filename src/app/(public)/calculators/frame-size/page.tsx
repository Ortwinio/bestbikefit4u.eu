import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { FrameSizeCalculatorForm } from "./FrameSizeCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/frame-size", locale);

  return {
    title: isNl ? "Framemaat calculator | BestBikeFit4U" : "Frame Size Calculator | BestBikeFit4U",
    description: isNl
      ? "Schat een realistische framemaat op basis van lengte, binnenbeenlengte en fietsdiscipline."
      : "Estimate a realistic frame size based on height, inseam, and bike category.",
    keywords: isNl
      ? ["framemaat calculator", "fietsmaat calculator", "racefiets maat estimate"]
      : ["frame size calculator", "bike size calculator", "road bike size estimate"],
    openGraph: {
      title: isNl ? "Framemaat calculator" : "Frame Size Calculator",
      description: isNl
        ? "Krijg een snelle framemaatinschatting op basis van je basisgegevens."
        : "Get a quick frame-size estimate based on your core measurements.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function FrameSizeCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/frame-size", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = isNl
    ? [
        {
          q: "Kan een framemaatcalculator een volledige bike fit vervangen?",
          a: "Nee. Framemaat is maar één onderdeel van de fit. Reach, drop en contactpunten bepalen nog steeds of de fiets echt goed past.",
        },
        {
          q: "Waarom is binnenbeenlengte belangrijk voor framemaat?",
          a: "Die beïnvloedt zadelhoogte en de verhoudingen van de fiets, en daardoor welke maten realistisch zijn.",
        },
      ]
    : [
        {
          q: "Can a frame-size calculator replace a complete bike fit?",
          a: "No. Frame size is only one part of the fit. Reach, drop, and contact points still determine whether the bike works well for you.",
        },
        {
          q: "Why does inseam matter for frame size?",
          a: "It strongly affects saddle height and overall proportions, which influence which size ranges are realistic.",
        },
      ];

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U Framemaat calculator" : "BestBikeFit4U Frame Size Calculator",
            description: isNl
              ? "Schat een realistische framemaat op basis van lengte, binnenbeenlengte en fietsdiscipline."
              : "Estimate a realistic frame size based on height, inseam, and bike category.",
            url: pageUrl,
          }),
        ]}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              BestBikeFit4U calculator
            </p>
            <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
              {isNl ? "Framemaat calculator" : "Frame Size Calculator"}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {isNl
                ? "Maak eerst een realistische shortlist van framematen voordat je fietsen, onderdelen of afstellingen vergelijkt."
                : "Shortlist realistic frame sizes before you compare bikes, parts, and setup changes."}
            </p>
          </div>
        </section>

        <FrameSizeCalculatorForm isNl={isNl} />

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {isNl ? "Volgende stap" : "Next step"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {isNl
              ? "Als je de waarschijnlijke maatrange kent, vergelijk je reach, stack en het totale fit-doel zodat de fiets in de praktijk werkt."
              : "Once you know the likely size range, compare reach, stack, and overall fit targets so the bike works in practice, not just on paper."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="frame_size_bike_fit_cta"
                  ctaLabel={isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
                />
              }
            >
              {isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
            </Button>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="frame_size_dashboard_cta"
                  ctaLabel={isNl ? "Ga verder in dashboard" : "Continue in dashboard"}
                />
              }
              variant="outline"
            >
              {isNl ? "Ga verder in dashboard" : "Continue in dashboard"}
            </Button>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {isNl ? "Veelgestelde vragen" : "FAQ"}
          </h2>
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
          links={getRelatedLinks("frame-size", locale)}
          locale={locale}
        />
      </div>
    </div>
  );
}
