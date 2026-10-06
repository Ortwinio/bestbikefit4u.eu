import { CalculatorAnswerSection, ContentDisclosure } from "@/components/calculators/CalculatorAnswerSection";
import { getFitAnswer } from "@/lib/seo/calculatorAnswers/fit";
import { DEFAULT_SOCIAL_IMAGE } from "@/lib/seo/social-image";
import { fitPageDetails } from "@/i18n/calculators/fitPageDetails";
import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, Ruler, ShieldCheck } from "lucide-react";
import {
  FeatureIconCard,
  type FeatureIconCardColor,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/getDictionary";
import {
  buildHowToSchema,
  buildFaqPageSchema,
  buildCalculatorPageSchemas,
} from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { SaddleHeightExperience } from "./SaddleHeightExperience";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/saddle-height", locale);

  return {
    title: isNl
      ? "Zadelhoogte calculator | BikeFitBoost"
      : "Saddle Height Calculator | BikeFitBoost",
    description: fitPageDetails[locale].saddleDescription,
    keywords: isNl
      ? ["zadelhoogte calculator", "bike fit zadelhoogte", "fiets zadelpositie"]
      : ["saddle height calculator", "bike fit saddle height", "cycling saddle position"],
    openGraph: {
      images: [DEFAULT_SOCIAL_IMAGE],
      title: isNl ? "Zadelhoogte calculator" : "Saddle Height Calculator",
      description: fitPageDetails[locale].saddleDescription,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

const TRUST_POINT_COLORS: FeatureIconCardColor[] = ["teal", "primary", "green"];

export default async function SaddleHeightCalculatorPage() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/saddle-height", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = isNl
    ? [
        {
          q: "Hoe meet ik mijn binnenbeenlengte voor zadelhoogte?",
          a:
            "Sta blootsvoets, klem een boek stevig tussen de benen en meet van de vloer tot de " +
            "bovenkant van het boek.",
        },
        {
          q: "Kan ik beginnen zonder mijn binnenbeenlengte?",
          a: "Ja. Vul je lengte in; we schatten je binnenbeen als 0,47 × je lengte. " +
            "Voeg optioneel een gemeten binnenbeen toe om het onzekerheidsbereik meestal smaller te maken. " +
            "Het advies is berekend voor een racefiets.",
        },
        {
          q: "Wat betekent het 95%-bereik?",
          a: fitPageDetails.nl.saddleRangeAnswer,
        },
        {
          q: "Wanneer laat ik mijn zadelhoogte controleren?",
          a: "Een te hoog zadel kan je laten reiken naar de pedalen of je heupen laten wiegen. " +
            "Een te laag zadel kan je knieën sterk gebogen houden. " +
            "Stop bij pijn of tintelingen en laat je positie door een bikefitter controleren.",
        },
      ]
    : [
        {
          q: "How do I measure inseam for saddle height?",
          a:
            "Stand barefoot, place a book firmly between the legs, and measure from floor to the " +
            "top of the book.",
        },
        {
          q: "Can I start without my inseam measurement?",
          a: "Yes. Enter your height; we estimate inseam as 0.47 × your height. " +
            "Optionally add a measured inseam to usually narrow the uncertainty range. " +
            "The advice is calculated for a road bike.",
        },
        {
          q: "What does the 95% range mean?",
          a: fitPageDetails.en.saddleRangeAnswer,
        },
        {
          q: "When should I have my saddle height checked?",
          a: "A saddle that is too high can make you reach for the pedals or rock your hips. " +
            "A saddle that is too low can leave your knees deeply bent. " +
            "Stop if you feel pain or tingling and have a bikefitter check your position.",
        },
      ];
  const trustPoints = isNl
    ? [
        {
          title: "Advies met onzekerheidsbereik",
          description:
            "Je ziet een berekende zadelhoogte met een 95%-bereik voor meetonzekerheid en " +
            "spreiding van de formule. Het bereik is geen garantie op een comfortabele afstelling.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Gebouwd op meetdiscipline",
          description:
            "Een zorgvuldige binnenbeenlengte is hier belangrijker dan extra complexiteit. Dat " +
            "maakt de uitkomst beter uitlegbaar en betrouwbaarder.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Onderdeel van het totale fitplaatje",
          description:
            "Zadelhoogte staat niet los van reach, drop en comfort. Daarom blijft dit een " +
            "startpunt binnen een groter systeem.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Advice with an uncertainty range",
          description:
            "You see a calculated saddle height with a 95% range for measurement uncertainty and " +
            "variation in the formula. The range does not guarantee a comfortable setup.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Built on measurement discipline",
          description:
            "A careful inseam matters more here than extra complexity. That makes the output " +
            "easier to trust and explain.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Part of the full fit picture",
          description:
            "Saddle height does not live in isolation from reach, drop, and comfort. That is why " +
            "this remains a starting point inside a wider system.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ];

  return (
    <div className="text-foreground">
      <JsonLd
        schema={[
          buildFaqPageSchema(faqs),
          ...buildCalculatorPageSchemas({
            name: fitPageDetails[locale].saddleSchemaName,
            description: fitPageDetails[locale].saddleDescription,
            url: pageUrl,
            locale,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe bereken je zadelhoogte" : "How to calculate saddle height",
            description: isNl
              ? "Bereken je zadelhoogte met je lengte en optioneel je binnenbeen, met een onzekerheidsbereik."
              : "Calculate saddle height from your height and optional inseam, with an uncertainty range.",
            steps: [
              isNl ? "Vul je lichaamslengte in centimeters in." : "Enter your height in centimetres.",
              isNl
                ? "Meet optioneel je binnenbeen: sta blootsvoets tegen een muur, " +
                  "houd een boek stevig omhoog tussen je benen en meet van de vloer tot de bovenkant. " +
                  "Controleer een afwijkende meting."
                : "Optionally measure your inseam: stand barefoot against a wall, " +
                  "hold a book firmly up between your legs and measure from the floor to the top. " +
                  "Check an unusual measurement.",
              fitPageDetails[locale].saddleRangeStep,
              isNl
                ? "Gebruik de uitkomst als startpunt en test het rustig."
                : "Use the result as a starting point and test it conservatively.",
            ],
          }),
        ]}
      />

      <SaddleHeightExperience isNl={isNl} copy={dictionary.saddleHeightCalculator} />
      <CalculatorAnswerSection
        id="saddle-height"
        locale={locale}
        content={getFitAnswer("saddle-height", locale)}
      />

      <PublicPageShell className="pt-0 md:pt-0">
        <ContentDisclosure title={isNl
              ? "Je lengte als begin, je binnenbeen voor een smaller bereik"
              : "Start with height, add inseam for a narrower range"}>
<PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Waarom dit vertrouwen wekt" : "Why this builds trust",
            title: isNl
              ? "Je lengte als begin, je binnenbeen voor een smaller bereik"
              : "Start with height, add inseam for a narrower range",
            description: isNl
              ? "Het advies gebruikt alleen je lengte en optioneel je gemeten binnenbeen, berekend voor een racefiets."
              : "The advice uses only your height and optional measured inseam, calculated for a road bike.",
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {trustPoints.map((point, index) => (
              <FeatureIconCard
                key={point.title}
                icon={point.icon}
                title={point.title}
                description={point.description}
                color={TRUST_POINT_COLORS[index] ?? "primary"}
              />
            ))}
          </div>
          <p className="mt-6 text-muted-foreground">
            {isNl
              ? "Meet blootsvoets tegen een muur. Houd een boek stevig omhoog tussen je benen " +
                "en meet van de vloer tot de bovenkant. Meet zadelhoogte vanaf het midden van de trapas " +
                "langs de zitbuis tot de bovenkant van het zadel. "
              : "Measure barefoot against a wall. Hold a book firmly up between your legs " +
                "and measure from the floor to the top. Measure saddle height from the bottom bracket centre " +
                "along the seat tube to the top of the saddle. "}
            <Link
              className="inline-flex min-h-11 items-center underline"
              href={withLocalePrefix("/measurement-guide", locale)}
            >
              {isNl ? "Bekijk de meetgids" : "Read the measurement guide"}
            </Link>
          </p>
        </PublicSection>
</ContentDisclosure>



        <ContentDisclosure title={isNl ? "Veelgestelde vragen" : "FAQ"}>
          <PublicSection
            className="mt-10"
            header={{
              title: isNl ? "Veelgestelde vragen" : "FAQ",
              description: isNl
                ? "Korte antwoorden op de belangrijkste meetvragen."
                : "Short answers to the key measurement questions.",
            }}
          >
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-sm"
                >
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </PublicSection>
        </ContentDisclosure>

        <section className="mt-10">
          <ContentDisclosure title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}>
          <RelatedLinksSection
            title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
            links={getRelatedLinks("saddle-height", locale).slice(0, 3)}
            locale={locale}
          />
          </ContentDisclosure>
        </section>
      </PublicPageShell>
    </div>
  );
}
