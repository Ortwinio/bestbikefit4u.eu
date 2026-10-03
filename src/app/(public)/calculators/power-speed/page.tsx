import { DEFAULT_SOCIAL_IMAGE } from "@/lib/seo/social-image";
import { powerSpeedPageMessages } from "@/i18n/calculators/powerSpeedPage";
import { PerformanceCalculator } from "./PerformanceCalculator";
import type { Metadata } from "next";
import { Gauge, Route, ShieldCheck } from "lucide-react";
import {
  PublicFeatureCard,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildFaqPageSchema, buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";

const copy = powerSpeedPageMessages;
const featureIcons = [
  <Route key="Route" className="h-5 w-5" />,
  <ShieldCheck key="ShieldCheck" className="h-5 w-5" />,
  <Gauge key="Gauge" className="h-5 w-5" />,
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/calculators/power-speed", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: [...page.metadata.keywords],
    openGraph: {
      images: [DEFAULT_SOCIAL_IMAGE],
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function PowerSpeedEstimatorPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pagePath = withLocalePrefix("/calculators/power-speed", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <div className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: page.metadata.title,
            description: page.metadata.description,
            url: pageUrl,
          }),
          buildHowToSchema({ ...page.howTo, steps: [...page.howTo.steps] }),
          buildFaqPageSchema([...page.faqs]),
        ]}
      />

      <PerformanceCalculator tool="power-speed" locale={locale} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PublicSection
          className="mt-10"
          header={{
            eyebrow: page.intro.eyebrow,
            title: page.intro.title,
            description: page.intro.description,
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {page.features.map((feature, index) => (
              <PublicFeatureCard
                key={feature.title}
                icon={featureIcons[index]}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </PublicSection>

        {page.sections.map((section) => (
          <PublicSection key={section.title} className="mt-10" header={{ title: section.title }}>
            <div className="grid gap-4">
              {section.items.map((item) => (
                <PublicSurfaceCard key={item} description={item} />
              ))}
            </div>
          </PublicSection>
        ))}

        <PublicSection className="mt-10" header={{ eyebrow: page.faqTitle, title: page.faqTitle }}>
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <PublicSurfaceCard key={faq.q} title={faq.q} description={faq.a} />
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection title={page.relatedTitle} links={[...page.relatedLinks]} locale={locale} />

      </div>
    </div>
  );
}
