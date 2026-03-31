import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button, Input, Select } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { calculateCrankLength } from "../../../../../convex/lib/fitAlgorithm/calculations";
import { buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  getFirstSearchParam,
  parseBikeCategory,
  parsePositiveNumberParam,
  type SearchParamRecord,
} from "@/lib/publicCalculators";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/crank-length", locale);

  return {
    title: isNl ? "Cranklengte calculator | BestBikeFit4U" : "Crank Length Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken een praktisch startpunt voor cranklengte op basis van binnenbeenlengte en fietsdiscipline."
      : "Calculate a practical crank-length starting point based on inseam and bike category.",
    keywords: isNl
      ? ["cranklengte calculator", "fiets crankmaat", "cranklengte fit"]
      : ["crank length calculator", "bike crank size", "cycling crank length fit"],
    openGraph: {
      title: isNl ? "Cranklengte calculator" : "Crank Length Calculator",
      description: isNl
        ? "Vind een eerste cranklengte-aanbeveling op basis van binnenbeenlengte en categorie."
        : "Find a first-pass crank-length recommendation based on inseam and category.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

interface CrankLengthCalculatorPageProps {
  searchParams: Promise<SearchParamRecord>;
}

export default async function CrankLengthCalculatorPage({
  searchParams,
}: CrankLengthCalculatorPageProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const params = await searchParams;
  const submittedInseam = getFirstSearchParam(params, "inseamCm");
  const hasSubmitted = submittedInseam !== undefined;
  const inseamCm = parsePositiveNumberParam(params, "inseamCm");
  const category = parseBikeCategory(getFirstSearchParam(params, "category"));

  let error: string | null = null;
  let crankLengthMm: number | null = null;

  if (hasSubmitted) {
    if (inseamCm === null || inseamCm < 55 || inseamCm > 105) {
      error = isNl
        ? "Voer een binnenbeenlengte tussen 55 en 105 cm in."
        : "Please enter inseam between 55 and 105 cm.";
    } else {
      crankLengthMm = calculateCrankLength(Math.round(inseamCm * 10), category);
    }
  }

  const pagePath = withLocalePrefix("/calculators/crank-length", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = isNl
    ? [
        {
          q: "Maakt een kortere crank altijd comfortabeler?",
          a: "Niet altijd. Cranklengte moet passen bij je binnenbeenlengte, categorie en positie-doel, niet bij een algemene regel.",
        },
        {
          q: "Waarom is de cranklengte voor MTB soms korter?",
          a: "MTB-opstellingen kiezen soms iets korter voor meer pedaalvrijheid en controle op terrein.",
        },
      ]
    : [
        {
          q: "Does a shorter crank always improve comfort?",
          a: "Not always. Crank length needs to match your inseam, bike category, and position goals rather than following a blanket rule.",
        },
        {
          q: "Why is MTB crank guidance sometimes shorter?",
          a: "MTB setups may favor slightly shorter cranks for pedal clearance and terrain control.",
        },
      ];
  const helperPoints = isNl
    ? [
        "Cranklengte moet passen bij binnenbeenlengte, fietsdiscipline en houdingsdoelen.",
        "Korter is niet automatisch beter. De juiste keuze balanceert ruimte, comfort en trapgevoel.",
        "Gebruik dit samen met zadelhoogte en volledige fit-doelen, niet los daarvan.",
      ]
    : [
        "Crank length should match inseam, bike category, and posture demands.",
        "Shorter is not automatically better. The right choice balances clearance, comfort, and pedaling feel.",
        "Use this together with saddle height and full fit targets rather than in isolation.",
      ];
  const categoryOptions = isNl
    ? [
        { value: "road", label: "Race" },
        { value: "gravel", label: "Gravel" },
        { value: "mtb", label: "Mountainbike" },
        { value: "city", label: "Stadsfiets" },
      ]
    : [
        { value: "road", label: "Road" },
        { value: "gravel", label: "Gravel" },
        { value: "mtb", label: "Mountain" },
        { value: "city", label: "City" },
      ];

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U cranklengte calculator" : "BestBikeFit4U Crank Length Calculator",
            description: isNl
              ? "Bereken een praktisch startpunt voor cranklengte op basis van binnenbeenlengte en categorie."
              : "Calculate a practical crank-length starting point based on inseam and category.",
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
              {isNl ? "Cranklengte calculator" : "Crank Length Calculator"}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {isNl
                ? "Krijg een praktisch startpunt voor cranklengte voordat je componenten verandert."
                : "Get a practical starting point for crank length before you change components."}
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8" method="GET">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {isNl ? "Invoer" : "Inputs"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                {isNl ? "Maak je startpunt" : "Generate a baseline"}
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label={isNl ? "Binnenbeenlengte (cm)" : "Inseam (cm)"}
                id="crank-length-inseam"
                name="inseamCm"
                type="number"
                min={55}
                max={105}
                step="0.1"
                defaultValue={submittedInseam ?? ""}
                tooltip={
                  isNl
                    ? "Meet vanaf de vloer tot de bovenkant van een boek dat stevig tussen de benen wordt gehouden."
                    : "Measure from the floor to the top of a book held firmly between the legs."
                }
                required
              />

              <Select
                label={isNl ? "Fietsdiscipline" : "Bike Category"}
                id="crank-length-category"
                name="category"
                defaultValue={category}
                tooltip={
                  isNl
                    ? "Kies de discipline die past bij je fiets en gebruik."
                    : "Choose the category that matches your bike and intended use."
                }
                options={categoryOptions}
              />
            </div>

            <Button type="submit" className="mt-6">
              {isNl ? "Bereken cranklengte" : "Calculate crank length"}
            </Button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-[color:var(--secondary)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {isNl ? "Richtlijnen" : "Guidance"}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {helperPoints.map((point) => (
                  <li key={point} className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {isNl ? "Uitkomst" : "Output"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {isNl ? "Componentadvies" : "Component recommendation"}
          </h2>
          {crankLengthMm !== null ? (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="text-sm text-muted-foreground">
                {isNl ? "Aanbevolen cranklengte" : "Recommended crank length"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{crankLengthMm} mm</p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
              {isNl
                ? "Voer je gegevens in om een eerste cranklengte-aanbeveling te genereren."
                : "Enter your details to generate a first-pass crank-length recommendation."}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {isNl ? "Volgende stap" : "Next step"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {isNl
              ? "Cranklengte werkt het best als je die samen bekijkt met zadelhoogte, reach en de rest van de fit."
              : "Crank length works best when you consider it alongside saddle height, reach, and the rest of the fit."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="crank_length_bike_fit_cta"
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
                  section="crank_length_dashboard_cta"
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
          links={getRelatedLinks("crank-length", locale)}
          locale={locale}
        />
      </div>
    </div>
  );
}
