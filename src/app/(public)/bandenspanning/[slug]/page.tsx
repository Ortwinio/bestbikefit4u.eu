import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { Button } from "@/components/ui";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import {
  BIKE_TYPE_LABELS,
  EN_BIKE_TYPES,
  WEIGHT_STEPS,
  buildDutchPressureSlug,
  buildEnglishPressureSlug,
  buildPressureInput,
  parseDutchPressureSlug,
} from "@/lib/seo/programmatic/tirePressure";
import { buildFaqPageSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { BRAND } from "@/config/brand";

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
    alternates: {
      canonical: `${BRAND.siteUrl}/bandenspanning/${slug}`,
      languages: {
        en: `${BRAND.siteUrl}/en/tire-pressure/${buildEnglishPressureSlug(
          parsed.weight,
          parsed.bikeType
        )}`,
        nl: `${BRAND.siteUrl}/nl/bandenspanning/${slug}`,
        "x-default": `${BRAND.siteUrl}/nl/bandenspanning/${slug}`,
      },
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
  const pageUrl = `${BRAND.siteUrl}/bandenspanning/${slug}`;
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
          buildFaqPageSchema(faqs),
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Bandenspanning voor {weight}kg {label.nl}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          Deze pagina geeft een statisch startadvies voor een rijder van {weight} kg op een{" "}
          {label.nl} met gangbare bandbreedtes. Gebruik het als snelle referentie en ga daarna
          verder naar de volledige calculator voor jouw exacte setup.
        </p>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Tubeless advies</h2>
            <p className="mt-4 text-gray-700">Voor: {tubeless.frontBar} bar / {tubeless.frontPsi} PSI</p>
            <p className="mt-1 text-gray-700">Achter: {tubeless.rearBar} bar / {tubeless.rearPsi} PSI</p>
            <p className="mt-4 text-sm text-gray-600">{tubeless.explanation}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Vergelijking met binnenband</h2>
            <p className="mt-4 text-gray-700">Voor: {innerTube.frontBar} bar / {innerTube.frontPsi} PSI</p>
            <p className="mt-1 text-gray-700">Achter: {innerTube.rearBar} bar / {innerTube.rearPsi} PSI</p>
            <p className="mt-4 text-sm text-gray-600">
              Binnenband vraagt meestal iets meer druk om stootlekken te beperken.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-gray-900">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-1 text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<Link href="/bandenspanning-calculator" />}>
            Open bandenspanning calculator
          </Button>
          <Button render={<Link href={label.guideHref} />} variant="outline">
            Lees {label.nl} fit gids
          </Button>
        </div>

        <RelatedLinksSection
          title="Gerelateerde tools en gidsen"
          links={getRelatedLinks("tire-pressure", "nl")}
          locale="nl"
        />
      </div>
    </div>
  );
}
