import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleDot,
  Hand,
  HeartPulse,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PainFitIllustration } from "@/components/content/PublicPageIllustrations";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicInfoPanel,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { PAIN_PAGES, getPainPageCopy } from "@/content/painPages";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

function getPainIcon(painArea: string): LucideIcon {
  if (painArea === "hands") return Hand;
  if (painArea === "saddle") return CircleDot;
  return HeartPulse;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const alternates = buildLocaleAlternates("/pain", locale);
  return {
    title:
      locale === "nl"
        ? "Bikefit bij veelvoorkomende klachten | BestBikeFit4U"
        : "Bike Fit for Common Pain Points | BestBikeFit4U",
    description:
      locale === "nl"
        ? "Verken pagina's voor knie-, rug-, nek-, hand- en zadelklachten en ontdek welke bikefit-factoren je eerst controleert."
        : "Explore knee, back, neck, hand, and saddle discomfort pages to see which bike-fit factors to review first.",
    openGraph: {
      title:
        locale === "nl"
          ? "Bikefit bij veelvoorkomende klachten | BestBikeFit4U"
          : "Bike Fit for Common Pain Points | BestBikeFit4U",
      description:
        locale === "nl"
          ? "Verken pagina's voor knie-, rug-, nek-, hand- en zadelklachten en ontdek welke bikefit-factoren je eerst controleert."
          : "Explore knee, back, neck, hand, and saddle discomfort pages to see which bike-fit factors to review first.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function PainIndexPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/pain", locale);

  return (
    <PublicPageShell>
      <TrackMarketingEventOnView
        eventType="pain_page_view"
        locale={locale}
        pagePath={pagePath}
        section="pain_index"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={isNl ? "Symptoomgerichte start" : "Symptom-led starting point"}
          title={
            isNl
              ? "Bikefit voor veelvoorkomende klachten"
              : "Bike Fit for Common Pain Points"
          }
          description={
            isNl
              ? "Kies de klacht die het best past bij wat je op de fiets voelt en zie welke fitfactoren je eerst controleert."
              : "Choose the symptom that best matches what you feel on the bike and see which fit factors to review first."
          }
          chips={
            isNl
              ? [`${PAIN_PAGES.length} klachtpagina's`, "NL en EN beschikbaar", "Fit-first, niet medisch"]
              : [`${PAIN_PAGES.length} pain pages`, "Available in Dutch and English", "Fit first, not medical"]
          }
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_index_primary_cta"
                    ctaLabel={isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
                  />
                }
              >
                {isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/case-study", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_index_secondary_cta"
                    ctaLabel={isNl ? "Doe mee aan case study" : "Join case study"}
                  />
                }
              >
                {isNl ? "Doe mee aan case study" : "Join case study"}
              </Button>
            </>
          }
        />

        <PublicSection className="mt-10">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
            <PublicInfoPanel
              title={
                isNl
                  ? "Gebruik deze pagina's als eerste triage"
                  : "Use these pages as an initial triage step"
              }
              tone="warning"
            >
              {isNl
                ? "Deze content helpt je je beoordeling te structureren, maar vervangt geen medische diagnose of persoonlijk onderzoek wanneer klachten blijven terugkomen."
                : "This content helps structure your review, but it does not replace medical diagnosis or in-person assessment when symptoms keep returning."}
            </PublicInfoPanel>
            <PainFitIllustration locale={locale} />
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Zo gebruik je deze hub" : "How to use this hub",
            title: isNl
              ? "Kies de klacht die het meest herkenbaar is"
              : "Choose the symptom that feels most familiar",
            description: isNl
              ? "Gebruik de klachtpagina als fitgerichte eerste stap en schakel extra hulp in wanneer de belasting of pijnreactie niet logisch voelt."
              : "Use the symptom page as a fit-first starting point and escalate when the pain response or load pattern does not make sense.",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <PublicFeatureCard
              icon={<HeartPulse className="h-5 w-5" />}
              title={isNl ? "Herken je patroon" : "Recognize the pattern"}
              description={
                isNl
                  ? "Start met de klacht die het meest lijkt op jouw ritervaring."
                  : "Start with the symptom that best matches your actual riding experience."
              }
            />
            <PublicFeatureCard
              icon={<ArrowRight className="h-5 w-5" />}
              title={isNl ? "Controleer eerst fit" : "Check fit first"}
              description={
                isNl
                  ? "Gebruik de pagina om je eerste afstelchecks in de juiste volgorde te zetten."
                  : "Use the page to put your first fit checks in the right order."
              }
            />
            <PublicFeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              title={isNl ? "Wees eerlijk over grenzen" : "Be honest about limits"}
              description={
                isNl
                  ? "Bij aanhoudende of scherpe klachten is extra beoordeling slimmer dan meer trial-and-error."
                  : "With persistent or sharp pain, extra review is safer than more trial and error."
              }
            />
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Klacht overzicht" : "Pain overview",
            title: isNl
              ? "Open de pagina die het best past"
              : "Open the page that fits best",
            description: isNl
              ? "Elke pagina laat zien wat rijders meestal merken, wat je eerst controleert en wanneer je verder moet kijken."
              : "Each page shows what riders usually notice, what to check first, and when to look beyond self-adjustment.",
          }}
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PAIN_PAGES.map((page) => {
              const copy = getPainPageCopy(page, locale);
              const Icon = getPainIcon(page.painArea);

              return (
                <PublicSurfaceCard
                  key={page.slug}
                  title={copy.title}
                  description={copy.intro}
                  leading={<Icon className="h-5 w-5" />}
                  footer={
                    <Link
                      href={withLocalePrefix(`/pain/${page.slug}`, locale)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      {isNl ? "Open pagina" : "Open page"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                >
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                    {copy.categoryLabel}
                  </div>
                </PublicSurfaceCard>
              );
            })}
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={isNl ? "Vervolgstap" : "Next step"}
          title={
            isNl
              ? "Wil je je klachten gestructureerd beoordelen?"
              : "Want to review your symptoms in a structured way?"
          }
          description={
            isNl
              ? "Open de bike fit calculator voor een fitgerichte eerste beoordeling of doe mee aan de case study als je meer context wilt delen."
              : "Open the bike fit calculator for a fit-first review, or join the case study if you want to share more context."
          }
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_index_band_primary_cta"
                    ctaLabel={isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
                  />
                }
              >
                {isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/case-study", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pain_index_band_secondary_cta"
                    ctaLabel={isNl ? "Doe mee aan case study" : "Join case study"}
                  />
                }
              >
                {isNl ? "Doe mee aan case study" : "Join case study"}
              </Button>
            </>
          }
        />
      </div>
    </PublicPageShell>
  );
}
