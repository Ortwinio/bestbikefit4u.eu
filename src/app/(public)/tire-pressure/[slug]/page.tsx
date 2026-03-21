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
  parseEnglishPressureSlug,
} from "@/lib/seo/programmatic/tirePressure";
import { buildFaqPageSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { BRAND } from "@/config/brand";

interface ProgrammaticPressurePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return WEIGHT_STEPS.flatMap((weight) =>
    EN_BIKE_TYPES.map((bikeType) => ({
      slug: buildEnglishPressureSlug(weight, bikeType),
    }))
  );
}

export async function generateMetadata({
  params,
}: ProgrammaticPressurePageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseEnglishPressureSlug(slug);

  if (!parsed) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const label = BIKE_TYPE_LABELS[parsed.bikeType];

  return {
    title: `Tire Pressure for ${parsed.weight}kg ${label.en} Rider | BestBikeFit4U`,
    description: `Recommended front and rear tire pressure for a ${parsed.weight} kg ${label.en} rider, with bar and PSI values plus a quick tube-type comparison.`,
    keywords: [
      `tire pressure ${parsed.weight}kg ${label.en}`,
      `${label.en} tire pressure ${parsed.weight}kg`,
      `${label.en} cyclist tire pressure`,
    ],
    alternates: {
      canonical: `${BRAND.siteUrl}/tire-pressure/${slug}`,
      languages: {
        en: `${BRAND.siteUrl}/en/tire-pressure/${slug}`,
        nl: `${BRAND.siteUrl}/nl/bandenspanning/${buildDutchPressureSlug(
          parsed.weight,
          parsed.bikeType
        )}`,
        "x-default": `${BRAND.siteUrl}/en/tire-pressure/${slug}`,
      },
    },
  };
}

export default async function ProgrammaticTirePressurePage({
  params,
}: ProgrammaticPressurePageProps) {
  const { slug } = await params;
  const parsed = parseEnglishPressureSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { weight, bikeType } = parsed;
  const label = BIKE_TYPE_LABELS[bikeType];
  const tubeless = calculateBasicPressure(buildPressureInput(weight, bikeType, "tubeless"));
  const innerTube = calculateBasicPressure(buildPressureInput(weight, bikeType, "inner_tube"));
  const pageUrl = `${BRAND.siteUrl}/tire-pressure/${slug}`;
  const faqs = [
    {
      q: `Is ${tubeless.frontBar}/${tubeless.rearBar} bar a fixed pressure for every ${weight}kg rider?`,
      a: "No. It is a strong starting point based on rider weight, default tire width, surface, and bike type. Your exact setup can still change the final number.",
    },
    {
      q: "Why compare tubeless with inner tubes?",
      a: "Tube type changes the safe and comfortable pressure range. Tubeless setups usually support slightly lower pressures for the same rider and tire width.",
    },
  ];

  return (
    <div className="py-16">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: `Tire Pressure for ${weight}kg ${label.en} Rider`,
            description: `Static tire-pressure recommendation page for a ${weight} kg ${label.en} rider.`,
            url: pageUrl,
          }),
          buildFaqPageSchema(faqs),
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[color:var(--foreground)]">
          Tire Pressure for {weight}kg {label.en} Rider
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-[color:var(--muted-foreground)]">
          This landing page gives a static starting recommendation for a {weight} kg rider on a{" "}
          {label.en} with common tire widths. Use it as a quick reference, then move to the full
          calculator for your exact setup.
        </p>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)] p-6">
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Tubeless recommendation</h2>
            <p className="mt-4 text-[color:var(--foreground)]">Front: {tubeless.frontBar} bar / {tubeless.frontPsi} PSI</p>
            <p className="mt-1 text-[color:var(--foreground)]">Rear: {tubeless.rearBar} bar / {tubeless.rearPsi} PSI</p>
            <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">{tubeless.explanation}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Inner-tube comparison</h2>
            <p className="mt-4 text-[color:var(--foreground)]">Front: {innerTube.frontBar} bar / {innerTube.frontPsi} PSI</p>
            <p className="mt-1 text-[color:var(--foreground)]">Rear: {innerTube.rearBar} bar / {innerTube.rearPsi} PSI</p>
            <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
              Inner tubes typically require slightly higher pressure to reduce pinch-flat risk.
            </p>
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

        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<Link href="/bandenspanning-calculator" />}>
            Open Tire Pressure Calculator
          </Button>
          <Button render={<Link href={label.guideHref} />} variant="outline">
            Read {label.en[0].toUpperCase() + label.en.slice(1)} Fit Guide
          </Button>
        </div>

        <RelatedLinksSection
          title="Related tools and guides"
          links={getRelatedLinks("tire-pressure", "en")}
          locale="en"
        />
      </div>
    </div>
  );
}
