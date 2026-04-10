import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button } from "@/components/prototyper-ui/ui/button";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import {
  BIKE_TYPE_LABELS,
  EN_BIKE_TYPES,
  WEIGHT_STEPS,
  buildPressureAlternates,
  buildDutchPressureSlug,
  buildPressureInput,
  parseDutchPressureSlug,
} from "@/lib/seo/programmatic/tirePressure";
import { buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { BRAND } from "@/config/brand";
import { withLocalePrefix } from "@/i18n/navigation";

interface ProgrammaticBandenspanningPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return WEIGHT_STEPS.flatMap((weight) =>
    EN_BIKE_TYPES.map((bikeType) => ({
      slug: buildDutchPressureSlug(weight, bikeType),
    }))
  );
}

export async function generateMetadata({
  params,
}: ProgrammaticBandenspanningPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseDutchPressureSlug(slug);

  if (!parsed) {
    return { title: "Niet gevonden", robots: { index: false, follow: false } };
  }

  const label = BIKE_TYPE_LABELS[parsed.bikeType];

  return {
    title: `Bandenspanning voor ${parsed.weight}kg ${label.nl} | BestBikeFit4U`,
    description: `Aanbevolen voor- en achterdruk voor een rijder van ${parsed.weight} kg op een ${label.nl}, inclusief bar, PSI en vergelijking tussen tubeless en binnenband.`,
    keywords: [
      `bandenspanning ${parsed.weight}kg ${label.nl}`,
      `${label.nl} bandenspanning ${parsed.weight}kg`,
      `${label.nl} bandendruk advies`,
    ],
    alternates: buildPressureAlternates(parsed.weight, parsed.bikeType, "nl"),
    openGraph: {
      title: `Bandenspanning voor ${parsed.weight}kg ${label.nl} | BestBikeFit4U`,
      description: `Aanbevolen voor- en achterdruk voor een rijder van ${parsed.weight} kg op een ${label.nl}, inclusief bar, PSI en vergelijking tussen tubeless en binnenband.`,
      type: "website",
      url: buildPressureAlternates(parsed.weight, parsed.bikeType, "nl").canonical,
    },
  };
}

export default async function ProgrammaticBandenspanningPage({
  params,
}: ProgrammaticBandenspanningPageProps) {
  const { slug } = await params;
  const parsed = parseDutchPressureSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { weight, bikeType } = parsed;
  const label = BIKE_TYPE_LABELS[bikeType];
  const tubeless = calculateBasicPressure(buildPressureInput(weight, bikeType, "tubeless"));
  const innerTube = calculateBasicPressure(buildPressureInput(weight, bikeType, "inner_tube"));
  const pagePath = withLocalePrefix(`/bandenspanning/${slug}`, "nl");
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = [
    {
      q: `Is ${tubeless.frontBar}/${tubeless.rearBar} bar altijd juist voor elke rijder van ${weight} kg?`,
      a: "Nee. Dit is een sterk startpunt op basis van gewicht, standaard bandbreedte, ondergrond en fietstype. Je precieze setup kan het eindadvies nog verschuiven.",
    },
    {
      q: "Waarom vergelijken jullie tubeless met binnenband?",
      a: "Het bandtype verandert het veilige en comfortabele drukbereik. Tubeless kan meestal iets lager gereden worden bij dezelfde rijder en bandbreedte.",
    },
  ];

  return (
    <div className="py-16">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: `Bandenspanning voor ${weight}kg ${label.nl}`,
            description: `Statische bandenspanningspagina voor een rijder van ${weight} kg op een ${label.nl}.`,
            url: pageUrl,
          }),
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
              BestBikeFit4U bandenspanning gids
            </p>
            <h1 className="mt-4 text-4xl font-bold text-[color:var(--foreground)] sm:text-5xl">
              Bandenspanning voor {weight}kg {label.nl}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-[color:var(--muted-foreground)]">
              Deze pagina geeft een statisch startadvies voor een rijder van {weight} kg op een{" "}
              {label.nl} met gangbare bandbreedtes. Gebruik het als snelle referentie en ga daarna
              verder naar de volledige calculator voor jouw exacte setup.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Tubeless advies</h2>
            <p className="mt-4 text-[color:var(--foreground)]">Voor: {tubeless.frontBar} bar / {tubeless.frontPsi} PSI</p>
            <p className="mt-1 text-[color:var(--foreground)]">Achter: {tubeless.rearBar} bar / {tubeless.rearPsi} PSI</p>
            <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">{tubeless.explanation}</p>
          </div>
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Vergelijking met binnenband</h2>
            <p className="mt-4 text-[color:var(--foreground)]">Voor: {innerTube.frontBar} bar / {innerTube.frontPsi} PSI</p>
            <p className="mt-1 text-[color:var(--foreground)]">Achter: {innerTube.rearBar} bar / {innerTube.rearPsi} PSI</p>
            <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
              Binnenband vraagt meestal iets meer druk om stootlekken te beperken.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Zo gebruik je deze waarde</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              "Gebruik dit als startpunt, niet als definitieve wedstrijdspanning.",
              "Bandbreedte, ondergrond en bandtype kunnen je echte ideale druk nog verschuiven.",
              "Ga voor je exacte setup daarna naar de volledige calculator.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-[color:var(--foreground)]">{faq.q}</h3>
                <p className="mt-1 text-[color:var(--muted-foreground)]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Volgende stap</h2>
          <p className="mt-3 max-w-2xl text-[color:var(--muted-foreground)]">
            Wil je een advies op basis van jouw precieze bandbreedte, ondergrond en bandtype, gebruik dan daarna de volledige calculator.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix(
                    getLocalizedPublicCalculatorPath("tire-pressure", "nl"),
                    "nl"
                  )}
                  locale="nl"
                  pagePath={pagePath}
                  section="programmatic_pressure_primary_cta"
                  ctaLabel="Open bandenspanning calculator"
                />
              }
            >
              Open bandenspanning calculator
            </Button>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix(label.guideHref, "nl")}
                  locale="nl"
                  pagePath={pagePath}
                  section="programmatic_pressure_secondary_cta"
                  ctaLabel={`Lees ${label.nl} fit gids`}
                />
              }
              variant="outline"
            >
              Lees {label.nl} fit gids
            </Button>
          </div>
        </section>

        <RelatedLinksSection
          title="Gerelateerde tools en gidsen"
          links={getRelatedLinks("tire-pressure", "nl")}
          locale="nl"
        />
      </div>
    </div>
  );
}
