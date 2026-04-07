import type { Metadata } from "next";
import { Gauge, Ruler, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/saddle-height", locale);

  return {
    title: isNl
      ? "Zadelhoogte calculator | BestBikeFit4U"
      : "Saddle Height Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken een conservatieve zadelhoogte als startpunt op basis van categorie, doel, flexibiliteit en core."
      : "Calculate a conservative saddle-height starting point using category, goal, flexibility, and core inputs.",
    keywords: isNl
      ? ["zadelhoogte calculator", "bike fit zadelhoogte", "fiets zadelpositie"]
      : ["saddle height calculator", "bike fit saddle height", "cycling saddle position"],
    openGraph: {
      title: isNl ? "Zadelhoogte calculator" : "Saddle Height Calculator",
      description: isNl
        ? "Krijg een eerste zadelhoogte-inschatting en een veilige afstelmarge."
        : "Get a first-pass saddle-height estimate and a safe adjustment range.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function SaddleHeightCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/saddle-height", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = isNl
    ? [
        {
          q: "Hoe meet ik mijn binnenbeenlengte voor zadelhoogte?",
          a: "Sta blootsvoets, klem een boek stevig tussen de benen en meet van de vloer tot de bovenkant van het boek.",
        },
        {
          q: "Waarom beïnvloedt flexibiliteit het advies?",
          a: "De calculator combineert je binnenbeenlengte met je rijcontext. Flexibiliteit en core beïnvloeden hoe houdbaar de positie rond het zadel voelt.",
        },
      ]
    : [
        {
          q: "How do I measure inseam for saddle height?",
          a: "Stand barefoot, place a book firmly between the legs, and measure from floor to the top of the book.",
        },
        {
          q: "Why does flexibility affect saddle-height guidance?",
          a: "The calculator combines inseam with riding context. Flexibility and core affect the wider fit posture around the saddle, which matters when choosing a safe starting point.",
        },
      ];
  const trustPoints = isNl
    ? [
        {
          title: "Veilige basiszone",
          description:
            "Je krijgt bewust een conservatieve bandbreedte om te testen, in plaats van een te absolute eindwaarde.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Gebouwd op meetdiscipline",
          description:
            "Een zorgvuldige binnenbeenlengte is hier belangrijker dan extra complexiteit. Dat maakt de uitkomst beter uitlegbaar en betrouwbaarder.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Onderdeel van het totale fitplaatje",
          description:
            "Zadelhoogte staat niet los van reach, drop en comfort. Daarom blijft dit een startpunt binnen een groter systeem.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Safe baseline band",
          description:
            "You intentionally get a conservative test band rather than an overly absolute final number.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Built on measurement discipline",
          description:
            "A careful inseam matters more here than extra complexity. That makes the output easier to trust and explain.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Part of the full fit picture",
          description:
            "Saddle height does not live in isolation from reach, drop, and comfort. That is why this remains a starting point inside a wider system.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ];

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: "BestBikeFit4U Saddle Height Calculator",
            description:
              "Calculate a conservative saddle-height starting point using category, goal, flexibility, and core inputs.",
            url: pageUrl,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe bereken je zadelhoogte" : "How to calculate saddle height",
            description: isNl
              ? "Een rustig proces om een veilig startpunt voor zadelhoogte te krijgen."
              : "A short process for getting a safe saddle-height starting point.",
            steps: [
              isNl ? "Meet je binnenbeenlengte zorgvuldig." : "Measure your inseam carefully.",
              isNl ? "Kies je fietscategorie en rijdoel." : "Choose bike category and riding goal.",
              isNl
                ? "Beoordeel flexibiliteit en core-stabiliteit."
                : "Rate flexibility and core stability.",
              isNl
                ? "Gebruik de uitkomst als startpunt en test het rustig."
                : "Use the result as a starting point and test it conservatively.",
            ],
          }),
        ]}
      />

      <PublicHero
        eyebrow="BestBikeFit4U calculator"
        title={isNl ? "Zadelhoogte calculator" : "Saddle Height Calculator"}
        description={
          isNl
            ? "Bereken een rustige, conservatieve zadelhoogte als startpunt voordat je grotere aanpassingen doet."
            : "Calculate a clean, conservative saddle-height starting point before making larger fit changes."
        }
        chips={
          isNl
            ? ["NL en EN beschikbaar", "Conservatief startpunt", "Meetbaar thuis"]
            : ["Available in Dutch and English", "Conservative baseline", "Measurable at home"]
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: isNl ? "Waarom dit vertrouwen wekt" : "Why this builds trust",
          title: isNl
            ? "Eerst een veilige basis, daarna pas grotere aanpassingen"
            : "A safe baseline first, larger changes only afterwards",
          description: isNl
            ? "Deze calculator is bedoeld om overshooting te voorkomen en je eerste testzone geloofwaardig te houden."
            : "This calculator is designed to prevent overshooting and keep your first test zone credible.",
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {trustPoints.map((point) => (
            <PublicFeatureCard
              key={point.title}
              icon={point.icon}
              title={point.title}
              description={point.description}
            />
          ))}
        </div>
      </PublicSection>

      <SaddleHeightCalculatorForm isNl={isNl} />

      <PublicCtaBand
        className="mt-10"
        eyebrow={isNl ? "Volgende stap" : "Next step"}
        title={isNl ? "Plaats zadelhoogte in het totale fitbeeld" : "Put saddle height into the full fit picture"}
        description={
          isNl
            ? "Als je de zadelbasis kent, vergelijk je die met reach, drop en framedoelen zodat de totale positie logisch blijft."
            : "Once you know the saddle baseline, compare it with reach, drop, and frame targets so the full position stays coherent."
        }
        actions={
          <>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="saddle_height_bike_fit_cta"
                  ctaLabel={isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
                />
              }
            >
              {isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
            </Button>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="saddle_height_dashboard_cta"
                  ctaLabel={isNl ? "Ga verder in dashboard" : "Continue in dashboard"}
                />
              }
              variant="outline"
            >
              {isNl ? "Ga verder in dashboard" : "Continue in dashboard"}
            </Button>
          </>
        }
        aside={
          isNl
            ? "Gebruik een fysieke fitter of arts bij aanhoudende pijn, blessures of complexe asymmetrie."
            : "Use an in-person fitter or clinician for persistent pain, injury, or complex asymmetry."
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          title: isNl ? "Veelgestelde vragen" : "FAQ",
          description: isNl ? "Korte antwoorden op de belangrijkste meetvragen." : "Short answers to the key measurement questions.",
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

      <section className="mt-10">
        <RelatedLinksSection
          title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("saddle-height", locale)}
          locale={locale}
        />
      </section>
    </PublicPageShell>
  );
}
