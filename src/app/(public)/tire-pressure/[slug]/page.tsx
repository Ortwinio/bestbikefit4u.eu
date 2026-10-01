import { getRequestLocale } from "@/i18n/request";
import { pressureLandingMessages } from "@/i18n/marketing/pressureLanding";
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
  const locale = await getRequestLocale();
  const copy = pressureLandingMessages[locale];
  const parsed = parseEnglishPressureSlug(slug);

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

export default async function ProgrammaticTirePressurePage({ params }: ProgrammaticPressurePageProps) {
  const { slug } = await params;
  const parsed = parseEnglishPressureSlug(slug);
  if (!parsed) notFound();
  const locale = await getRequestLocale();
  return (
    <PressureLanding
      locale={locale}
      slug={slug}
      weight={parsed.weight}
      bikeType={parsed.bikeType}
      pathname={`/tire-pressure/${slug}`}
    />
  );
}
