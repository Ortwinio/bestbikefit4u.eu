import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/saddle-height", locale);

  return {
    title: isNl
      ? "Zadelhoogte calculator | BestBikeFit4U"
      : "Saddle Height Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken een conservatieve zadelhoogte als startpunt op basis van categorie, doel, flexibiliteit en core."
      : "Calculate a conservative saddle-height starting point using category, goal, flexibility, and core inputs.",
    keywords: isNl
      ? ["zadelhoogte calculator", "bike fit zadelhoogte", "fiets zadelpositie"]
      : ["saddle height calculator", "bike fit saddle height", "cycling saddle position"],
    openGraph: {
      title: isNl ? "Zadelhoogte calculator" : "Saddle Height Calculator",
      description: isNl
        ? "Krijg een eerste zadelhoogte-inschatting en een veilige afstelmarge."
        : "Get a first-pass saddle-height estimate and a safe adjustment range.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function SaddleHeightCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/saddle-height", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = isNl
    ? [
        {
          q: "Hoe meet ik mijn binnenbeenlengte voor zadelhoogte?",
          a: "Sta blootsvoets, klem een boek stevig tussen de benen en meet van de vloer tot de bovenkant van het boek.",
        },
        {
          q: "Waarom beïnvloedt flexibiliteit het advies?",
          a: "De calculator combineert je binnenbeenlengte met je rijcontext. Flexibiliteit en core beïnvloeden hoe houdbaar de positie rond het zadel voelt.",
        },
      ]
    : [
        {
          q: "How do I measure inseam for saddle height?",
          a: "Stand barefoot, place a book firmly between the legs, and measure from floor to the top of the book.",
        },
        {
          q: "Why does flexibility affect saddle-height guidance?",
          a: "The calculator combines inseam with riding context. Flexibility and core affect the wider fit posture around the saddle, which matters when choosing a safe starting point.",
        },
      ];

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: "BestBikeFit4U Saddle Height Calculator",
            description:
              "Calculate a conservative saddle-height starting point using category, goal, flexibility, and core inputs.",
            url: pageUrl,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe bereken je zadelhoogte" : "How to calculate saddle height",
            description: isNl
              ? "Een rustig proces om een veilig startpunt voor zadelhoogte te krijgen."
              : "A short process for getting a safe saddle-height starting point.",
            steps: [
              isNl
                ? "Meet je binnenbeenlengte zorgvuldig."
                : "Measure your inseam carefully.",
              isNl
                ? "Kies je fietscategorie en rijdoel."
                : "Choose bike category and riding goal.",
              isNl
                ? "Beoordeel flexibiliteit en core-stabiliteit."
                : "Rate flexibility and core stability.",
              isNl
                ? "Gebruik de uitkomst als startpunt en test het rustig."
                : "Use the result as a starting point and test it conservatively.",
            ],
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
              {isNl ? "Zadelhoogte calculator" : "Saddle Height Calculator"}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {isNl
                ? "Bereken een rustige, conservatieve zadelhoogte als startpunt voordat je grotere aanpassingen doet."
                : "Calculate a clean, conservative saddle-height starting point before making larger fit changes."}
            </p>
          </div>
        </section>

        <SaddleHeightCalculatorForm isNl={isNl} />

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {isNl ? "Volgende stap" : "Next step"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {isNl
              ? "Als je de zadelbasis kent, vergelijk je die met reach, drop en framedoelen zodat de totale positie logisch blijft."
              : "Once you know the saddle baseline, compare it with reach, drop, and frame targets so the full position stays coherent."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="saddle_height_bike_fit_cta"
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
                  section="saddle_height_dashboard_cta"
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
          links={getRelatedLinks("saddle-height", locale)}
          locale={locale}
        />
      </div>
    </div>
  );
}
