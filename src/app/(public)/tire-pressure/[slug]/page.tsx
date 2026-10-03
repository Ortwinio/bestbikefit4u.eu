import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestLocale } from "@/i18n/request";
import { pressureBikeLandingMessages } from "@/i18n/marketing/pressureBikeLanding";
import { PressureBikeLanding } from "@/components/seo/PressureBikeLanding";
import { DEFAULT_SOCIAL_IMAGE } from "@/lib/seo/social-image";
import {
  BIKE_TYPE_LABELS, EN_BIKE_TYPES, NL_TO_EN, buildPressureBikeAlternates, type EnBikeType,
} from "@/lib/seo/programmatic/tirePressure";

interface Props { params: Promise<{ slug: string }> }
function bikeFromSlug(slug: string): EnBikeType | undefined {
  if ((EN_BIKE_TYPES as readonly string[]).includes(slug)) return slug as EnBikeType;
  return Object.hasOwn(NL_TO_EN, slug) ? NL_TO_EN[slug as keyof typeof NL_TO_EN] : undefined;
}
export function generateStaticParams() { return EN_BIKE_TYPES.map(slug => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bike = bikeFromSlug(slug);
  if (!bike) return { robots: { index: false, follow: false } };
  const locale = await getRequestLocale();
  const copy = pressureBikeLandingMessages[locale];
  const title = copy.title(BIKE_TYPE_LABELS[bike][locale]);
  const description = copy.description(BIKE_TYPE_LABELS[bike][locale]);
  const alternates = buildPressureBikeAlternates(bike, locale);
  return { title, description, alternates,
    openGraph: { title, description, type: "website", url: alternates.canonical, images: [DEFAULT_SOCIAL_IMAGE] } };
}

export default async function PressureBikePage({ params }: Props) {
  const { slug } = await params;
  const bikeType = bikeFromSlug(slug);
  if (!bikeType) notFound();
  return <PressureBikeLanding bikeType={bikeType} locale={await getRequestLocale()} />;
}
