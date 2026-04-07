import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Compass,
  Gauge,
  HeartPulse,
  Sparkles,
  type LucideIcon,
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
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { USE_CASES, getUseCaseCopy } from "./data";

function getUseCaseIcon(slug: string): LucideIcon {
  if (slug.includes("pain") || slug.includes("back")) return HeartPulse;
  if (slug.includes("endurance") || slug.includes("performance")) return Gauge;
  if (slug.includes("triathlon") || slug.includes("gravel")) return Compass;
  return Activity;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/use-cases", locale);

  return {
    title: isNl
      ? "Bikefit use cases voor klachten en rijstijlen | BestBikeFit4U"
      : "Bike Fit Use Cases for Pain Points and Riding Styles | BestBikeFit4U",
    description: isNl
      ? "Bekijk use cases voor bikefit bij duurritten, rugklachten, triathlon, gravel, MTB en meer."
      : "Explore bike-fit use cases for endurance riding, back pain, triathlon, gravel, MTB, and more.",
    keywords: isNl
      ? ["bikefit use cases", "rugklachten fietsen", "triathlon bikefit"]
      : ["bike fit use cases", "cycling back pain", "triathlon bike fit"],
    openGraph: {
      title: isNl
        ? "Bikefit use cases voor klachten en rijstijlen | BestBikeFit4U"
        : "Bike Fit Use Cases for Pain Points and Riding Styles | BestBikeFit4U",
      description: isNl
        ? "Bekijk use cases voor bikefit bij duurritten, rugklachten, triathlon, gravel, MTB en meer."
        : "Explore bike-fit use cases for endurance riding, back pain, triathlon, gravel, MTB, and more.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function UseCasesIndexPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/use-cases", locale);

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={isNl ? "Scenario bibliotheek" : "Scenario library"}
          title={isNl ? "Bikefit use cases" : "Bike Fit Use Cases"}
          description={
            isNl
              ? "Gebruik scenario-pagina's om sneller te bepalen welke fitprioriteiten, calculators en vervolgstappen bij jouw ritten passen."
              : "Use scenario pages to identify which fit priorities, calculators, and next steps best match your actual riding."
          }
          chips={
            isNl
              ? [`${USE_CASES.length} use cases`, "NL en EN beschikbaar", "Van context naar actie"]
              : [`${USE_CASES.length} use cases`, "Available in Dutch and English", "From context to action"]
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Hoe je deze hub gebruikt" : "How to use this hub",
            title: isNl
              ? "Gebruik use cases als scenariofilter"
              : "Use scenarios as a decision filter",
            description: isNl
              ? "Deze pagina's helpen je sneller zien of comfort, controle, belastbaarheid of prestaties de volgende stap moeten sturen."
              : "These pages help you decide faster whether comfort, control, durability, or performance should guide the next step.",
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <PublicSurfaceCard
              title={isNl ? "Wat deze hub wel en niet doet" : "What this hub does and does not do"}
              description={
                isNl
                  ? "Use cases geven richting, maar vervangen geen volledige fit of medische beoordeling wanneer klachten blijven terugkomen."
                  : "Use cases provide direction, but they do not replace a full fit or medical review when symptoms keep returning."
              }
              leading={<Compass className="h-5 w-5" />}
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                  {isNl
                    ? "Gebruik ze om de juiste calculator, gids of fitflow sneller te kiezen."
                    : "Use them to choose the right calculator, guide, or fit flow faster."}
                </div>
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                  {isNl
                    ? "Blijven klachten terugkomen, dan is extra beoordeling verstandiger dan meer losse tweaks."
                    : "If symptoms keep returning, extra review is safer than stacking more isolated tweaks."}
                </div>
              </div>
            </PublicSurfaceCard>
            <div className="grid gap-4 sm:grid-cols-3">
              <PublicFeatureCard
                icon={<Activity className="h-5 w-5" />}
                title={isNl ? "Herken je scenario" : "Recognize your scenario"}
                description={
                  isNl
                    ? "Kies de use case die het dichtst bij je echte ritten zit."
                    : "Start with the page that feels closest to your actual riding."
                }
              />
              <PublicFeatureCard
                icon={<Gauge className="h-5 w-5" />}
                title={isNl ? "Zie je prioriteiten" : "See your priorities"}
                description={
                  isNl
                    ? "Zie sneller of houding, comfort of prestaties eerst moeten komen."
                    : "Understand faster whether posture, comfort, or performance should lead."
                }
              />
              <PublicFeatureCard
                icon={<ArrowRight className="h-5 w-5" />}
                title={isNl ? "Ga daarna door" : "Then move forward"}
                description={
                  isNl
                    ? "Gebruik de context en open daarna calculator of volledige fit."
                    : "Use the scenario context, then move into a calculator or the full fit flow."
                }
              />
            </div>
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Scenario overzicht" : "Scenario overview",
            title: isNl ? "Kies de use case die het best past" : "Choose the best matching use case",
            description: isNl
              ? "Elke use case vertaalt een herkenbare rit- of klachtcontext naar praktische fitkeuzes."
              : "Each use case translates a familiar riding or discomfort context into practical fit priorities.",
          }}
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {USE_CASES.map((item) => {
              const copy = getUseCaseCopy(item, locale);
              const Icon = getUseCaseIcon(item.slug);

              return (
                <PublicSurfaceCard
                  key={item.slug}
                  title={copy.cardTitle}
                  description={copy.cardDescription}
                  leading={<Icon className="h-5 w-5" />}
                  footer={
                    <Link
                      href={withLocalePrefix(`/use-cases/${item.slug}`, locale)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      {isNl ? "Bekijk use case" : "View use case"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                >
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                    {isNl
                      ? "Gebruik deze pagina als contextlaag voordat je een calculator of complete fit opent."
                      : "Use this page as a context layer before opening a calculator or the full fit workflow."}
                  </div>
                </PublicSurfaceCard>
              );
            })}
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={isNl ? "Klaar om je eigen fit te berekenen?" : "Ready to calculate your own fit?"}
          description={
            isNl
              ? "Start met de gratis bike fit calculator en gebruik daarna het dashboard als je meer detail of opvolging nodig hebt."
              : "Start with the free bike fit calculator, then continue in the dashboard when you need more detail or follow-up."
          }
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="use_cases_calculator_cta"
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
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="use_cases_cta"
                    ctaLabel={isNl ? "Start gratis fit" : "Start Free Fit"}
                  />
                }
              >
                {isNl ? "Start gratis fit" : "Start Free Fit"}
              </Button>
            </>
          }
          aside={
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {isNl
                ? "Scenario’s helpen je sneller prioriteren, maar echte klachten vragen soms om een diepere review."
                : "Scenarios help you prioritize faster, but recurring symptoms can still require deeper review."}
            </span>
          }
        />
      </div>
    </PublicPageShell>
  );
}
