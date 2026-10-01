import { pressureLandingMessages } from "@/i18n/marketing/pressureLanding";
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
  const locale = "nl";
  const copy = pressureLandingMessages[locale];
  const parsed = parseDutchPressureSlug(slug);

  if (!parsed) {
    return { title: copy.notFound, robots: { index: false, follow: false } };
  }

  const label = BIKE_TYPE_LABELS[parsed.bikeType][locale];
  const title = `${copy.title(parsed.weight, label)} | BestBikeFit4U`;
  const description = copy.description(parsed.weight, label);
  const alternates = buildPressureAlternates(parsed.weight, parsed.bikeType, locale);

  return {
    title,
    description,
    keywords: copy.keywords(parsed.weight, label),
    alternates,
    openGraph: { title, description, type: "website", url: alternates.canonical },
  };
}

export default async function ProgrammaticBandenspanningPage({ params }: ProgrammaticBandenspanningPageProps) {
  const { slug } = await params;
  const parsed = parseDutchPressureSlug(slug);
  if (!parsed) notFound();
  return <PressureLanding locale="nl" slug={slug} weight={parsed.weight} bikeType={parsed.bikeType} />;
}
