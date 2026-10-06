import { CalculatorAnswerSection, ContentDisclosure } from "@/components/calculators/CalculatorAnswerSection";
import { getEquipmentAnswer } from "@/lib/seo/calculatorAnswers/equipment";
import { DEFAULT_SOCIAL_IMAGE } from "@/lib/seo/social-image";
import type { Metadata } from "next";
import { ArrowUpDown, Gauge, ShieldCheck } from "lucide-react";
import {
  FeatureIconCard,
  type FeatureIconCardColor,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { gearingPageMessages } from "@/i18n/calculators/gearingPage";
import {
  buildFaqPageSchema,
  buildHowToSchema,
  buildCalculatorPageSchemas,
} from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { GearingCalculatorForm } from "./GearingCalculatorForm";

function buildFaqs(isNl: boolean) {
  return isNl
    ? [
        {
          q: "Wat is mijn lichtste en zwaarste versnelling?",
          a:
            "De lichtste versnelling is je kleinste kettingring met de grootste krans. De " +
            "zwaarste versnelling is je grootste kettingring met de kleinste krans.",
        },
        {
          q: "Waarom helpt trapfrequentie bij verzetadvies?",
          a:
            "Dezelfde versnelling voelt anders als je sneller of langzamer trapt. De " +
            "calculator schat daarom je cadans op de klim met je lichtste verzet.",
        },
        {
          q: "Is 1x altijd genoeg voor beklimmingen?",
          a:
            "Niet altijd. 1x kan prima werken, maar voor lange of steile beklimmingen is een " +
            "ruimer bereik vaak prettiger.",
        },
      ]
    : [
        {
          q: "What are my easiest and hardest gears?",
          a:
            "Your easiest gear is your smallest chainring paired with the largest cassette " +
            "cog. Your hardest gear is your largest chainring paired with the smallest cog.",
        },
        {
          q: "Why does cadence matter in a gearing calculator?",
          a:
            "The same gear feels very different if you spin faster or slower. That is why the" +
            " calculator estimates your climbing cadence in your easiest gear.",
        },
        {
          q: "Is 1x always enough for climbing?",
          a: "Not always. 1x can work well, but long or steep climbs usually feel better with a wider range.",
        },
      ];
}

const TRUST_POINT_COLORS: FeatureIconCardColor[] = ["teal", "primary", "green"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const copy = gearingPageMessages[locale];
  const alternates = buildLocaleAlternates("/calculators/gearing", locale);

  return {
    title: isNl ? "Verzet calculator | BikeFitBoost" : "Gearing Calculator | BikeFitBoost",
    description: copy.description,
    keywords: isNl
      ? ["verzet calculator", "gear ratio calculator", "klimverzet calculator", "cassette calculator"]
      : ["gearing calculator", "gear ratio calculator", "climb gearing calculator", "cassette calculator"],
    openGraph: {
      images: [DEFAULT_SOCIAL_IMAGE],
      title: isNl ? "Verzet calculator" : "Gearing Calculator",
      description: copy.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function GearingCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const copy = gearingPageMessages[locale];
  const pagePath = withLocalePrefix("/calculators/gearing", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = buildFaqs(isNl);
  const trustIcons = [ArrowUpDown, ShieldCheck, Gauge];

  return (
    <div className="text-foreground">
      <JsonLd
        schema={[
          ...buildCalculatorPageSchemas({
            name: isNl ? "BikeFitBoost Verzet calculator" : "BikeFitBoost Gearing Calculator",
            description: copy.description,
            url: pageUrl,
            locale,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe gebruik je de verzet calculator" : "How to use the gearing calculator",
            description: isNl
              ? "Een korte flow om je drivetrain snel te begrijpen."
              : "A short flow to understand your drivetrain quickly.",
            steps: isNl
              ? [
                  "Vul je kleinste voorblad en grootste tandwiel in.",
                  "Vul je steilste klim en gewicht in en bekijk je geschatte cadans met onzekerheidsbereik.",
                ]
              : [
                  "Enter your smallest chainring and largest sprocket.",
                  "Enter your steepest gradient and weight, then review your estimated cadence and uncertainty range.",
                ],
          }),
          buildFaqPageSchema(faqs),
        ]}
      />

      <GearingCalculatorForm isNl={isNl} />
      <CalculatorAnswerSection id="gearing" locale={locale} content={getEquipmentAnswer("gearing", locale)} />
      <div className="text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ContentDisclosure title={copy.sectionTitle}>
            <PublicSection
              className="mt-10"
              header={{
                eyebrow: isNl ? "Waarom dit werkt" : "Why this works",
                title: copy.sectionTitle,
                description: copy.sectionDescription,
              }}
            >
              <div className="grid gap-4 md:grid-cols-3">
                {copy.trustPoints.map((point, index) => {
                  const Icon = trustIcons[index];
                  return (
                  <FeatureIconCard
                    key={point.title}
                    icon={<Icon className="h-5 w-5" />}
                    title={point.title}
                    description={point.description}
                    color={TRUST_POINT_COLORS[index] ?? "primary"}
                  />
                  );
                })}
              </div>
            </PublicSection>
          </ContentDisclosure>



          <ContentDisclosure title={isNl ? "Veelgestelde vragen" : "Frequently asked questions"}>
            <PublicSection className="mt-10" header={{ title: isNl ? "Veelgestelde vragen" : "Frequently asked questions" }}>
              <div className="space-y-6">
                {faqs.map((faq) => <article key={faq.q}>
                  <h3 className="text-lg font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.a}</p>
                </article>)}
              </div>
            </PublicSection>
          </ContentDisclosure>

          <ContentDisclosure title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}>
          <RelatedLinksSection
            title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
            links={getRelatedLinks("gearing", locale).slice(0, 3)}
            locale={locale}
          />
          </ContentDisclosure>
        </div>
      </div>
    </div>
  );
}
