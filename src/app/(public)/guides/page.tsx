import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Gauge,
  HeartPulse,
  Mountain,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { GUIDES, getGuideClusterLabel, getGuideCopy } from "./data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/guides", locale);

  return {
    title: isNl
      ? "Bikefitting gidsen voor klachten en disciplines | BestBikeFit4U"
      : "Bike Fitting Guides for Pain and Disciplines | BestBikeFit4U",
    description: isNl
      ? "Bekijk praktische bikefitting-gidsen voor kniepijn, rugklachten, racefiets, gravel, MTB en triathlon."
      : "Explore practical bike fitting guides for knee pain, back pain, road, gravel, MTB, and triathlon setups.",
    keywords: isNl
      ? ["bikefitting gids", "bikefitting kniepijn", "racefiets fit", "gravel bikefitting"]
      : ["bike fitting guides", "bike fitting knee pain", "road bike fit", "gravel bike fit"],
    openGraph: {
      title: isNl
        ? "Bikefitting gidsen voor klachten en disciplines"
        : "Bike Fitting Guides for Pain and Disciplines",
      description: isNl
        ? "Praktische gidsen voor betere comfort, controle en prestaties op de fiets."
        : "Practical guides to improve comfort, control, and performance on the bike.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

function ClusterCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return <PublicFeatureCard icon={icon} title={title} description={description} />;
}

export default async function GuidesHubPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/guides", locale);

  const painGuides = GUIDES.filter((guide) => guide.cluster === "pain");
  const disciplineGuides = GUIDES.filter((guide) => guide.cluster === "discipline");

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={isNl ? "Praktische gidsen" : "Practical guides"}
          title={isNl ? "Bikefitting gidsen" : "Bike Fitting Guides"}
          description={
            isNl
              ? "Gebruik deze gidsen om sneller de juiste afstellingen te kiezen voor jouw klachten of discipline."
              : "Use these guides to choose better setup priorities for your pain points or cycling discipline."
          }
          chips={
            isNl
              ? [`${painGuides.length} klachtgidsen`, `${disciplineGuides.length} disciplinegidsen`, "NL en EN beschikbaar"]
              : [`${painGuides.length} pain guides`, `${disciplineGuides.length} discipline guides`, "Available in Dutch and English"]
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Hoe je deze hub gebruikt" : "How to use this hub",
            title:
              isNl
                ? "Gebruik gidsen als filter, niet als eindpunt"
                : "Use guides as a filter, not as the final answer",
            description:
              isNl
                ? "De gidsen helpen je sneller prioriteren voordat je een calculator of volledige fitflow opent."
                : "The guides help you prioritize faster before opening a calculator or the full fit flow.",
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <PublicSurfaceCard
              title={isNl ? "Zo haal je meer waarde uit deze pagina" : "How to get more value from this page"}
              description={
                isNl
                  ? "Start bij je klacht of discipline, lees alleen de relevante context, en ga daarna direct door naar je volgende actie."
                  : "Start with your pain point or discipline, read only the relevant context, and then move straight into the next action."
              }
              leading={<BookOpen className="h-5 w-5" />}
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                  {isNl
                    ? "Pijn-gidsen helpen je bepalen welke fitfactoren je eerst controleert."
                    : "Pain guides help you decide which fit factors to review first."}
                </div>
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                  {isNl
                    ? "Disciplinegidsen helpen je houding, controle en prestatiedoelen beter wegen."
                    : "Discipline guides help you weigh posture, control, and performance goals more clearly."}
                </div>
              </div>
            </PublicSurfaceCard>
            <div className="grid gap-4 sm:grid-cols-3">
              <ClusterCard
                icon={<HeartPulse className="h-5 w-5" />}
                title={isNl ? "Pijn eerst oplossen" : "Solve discomfort first"}
                description={
                  isNl
                    ? "Snelle referentie voor knie-, rug-, nek- en handklachten."
                    : "Fast references for knee, back, neck, and hand discomfort."
                }
              />
              <ClusterCard
                icon={<Gauge className="h-5 w-5" />}
                title={isNl ? "Prioriteiten per discipline" : "Priorities by discipline"}
                description={
                  isNl
                    ? "Krijg context voor race, gravel, MTB en triathlon."
                    : "Get context for road, gravel, MTB, and triathlon."
                }
              />
              <ClusterCard
                icon={<ArrowRight className="h-5 w-5" />}
                title={isNl ? "Van gids naar actie" : "From guide to action"}
                description={
                  isNl
                    ? "Gebruik gidsen als filter en ga daarna door naar calculator of volledige fit."
                    : "Use guides as a filter, then move into the calculator or full fit flow."
                }
              />
            </div>
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Cluster 01" : "Cluster 01",
            title: getGuideClusterLabel("pain", locale),
            description: isNl
              ? "Gebruik deze gidsen als snelle triage voor klachten die je op de fiets blijft voelen."
              : "Use these guides as fast triage when recurring discomfort keeps showing up on the bike.",
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {painGuides.map((guide) => {
              const copy = getGuideCopy(guide, locale);
              return (
                <PublicSurfaceCard
                  key={guide.slug}
                  title={copy.cardTitle}
                  description={copy.cardDescription}
                  leading={<HeartPulse className="h-5 w-5" />}
                  footer={
                    <Link
                      href={withLocalePrefix(`/guides/${guide.slug}`, locale)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      {isNl ? "Lees gids" : "Read guide"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                >
                  <div />
                </PublicSurfaceCard>
              );
            })}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Cluster 02" : "Cluster 02",
            title: getGuideClusterLabel("discipline", locale),
            description: isNl
              ? "Vergelijk discipline-specifieke posities, belasting en praktische afstelkeuzes."
              : "Compare discipline-specific positions, loading patterns, and setup tradeoffs.",
          }}
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {disciplineGuides.map((guide) => {
              const copy = getGuideCopy(guide, locale);
              return (
                <PublicSurfaceCard
                  key={guide.slug}
                  title={copy.cardTitle}
                  description={copy.cardDescription}
                  leading={<Mountain className="h-5 w-5" />}
                  footer={
                    <Link
                      href={withLocalePrefix(`/guides/${guide.slug}`, locale)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      {isNl ? "Lees gids" : "Read guide"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                >
                  <div />
                </PublicSurfaceCard>
              );
            })}
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={isNl ? "Klaar voor je volgende fitstap?" : "Ready for your next fit step?"}
          description={
            isNl
              ? "Start gratis en bekijk afstelbegeleiding die past bij jouw lichaam, doelen en rijstijl."
              : "Start free and review setup guidance matched to your body, goals, and riding style."
          }
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="hub_final_cta"
                    ctaLabel={isNl ? "Start gratis fit" : "Start Free Fit"}
                  />
                }
              >
                {isNl ? "Start gratis fit" : "Start Free Fit"}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="guides_calculator_cta"
                    ctaLabel={isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
                  />
                }
              >
                {isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
              </Button>
            </>
          }
          aside={
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {isNl
                ? "Elke gids eindigt met een directe stap richting calculator of volledige fitflow."
                : "Every guide ends with a direct next step into the calculator or full fit flow."}
            </span>
          }
        />
      </div>
    </PublicPageShell>
  );
}
