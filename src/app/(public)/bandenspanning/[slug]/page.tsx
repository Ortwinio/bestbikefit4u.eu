import { PressureLanding } from "../../tire-pressure/[slug]/PressureLanding";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BIKE_TYPE_LABELS,
  EN_BIKE_TYPES,
  WEIGHT_STEPS,
  buildPressureAlternates,
  buildDutchPressureSlug,
  parseDutchPressureSlug,
} from "@/lib/seo/programmatic/tirePressure";

interface ProgrammaticBandenspanningPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return WEIGHT_STEPS.flatMap((weight) =>
    EN_BIKE_TYPES.map((bikeType) => ({
      slug: buildDutchPressureSlug(weight, bikeType),
    })),
  );
}

export async function generateMetadata({ params }: ProgrammaticBandenspanningPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseDutchPressureSlug(slug);

  if (!parsed) {
    return { title: "Niet gevonden", robots: { index: false, follow: false } };
  }

  const label = BIKE_TYPE_LABELS[parsed.bikeType];

  return {
    title: `Bandenspanning voor ${parsed.weight}kg ${label.nl} | BestBikeFit4U`,
    description:
      `Aanbevolen voor- en achterdruk voor een rijder van ${parsed.weight} kg op een ${label.nl}, ` +
      "inclusief bar, PSI en vergelijking tussen tubeless en binnenband.",
    keywords: [
      `bandenspanning ${parsed.weight}kg ${label.nl}`,
      `${label.nl} bandenspanning ${parsed.weight}kg`,
      `${label.nl} bandendruk advies`,
    ],
    alternates: buildPressureAlternates(parsed.weight, parsed.bikeType, "nl"),
    openGraph: {
      title: `Bandenspanning voor ${parsed.weight}kg ${label.nl} | BestBikeFit4U`,
      description:
        `Aanbevolen voor- en achterdruk voor een rijder van ${parsed.weight} kg op een ${label.nl}, ` +
        "inclusief bar, PSI en vergelijking tussen tubeless en binnenband.",
      type: "website",
      url: buildPressureAlternates(parsed.weight, parsed.bikeType, "nl").canonical,
    },
  };
}

export default async function ProgrammaticBandenspanningPage({ params }: ProgrammaticBandenspanningPageProps) {
  const { slug } = await params;
  const parsed = parseDutchPressureSlug(slug);
  if (!parsed) notFound();
  return <PressureLanding locale="nl" slug={slug} weight={parsed.weight} bikeType={parsed.bikeType} />;
}
