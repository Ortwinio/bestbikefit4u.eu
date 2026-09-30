import { PressureLanding } from "./PressureLanding";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BIKE_TYPE_LABELS,
  EN_BIKE_TYPES,
  WEIGHT_STEPS,
  buildPressureAlternates,
  buildEnglishPressureSlug,
  parseEnglishPressureSlug,
} from "@/lib/seo/programmatic/tirePressure";

interface ProgrammaticPressurePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return WEIGHT_STEPS.flatMap((weight) =>
    EN_BIKE_TYPES.map((bikeType) => ({
      slug: buildEnglishPressureSlug(weight, bikeType),
    })),
  );
}

export async function generateMetadata({ params }: ProgrammaticPressurePageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseEnglishPressureSlug(slug);

  if (!parsed) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const label = BIKE_TYPE_LABELS[parsed.bikeType];

  return {
    title: `Tire Pressure for ${parsed.weight}kg ${label.en} Rider | BestBikeFit4U`,
    description:
      `Recommended front and rear tire pressure for a ${parsed.weight} kg ${label.en} rider, ` +
      "with bar and PSI values plus a quick tube-type comparison.",
    keywords: [
      `tire pressure ${parsed.weight}kg ${label.en}`,
      `${label.en} tire pressure ${parsed.weight}kg`,
      `${label.en} cyclist tire pressure`,
    ],
    alternates: buildPressureAlternates(parsed.weight, parsed.bikeType, "en"),
    openGraph: {
      title: `Tire Pressure for ${parsed.weight}kg ${label.en} Rider | BestBikeFit4U`,
      description:
        `Recommended front and rear tire pressure for a ${parsed.weight} kg ${label.en} rider, ` +
        "with bar and PSI values plus a quick tube-type comparison.",
      type: "website",
      url: buildPressureAlternates(parsed.weight, parsed.bikeType, "en").canonical,
    },
  };
}

export default async function ProgrammaticTirePressurePage({ params }: ProgrammaticPressurePageProps) {
  const { slug } = await params;
  const parsed = parseEnglishPressureSlug(slug);
  if (!parsed) notFound();
  return <PressureLanding locale="en" slug={slug} weight={parsed.weight} bikeType={parsed.bikeType} />;
}
